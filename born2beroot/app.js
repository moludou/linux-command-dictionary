'use strict';
const b2bGroups = ['すべて','基本確認','パッケージ','ユーザー・権限','ファイル・文字列','ストレージ・情報','ネットワーク・保護','監視・ログ'];
const b2bEscape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const b2bNormalize = value => String(value).normalize('NFKC').toLocaleLowerCase('ja').trim();
function b2bMatches(item, query) {
  const haystack = b2bNormalize([item.name,item.group,item.role,item.code,item.parts.flat().join(' '),item.result,item.note,item.effect,item.where].join(' '));
  return b2bNormalize(query).split(/\s+/).filter(Boolean).every(word => haystack.includes(word));
}
function b2bCard(item) {
  const e=b2bEscape;
  const safe=/確認のみ/.test(item.effect);
  return `<details class="entry" id="cmd-${e(item.name)}"><summary><strong>${e(item.name)}</strong><span class="badge ${safe?'':'change'}">${e(item.effect)}</span><small>${e(item.role)}</small></summary><div class="entry-body"><p><strong>使う場面：</strong>${e(item.group)}</p><p><strong>実行場所：</strong>${e(item.where)}</p><h3>実行例</h3><div class="codebox"><button class="copy" type="button" data-copy="${e(item.name)}" aria-label="${e(item.name)}の実行例をコピー">コピー</button><pre><code>${e(item.code)}</code></pre></div><h3>コマンドを分解</h3><dl class="parts">${item.parts.map(([part,meaning])=>`<dt>${e(part)}</dt><dd>${e(meaning)}</dd>`).join('')}</dl><h3>結果の読み方</h3><p>${e(item.result)}</p><h3>理解するポイント</h3><p>${e(item.note)}</p></div></details>`;
}
if (typeof document !== 'undefined') {
  const search=document.getElementById('b2bSearch');
  const groups=document.getElementById('groups');
  const cards=document.getElementById('commandCards');
  const count=document.getElementById('count');
  let selected='すべて';
  function render() {
    groups.innerHTML=b2bGroups.map(group=>`<button type="button" data-group="${b2bEscape(group)}" aria-pressed="${selected===group}">${b2bEscape(group)}</button>`).join('');
    const shown=B2B_COMMANDS.filter(item=>(selected==='すべて'||item.group===selected)&&b2bMatches(item,search.value)).sort((a,b)=>a.name.localeCompare(b.name,'en'));
    count.textContent=`${shown.length} / ${B2B_COMMANDS.length} コマンド`;
    cards.innerHTML=shown.length?shown.map(b2bCard).join(''):'<p class="empty">一致するコマンドがありません。「すべて」に切り替えるか、検索語を短くしてください。</p>';
  }
  groups.addEventListener('click',event=>{const button=event.target.closest('[data-group]');if(!button)return;selected=button.dataset.group;render();});
  search.addEventListener('input',render);
  document.getElementById('clearSearch').addEventListener('click',()=>{search.value='';selected='すべて';render();search.focus();});
  cards.addEventListener('click',async event=>{
    const button=event.target.closest('[data-copy]');if(!button)return;
    const item=B2B_COMMANDS.find(item=>item.name===button.dataset.copy);if(!item)return;
    const status=document.getElementById('copyStatus');
    try {await navigator.clipboard.writeText(item.code);status.textContent='コピーしました';}
    catch {status.textContent='コピーできませんでした。コードを選択してコピーしてください。';}
    setTimeout(()=>{status.textContent='';},3500);
  });
  function openHash(){
    let name;try{name=decodeURIComponent(location.hash.slice(1));}catch{return;}
    if(!name.startsWith('cmd-'))return;
    if(!B2B_COMMANDS.some(item=>'cmd-'+item.name===name))return;
    selected='すべて';search.value='';render();
    const entry=document.getElementById(name);if(entry){entry.open=true;entry.scrollIntoView({block:'start'});}
  }
  render();openHash();window.addEventListener('hashchange',openHash);
}
if(typeof module!=='undefined')module.exports={b2bGroups,b2bMatches,b2bCard,b2bEscape};
