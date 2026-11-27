(() => {
  const {text,svg,numbers}=Art;
  const ink='#203747', teal='#107569', warm='#a74729', muted='#597080';
  const line=(x,y,X,Y,color='#9cb2bb',width=3)=>`<line x1="${x}" y1="${y}" x2="${X}" y2="${Y}" stroke="${color}" stroke-width="${width}"/>`;
  const rect=(x,y,w,h,color,r=8)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${color}"/>`;
  const circle=(x,y,r,color)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
  const frame=(title,description,art)=>({title,text:description,svg:svg(art)});
  function lesson(id,title,page,intro,examples,inputLabel,build){lessons.push({id,title,page,intro,examples,inputLabel,build});}
  function boxes(values,active=[],caption='',links=false,indices=false){
    const pitch=Math.min(100,580/values.length), width=Math.min(71,pitch-15), start=320-pitch*(values.length-1)/2;
    return text(320,65,caption,23,ink)+values.map((v,i)=>{
      const x=start+pitch*i, color=active.includes(i)?warm:teal;
      return rect(x-width/2,125,width,55,v===null?'#dfe9ec':color)+text(x,162,v??'空',26,v===null?muted:'white')+
        (indices?text(x,216,'['+i+']',20,muted):'')+
        (links && i<values.length-1?text(x+pitch/2,160,'→',21,muted):'');
    }).join('');
  }
  lesson('0-1','アルゴリズムとは？',10,'同じ答えにたどり着く手順を、別の入力でも繰り返せるように書きます。',['7, 4, 6, 2','8, 3, 3, 5, 1'],'並べ替える数（2〜7個）',raw=>{
    const a=numbers(raw,2,7), frames=[frame('入力と目標を決める','受け取った数を小さい順に並べます。最初に、まだ並んでいない部分の最小値を探します。',boxes(a,[],'入力'))];
    for(let i=0;i<a.length-1;i++){
      const best=i+a.slice(i).indexOf(Math.min(...a.slice(i)));
      frames.push(frame('未整列の範囲から最小値を選ぶ',`${i+1} 番目から右を見渡すと、いちばん小さいのは ${a[best]} です。`,boxes(a,[best],'最小値を選ぶ')));
      [a[i],a[best]]=[a[best],a[i]];
      frames.push(frame('左から順に位置を決める',`左の ${i+1} 個が決まりました。残りにも同じ手順を適用します。`,boxes(a,[i],'今回決まった位置')));
    }
    frames.push(frame('手順が終わる','入力が変わっても同じ選び方で整列できます。プログラムは、この手順をコンピュータが実行できる言葉で表したものです。',boxes(a,[],'出力')));
    return frames;
  });
  lesson('0-2','計算時間の測り方',15,'選択ソートで数どうしを比べた回数を数え、入力が増えると仕事がどう増えるかを見ます。',['6','9'],'データの個数（2〜12）',raw=>{
    const [n]=numbers(raw,1,1);if(n<2||n>12)throw Error('2〜12 の整数を入力してください。');
    let sum=0;const counts=[],frames=[];
    for(let i=n-1;i>0;i--){counts.push(i);sum+=i;
      const chart=counts.map((v,k)=>rect(60+k*44,230-v*14,29,v*14,teal,3)+text(74+k*44,255,v,18)).join('');
      frames.push(frame(`第 ${counts.length} ラウンド`,`未整列の ${i+1} 個から最小値を選ぶ比較は ${i} 回。ここまでの合計は ${sum} 回です。`,text(320,50,'各ラウンドの比較回数',23)+chart));}
    frames.push(frame('増え方を式で読む',`比較は n(n−1)/2 回です。大きい n で支配的なのは n² の項なので、増え方を O(n²) と表します。秒数は機器などにも左右されます。`,text(320,130,`${n} × ${n-1} ÷ 2 = ${sum}`,38,teal)+text(320,205,'比較回数は入力の個数から計算できる',20)));
    return frames;
  });
  lesson('1-1','データ構造とは？',18,'データの入れ方を変えると、追加と検索に必要な仕事も変わります。',['28, 13, 41, 26','73, 48, 12, 47, 21'],'登録する番号（3〜6個）',raw=>{
    const a=numbers(raw,3,6),key=a.at(-1), group=Math.floor(key/10);
    const frames=[frame('到着順に登録する','末尾への追加は簡単です。位置の手掛かりがなければ、目的の番号を先頭から探します。',boxes(a,[],'登録順'))];
    for(let i=0;i<=a.indexOf(key);i++)frames.push(frame(`${key} を探す`,`${i+1} 個目は ${a[i]}。`+(a[i]===key?'一致したので止まります。':'次も調べます。'),boxes(a,[i],'順番に調べる')));
    frames.push(frame('分類してから探す',`十の位が ${group} の箱だけを開きます。登録時に分類する分、検索時に調べる範囲を小さくできます。`,boxes(a.filter(x=>Math.floor(x/10)===group),[],'十の位が '+group+' の箱')));return frames;
  });
  for(const linked of [true,false]){
    lesson(linked?'1-2':'1-3',linked?'リスト':'配列',linked?22:26,linked?'次の要素を指すリンクをたどり、要素を途中に挿入してから取り外します。':'添字で位置を指定し、挿入と削除で要素が移動する様子を比べます。',['12, 35, 48, 26','7, 4, 9, 2, 6'],'元の列と、最後に挿入する数（合計4〜6個）',raw=>{
      const a=numbers(raw,4,6),value=a.pop(), f=[];
      const add=(title,desc,marks,cap)=>f.push(frame(title,desc,boxes(a,marks,cap,linked,!linked)));
      add('元の並びを読む',linked?'各要素は、値と次の要素へのリンクを持ちます。':'同じ大きさの要素がメモリ上に連続して並びます。',[],'初期状態');
      if(linked){for(let i=0;i<3;i++)add('リンクをたどる',`先頭から ${i} 本のリンクをたどると ${a[i]} に着きます。`,[i],'先頭から順に');}
      else add('添字 2 を指定する',`先頭の位置に「要素の幅 × 2」を足すと、値 ${a[2]} に直接届きます。`,[2],'添字は 0 から');
      if(linked){
        f.push(frame('新しい要素の行き先を決める',`新しい値 ${value} から、元の2番目 ${a[1]} にリンクします。先頭のリンクはまだ元のままです。`,boxes(a,[1],'元の列',true)+text(320,270,`新しい要素　${value} → ${a[1]}`,22,warm)));
      }else{
        a.push(null);for(let j=a.length-1;j>1;j--){a[j]=a[j-1];a[j-1]=null;add('後ろから一つずつ移す','後ろ側から空きを移していくと、まだ必要な要素を上書きせずに済みます。',[j],'挿入場所を空ける');}
      }
      if(linked)a.splice(1,0,value);else a[1]=value;
      add('挿入する',linked?`先頭が ${value} を指すようにつなぎ替えます。ほかの要素の位置は変わりません。`:`空いた添字 1 に ${value} を書き込みます。`,[1],'挿入後');
      if(linked)a.splice(1,1);else {a[1]=null;for(let j=2;j<a.length;j++){a[j-1]=a[j];a[j]=null;add('後続の要素を左へ詰める','空いた場所に右隣の要素を移します。',[j-1],'削除と移動');}a.pop();}
      add('削除を終える',linked?'先頭から挿入要素の次へ直接リンクすると、その要素が列から外れます。':'途中に新しい空きを残さず、元の並びに戻りました。',[],'削除後');return f;
    });
  }
  for(const stack of [true,false]){
    lesson(stack?'1-4':'1-5',stack?'スタック':'キュー',stack?30:32,stack?'最後に入れたものから取り出す仕組みです。':'先に入れたものから取り出す仕組みです。',['3, 8, 2','4, 1, 7, 5'],'入れる順番（2〜6個）',raw=>{
      const input=numbers(raw,2,6),a=[],out=[],f=[];
      function diagram(mark){return stack ? text(320,31,'上が出し入れ口',19)+a.map((v,i)=>rect(248,221-i*31,144,29,i===mark?warm:teal)+text(320,243-i*31,v,20,'white')).join('')+line(232,255,408,255):boxes(a.length?a:[null],mark>=0?[mark]:[],'左が出口　／　右が入口');}
      for(const v of input){a.push(v);f.push(frame(stack?'プッシュする':'エンキューする',`${v} を${stack?'上に積みます。':'列の末尾に加えます。'}`,diagram(a.length-1)));}
      while(a.length){const v=stack?a.pop():a.shift();out.push(v);f.push(frame(stack?'ポップする':'デキューする',`${stack?'いちばん上':'列の先頭'}から ${v} を取り出しました。`,diagram(-1)+text(320,295,'取り出した順　'+out.join(' → '),20,warm)));}return f;
    });
  }
  lesson('1-6','ハッシュテーブル',34,'キーから格納先を計算します。同じ箱に当たったキーは、その箱の中で比較します。',['12, 7, 14, 4','3, 8, 13, 17'],'登録する数値キー（2〜6個）',raw=>{
    const keys=numbers(raw,2,6),bins=[[],[],[],[],[]],f=[];
    const draw=i=>bins.map((bin,j)=>rect(75,17+j*56,76,44,i===j?warm:'#356876')+text(113,47+j*56,j,21,'white')+text(171,47+j*56,bin.length?bin.join('　→　'):'空',22,ink,'start')).join('');
    for(const key of keys){const i=key%5;f.push(frame('キーを箱番号に変換する',`この例の関数は「キーを 5 で割った余り」。${key} を入れる箱は ${i} です。`,draw(i)));
      const existing=bins[i].includes(key),collision=bins[i].length>0;if(!existing)bins[i].push(key);
      f.push(frame(existing?'同じキーを確認する':collision?'衝突を処理する':'空の箱に登録する',existing?'同じキーは一つの項目として扱います。':collision?'同じ余りを持つ別のキーを、箱の中のリストに追加します。':'箱の先頭にキーを置きます。',draw(i)));}
    const last=keys.at(-1),i=last%5;for(const key of bins[i]){f.push(frame('同じ関数で検索する',`探すキーは ${last}。箱 ${i} の ${key} と比較し、${key===last?'一致しました。':'次を調べます。'}`,draw(i)));if(key===last)break;}return f;
  });
  function tree(values,edges,coords,focus=[]){
    return edges.map(([a,b])=>line(...coords[a],...coords[b])).join('')+values.map((v,i)=>circle(...coords[i],21,focus.includes(i)?warm:teal)+text(coords[i][0],coords[i][1]+7,v,21,'white')).join('');
  }
  lesson('1-7','ヒープ',42,'最小ヒープでは、親の値がどの子の値以下にもなります。追加と最小値の取り出しを試します。',['3, 6, 8, 4, 1','9, 7, 5, 3, 2, 4'],'追加する順番（3〜7個）',raw=>{
    const a=[],f=[],coords=[[320,50],[172,139],[468,139],[90,241],[248,241],[392,241],[550,241]];
    function step(t,d,marks){f.push(frame(t,d,tree(a,a.slice(1).map((_,i)=>[Math.floor(i/2),i+1]),coords,marks)));}
    for(const n of numbers(raw,3,7)){a.push(n);let i=a.length-1;step('末尾に追加する',`空いている次の位置に ${n} を置きます。`,[i]);
      while(i>0){const p=Math.floor((i-1)/2);if(a[p]<=a[i])break;[a[p],a[i]]=[a[i],a[p]];step('親より小さいので上げる',`${a[p]} と ${a[i]} の位置を交換しました。`,[p,i]);i=p;}}
    const min=a[0];a[0]=a.pop();step('根から最小値を取り出す',`${min} を取り出して、最後の値を根に持ってきます。木の形が保たれます。`,[0]);
    let i=0;while(2*i+1<a.length){let c=2*i+1;if(c+1<a.length&&a[c+1]<a[c])c++;if(a[i]<=a[c])break;[a[i],a[c]]=[a[c],a[i]];step('小さいほうの子と交換する','親子の条件を直しながら下に進みます。',[i,c]);i=c;}
    step('最小値は再び根にある',`次に取り出す値は ${a[0]} です。追加と取り出しで進む段数は、木の高さに比例します。`,[0]);return f;
  });
  lesson('1-8','2分探索木',46,'左の部分木は小さく、右は大きく保ちます。挿入・探索・根の削除を順に見ます。',['15, 9, 23, 3, 12, 17, 28','8, 3, 10, 1, 6, 14'],'重複しない数を挿入する順番（3〜7個）',raw=>{
    const input=numbers(raw,3,7);if(new Set(input).size!==input.length)throw Error('この教材では異なる数を使います。');
    let root=null;const f=[];
    function drawTree(focus){
      const nodes=[],edges=[],coords=[];let order=0;const pending=[];
      function visit(n,depth,p){if(!n)return;const i=nodes.length;nodes.push(n.v);if(p!==null)edges.push([p,i]);visit(n.left,depth+1,i);pending.push([i,order++,depth]);visit(n.right,depth+1,i);}
      visit(root,0,null);const maxDepth=Math.max(1,...pending.map(x=>x[2]));
      for(const [i,k,d] of pending)coords[i]=[60+(k+.5)*520/nodes.length,45+d*215/maxDepth];
      return tree(nodes,edges,coords,nodes.flatMap((v,i)=>focus.includes(v)?[i]:[]));
    }
    function step(t,d,v){f.push(frame(t,d,drawTree(v)));}
    for(const v of input){const item={v,left:null,right:null};if(!root){root=item;step('根を作る',`最初の値は ${v} です。`,[v]);continue;}
      let node=root;while(true){const side=v<node.v?'left':'right';step('大小を比べる',`${v} は ${node.v} より${side==='left'?'小さいので左':'大きいので右'}へ進みます。`,[node.v]);if(!node[side]){node[side]=item;break;}node=node[side];}
      step('空いた位置に挿入する',`${v} の位置が決まりました。`,[v]);}
    const target=input.at(-1);let n=root;
    while(n){step('根から検索する',n.v===target?`${target} を見つけました。`:`${target} と ${n.v} を比べ、片方の部分木だけを調べます。`,[n.v]);if(n.v===target)break;n=n[target<n.v?'left':'right'];}
    const old=root.v;if(root.left&&root.right){let parent=root,pred=root.left;while(pred.right){parent=pred;pred=pred.right;}
      step('根の代わりを選ぶ',`子が2つあるので、左の部分木の最大値 ${pred.v} を使います。`,[old,pred.v]);root.v=pred.v;if(parent===root)root.left=pred.left;else parent.right=pred.left;
    }else root=root.left||root.right;
    step('削除後の木を確認する',`根にあった ${old} を削除しました。各頂点で、左が小さく右が大きい関係は保たれます。`,[root.v]);return f;
  });
})();
