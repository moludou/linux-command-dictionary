const storageKey = 'mac-command-favorites';
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let favorites = new Set();
try { const saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(saved)) favorites = new Set(saved.filter(name => MAC_COMMANDS.some(c => c.name === name))); } catch {}
const state = { category:'すべて', query:'', favoritesOnly:false };
const categories = ['すべて', ...new Set(MAC_COMMANDS.map(command => command.category))];
const commands = [...MAC_COMMANDS].sort((a,b) => a.name.localeCompare(b.name,'en'));
const list = document.querySelector('#entries');
const search = document.querySelector('#mac-search');
const feedback = document.querySelector('#feedback');
let feedbackTimer;
function notify(message) { clearTimeout(feedbackTimer); feedback.textContent = message; feedbackTimer = setTimeout(() => { feedback.textContent = ''; }, 5000); }
function codeBlock(code, index, label) { return `<div class="code-row"><h3>${escapeHtml(label)}</h3><button class="copy" type="button" data-copy="${index}" aria-label="${escapeHtml(label)}をコピー">コピー</button></div><pre><code>${escapeHtml(code)}</code></pre>`; }
const copyTexts = [];
function copyBlock(code, label) { const index = copyTexts.push(code)-1; return codeBlock(code,index,label); }
function render() {
  const expanded = new Set([...list.querySelectorAll('details[open]')].map(el => el.id));
  const words = state.query.normalize('NFKC').toLowerCase().trim().split(/\s+/).filter(Boolean);
  const shown = commands.filter(c => (state.category==='すべて'||c.category===state.category) && (!state.favoritesOnly||favorites.has(c.name)) && words.every(word => JSON.stringify(c).normalize('NFKC').toLowerCase().includes(word)));
  document.querySelector('#categories').innerHTML = categories.map(category => `<button type="button" data-category="${escapeHtml(category)}" aria-pressed="${category===state.category}">${escapeHtml(category)}</button>`).join('');
  copyTexts.length = 0;
  list.innerHTML = shown.map(c => `<details class="entry" id="${escapeHtml(c.name)}" ${expanded.has(c.name)?'open':''}>
    <summary><div><span class="category">${escapeHtml(c.category)}</span><strong>${escapeHtml(c.name)}</strong><span>${escapeHtml(c.summary)}</span></div></summary>
    <div class="entry-body"><div class="tools"><span class="effect">${escapeHtml(c.effect)}</span><button type="button" class="favorite" data-favorite="${escapeHtml(c.name)}" aria-pressed="${favorites.has(c.name)}">${favorites.has(c.name)?'★ 登録済み':'☆ お気に入りに追加'}</button></div>
    <h3>基本の書式</h3><pre><code>${escapeHtml(c.syntax)}</code></pre>
    <h3>引数・オプションの意味</h3><dl class="tokens">${c.tokens.map(([name,meaning])=>`<dt>${escapeHtml(name)}</dt><dd>${escapeHtml(meaning)}</dd>`).join('')}</dl>
    ${c.examples.map(([code,purpose,output,meaning],i)=>`<section>${copyBlock(code,`実行例${i+1}：${purpose}`)}<h3>表示例・動作</h3><pre class="terminal"><code>${escapeHtml(output)}</code></pre><p>${escapeHtml(meaning)}</p></section>`).join('')}
    <h3>何が変わる？</h3><p>${escapeHtml(c.impact)}</p>
    <h3>エラー・困ったときの例</h3><pre class="error"><code>${escapeHtml(c.error[0])}\n\n${escapeHtml(c.error[1])}</code></pre><p><strong>原因：</strong>${escapeHtml(c.error[2])}</p><p><strong>確認・対処：</strong>${escapeHtml(c.error[3])}</p>
    ${copyBlock(c.manual,'Mac上のマニュアルで確認')}<p class="manual">出力・対応オプションはmacOSの版により異なります。上のコマンドで使用中のMacの説明を確認できます。</p>
    ${c.source?`<p><a href="${escapeHtml(c.source)}">Apple公式の関連資料</a></p>`:''}
    <h3>関連コマンド</h3><nav class="related" aria-label="${escapeHtml(c.name)}の関連コマンド">${c.related.map(name=>`<a href="#${encodeURIComponent(name)}">${escapeHtml(name)}</a>`).join('')}</nav></div></details>`).join('');
  document.querySelector('#result-count').textContent = `${shown.length} / ${commands.length}項目 · ${state.category}${state.favoritesOnly?' · お気に入り':''}`;
  document.querySelector('#empty').hidden = shown.length !== 0;
  document.querySelector('#favorites').setAttribute('aria-pressed',String(state.favoritesOnly));
}
document.querySelector('#categories').addEventListener('click', event => { const button=event.target.closest('[data-category]'); if(!button)return; state.category=button.dataset.category;render();document.querySelector(`[data-category="${state.category}"]`).focus(); });
search.addEventListener('input',()=>{ state.query=search.value;render(); });
document.querySelector('#favorites').addEventListener('click',()=>{state.favoritesOnly=!state.favoritesOnly;render();});
document.querySelector('#reset').addEventListener('click',()=>{state.category='すべて';state.query='';state.favoritesOnly=false;search.value='';render();search.focus();});
list.addEventListener('click', async event => {
  const favorite = event.target.closest('[data-favorite]');
  if(favorite){const name=favorite.dataset.favorite;favorites.has(name)?favorites.delete(name):favorites.add(name);let saved=true;try{localStorage.setItem(storageKey,JSON.stringify([...favorites]));}catch{saved=false;}render();const replacement=list.querySelector(`[data-favorite="${name}"]`);(replacement||document.querySelector('#favorites')).focus();notify(saved?'お気に入りを更新しました':'このブラウザーでは保存できません。現在のページ内だけで保持します。');return;}
  const copy=event.target.closest('[data-copy]');if(!copy)return;
  const text=copyTexts[Number(copy.dataset.copy)];
  try { if(!navigator.clipboard?.writeText)throw Error('fallback');await navigator.clipboard.writeText(text);notify('コピーしました'); }
  catch { const field=document.createElement('textarea');field.value=text;field.style.position='fixed';field.style.opacity='0';document.body.append(field);field.select();let copied=false;try{copied=document.execCommand('copy');}catch{}field.remove();copy.focus();notify(copied?'コピーしました':'コピーできませんでした。コードを選択してコピーしてください。'); }
});
function openHash() { let name;try{name=decodeURIComponent(location.hash.slice(1));}catch{return;}if(!commands.some(c=>c.name===name))return;state.category='すべて';state.query='';state.favoritesOnly=false;search.value='';render();const entry=document.getElementById(name);entry.open=true;entry.querySelector('summary').focus();entry.scrollIntoView({block:'start'}); }
window.addEventListener('hashchange',openHash);
document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(link&&link.getAttribute('href')===location.hash){event.preventDefault();openHash();}});
render();openHash();
