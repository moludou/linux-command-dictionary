(() => {
  const {svg,text}=Art;
  const palette=['#337eb1','#bc542a','#3b8062','#885698'], ink='#203747';
  const circle=(x,y,r,color)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
  const line=(x,y,X,Y,color,w=2)=>`<line x1="${x}" y1="${y}" x2="${X}" y2="${Y}" stroke="${color}" stroke-width="${w}"/>`;
  function add(id,title,page,intro,examples,inputLabel,build){lessons.push({id,title,page,intro,examples,inputLabel,build});}
  function frame(title,desc,body){return {title,text:desc,svg:svg(body)};}
  function ints(raw,count,min,max) {
    const fields=raw.trim().normalize('NFKC').split(/[\s,、]+/);
    if(fields.length!==count||fields.some(v=>!/^\d+$/.test(v)||+v<min||+v>max))throw Error(`${min}〜${max} の整数を ${count} 個入力してください。`);
    return fields.map(Number);
  }
  function points(raw) {
    const pairs=raw.normalize('NFKC').trim().split(/\s+/);
    if(pairs.length<3||pairs.length>12)throw Error('3〜12 個の点を「1,2 3,4 5,6」の形で入力してください。');
    return pairs.map(pair=>ints(pair,2,0,10));
  }
  const sets=['1,2 2,3 2,1 7,7 8,8 9,7 5,2 7,2 6,1','1,8 2,7 3,8 4,4 5,4 7,1 8,2 9,1'];
  function scatter(pts,centers=[],groups=[],caption='各点は2つの特徴を持つ'){
    const sx=x=>78+x*48,sy=y=>259-y*21;
    let out='';
    for(let i=0;i<=10;i+=2){
      out+=line(sx(i),sy(0),sx(i),sy(10),'#e0e8eb',1)+line(sx(0),sy(i),sx(10),sy(i),'#e0e8eb',1)+text(sx(i),280,i,15)+text(56,sy(i)+5,i,15);
    }
    pts.forEach(([x,y],i)=>{const c=centers[groups[i]];if(c)out+=line(sx(x),sy(y),sx(c[0]),sy(c[1]),palette[groups[i]],1.5);});
    pts.forEach(([x,y],i)=>{out+=circle(sx(x),sy(y),7,palette[groups[i]]||'#566e77');});
    centers.forEach(([x,y],i)=>{const X=sx(x),Y=sy(y);out+=line(X-8,Y-8,X+8,Y+8,'white',8)+line(X-8,Y+8,X+8,Y-8,'white',8)+line(X-8,Y-8,X+8,Y+8,palette[i],4)+line(X-8,Y+8,X+8,Y-8,palette[i],4);});
    return out+text(320,308,caption,18);
  }
  add('6-1','クラスタリングとは？',178,'2つの特徴を座標にして、どんな点同士が似ているかを図で比べます。',sets,'点の座標（0〜10、点の間は空白）',raw=>{
    const pts=points(raw), [x,y]=pts[0];
    const order=pts.map(([a,b],i)=>({i,d:(a-x)**2+(b-y)**2})).slice(1).sort((a,b)=>a.d-b.d);
    const near=pts[order[0].i],groups=pts.map((_,i)=>i===0||i===order[0].i?0:undefined);
    return [frame('特徴を2本の軸に取る','横と縦を、それぞれの商品の2種類の評価とします。位置が近いほど、両方の特徴が似ています。',scatter(pts)),
      frame('近い組を見つける',`最初の点 (${x}, ${y}) に最も近い別の点は (${near.join(', ')}) です。`,scatter(pts,[pts[0]],groups,'色のついた2点に注目')),
      frame('どの特徴で分けるかを決める','横軸だけで分けると縦方向の差は無視されます。特徴の選び方や、単位のそろえ方でもグループは変わります。次節では中心までの距離を使います。',scatter(pts,[],pts.map(p=>p[0]<5?0:1),'例：横の値が 5 未満かどうかで分けた場合'))];
  });
  add('6-2','k-means 法',180,'各点を近い中心に割り当て、中心を平均位置へ動かす操作を繰り返します。',sets,'点の座標（異なる点を3個以上、0〜10）',raw=>{
    const pts=points(raw), unique=Array.from(new Map(pts.map(p=>[p.join(','),p])).values());
    if(unique.length<3)throw Error('異なる点を3個以上入力してください。');
    let centers=unique.slice(0,3),previous=null;
    const f=[frame('中心を3つ置く','k はグループの個数です。この実験では k = 3。比較できるよう、入力の先頭から異なる3点を初期中心にします。×が中心です。',scatter(pts,centers))];
    for(let round=1;round<=100;round++){
      const groups=pts.map(([x,y])=>{const ds=centers.map(([cx,cy])=>(x-cx)**2+(y-cy)**2);return ds.indexOf(Math.min(...ds));});
      f.push(frame(`第 ${round} 回・近い中心を選ぶ`,'各点と中心の距離を比べました。同じ距離なら先の中心に割り当てます。線は所属先を表します。',scatter(pts,centers,groups,'● データ　　× 中心')));
      if(previous&&groups.every((g,i)=>g===previous[i])){f.push(frame('所属が変わらなくなった','前回と同じ組分けになりました。初期中心や k を変えると、別の組分けに落ち着くこともあります。',scatter(pts,centers,groups,'収束したグループ')));break;}
      centers=centers.map((old,i)=>{const members=pts.filter((_,j)=>groups[j]===i);return members.length?[0,1].map(dim=>members.reduce((sum,p)=>sum+p[dim],0)/members.length):old;});
      f.push(frame('グループごとに平均を取る','横座標と縦座標を別々に平均し、×をその位置に置きます。空のグループの中心はこの例では元の位置に残します。',scatter(pts,centers,groups,'平均位置へ移った中心')));previous=groups;
    }return f;
  });
  add('7-1','ユークリッドの互除法',186,'2つの整数の最大公約数を、割り算の余りを使って求めます。',['1112, 695','84, 30'],'2つの正の整数（1〜9999）',raw=>{
    let [a,b]=ints(raw,2,1,9999);const f=[];
    while(b){const r=a%b;
      f.push(frame('割って余りを出す',`${a} と ${b} の公約数は、その差や、${a} から ${b} の倍数を引いた余り ${r} も割り切ります。逆に ${b} と余りの公約数は元の2数も割り切ります。`,text(320,100,`${a} ÷ ${b}`,38)+text(320,186,`商 ${Math.floor(a/b)}　　余り ${r}`,31,palette[0])+text(320,248,`${a} = ${b} × ${Math.floor(a/b)} + ${r}`,23)));
      if(r)f.push(frame('小さい組へ置き換える',`最大公約数を保ったまま、次は ${b} と ${r} を使います。`,text(320,125,`(${a}, ${b})`,33)+text(320,207,`↓　 (${b}, ${r})`,33,palette[0])));
      [a,b]=[b,r];
    }
    f.push(frame('余りが 0 になった',`最後に割った数 ${a} が最大公約数です。`,text(320,125,'最大公約数',24)+text(320,211,a,57,palette[2])));return f;
  });
  function powerMod(a,k,n){let base=BigInt(a),e=BigInt(k),m=BigInt(n),r=1n;while(e){if(e%2n===1n)r=r*base%m;base=base*base%m;e/=2n;}return Number(r);}
  add('7-2','素数判定法',190,'試し割りで確実に判定し、同じ整数でフェルマーテストの限界も確認します。',['3599','113','561','1'],'調べる整数（1〜9999）',raw=>{
    const [n]=ints(raw,1,1,9999),f=[frame('素数の条件を確認する','素数は2以上で、1と自分以外に正の約数を持たない整数です。',text(320,188,n,68,palette[0]))];
    if(n<2)return [...f,frame('1 は素数に含めない','1 の正の約数は1個だけです。',text(320,169,'約数　1',42))];
    let factor=0;
    for(let d=2;d*d<=n;d++){const r=n%d;f.push(frame(`${d} で試し割りする`,r?`余りが ${r} あるので ${d} は約数ではありません。`:`割り切れました。${n} は ${d} × ${n/d} で、合成数です。`,text(320,130,`${n} ÷ ${d}`,35)+text(320,207,`余り ${r}`,36,r?palette[0]:palette[1])));if(!r){factor=d;break;}}
    f.push(frame('試し割りの結論',factor?`約数 ${factor} が見つかりました。`:'合成数なら平方根以下に約数があります。その範囲に約数がないので素数です。',text(320,168,n+(factor?' は合成数':' は素数'),40,palette[2])));
    for(const base of [2,3,5].filter(b=>b<n)){const r=powerMod(base,n,n);f.push(frame(`フェルマーテスト：底 ${base}`,`素数 p なら aᵖ を p で割った余りは a と同じです。${r===base?'今回は一致しました。一致だけで素数とは断定できません。':'一致しないため合成数と分かります。'}`,text(320,134,`${base}^${n} mod ${n} = ${r}`,30)+text(320,210,r===base?'一致':'不一致',31,palette[1])));}
    return f;
  });
  add('7-3','ページランク',194,'リンク先へ票を分配し、ときどき別ページへ飛ぶ閲覧者をモデル化します。',['BC, C, A','B, A, -','C, C, AB'],'A・B・C のリンク先を順に指定（例 BC, C, A。リンクなしは -）',raw=>{
    const names=['A','B','C'],links=raw.normalize('NFKC').toUpperCase().split(/[,、]/).map(s=>s.trim());if(links.length!==3||links.some(s=>!/^([ABC]{1,3}|-)$/.test(s)))throw Error('3ページ分を「BC, C, A」の形で入力してください。');
    const to=links.map(s=>s==='-'?[]:[...new Set(s)]),coords=[[128,164],[485,68],[485,246]],d=.85;
    function chart(ranks){let s='';to.forEach((list,i)=>list.forEach(dest=>{const j=names.indexOf(dest);if(i===j){s+=text(coords[i][0]-40,coords[i][1]-32,'↺',28,palette[i]);return;}const [x,y]=coords[i],[X,Y]=coords[j],len=Math.hypot(X-x,Y-y),u=(X-x)/len,v=(Y-y)/len;
      const ox=-v*7,oy=u*7,tx=X-43*u+ox,ty=Y-43*v+oy;s+=line(x+ox,y+oy,tx,ty,palette[i],3)+`<path d="M ${tx} ${ty} l ${-12*u+6*v} ${-12*v-6*u} l ${-12*v} ${12*u} Z" fill="${palette[i]}"/>`;}));
      coords.forEach(([x,y],i)=>{s+=circle(x,y,39,palette[i])+text(x,y-1,names[i],23,'white')+text(x,y+20,(ranks[i]*100).toFixed(1)+'%',17,'white');});return s;}
    let r=[1/3,1/3,1/3];const f=[frame('全ページから同じ割合で始める','円の数字は、そのページにいる確率です。矢印の方向に進むものとして計算します。',chart(r))];
    f.push(frame('リンク先に票を分ける',`各ページの持ち分の85%をリンク先で等分し、残り15%は全ページに等分します。リンクがないページの分は全体に等配します。`,chart(r)));
    for(let round=1;round<=100;round++){const next=names.map(()=>(1-d)/3);to.forEach((list,i)=>{const targets=list.length?list:names;for(const v of targets)next[names.indexOf(v)]+=d*r[i]/targets.length;});const delta=Math.max(...next.map((v,i)=>Math.abs(v-r[i])));r=next;
      if(round<=5||delta<.0001||round===100)f.push(frame(`${round} 回目の分配`,delta<.0001?'全ページで前回との差が0.01ポイント未満になりました。到着しやすいページほど高い割合になります。':'すべてのページの新しい値を、前の回の値からまとめて計算しました。',chart(r)));if(delta<.0001)break;
    }return f;
  });
  add('7-4','ハノイの塔',202,'小さい円盤を一時的によけ、大きい円盤を移す手順を、同じ形の小さな問題に分けます。',['3','5','2'],'円盤の枚数（1〜6）',raw=>{
    const [n]=ints(raw,1,1,6),poles=[Array.from({length:n},(_,i)=>n-i),[],[]],names='ABC',f=[];
    function chart(dest=-1){let s='';poles.forEach((pile,i)=>{const x=112+i*208;s+=line(x,77,x,243,'#98a9ae',7)+line(x-90,244,x+90,244,'#637e83',6)+text(x,283,names[i],23);pile.forEach((size,j)=>{const w=30+size*20,y=219-j*25;s+=`<rect x="${x-w/2}" y="${y}" width="${w}" height="23" rx="5" fill="${palette[(size-1)%4]}"/>`+text(x,y+18,size,17,'white');});if(i===dest)s+=text(x,51,'移動先',18,palette[1]);});return s;}
    f.push(frame('A から C へすべて移す','一度に動かせるのは一番上の1枚。大きい円盤を小さい円盤の上には置けません。',chart()));
    function move(k,src,dst,tmp){if(!k)return;move(k-1,src,tmp,dst);const disc=poles[src].pop();poles[dst].push(disc);f.push(frame(`円盤 ${disc} を ${names[src]} から ${names[dst]} へ`,disc===n?'上の円盤をよけ終えたので、最大の円盤を目的地へ移せます。残りをその上へ移します。':`上の ${disc-1} 枚をよける → 円盤 ${disc} を移す → よけた分を重ねる。この分け方を小さい塔にも使います。`,chart(dst)));move(k-1,tmp,dst,src);}
    move(n,0,2,1);f.push(frame('すべての円盤が移った',`上の n−1 枚の移動を2回、最大の円盤の移動を1回行います。${n} 枚では 2^${n} − 1 = ${2**n-1} 手です。`,chart()));return f;
  });
})();
