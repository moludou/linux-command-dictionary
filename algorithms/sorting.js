(() => {
  "use strict";

  const palette = ["#35828b", "#7662ad", "#426db6", "#9d6237", "#417d52", "#9a5266", "#577492"];
  const accent = "#963b20", ink = "#21394b", muted = "#51697a";
  const numberLabel = "並べる整数（1〜99をカンマ区切りで最大10個）";
  const text = (...args) => Art.text(...args);
  const rect = (x,y,w,h,color,r=6) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${color}"/>`;
  const line = (x,y,X,Y,color,width=2) =>
    `<path d="M ${x} ${y} L ${X} ${Y}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
  const indices = n => Array.from({length:n}, (_,i) => i);

  function bars(values, options={}) {
    const {active=[], done=[], faded=[], tag="", caption="", held=null} = options;
    const slot=Math.min(76,560/values.length), width=slot*.72;
    const first=(640-slot*values.length)/2+slot/2;
    const top=Math.max(1,...values.filter(Number.isFinite),held || 0);
    const baseline=212;
    let s=text(36,38,tag,19,muted,"start");
    s+=line(first-slot/2,baseline+1,640-first+slot/2,baseline+1,"#c5d5dc");
    values.forEach((v,i)=>{
      const cx=first+i*slot;
      if(v===null) {
        s+=`<rect x="${cx-width/2}" y="${baseline-37}" width="${width}" height="37" rx="6" fill="none" stroke="#8ba5ac" stroke-dasharray="5 4"/>`;
        return;
      }
      const h=35+104*(v/top);
      const color=faded.includes(i)?"#a7b6bf":done.includes(i)?"#416b54":palette[v%palette.length];
      s+=rect(cx-width/2,baseline-h,width,h,color);
      s+=text(cx,baseline-10,String(v),23,"white");
      if(active.includes(i)) s+=`<path d="M ${cx-width/2} 223 v 7 h ${width} v -7" fill="none" stroke="${accent}" stroke-width="4"/>`;
      else if(done.includes(i)) s+=text(cx,239,"✓",17,"#40654c");
    });
    s+=text(320,285,caption,19,ink);
    return Art.svg(s);
  }

  function snapshot(title,description,svg) { return {title,text:description,svg}; }
  function complete(a,details) {
    return snapshot("並べ替え完了",`小さい順に ${a.join("、")}。 ${details}`,
      bars(a,{done:indices(a.length),tag:"結果",caption:"左から右へ、小さい順"}));
  }
  function swap(a,i,j) { [a[i],a[j]]=[a[j],a[i]]; }
  function sorted(a) { return [...a].sort((x,y)=>x-y); }

  function intro(a) {
    return [
      snapshot("入力の並び", "棒の高さが数字の大きさを表します。それぞれの値を保ったまま、位置を変えてみます。",
        bars(a,{tag:"並べ替える前",caption:"この列を小さい順に読むには？"})),
      snapshot("小さい順にする","昇順では、どの数字も右隣と同じか、それより小さくなります。",
        bars(sorted(a),{tag:"昇順",caption:"小さい値から大きい値へ"})),
      snapshot("大きい順にする","降順もソートの一種です。たとえば得点の高い順に順位を付けるときに使えます。",
        bars(sorted(a).reverse(),{tag:"降順",caption:"大きい値から小さい値へ"}))
    ];
  }

  function bubble(a) {
    const f=[];
    for(let left=0;left<a.length-1;left++){
      for(let j=a.length-1;j>left;j--){
        const l=a[j-1],r=a[j],active=[j-1,j],done=indices(left);
        const tag=`右から左へ　${left+1}巡目`;
        f.push(snapshot("隣同士を比べる",`左の ${l} と右の ${r} を比べます。`,
          bars(a,{active,done,tag,caption:`${l}　と　${r}`})));
        const change=l>r;
        if(change) swap(a,j-1,j);
        f.push(snapshot(change?"小さい値を左へ":"並びを保つ",
          change?`${r} のほうが小さいので交換します。`:`${l} は ${r} 以下なので、そのままにします。`,
          bars(a,{active,done,tag,caption:change?`${l}  ＞  ${r}　交換`:`${l}  ≦  ${r}　維持`})));
      }
      f.push(snapshot("この巡回で位置が決まる",`未確定だった範囲の最小値 ${a[left]} が左端に届きました。`,
        bars(a,{done:indices(left+1),tag:"確定した範囲",caption:`左から ${left+1} 個が確定`})));
    }
    f.push(complete(a,"隣同士の比較を繰り返すので、比較回数は n 個で n(n−1)/2 回です。"));
    return f;
  }

  function selection(a) {
    const f=[];
    for(let start=0;start<a.length-1;start++){
      let best=start;
      const done=indices(start);
      f.push(snapshot("最小値の候補を置く",`残りの先頭 ${a[start]} を仮の最小値にします。`,bars(a,{active:[start],done,tag:"残りを左から調べる",caption:`仮の最小値　${a[best]}`})));
      for(let j=start+1;j<a.length;j++){
        const prev=best;
        if(a[j]<a[best]) best=j;
        f.push(snapshot("残りの値を調べる",`${a[prev]} と ${a[j]} を比べました。ここまでの最小値は ${a[best]} です。`,
          bars(a,{active:[prev,j],done,tag:"最小値の探索",caption:`最小値　${a[best]}（左から ${best+1} 番目）`})));
      }
      const next=a[best],old=a[start];
      swap(a,start,best);
      f.push(snapshot("残りの先頭を確定",best===start?`${next} はすでに正しい位置にあります。`:`残りの先頭にあった ${old} と最小値 ${next} を交換します。`,
        bars(a,{active:[start,best],done:indices(start+1),tag:"選んだ値を置く",caption:`左から ${start+1} 番目は ${next}`})));
    }
    f.push(complete(a,"各巡回で未確定の範囲を調べます。比較は O(n²)、交換は各巡回で最大1回です。"));
    return f;
  }

  function insertion(a) {
    const f=[snapshot("左端から始める", "最初の1個だけなら、すでに小さい順です。この範囲を1個ずつ広げます。",
      bars(a,{done:[0],tag:"整列済みの範囲",caption:"左端の1個が出発点"}))];
    for(let i=1;i<a.length;i++){
      const key=a[i]; let j=i; a[j]=null;
      const held={held:key,tag:`手元の数　${key}`};
      f.push(snapshot("次の値を取り出す",`${key} を手元に取り、左側の列に入れる場所を探します。点線は空いた位置です。`,
        bars(a,{...held,done:indices(i),caption:`${key} をどこに入れる？`})));
      while(j>0){
        const previous=a[j-1];
        f.push(snapshot("左の値と比較",`空きの左にある ${previous} と、手元の ${key} を比べます。`,
          bars(a,{...held,active:[j-1],caption:`${previous}　と　${key}`})));
        if(previous<=key) break;
        a[j]=previous;a[--j]=null;
        f.push(snapshot("空きを左へ移す",`${previous} は ${key} より大きいので右へ1個分ずらします。`,
          bars(a,{...held,active:[j+1],caption:`${previous} を右へ`})));
      }
      a[j]=key;
      f.push(snapshot("空いた場所に挿入",`${key} を左から ${j+1} 番目に入れました。先頭の ${i+1} 個が小さい順になりました。`,
        bars(a,{done:indices(i+1),tag:"挿入した後",caption:`整列済み　${i+1} 個`})));
    }
    f.push(complete(a,"ほぼ整列した入力では移動が少なく、逆順では最大 O(n²) の時間がかかります。"));
    return f;
  }

  function heapDiagram(heap, output, focus, caption) {
    let s=text(28,29,"最大ヒープ",18,muted,"start");
    const point=i=>{
      const depth=Math.floor(Math.log2(i+1));
      const col=i-(2**depth-1);
      return [32+(col+.5)*576/(2**depth),48+depth*50];
    };
    heap.forEach((_,i)=>{
      if(i) s+=line(...point(Math.floor((i-1)/2)),...point(i),"#b2c5cd",3);
    });
    heap.forEach((v,i)=>{
      const [x,y]=point(i);
      s+=`<circle cx="${x}" cy="${y}" r="20" fill="${focus.includes(i)?accent:palette[v%palette.length]}"/>`;
      s+=text(x,y+7,String(v),20,"white");
    });
    s+=text(28,246,"取り出した値",18,muted,"start");
    s+=text(320,275,output.join("　")||"—",22,ink);
    s+=text(320,309,caption,16,muted);
    return Art.svg(s);
  }
  function heapSort(values) {
    const f=[], heap=[], output=[];
    const add=(title,desc,focus=[],caption="子は、左から順に空いている段へ")=>
      f.push(snapshot(title,desc,heapDiagram(heap,output,focus,caption)));
    for(const v of values) {
      let child=heap.length;heap.push(v);
      add("木の末尾に追加",`${v} を新しい葉に置きます。上の親より大きければ位置を交換します。`,[child]);
      while(child>0) {
        const parent=Math.floor((child-1)/2);
        if(heap[parent]>=heap[child]) break;
        swap(heap,child,parent);add("大きい値を上へ",`${v} が親より大きいため、ひとつ上に移しました。`,[child,parent],"根には最大の値が集まる");
        child=parent;
      }
    }
    while(heap.length){
      const max=heap[0], last=heap.pop();output.unshift(max);
      if(heap.length)heap[0]=last;
      add("根を取り出す",`最大の ${max} を結果の左に置きます。`+(heap.length?"木の末尾を根に移し、親子関係を整えます。":"木は空になりました。"),
        heap.length?[0]:[],"先に取り出した大きな値は右に残る");
      let p=0;
      while(2*p+1<heap.length) {
        let child=2*p+1;
        if(child+1<heap.length && heap[child+1]>heap[child])child++;
        if(heap[p]>=heap[child])break;
        const v=heap[child];swap(heap,p,child);
        add("大きい子を上にする",`子の中で最大の ${v} が親より大きいので交換します。`,[p,child],"親は子以上になるように整える");
        p=child;
      }
    }
    f.push(complete(output,"木を1段ずつたどる操作を繰り返します。全体の時間は O(n log n) です。"));return f;
  }

  function groupsDiagram(rows) {
    let s="";
    rows.forEach(({label,groups},r)=>{
      const y=29+r*89;
      s+=text(32,y,label,18,muted,"start");
      const cells=groups.reduce((sum,g)=>sum+Math.max(1,g.length),0);
      const slot=Math.min(55,(570-9*(groups.length-1))/cells);
      let x=(640-(slot*cells+9*(groups.length-1)))/2;
      for(const group of groups) {
        const w=slot*Math.max(1,group.length);
        s+=rect(x,y+10,w,40,"#e7eef1",6);
        if(!group.length)s+=text(x+w/2,y+38,"—",17,muted);
        group.forEach((v,i)=>{
          s+=rect(x+i*slot+2,y+12,slot-4,36,palette[v%palette.length],4);
          s+=text(x+(i+.5)*slot,y+37,String(v),20,"white");
        });
        x+=w+9;
      }
    });
    return Art.svg(s);
  }

  function mergeSort(a) {
    const f=[];
    let groups=[a];
    function split(g) {
      const mid=Math.ceil(g.length/2);
      return [g.slice(0,mid),g.slice(mid)];
    }
    while(groups.some(g=>g.length>1)){
      const divided=groups.flatMap(g=>g.length>1?split(g):[g]);
      f.push(snapshot("グループを半分に分ける","枠がひとつのグループです。2個以上のグループをほぼ同じ長さの二つに分けます。",
        groupsDiagram([{label:"分ける前",groups},{label:"分けた後",groups:divided}])));
      groups=divided;
    }
    function merge(g) {
      if(g.length===1)return g;
      const [a,b]=split(g).map(merge);
      const result=[];
      while(a.length||b.length){
        const left=a[0],right=b[0];
        const takeLeft=!b.length||(a.length && left<=right);
        const v=takeLeft?left:right;
        f.push(snapshot("先頭から次の値を選ぶ",left!==undefined && right!==undefined?`左の先頭 ${left} と右の先頭 ${right} を比べ、${v} を結合先へ移します。`:`片方が空になりました。残った列の先頭 ${v} を結合先へ移します。`,
          groupsDiagram([{label:"左の列",groups:[a]},{label:"右の列",groups:[b]},{label:"結合先",groups:[result]}])));
        (takeLeft?a:b).shift();result.push(v);
      }
      f.push(snapshot("二つの列が一つになる",`この範囲は ${result.join("、")} の順に並びました。`,
        groupsDiagram([{label:"結合した列",groups:[result]}])));
      return result;
    }
    f.push(complete(merge(a),"各段で全体を一度ずつ処理し、段の数はおよそ log₂ n。時間は O(n log n) です。"));return f;
  }

  function quickSort(input) {
    const f=[];
    // A repeatable pseudo-random sequence keeps the same input reproducible on rewind.
    let seed=input.reduce((acc,v)=>Math.imul(acc,31)+v|0,17);
    const bookInput=input.join(",")==="3,5,8,1,2,9,4,7,6";
    const bookPivots={"3,5,8,1,2,9,4,7,6":4,"5,8,9,7,6":6,"8,9,7":8,"3,1,2":2};
    function sort(g) {
      if(g.length<2)return g;
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      const bookPivot=bookInput ? bookPivots[g.join(",")] : undefined;
      const pi=bookPivot===undefined ? seed%g.length : g.indexOf(bookPivot);
      const pivot=g[pi],remaining=g.filter((_,i)=>i!==pi),low=[],high=[];
      f.push(snapshot("ピボットを一つ選ぶ",`この列の基準は ${pivot}。これを外し、ほかの値を小さい側と同じか大きい側に分けます。`,
        bars(g,{active:[pi],tag:"今回扱う部分列",caption:`ピボット　${pivot}`})));
      while(remaining.length) {
        const v=remaining.shift();
        (v<pivot?low:high).push(v);
        f.push(snapshot("基準と比べて振り分ける",`${v} は ${pivot} ${v<pivot?"より小さいので左":"以上なので右"}の列に入ります。`,
          groupsDiagram([{label:`これから調べる数　　基準 ${pivot}`,groups:[remaining]},{label:`左　　${pivot} より小さい`,groups:[low]},{label:`右　　${pivot} 以上`,groups:[high]}])));
      }
      f.push(snapshot("ピボットの位置が決まる","ピボットを二つの列の間に戻します。右の列、左の列の順に同じ操作を行います。",
        groupsDiagram([{label:"左の列",groups:[low]},{label:"ピボット",groups:[[pivot]]},{label:"右の列",groups:[high]}])));
      const right=sort(high),left=sort(low);
      return [...left,pivot,...right];
    }
    f.push(complete(sort(input),"分割が偏ると最悪 O(n²)、基準を均等な確率で選ぶ場合の平均は O(n log n) です。"));
    return f;
  }

  const sortLessons=[
    ["2-1","ソートとは？",54,"同じ値の集まりを、小さい順と大きい順に並べて比べます。","7,13,4,5,8,1,11,9",intro],
    ["2-2","バブルソート",56,"右端から二つずつ比べ、1巡するたびに小さな値を左端へ運びます。","5,9,3,1,2,8,4,7,6",bubble],
    ["2-3","選択ソート",60,"残りの範囲で最も小さい値を探し、次の確定位置に置きます。","6,1,7,8,9,3,5,4,2",selection],
    ["2-4","挿入ソート",62,"一つの値を手元に取り、左の整列済みの列に差し込みます。","5,3,4,7,2,8,6,9,1",insertion],
    ["2-5","ヒープソート",66,"親が子以上の木を作ります。根から最大値を取り出し、結果を右から埋めます。","5,2,7,3,6,1,4",heapSort],
    ["2-6","マージソート",70,"列を細かく分けてから、小さいものを先に選びながら結合します。","6,4,3,7,5,1,2",mergeSort],
    ["2-7","クイックソート",74,"基準の値で二組に分け、それぞれを同じ方法で整列させます。","3,5,8,1,2,9,4,7,6",quickSort]
  ];
  for(const [id,title,page,intro,book,trace] of sortLessons){
    lessons.push({id,title,page,intro,inputLabel:numberLabel,examples:[book,"4,2,3","5,1,4,1,2"],build(raw){return trace(Art.numbers(raw));}});
  }

  function search(raw,binary) {
    const pieces=raw.normalize("NFKC").split(/[|｜]/);
    if(pieces.length!==2)throw Error("数の列と探す値を | で区切ってください。例　2,4,6 | 4");
    const a=Art.numbers(pieces[0]), [target]=Art.numbers(pieces[1],1,1);
    if(binary&&a.some((v,i)=>i&&v<a[i-1]))throw Error("2分探索では、左から小さい順に数字を入力してください。");
    const f=[],tag=`探す数　${target}`;
    let lo=0,hi=a.length-1,count=0;
    while(lo<=hi){
      const i=binary?Math.floor((lo+hi)/2):lo;
      count++;
      const faded=indices(a.length).filter(k=>k<lo||k>hi);
      const title=binary?"候補の中央を見る":"先頭から一つずつ調べる";
      f.push(snapshot(title,`左から ${i+1} 番目の ${a[i]} を、探している ${target} と比べます。`,
        bars(a,{active:[i],faded,tag,caption:`${count} 回目の比較　　${a[i]} と ${target}`})));
      if(a[i]===target){
        f.push(snapshot("見つかった",`${count} 回の比較で、左から ${i+1} 番目の ${target} が見つかりました。`,
          bars(a,{active:[i],faded,done:[i],tag,caption:`一致　　左から ${i+1} 番目`})));
        return f;
      }
      const left=binary && a[i]>target;
      if(left)hi=i-1;else lo=i+1;
      const reason=binary?(left?`${a[i]} は ${target} より大きく、それ以降も大きい値です。`:`${a[i]} は ${target} より小さく、それ以前も小さい値です。`):`${a[i]} は探している値と異なります。`;
      f.push(snapshot(binary?"探索範囲をしぼる":"次の位置に進む",reason+(lo<=hi?"残った範囲を調べます。":"これで全ての候補を調べ終えました。"),
        bars(a,{faded:indices(a.length).filter(k=>k<lo||k>hi),tag,caption:`残りの候補　${Math.max(0,hi-lo+1)} 個`})));
    }
    f.push(snapshot("探す値は含まれていない",`候補がなくなりました。この列には ${target} がありません。比較は ${count} 回でした。`,
      bars(a,{faded:indices(a.length),tag,caption:"候補　0 個"})));
    return f;
  }
  for(const binary of [false,true]){
    lessons.push({id:binary?"3-2":"3-1",title:binary?"2分探索":"線形探索",page:binary?84:82,
      intro:binary?"小さい順の列の中央を調べ、探す範囲をおよそ半分ずつに絞ります。比較回数は O(log n) です。":"並び順を問わず、先頭から順番に比較します。最も多い場合は n 個すべてを調べます。",
      inputLabel:"配列 | 探す値（1〜99、配列は最大10個）",
      examples:[binary?"1,2,3,4,5,6,7,8,9 | 6":"3,9,8,2,1,4,6,5,7 | 6","2,4,6,8 | 5","3,3,5 | 3"],
      build(raw){return search(raw,binary);}
    });
  }
})();
