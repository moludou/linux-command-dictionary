// 目的：本物のブラウザーで旧版からの移行、更新通知、オフライン、お気に入り保持を検証する。
// 学べること：配信内容や通信状態を変え、利用者と同じ操作で不具合を見つける方法。
const { chromium } = require('playwright'); // ブラウザーを自動操作する道具を読み込む。
const http = require('node:http'); // テスト用の配信サーバーを作る。
const fs = require('node:fs'); // リポジトリのファイルを読み込む。
const path = require('node:path'); // ファイルの場所を組み立てる。
const { execFileSync } = require('node:child_process'); // 固定した旧版のファイルをGitから読む。
const assert = require('node:assert/strict'); // 期待する結果と実際の結果を比較する。
const root = path.resolve(__dirname, '..'); // プロジェクトの場所を基準にする。
const currentHTML = fs.readFileSync(path.join(root, 'index.html'), 'utf8'); // 修正後の辞典を読む。
const currentSW = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8'); // 修正後の通信処理を読む。
const legacy = name => execFileSync('git', ['show', `f4c2e86:${name}`], { cwd: root, encoding: 'utf8' }); // 旧版を再現する。
let version = 'legacy'; // 最初は旧版を配信する。
let failure = false; // サーバー障害を切り替える目印。
let slow = false; // 通信の遅延を切り替える目印。
const server = http.createServer((req, res) => { // GitHub Pagesと同じサブディレクトリで配信する。
  const name = new URL(req.url, 'http://localhost').pathname.replace(/^\/linux-command-dictionary\//, '') || 'index.html'; // 入口をHTMLへ対応させる。
  if (!['index.html', 'service-worker.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'].includes(name)) { res.writeHead(404).end(); return; } // 未知のURLは配信しない。
  if (failure && name === 'index.html') { res.writeHead(503).end('maintenance'); return; } // サーバー障害を再現する。
  let body = fs.readFileSync(path.join(root, name)); // 通常のファイルを読む。
  if (version === 'legacy' && ['index.html', 'service-worker.js'].includes(name)) body = legacy(name); // 最初のインストールには旧版を使う。
  if (version === 'updated' && name === 'index.html') body = currentHTML.replace('意味・影響・注意点を、スマホですばやく確認。', '更新テスト：新しい辞典です。'); // Workerを変えずHTMLだけを更新する。
  if (version === 'v3' && name === 'index.html') body = currentHTML.replace('意味・影響・注意点を、スマホですばやく確認。', '第3世代の辞典です。'); // 次世代の画面を用意する。
  if (version === 'v3' && name === 'service-worker.js') body = currentSW.replace('${CACHE_PREFIX}v2', '${CACHE_PREFIX}v3'); // 次世代の保存箱を使う。
  const send = () => { res.writeHead(200, { 'Content-Type': name.endsWith('.html') ? 'text/html; charset=utf-8' : name.endsWith('.js') ? 'application/javascript' : name.endsWith('.png') ? 'image/png' : 'application/manifest+json', 'Cache-Control': 'no-store' }); res.end(body); }; // 正しい種類を付けて配信する。
  if (slow && name === 'index.html') setTimeout(send, 6500); else send(); // 時間切れも再現する。
}); // サーバーの定義の終わり。
(async () => { // ブラウザーテストを順に実行する。
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); // 空いているポートで起動する。
  const browser = await chromium.launch({ headless: true }); // 画面を開かずChromiumを動かす。
  try { // 失敗しても後片付けする。
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true }); // スマートフォン相当の画面幅を使う。
    const page = await context.newPage(); // 一つ目の画面を開く。
    const errors = []; // 画面内のJavaScriptエラーを記録する。
    page.on('pageerror', error => errors.push(error.message)); // 隠れたエラーも検出する。
    const url = `http://127.0.0.1:${server.address().port}/linux-command-dictionary/`; // 公開サイトと同じ階層のURLを作る。
    await page.goto(url); // 旧版を開く。
    await page.evaluate(() => navigator.serviceWorker.ready); // 旧版の保存が完了するまで待つ。
    await page.reload(); // 旧版の通信処理で画面を開く。
    await page.locator('[data-command="ls"]').click(); // 利用者と同じ操作で詳細を開く。
    await page.locator('#favoriteButton').click(); // お気に入りを実際に登録する。
    const favorite = await page.evaluate(() => localStorage.getItem('linux-command-favorites')); // 元の保存内容を覚える。
    assert.ok(JSON.parse(favorite).includes('ls')); // 登録できたことを確認する。
    await page.evaluate(() => caches.open('unrelated-app-v1')); // 同じサイト上の別アプリの保存箱を用意する。
    version = 'current'; // 修正版の公開を再現する。
    await page.evaluate(async () => (await navigator.serviceWorker.ready).update()); // 新しい通信処理を見つける。
    await page.waitForFunction(async () => (await caches.keys()).includes('linux-command-dictionary-v2') && !(await caches.keys()).includes('linux-command-dictionary-v1')); // 旧世代の削除を待つ。
    await page.reload(); // 旧画面から新画面への初回移行を行う。
    const update = page.getByRole('button', { name: '新しい辞典があります。タップして更新', exact: true }); // 更新通知を操作するための目印。
    await page.waitForTimeout(700); // 初回の比較処理が完了する時間を取る。
    assert.equal(await update.isVisible(), false); // 同じHTMLで誤通知しないことを確認する。
    assert.ok(await page.evaluate(async () => (await caches.keys()).includes('unrelated-app-v1'))); // 他アプリの保存を壊していないことを確認する。
    const secondPage = await context.newPage(); // 同じ辞典を別タブにも開く。
    await secondPage.goto(url); // 更新前の内容を表示しておく。
    await page.bringToFront(); // 一つ目の画面を使う。
    version = 'updated'; // Workerはそのままで辞典だけを公開する。
    await page.evaluate(() => window.dispatchEvent(new Event('online'))); // 通信回復時の確認を実行する。
    await update.waitFor({ state: 'visible' }); // HTMLだけの変更でも通知が出ることを確認する。
    await update.click(); // 利用者の操作で新版へ切り替える。
    await page.waitForFunction(() => document.querySelector('.lead').textContent.includes('更新テスト')); // 新版の表示を確認する。
    await secondPage.bringToFront(); // 保存箱がすでに更新された後に別タブへ戻る。
    await secondPage.evaluate(() => window.dispatchEvent(new Event('online'))); // 別タブからも確認を始める。
    await secondPage.getByRole('button', { name: '新しい辞典があります。タップして更新', exact: true }).waitFor({ state: 'visible' }); // 古い画面自身との差を検出できることを確認する。
    await secondPage.close(); // 別タブの確認を終える。
    await page.bringToFront(); // 一つ目の画面で検証を続ける。
    await context.setOffline(true); // 圏外を再現する。
    await page.goto(`${url}index.html?offline=1`); // 別の入口でも同じ保存済み辞典を開く。
    assert.match(await page.locator('.lead').textContent(), /更新テスト/); // オフラインでも最新版が残っていることを確認する。
    await page.locator('#searchInput').fill('ls'); // 圏外でも検索する。
    assert.ok(await page.locator('[data-command="ls"]').count()); // 検索結果が表示されることを確認する。
    await page.locator('#favoriteNav').click(); // お気に入り一覧へ切り替える。
    assert.ok(await page.locator('[data-command="ls"]').count()); // お気に入りも利用できることを確認する。
    await context.setOffline(false); // 通信を復旧する。
    failure = true; // サーバーが503を返す状態にする。
    await page.reload(); // 障害中も開いてみる。
    assert.match(await page.locator('.lead').textContent(), /更新テスト/); // 保存済みの正常なHTMLを使うことを確認する。
    failure = false; slow = true; // 障害を解除し、遅い通信にする。
    const start = Date.now(); // 待ち時間を測り始める。
    await page.reload({ waitUntil: 'domcontentloaded' }); // 5秒で保存済みへ戻ることを試す。
    assert.ok(Date.now() - start < 6400); // 遅いサーバーを最後まで待たないことを確認する。
    assert.match(await page.locator('.lead').textContent(), /更新テスト/); // 保存済みの新版を維持する。
    slow = false; version = 'v3'; // 次のWorker更新を公開する。
    await page.evaluate(async () => (await navigator.serviceWorker.ready).update()); // Workerの次世代へ進める。
    await page.waitForFunction(async () => (await caches.keys()).includes('linux-command-dictionary-v3') && !(await caches.keys()).includes('linux-command-dictionary-v2')); // 世代切り替えと削除を確認する。
    await page.reload(); // 第3世代を表示する。
    assert.match(await page.locator('.lead').textContent(), /第3世代/); // 新世代の辞典を確認する。
    assert.equal(await page.evaluate(() => localStorage.getItem('linux-command-favorites')), favorite); // 保存文字列が完全に維持されたことを確認する。
    assert.deepEqual(errors, []); // 画面内にJavaScriptエラーがないことを確認する。
    await context.setOffline(true); // 最後に新世代でも圏外にする。
    await page.reload(); // 保存された第3世代を開く。
    assert.match(await page.locator('.lead').textContent(), /第3世代/); // 新世代のオフライン起動を確認する。
    console.log('PASS: 旧版移行・HTML更新・誤通知なし・旧キャッシュ削除・他アプリ保持・オフライン検索・お気に入り保持・503・通信時間切れ・次世代更新'); // 結果を表示する。
  } finally { await browser.close(); server.closeAllConnections(); server.close(); } // テスト後にブラウザーとサーバーを閉じる。
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; }); // 失敗を実行元へ伝える。
