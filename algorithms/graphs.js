// 第4章の各場面は、頂点の値と候補の実際の変化から組み立てる。
(() => {
  const colors = { fresh: '#466b87', open: '#49761c', done: '#aa580c', now: '#b83c37', line: '#a4b5bd' };
  const layout = { A:[65,122], B:[191,42], C:[191,222], D:[318,122], E:[446,42], F:[446,222], G:[574,122] };
  const tree = { A:[320,29], B:[159,90], C:[319,90], D:[480,90], E:[76,151], F:[200,151], H:[319,151], I:[440,151], J:[560,151], K:[76,215], G:[318,215], L:[560,215] };
  const branches = ['AB','AC','AD','BE','BF','CH','DI','DJ','EK','HG','JL'].map(pair => [pair[0], pair[1]]);
  const dijkstraEdges = [['A','B',2],['A','C',5],['B','C',6],['B','D',1],['B','E',3],['D','E',4],['C','F',8],['E','G',9],['F','G',7]];
  const bellmanEdges = [['A','B',9],['A','C',2],['B','C',6],['B','D',3],['B','E',1],['C','D',2],['C','F',9],['D','E',5],['D','F',6],['E','F',3],['E','G',7],['F','G',4]];
  const finite = n => Number.isFinite(n) ? String(n) : '∞';
  const edgeId = (a,b) => [a,b].sort().join('');
  function target(raw, nodes) {
    const v = String(raw).normalize('NFKC').trim().toUpperCase();
    if (!Object.hasOwn(nodes,v)) throw new Error('図にある頂点の英字を1文字入力してください。');
    return v;
  }
  function getPath(parents, end) {
    const arr = [end];
    while (parents[arr[0]] && !arr.includes(parents[arr[0]])) arr.unshift(parents[arr[0]]);
    return arr;
  }
  function graphic(nodes, edges, state = {}) {
    const { current='', done=[], open=[], distance=null, selected=[], checked=[], path=[], directed=false, line1='', line2='' } = state;
    const keyFor = directed ? (a,b)=>a+b : edgeId;
    const pathEdges = path.slice(1).map((v,i) => keyFor(path[i],v));
    let body = '';
    for (const [a,b,w] of edges) {
      const key = keyFor(a,b), hot = checked.includes(key), chosen=pathEdges.includes(key) || selected.includes(key);
      const color=hot?colors.open:chosen?colors.done:colors.line;
      let [x,y]=nodes[a], [X,Y]=nodes[b];
      const dx=X-x,dy=Y-y,len=Math.hypot(dx,dy),u=dx/len,v=dy/len;
      if(directed && edges.some(([from,to])=>from===b&&to===a)) {
        // Offset opposing arrows so their labels and directions stay distinct.
        x-=14*v;X-=14*v;y+=14*u;Y+=14*u;
      }
      body += '<line x1="'+x+'" y1="'+y+'" x2="'+X+'" y2="'+Y+'" stroke="'+color+'" stroke-width="'+(hot||chosen?6:3)+'"/>';
      if (directed) {
        const cx=x+.69*dx,cy=y+.69*dy;
        body+='<polygon points="'+[[cx+u*7,cy+v*7],[cx-u*6-v*6,cy-v*6+u*6],[cx-u*6+v*6,cy-v*6-u*6]].map(q=>q.join(',')).join(' ')+'" fill="'+color+'"/>';
      }
      if (w!==undefined) {
        const mx=(x+X)/2,my=(y+Y)/2;
        body+='<rect x="'+(mx-14)+'" y="'+(my-12)+'" width="28" height="24" rx="5" fill="#fff"/>';
        body+=Art.text(mx,my+7,w,19,hot?colors.open:'#31495b');
      }
    }
    for (const [v,[x,y]] of Object.entries(nodes)) {
      const focused=v===current, settled=done.includes(v)||path.includes(v), queued=open.includes(v);
      const fill=focused?colors.now:settled?colors.done:queued?colors.open:colors.fresh;
      const width=distance?68:40, label=distance?v+' '+finite(distance[v]):v;
      body+='<rect x="'+(x-width/2)+'" y="'+(y-17)+'" width="'+width+'" height="34" rx="15" fill="'+fill+'"/>';
      if (focused) body+='<rect x="'+(x-width/2-3)+'" y="'+(y-20)+'" width="'+(width+6)+'" height="40" rx="17" fill="none" stroke="'+fill+'" stroke-width="2"/>';
      body+=Art.text(x,y+7,label,19,'white');
    }
    body+=Art.text(320,268,line1,18,'#173c54')+Art.text(320,299,line2,17,'#3d5868');
    return Art.svg(body);
  }
  function intro(raw) {
    const start=target(raw,layout);
    const neighbors=dijkstraEdges.filter(([a,b])=>a===start||b===start)
      .map(([a,b,w])=>[a===start?b:a,w]);
    const neighbor=neighbors[0][0];
    const localEdges=neighbors.map(([v])=>edgeId(v,start));
    const draw=(title,text,state)=>({title,text,svg:graphic(layout,dijkstraEdges,state)});
    return [
      draw('頂点に名前を付ける','駅を点で、線路を線で表した地図を考えます。点が頂点、線が辺です。',{current:start,line1:'赤い点が出発駅 '+start,line2:'A から G まで、7 つの頂点があります。'}),
      draw('隣の頂点を調べる','一本の辺だけで行ける頂点が隣です。無向グラフでは、行きと帰りに同じ辺を使えます。',{current:start,open:neighbors.map(n=>n[0]),checked:localEdges,line1:start+' の隣　'+neighbors.map(n=>n[0]).join(' ・ '),line2:'緑の線をどちら向きにも進めます。'}),
      draw('辺の数字を読む','辺の数字を移動にかかる時間とします。経路の合計時間は、通った辺の数字を足し合わせて求めます。',{current:start,checked:[edgeId(start,neighbor)],open:[neighbor],line1:start+' → '+neighbor+' のコストは '+neighbors[0][1],line2:'頂点の間隔はコストに含めません。'}),
      draw('矢印を付ける','一方通行の路線では、矢印の向きだけに移動できます。図では各辺を有向に変えました。',{current:start,directed:true,line1:'矢印の向きが進める向き',line2:'辺に向きがあると、帰りの道があるとは限りません。'})
    ];
  }
  function traversal(raw, depth) {
    const end=target(raw,tree), pending=['A'], seen=new Set(pending), visited=[], parent={}, frames=[];
    function add(title,text,current,checked=[],path=[]) {
      frames.push({title,text,svg:graphic(tree,branches,{current,done:visited,open:pending,checked,path,
        line1:(depth?'スタックの次 → ':'キューの先頭 → ')+(pending.join('　')||'空'),
        line2:'探索順　'+(visited.join(' → ')||'まだありません')})});
    }
    add('A から '+end+' を探す',depth?'候補を積み重ね、新しく見つけた枝を先に調べます。同時に追加する枝は、図の左を先に取り出す順で積みます。':'候補を見つけた順に並べます。同時に見つけた候補は図の左から並べます。','');
    while (pending.length) {
      const node=pending.shift();
      visited.push(node);
      if (node===end) {
        const path=getPath(parent,end);
        add('目的の '+end+' に到着','探索した頂点の数は '+visited.length+'。A からの経路は '+path.join(' → ')+' です。',node,[],path);
        break;
      }
      add(node+' を取り出す',depth?'スタックの先頭に置いた '+node+' を調べます。':'キューの先頭に並んでいた '+node+' を調べます。',node);
      const next=branches.filter(([a,b])=>a===node||b===node).map(([a,b])=>a===node?b:a).filter(v=>!seen.has(v));
      for(const v of next) {seen.add(v);parent[v]=node;}
      if(depth) pending.unshift(...next); else pending.push(...next);
      const text=next.length?next.join('、')+' を'+(depth?'先頭':'末尾')+'に加えます。':'新しい枝はありません。候補に残った次の頂点を調べます。';
      add(next.length?'候補に加える':'この枝は行き止まり',text,node,next.map(v=>edgeId(node,v)));
    }
    return frames;
  }
  function shortest(raw, bellman) {
    const special=bellman&&['負辺','負閉路'].includes(raw.trim());
    const nodes=special?{A:[90,137],B:[300,45],C:[300,222],G:[540,137]}:layout;
    const goal=special?'G':target(raw,nodes);
    const edges=special?[['A','B',2],['B','G',1],['A','C',4],['C','B',-3],...(raw.trim()==='負閉路'?[['B','C',1]]:[])]:bellman?bellmanEdges:dijkstraEdges;
    const keyFor = special ? (a,b)=>a+b : edgeId;
    const distance=Object.fromEntries(Object.keys(nodes).map(v=>[v,Infinity]));
    const parent={},done=[],frames=[];distance.A=0;
    const keys=Object.keys(nodes);
    function add(title,text,current='',state={}) {
      const selected=Object.entries(parent).filter(([child])=>bellman||done.includes(child)).map(([v,p])=>keyFor(p,v));
      const stateWithValues={current,distance,done,selected,open:keys.filter(k=>Number.isFinite(distance[k])&&!done.includes(k)),directed:special,...state};
      const svg=graphic(nodes,edges,stateWithValues);
      frames.push({title,text,svg});
    }
    add('初期値を置く','A は出発点なので 0。ほかの頂点の ∞ は、まだ経路を見つけていないことを表します。','A',{line1:'始点 A　　目的地 '+goal,line2:'線の数字は辺のコスト、頂点の数字は A からの合計'});
    if(bellman) {
      for(let pass=1;pass<=keys.length;pass++) {
        let changed=false;
        for(const [a,b,w] of edges) {
          const dirs=special?[[a,b]]:[[a,b],[b,a]].sort(([v],[u])=>distance[v]-distance[u]);
          for(const [u,v] of dirs) {
            if(!Number.isFinite(distance[u])) continue;
            const previous=distance[v], candidate=distance[u]+w;
            if(candidate<previous) {
              changed=true;
              if(pass===keys.length) {
                add('負の閉路を検出する','頂点数 − 1 回の走査後にも値が下がりました。この例では B → C → B を回るたびに 2 減り、その後 G に行けるので、G までの最小値が存在しません。',u,{line1:'B → C → B　　1 − 3 = −2',line2:'閉路を繰り返すたびに合計が小さくなる'});
                return frames;
              }
              distance[v]=candidate;parent[v]=u;
              add(pass+' 周目　'+v+' の記録を更新',u+' を通ると合計 '+candidate+'。'+v+' の以前の値 '+finite(previous)+' より小さいので、直前の頂点も '+u+' にします。',u,{checked:[keyFor(u,v)],line1:u+' → '+v+'　　'+distance[u]+' + ('+w+') = '+candidate,line2:v+' の値　'+finite(previous)+' → '+candidate});
            } else if(pass===1&&u==='B'&&v==='A') {
              add('逆向きも比べる','無向の辺 A–B は、反対向きにも調べます。A の 0 より高い値は書き込みません。',u,{checked:['AB'],line1:'B → A　　9 + 9 = 18',line2:'A の記録　0 のまま'});
            }
          }
        }
        add(pass+' 周目が終了',changed?'全ての辺を調べ終えました。新しい記録を使い、同じ順序でもう一度辺を調べます。':'全ての辺を試しても値が変わりませんでした。これで最短距離が決まりました。','',{line1:'辺を一巡　'+(changed?'更新あり':'更新なし'),line2:changed?'もう一周調べます。':'最後に直前の頂点をたどります。'});
        if(!changed)break;
      }
    } else {
      while(done.length<keys.length) {
        const options=keys.filter(k=>!done.includes(k)&&Number.isFinite(distance[k])).sort((a,b)=>distance[a]-distance[b]);
        const u=options[0]; if(!u)break;
        done.push(u);
        add(u+' の '+distance[u]+' を確定',options[1]&&distance[u]===distance[options[1]]?'最小値が同じ頂点が複数あります。この例では英字順に '+u+' を選びます。':'未確定の候補から、A に最も安くつながる '+u+' を選びます。',u,{line1:'選ぶ前の候補　'+options.map(v=>v+' '+distance[v]).join('　'),line2:'確定順　'+done.join(' → ')});
        if(u===goal)break;
        for(const [a,b,w] of edges) {
          if(a!==u&&b!==u)continue;
          const v=a===u?b:a;if(done.includes(v))continue;
          const prev=distance[v],alt=distance[u]+w,update=alt<prev;
          if(update){distance[v]=alt;parent[v]=u;}
          add(u+' → '+v+' を試す',update?'合計が今の記録を下回ります。'+v+' の値を書き換え、どこから来たかも保存します。':'すでに同じか、それより安い道があります。今の値と直前の頂点を残します。',u,{checked:[keyFor(u,v)],line1:distance[u]+' + '+w+' = '+alt,line2:v+' の記録　'+finite(prev)+(update?' → '+alt:' のまま')});
        }
      }
    }
    const path=getPath(parent,goal);
    add('最短経路をたどる','各頂点に記録した直前の頂点を '+goal+' から A まで逆にたどり、順番を反転すると経路が得られます。',goal,{path,line1:path.join(' → '),line2:'合計コスト　'+distance[goal]});
    return frames;
  }
  function maze(raw) {
    const mode=raw.trim();
    if(!['直線','ゼロ','マンハッタン'].includes(mode)) throw new Error('推定の種類として「直線」「ゼロ」「マンハッタン」のどれかを入力してください。');
    const map=['...####','.#.####','.#.....','.#.###.','.#.#...','.#.#.##','.......'];
    const start=16,goal=48, coords=n=>[n%7,Math.floor(n/7)];
    const heuristic=n=>{
      const [x,y]=coords(n);
      if(mode==='ゼロ')return 0;
      return mode==='直線'?Math.round(Math.hypot(6-x,6-y)):12-x-y;
    };
    const estimate=n=>g[n]+heuristic(n);
    const pos=n=>{const [x,y]=coords(n);return '('+(x+1)+', '+(y+1)+')';};
    const g={[start]:0},parent={},closed=new Set(),open=[start],frames=[];
    function add(title,text,current,path=[]) {
      let body='';
      for(let y=0;y<7;y++)for(let x=0;x<7;x++) {
        if(map[y][x]==='#')continue;
        const n=y*7+x, left=45+x*37, top=14+y*37;
        const isPath=path.includes(n), isOpen=open.includes(n), active=n===current;
        const fill=active?colors.now:isPath?colors.done:isOpen?colors.open:closed.has(n)?'#517b98':'#f2f6f8';
        body+='<rect x="'+left+'" y="'+top+'" width="35" height="35" rx="5" fill="'+fill+'" stroke="#a9bbc5"/>';
        const value=n===start?'S':n===goal?'G':Number.isFinite(g[n])?estimate(n):'';
        body+=Art.text(left+17.5,top+24,value,17,(isPath||isOpen||active||closed.has(n))?'white':'#3c5567');
      }
      body+=Art.text(464,54,'実際 ＋ 見込み',23,'#254b64');
      if(current!==undefined) {
        body+=Art.text(464,98,'現在のマス　'+pos(current),17);
        body+=Art.text(464,142,'実際　'+g[current]+' 歩',22);
        body+=Art.text(464,175,'見込み　'+heuristic(current)+' 歩',22);
        body+=Art.text(464,216,'評価値　'+estimate(current),24,'#964811');
      }
      body+=Art.text(320,290,path.length?'橙が経路　　合計 '+g[goal]+' 歩':'S は出発、G は目的地。緑は候補、赤は現在地。',18);
      frames.push({title,text,svg:Art.svg(body)});
    }
    add('S から G への道を探す','上下左右に一歩ずつ移動します。この迷路では、出発からの実際の歩数と、ゴールまでの見込みを足した数の小さい候補から調べます。',start);
    add('残りの歩数を見積もる',mode==='直線'?'書籍と同じく、今の位置から G までの直線距離を四捨五入します。壁は見積もりに含めません。':mode==='ゼロ'?'全ての見込みを 0 にすると、出発からの実際の歩数だけで選ぶダイクストラ法と同じ順序になります。':'横に必要な歩数と縦に必要な歩数を足します。壁を回り込む分は含めません。',start);
    while(open.length) {
      open.sort((a,b)=>estimate(a)-estimate(b));
      const u=open.shift();closed.add(u);
      if(u===goal) {
        add('ゴールを取り出す','G の評価値は実際の歩数と一致します。'+closed.size+' マスを取り出したところで探索を終了します。',u);
        const path=[goal];while(path[0]!==start)path.unshift(parent[path[0]]);
        add('最短経路がつながる','各マスで覚えていた一つ前のマスをたどると、S から G までの '+g[u]+' 歩の経路が得られます。',goal,path);
        break;
      }
      add(pos(u)+' を選ぶ','候補から評価値が最小のマスを取り出します。同点なら先に候補に入ったマスから調べます。',u);
      const [x,y]=coords(u), next=[];
      for(const [xx,yy] of [[x+1,y],[x,y+1],[x,y-1],[x-1,y]]) {
        if(map[yy]?.[xx]!=='.')continue;
        const v=yy*7+xx,newCost=g[u]+1;
        if(newCost>=(g[v]??Infinity))continue;
        g[v]=newCost;parent[v]=u;closed.delete(v);if(!open.includes(v))open.push(v);
        next.push(pos(v)+' は '+estimate(v));
      }
      if(next.length)add('隣のマスを候補に加える','実際の歩数に見込みを加えます。新しい評価値は '+next.join('、')+'。図の緑のマスに表示しています。',u);
    }
    return frames;
  }
  function register(id,title,page,introText,label,examples,build) {
    lessons.push({id,title,page,intro:introText,inputLabel:label,examples,build});
  }
  register('4-1','グラフとは？',88,'頂点と辺を駅と線路に見立て、つながり、向き、コストの読み方を覚えます。','出発する頂点（A〜G）',['A','D'],intro);
  register('4-2','幅優先探索',92,'キューに見つけた順で並べ、出発点から辺の本数が少ない頂点から順番に探します。','探す頂点（A〜L）',['G','K','L'],raw=>traversal(raw,false));
  register('4-3','深さ優先探索',96,'新しく見つけた枝を優先して進み、行き止まりでは残しておいた候補に戻ります。','探す頂点（A〜L）',['G','K','L'],raw=>traversal(raw,true));
  register('4-4','ベルマン–フォード法',100,'辺を一巡するたびに距離を見直します。補足の実験では負の辺や、回るたびに合計が減る閉路も調べられます。','目的地（A〜G）、または「負辺」「負閉路」',['G','E','負辺','負閉路'],raw=>shortest(raw,true));
  register('4-5','ダイクストラ法',106,'辺のコストがすべて 0 以上のとき、未確定の頂点から最小のものを一つずつ確定します。','目的地（A〜G）',['G','D','F'],raw=>shortest(raw,false));
  register('4-6','A*（エースター）',114,'出発点からの歩数と、ゴールまでの見込みを合わせて候補を選びます。同じ迷路で見込みの付け方を変えて比較できます。','見込みの計算（直線・ゼロ・マンハッタン）',['直線','ゼロ','マンハッタン'],maze);
})();
