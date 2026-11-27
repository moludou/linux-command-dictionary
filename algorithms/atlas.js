(() => {
  'use strict';
  const chapters=['アルゴリズムの基本','データ構造','ソート','配列の探索','グラフ探索','セキュリティのアルゴリズム','クラスタリング','その他のアルゴリズム'];
  const colors=['#24648b','#9a4c52','#53722d','#93602d','#316c95','#6f5c92','#637227','#88557e'];
  const chapterEnds=[16,52,80,86,118,176,184,206];
  const $=id=>document.getElementById(id);
  const group=lesson=>Number(lesson.id.split('-')[0]);
  const chapterName=i=>i===0?'序章':'第'+i+'章';
  lessons.sort((a,b)=>a.page-b.page);
  function endPage(i){const next=lessons[i+1],current=lessons[i];return next&&group(current)===group(next)?next.page-1:chapterEnds[group(current)];}
  function node(tag,label,cl){const n=document.createElement(tag);if(label!==undefined)n.textContent=label;if(cl)n.className=cl;return n;}
  function link(label,href,cl){const a=node('a',label,cl);a.href=href;return a;}
  function normalize(s){return s.normalize('NFKC').toLowerCase().replaceAll(' ','').replaceAll('二分','2分');}
  function catalog(){
    const query=normalize($('search').value.trim());
    const page=/^\d{1,3}$/.test(query)?Number(query):null;
    $('catalog').replaceChildren();let count=0;
    chapters.forEach((name,c)=>{
      const section=node('section',undefined,'chapter');section.style.setProperty('--chapter',colors[c]);
      const h=node('h3');h.append(node('span',chapterName(c)),name);section.append(h);
      for(const [i,l] of lessons.entries()){
        if(group(l)!==c)continue;
        if(query&&!normalize([l.id,l.title,name,l.intro].join(' ')).includes(query)&&!(page!==null&&l.page<=page&&page<=endPage(i)))continue;
        const a=link('','#'+l.id,'entry');a.append(node('small',l.id),node('span',l.title),node('small','p.'+l.page));section.append(a);count++;
      }
      if(section.children.length>1)$('catalog').append(section);
    });
    $('results').textContent=query?(count?count+' 節が見つかりました。':'該当する教材がありません。別の語句で検索してください。'):'全 '+count+' 節　／　26のアルゴリズムと7つのデータ構造';
  }
  let current=null,frames=[],idx=0,timer=null;
  function stop(){if(timer!==null)clearInterval(timer);timer=null;$('play').textContent='再生';}
  function geometry(root){
    const shapes=new Map(),seen=new Map();
    for(const e of root.querySelectorAll('rect,circle,text')){
      const type=e.tagName,label=type==='text'?e.textContent:[e.getAttribute('fill'),e.getAttribute('height'),e.getAttribute('width'),e.getAttribute('r')].join('/');
      const base=type+':'+label,n=seen.get(base)||0;seen.set(base,n+1);
      const bounds=e.getBBox();shapes.set(base+'/'+n,{e,x:bounds.x,y:bounds.y});
    }
    return shapes;
  }
  function show(num,motion=false){
    const stage=$('diagram'),f=frames[num];
    const animate=motion&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
    const previous=animate?geometry(stage):null;
    idx=num;stage.innerHTML=f.svg;stage.setAttribute('aria-label',f.title+'。'+f.text);
    if(previous){
      for(const [key,now] of geometry(stage)){
        const old=previous.get(key);if(!old||!now.e.animate)continue;
        const dx=old.x-now.x,dy=old.y-now.y;
        if(Math.abs(dx)+Math.abs(dy)>2&&Math.abs(dx)<550&&Math.abs(dy)<200)
          now.e.animate([{transform:'translate('+dx+'px,'+dy+'px)'},{transform:'translate(0,0)'}],{duration:290,easing:'ease-out'});
      }
    }
    $('counter').textContent='手順 '+(idx+1)+' / '+frames.length;
    $('frame-title').textContent=f.title;$('frame-text').textContent=f.text;$('seek').value=idx;
    $('prev').disabled=idx===0;$('next').disabled=idx===frames.length-1;
    if(idx===frames.length-1){stop();$('play').textContent='もう一度';}
    const active=$('frame-index').querySelector('[aria-current]');if(active)active.removeAttribute('aria-current');
    $('frame-index').children[idx]?.firstChild.setAttribute('aria-current','step');
  }
  function go(i){stop();show(i,Math.abs(i-idx)===1);}
  function play(){
    if(timer!==null){stop();return;}
    if(idx===frames.length-1)show(0);
    timer=setInterval(()=>show(idx+1,true),Number($('speed').value));$('play').textContent='一時停止';
  }
  function start(raw){
    stop();
    try{
      const generated=current.build(raw);
      if(!generated.length)throw Error('別の入力を試してください。');
      frames=generated;$('error').textContent='';$('raw').removeAttribute('aria-invalid');
    }catch(e){$('error').textContent=e.message;$('raw').setAttribute('aria-invalid','true');return;}
    $('seek').min=0;$('seek').max=frames.length-1;
    const rows=frames.map((f,i)=>{const li=node('li'),button=node('button',f.title);button.onclick=()=>go(i);li.append(button);return li;});
    $('frame-index').replaceChildren(...rows);show(0);
  }
  function openLesson(l){
    current=l;const i=lessons.indexOf(l),c=group(l);
    $('section-meta').textContent=chapterName(c)+'　'+chapters[c]+'　／　'+l.id+'　·　pp.'+l.page+'–'+endPage(i);
    $('reader').style.setProperty('--accent',colors[c]);$('section-title').textContent=l.title;$('intro').textContent=l.intro;document.title=l.title+'｜アルゴリズムの図解ノート';
    $('full-demo').hidden=l.id!=='4-5';$('rawlabel').textContent=l.inputLabel;$('raw').value=l.examples[0];$('steps').open=false;
    $('presets').replaceChildren(...l.examples.map((v,i)=>{const b=node('button','例 '+(i+1));b.type='button';b.title=String(v);b.onclick=()=>{$('raw').value=v;start(v);};return b;}));
    $('neighbors').replaceChildren();
    for(const [offset,label] of [[-1,'前の教材'],[1,'次の教材']]){
      const adjacent=lessons[i+offset];if(!adjacent)continue;
      const a=link('','#'+adjacent.id);a.append(node('small',label),adjacent.id+'　'+adjacent.title);$('neighbors').append(a);
    }
    start(l.examples[0]);
  }
  function route(){
    stop();const l=lessons.find(l=>'#'+l.id===location.hash);
    $('library').hidden=!!l;$('reader').hidden=!l;
    if(l){openLesson(l);$('section-title').focus({preventScroll:true});}else{document.title='アルゴリズムの図解ノート｜コードとコマンドの辞典';catalog();}
    if(location.hash==='#contents')document.querySelector('.toc-head').scrollIntoView();else window.scrollTo(0,0);
  }
  $('experiment').onsubmit=e=>{e.preventDefault();start($('raw').value);};
  $('search').oninput=catalog;$('play').onclick=play;$('prev').onclick=()=>go(idx-1);$('next').onclick=()=>go(idx+1);
  $('seek').oninput=e=>go(Number(e.target.value));$('speed').onchange=()=>{if(timer!==null){stop();play();}};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('hashchange',route);route();
})();
