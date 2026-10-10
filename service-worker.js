// 目的：オンラインでは最新の辞典、オフラインでは保存済みの辞典を表示する。
// 学べること：通信失敗への備え、キャッシュの世代管理、お気に入りとの保存先の違い。
const CACHE_PREFIX = "linux-command-dictionary-"; // この辞典の保存箱を識別する名前。
const CACHE_NAME = `${CACHE_PREFIX}v2`; // ファイル構成や保存処理を変えるときに世代を上げる。
const INDEX_URL = new URL("./index.html", self.registration.scope).href; // 辞典の保存先を一本化する。
const APP_FILES = ["./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"]; // 起動に必要なファイル。
const APP_URLS = new Set(APP_FILES.map(path => new URL(path, self.registration.scope).href)); // 保存するURLだけを列挙する。

self.addEventListener("install", event => { // 新しい処理が見つかったとき。
  event.waitUntil((async () => { // 必要なファイルの保存完了を待つ。
    const cache = await caches.open(CACHE_NAME); // 新世代の保存箱を開く。
    await cache.addAll(APP_FILES.map(path => new Request(new URL(path, self.registration.scope), { cache: "reload" }))); // 通信キャッシュを使い回さず、まとめて保存する。
    await self.skipWaiting(); // 保存成功後だけ新しい処理に切り替える。
  })()); // 保存失敗時は旧版を継続する。
}); // インストール処理の終わり。

self.addEventListener("activate", event => { // 新しい世代が有効になったとき。
  event.waitUntil((async () => { // 削除と引き継ぎの完了を待つ。
    const keys = await caches.keys(); // キャッシュの保存箱の名前を調べる。
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key))); // この辞典の旧世代だけを削除する。
    await self.clients.claim(); // 開いている画面の通信も引き受ける。
  })()); // localStorageのお気に入りには触れない。
}); // 有効化処理の終わり。

self.addEventListener("fetch", event => { // 画面がファイルを取得するとき。
  const url = new URL(event.request.url); // URLを比較しやすい形にする。
  const isIndex = url.origin === self.location.origin && (url.pathname === new URL(INDEX_URL).pathname || url.pathname === new URL(self.registration.scope).pathname); // 辞典の入口を判定する。
  if (event.request.method !== "GET" || (!isIndex && !APP_URLS.has(url.href))) return; // 保存対象外は通常の通信に任せる。
  const key = isIndex ? INDEX_URL : url.href; // / と index.html と検索文字付きの入口を同じ保存先にする。
  const result = (async () => { // 表示と保存をまとめて処理する。
    const controller = new AbortController(); // 遅すぎる通信を中止するための道具。
    const timer = setTimeout(() => controller.abort(), 5000); // 5秒で保存済みデータへ切り替える。
    try { // まず通信を試す。
      const response = await fetch(event.request, { cache: "no-store", signal: controller.signal }); // ブラウザーの古い通信キャッシュを避ける。
      if (!response.ok || response.redirected || (isIndex && !response.headers.get("content-type")?.includes("text/html"))) throw new Error("辞典を取得できませんでした"); // エラーページを保存しない。
      await response.clone().arrayBuffer(); // 本文の受信にも5秒の制限を適用する。
      clearTimeout(timer); // 受信できたので制限時間を解除する。
      try { // 容量不足でもオンライン表示は続ける。
        const cache = await caches.open(CACHE_NAME); // 現在の保存箱を開く。
        await cache.put(key, response.clone()); // 次のオフライン閲覧用に保存する。
      } catch { /* 保存失敗でも取得済みの辞典は表示する。 */ } // お気に入りには影響させない。
      return response; // 取得した応答を画面へ渡す。
    } catch { // オフライン、時間切れ、サーバーエラーの場合。
      const cache = await caches.open(CACHE_NAME); // 他アプリの保存箱は検索しない。
      return (await cache.match(key)) || Response.error(); // 保存済みを使い、なければ通信失敗とする。
    } finally { // 成功・失敗のどちらでも後片付けする。
      clearTimeout(timer); // 不要なタイマーを残さない。
    } // 通信と保存の処理の終わり。
  })(); // 非同期処理を開始する。
  event.respondWith(result); // 取得結果を画面へ返す。
  event.waitUntil(result.then(() => undefined, () => undefined)); // 保存完了まで処理を生かしておく。
}); // 通信処理の終わり。
