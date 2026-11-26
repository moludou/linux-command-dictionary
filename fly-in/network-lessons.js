// The lesson frames use the same topology and costs as the diagrams.
const networkCourse = (() => {
  const town = {
    points:{港:[32,125],丘:[106,90],林:[106,160],塔:[180,55],池:[180,125],橋:[180,195],門:[254,90],川:[254,160],駅:[328,125]},
    edges:['港丘','港林','丘塔','丘池','林池','林橋','池門','橋川','門駅','川駅']
  };
  const roads = {
    points:{浜:[32,128],倉:[105,65],園:[105,190],市:[178,125],坂:[251,65],森:[251,190],灯:[328,128]},
    edges:['浜倉','浜園','園倉','園市','倉市','倉坂','市坂','市森','坂灯','森灯','園森'],
    weights:[7,2,2,5,1,5,2,4,4,1,10]
  };
  const fares = {...roads, directed:true, weights:roads.weights.map((w,i)=>roads.edges[i]==='倉市' ? -2 : w)};
  const air = {
    points:{港:[30,129],丘:[103,68],谷:[101,175],関:[204,77],湾:[177,192],島:[253,171],駅:[325,118]},
    edges:['港丘','丘関','港谷','谷関','関駅','谷湾','湾島','島駅']
  };
  const boards={town,roads,fares,air};
  const page=(title,text,values={})=>({title,text,...values});
  const join=names=>names.length ? names.join(' → ') : 'なし';
  const pairs=path=>path.slice(1).map((v,i)=>path[i]+v);
  function neighbors(board,node) {
    return board.edges.filter(edge=>edge.includes(node)).map(edge=>edge[0]===node ? edge[1] : edge[0]);
  }
  function recover(parent,node) {
    const path=[node];
    while(parent[node]) {node=parent[node]; path.unshift(node);}
    return path;
  }
  const graph=[
    page('分岐のあるグラフとは？','港から駅までの地図です。九つの丸は場所、十本の線は行き来できる通路です。港で道が分かれ、離れた道が池でまたつながります。',{footer:'港から駅まで、どこを通れるだろう'}),
    page('池には三つの隣がある','池に指を置き、そこに触れている線だけをたどりましょう。丘、林、門に着きます。駅へ行くには、もう一本先の通路が必要です。',{current:'池',open:['丘','林','門'],lit:['丘池','林池','池門'],footer:'池の隣　丘・林・門'}),
    page('枝の先と、一周できる道','丘から塔に進むと、戻り道は丘へ向かう一本だけです。一方、色のついた四本をたどれば、港から丘、池、林を通って港に戻れます。出発点に戻るこの道を閉路と呼びます。',{current:'塔',lit:['港丘','丘池','林池','港林'],footer:'閉路　港 → 丘 → 池 → 林 → 港'}),
    page('通る場所が違っても同じ駅に着く','下側の道をたどると港、林、橋、川、駅です。上側には港、丘、池、門、駅という道があります。どちらも四本。幅優先探索では、もっと少ない本数で着ける道があるかも順番に確かめます。',{lit:['港林','林橋','橋川','川駅'],current:'駅',footer:'港 → 林 → 橋 → 川 → 駅'})
  ];
  const coordinates=Object.fromEntries(Object.entries(town.points).map(([k,[x,y]])=>[k,[(x-32)/74,(195-y)/35]]));
  const fileLines=['nb_drones: 3',...Object.entries(coordinates).map(([k,xy])=>(k==='港'?'start_hub':k==='駅'?'end_hub':'hub')+': '+k+' '+xy.join(' ')),...town.edges.map(([a,b])=>'connection: '+a+'-'+b)];
  const mapPages=[
    page('大きな地図ファイルを読むには？','飛ばす台数、場所、通路の順で地図を組み立てます。この例では3台、9地点、通路10本です。図の下で入力ファイル全体も開けます。',{footer:'3台　／　9地点　／　10本の通路'}),
    page('最初の10行で、台数と九つの地点を読む','1行目は台数です。続く9行には、出発地の港、目的地の駅、途中の七つの地点の名前と座標があります。ここまでで点がそろいました。',{edgeCount:0,footer:'地点の例　hub: 池 2 2',current:'池'}),
    ...town.edges.map((edge,i)=>{
      const [a,b]=edge, seen=town.edges.slice(0,i+1);
      const adjacent=neighbors({edges:seen},b);
      return page((11+i)+'行目　'+a+'と'+b+'を結ぶ','「connection: '+a+'-'+b+'」を読み、図に一本の線を加えます。'+a+'の隣に'+b+'を、'+b+'の隣に'+a+'を登録します。ここまでに読んだ通路では、'+b+'の隣は'+adjacent.join('・')+'です。',{edgeCount:i+1,current:b,lit:[edge],footer:'connection: '+a+'-'+b});
    }),
    page('隣接リストから池の分かれ道を読む','完成した図の池には三本の線があります。入力ファイルの「丘-池」「林-池」「池-門」をまとめると、池の隣は丘・林・門です。駅を目指す探索は、この三つを次の候補にできます。',{current:'池',open:['丘','林','門'],lit:['丘池','林池','池門'],footer:'隣接リスト　池 → ［丘、林、門］'})
  ];
  function breadth() {
    const queue=['港'],seen=new Set(queue),done=[],parent={};
    const pages=[page('枝分かれを幅優先で調べるには？','港から駅へ、通路の本数が最も少ない道を探します。先に見つけた地点から取り出し、初めて見つけた隣は列の右端に加えます。同じ段では図の上側の枝から調べます。',{open:[...queue],footer:'調べる順番　港'})];
    while(queue.length){
      const at=queue.shift();
      if(at==='駅'){
        const path=recover(parent,at);
        pages.push(page('駅までの最少本数は'+(path.length-1)+'本','駅を列から取り出しました。駅を見つけた門、その門を見つけた池、というように一つ前の地点を逆にたどると、最初に見つけた最短経路が分かります。',{current:at,lit:pairs(path),done:[...done],footer:join(path)}));break;
      }
      const added=neighbors(town,at).filter(k=>!seen.has(k));
      for(const k of added){seen.add(k);queue.push(k);parent[k]=at;}
      done.push(at);
      const depth=recover(parent,at).length-1;
      pages.push(page(at+'を列の先頭から取り出す','港から通路'+depth+'本の地点です。'+(added.length?'初めて見つけた'+added.join('と')+'を列の末尾に加えます。':'隣はすべて発見済みです。列に二度加える地点はありません。'),{current:at,lit:added.map(k=>at+k),open:[...queue],done:[...done],footer:'調べる順番　'+join(queue)}));
    }
    return pages;
  }
  function depth() {
    const stack=['港'], seen=new Set(stack);
    const pages=[page('同じ地図を深さ優先で調べるには？','幅優先と同じ港から出発します。今いる地点から未訪問の隣を一つ選び、その先へ進みます。この例の分かれ道では港で丘、丘で塔、池で林を先に選びます。',{current:'港',footer:'探索中の道　港'})];
    while(stack.length){
      const at=stack.at(-1);
      if(at==='駅'){
        pages.push(page('最初に見つけた経路は'+(stack.length-1)+'本','駅に着いたので探索を止めます。塔に寄って戻った動きは、完成した経路から外れます。幅優先では4本の道が見つかりましたが、この順に深くたどると6本の道が先に見つかります。',{current:at,lit:pairs(stack),done:[...seen],footer:join(stack)}));break;
      }
      const next=neighbors(town,at).find(k=>!seen.has(k));
      if(next){
        seen.add(next);stack.push(next);
        pages.push(page(at+'から'+next+'へ進む',at+'から直接行けて、まだ調べていない'+next+'を選びます。次は'+next+'の隣を調べます。前に訪れた場所には印を残すので、閉路に入っても同じ所を回り続けません。',{current:next,lit:pairs(stack),done:[...seen],footer:join(stack)}));
      } else {
        stack.pop();
        pages.push(page(at+'から'+stack.at(-1)+'へ戻る',at+'には未訪問の隣がありません。一本前の通路を戻り、別の枝が残っている地点から探索を続けます。',{current:stack.at(-1),lit:[at+stack.at(-1)],done:[...seen],footer:'探索中の道　'+join(stack)}));
      }
    }
    return pages;
  }
  function weighted(bellman) {
    const board=bellman ? fares : roads;
    const dist=Object.fromEntries(Object.keys(board.points).map(k=>[k,Infinity]));
    dist.浜=0;
    const parent={},settled=[];
    const pages=[page(bellman?'ベルマン–フォード法とは？':'重みのある道で、最短経路を探すには？',bellman?'各地点までの仮の料金を置き、すべての矢印を繰り返し調べて値を小さくしていく方法です。市に入る割引区間がある運賃の例です。矢印の向きにだけ進めます。':'浜から灯まで行きます。線の数字はその道の所要時間（分）、丸の下の数字は浜からそこまでの合計です。道路ごとに時間が違う一般の例で、Fly-inのゾーンのルールとは単位が異なります。',{current:'浜',dist:{...dist},footer:'∞ は、まだ道が見つかっていない印'})];
    if(bellman) {
      const order=[...board.edges.keys()].reverse();
      for(let pass=1;pass<Object.keys(dist).length;pass++){
        let changed=false;
        for(const i of order){
          const [a,b]=board.edges[i],w=board.weights[i],candidate=dist[a]+w;
          if(candidate>=dist[b])continue;
          const old=dist[b];
          dist[b]=candidate;parent[b]=a;changed=true;
          const calc=dist[a]+(w<0?' − '+(-w):' ＋ '+w)+' ＝ '+candidate;
          pages.push(page(pass+'巡目　'+a+'から'+b+'の料金を更新',a+'までの料金に矢印の料金を足します。'+calc+'。'+(Number.isFinite(old)?b+'の前の値は'+old+'。今回の方が小さいので書き換えます。':b+'への道が初めて見つかりました。'),{current:b,lit:[a+b],dist:{...dist},footer:calc}));
        }
        if(!changed){pages.push(page('一巡しても、値が変わらなくなった','同じ順ですべての矢印をもう一度調べました。どこを通っても、記録した料金より安くできません。この例には、回るたびに料金が下がる閉路はありません。',{dist:{...dist},footer:'すべての矢印で更新なし'}));break;}
      }
    } else {
      while(settled.length<Object.keys(dist).length){
        const at=Object.keys(dist).filter(k=>!settled.includes(k)).sort((a,b)=>dist[a]-dist[b])[0];
        settled.push(at);
        pages.push(page(at+'までの'+dist[at]+'分を確定する','まだ確定していない中で、仮の合計がいちばん小さい地点は'+at+'です。どの道の所要時間も正なので、この先ほかを回っても、ここへもっと早くは着けません。',{current:at,done:[...settled],dist:{...dist},footer:'確定した順　'+join(settled)}));
        if(at==='灯')break;
        for(const b of neighbors(board,at)){
          const i=board.edges.findIndex(e=>e===at+b || e===b+at);
          const w=board.weights[i],candidate=dist[at]+w,old=dist[b];
          if(candidate>=old)continue;
          dist[b]=candidate;parent[b]=at;
          pages.push(page(at+'を通ると'+b+'まで'+candidate+'分',at+'までの'+dist[at]+'分に、'+at+'から'+b+'までの'+w+'分を足します。'+(Number.isFinite(old)?'前の候補は'+old+'分。短い道が見つかったので、値と一つ前の地点を書き換えます。':'初めて見つけた道なので、この合計を仮の値にします。'),{current:b,done:[...settled],lit:[at+b],dist:{...dist},footer:dist[at]+' ＋ '+w+' ＝ '+candidate+(Number.isFinite(old)?'　（前は'+old+'）':'')}));
        }
      }
    }
    const route=recover(parent,'灯');
    pages.push(page('浜から灯までの道をたどり直す','灯の値を最後に小さくした地点から、一つずつ手前へ戻ります。出発順に並べ直すと'+join(route)+'。'+(bellman?'料金の合計は':'所要時間は')+dist.灯+(bellman?'です。':'分です。'),{current:'灯',lit:pairs(route),dist:{...dist},footer:join(route)}));
    return pages;
  }
  const grid=['.......','.##.##.','S..#..G','.#.#.#.','.......'];
  function maze(){
    const cell=(x,y)=>y*7+x, start=cell(0,2), goal=cell(6,2);
    const h=k=>Math.abs(6-k%7)+Math.abs(2-Math.floor(k/7));
    const g={[start]:0},parent={},open=new Set([start]),closed=[];
    const pages=[page('壁のある迷路をA*で解くには？','出発は左のS、目的地は右のGです。白いマスを上下左右に1マス進むと1歩。濃いマスは壁です。各候補で、ここまでの歩数 g に、壁を無視した残りの縦横の歩数 h を足します。',{open:[start],current:start,footer:'候補の評価　f ＝ g ＋ h',note:'f が同じなら h の小さいマスを先に、それも同じなら上の行から左順に選びます。マスの数字はこの例での f です。'})];
    while(open.size){
      const score=k=>g[k]+h(k);
      const at=[...open].sort((a,b)=>score(a)-score(b)||h(a)-h(b)||a-b)[0];
      open.delete(at); closed.push(at);
      if(at===goal){
        const path=recoverGrid(parent,goal);
        pages.push(page('壁を回り込んでGまで'+g[goal]+'歩','Gを候補から取り出しました。見積もりは0、実際に歩く距離は'+g[goal]+'歩です。色のついた道を逆にたどると、どの分かれ道で曲がったか分かります。',{current:at,done:[...closed],path,footer:'最短経路　'+g[goal]+'歩'}));break;
      }
      const x=at%7,y=Math.floor(at/7);
      let added=0;
      for(const [dx,dy] of [[1,0],[0,-1],[0,1],[-1,0]]){
        const nx=x+dx,ny=y+dy;
        if(!grid[ny]?.[nx] || grid[ny][nx]==='#')continue;
        const k=cell(nx,ny),ng=g[at]+1;
        if(ng>=(g[k]??Infinity))continue;
        g[k]=ng;parent[k]=at;open.add(k);added++;
      }
      pages.push(page('横'+(x+1)+'・縦'+(y+1)+'のマスを調べる','縁取りしたマスは、候補の中で g＋h が最小です。ここまで'+g[at]+'歩、残りは少なくとも'+h(at)+'歩。'+(added?'この地点から進める候補を'+added+'か所、新規登録または更新しました。':'周囲は壁か、すでに同じ歩数以下で行けるマスです。新しい候補はありません。'),{current:at,done:[...closed],open:[...open],scores:Object.fromEntries([...open].map(k=>[k,score(k)])),footer:'g ＝ '+g[at]+'　　h ＝ '+h(at)+'　　f ＝ '+score(at)}));
    }
    return pages;
  }
  function recoverGrid(parent,node){
    const path=[node];
    while(parent[node]!==undefined){node=parent[node];path.unshift(node);}
    return path;
  }
  const split=[
    ['港','港','港'],['丘','谷','港'],['関','湾','谷'],['駅','島','関'],['駅','駅','駅']
  ];
  const queue=[
    ['港','港','港'],['丘','谷','港'],['関','谷','丘'],['駅','関','丘'],['駅','駅','関'],['駅','駅','駅']
  ];
  function flight(title,text,at,more={}) {
    return page(title,text,{at,...more});
  }
  const fleet=[
    flight('三台を二つの経路に分けるには？','港から駅に向かいます。短い道は関に集まり、谷から湾・島を回る道は一本長くなります。どの移動も1ターン。途中の各地点と各通路の定員は1台です。',split[0]),
    flight('1ターン目　二台が出て、一台が待つ','1号機は丘へ、2号機は谷へ進みます。港から出る通路は二本なので、3号機はここで待ちます。',split[1]),
    flight('2ターン目　2号機を湾へ回す','1号機は関に向かいます。2号機はもう一つの道を選んで湾へ。2号機が谷を出たのと同じターンに、3号機が港から谷に入ります。',split[2]),
    flight('3ターン目　最初の一台が到着','1号機は関から駅へ、2号機は湾から島へ進みます。空いた関には谷から3号機が入ります。駅にはまだ1台だけです。',split[3]),
    flight('4ターン目　別々の通路から同時に届ける','2号機は島から、3号機は関から駅へ入ります。全員が4ターンで到着しました。全機が短い道を選ぶと出口が関の先の一本に限られ、最後は5ターン目です。',split[4])
  ];
  const restricted=[
    flight('別々の通路でも、同時に入れないのはなぜ？','今回は関だけが制限ゾーンで、定員は1台です。どの方向から関へ向かっても到着は2ターン後。丘から来る機体と谷から来る機体で、到着時刻を調整します。',['港','港']),
    flight('1ターン目　丘と谷で道が分かれる','1号機は丘へ、2号機は谷へ進みました。どちらの地点からも、別々の通路を使って関に向かえます。',['丘','谷']),
    flight('2ターン目　到着先の空きを先に確かめる','1号機だけが丘から関へ出発します。2号機も今出発すると、次のターンに同じ関に2台が必ず着いてしまいます。2号機はまだ谷で待ちます。',['丘関','谷']),
    flight('3ターン目　先の一台が関に着く','1号機が関に到着。2号機は今から谷を出れば、到着は4ターン目です。1号機がそのターンに関を出る予定なので、2号機は通路に入れます。',['関','谷関']),
    flight('4ターン目　関の中で入れ替わる','1号機は駅へ向かい、2号機が通路から関へ入ります。通路の途中で待った機体はなく、関の定員も守れました。',['駅','関']),
    flight('5ターン目　二台目も駅へ','2号機が駅に着きました。別々の通路に空きがあっても、制限ゾーンへ出発する前に、到着するターンの空きまで確かめる必要があります。',['駅','駅'])
  ];
  const bottleneck=[
    flight('合流する関がボトルネックになると？','港から丘と谷に分かれても、三台とも関を通る作戦です。途中はすべて普通のゾーンで定員1台。いちばん早い機体は3ターン目にしか駅に着けません。',queue[0]),
    flight('1ターン目　丘と谷を使う','港には3号機が残ります。1号機と2号機は、次に同じ関へ向かう予定です。',queue[1]),
    flight('2ターン目　2号機は谷で待機','関に入れるのは1号機だけです。2号機は谷で待ち、3号機は空いた丘に進みます。',queue[2]),
    flight('3ターン目　関を使えるのは次の一台','1号機が駅へ、2号機が関へ進みます。3号機は丘で待ちます。駅に通じる同じ一本の通路を一度に2台は使えません。',queue[3]),
    flight('4ターン目　まだ一台が関にいる','2号機が駅に到着し、3号機はようやく関に入れました。',queue[4]),
    flight('5ターン目　全員が到着','関を通る作戦では、3、4、5ターン目に1台ずつ到着します。次は同じ地図で、2号機だけが湾を回った場合を比べましょう。',queue[5]),
    flight('別の作戦の4ターン目と比べる','2号機を谷から湾、島へ回すと、2号機と3号機が別々の通路から同時に到着できます。一台に長い道を割り当てた結果、全員の到着は1ターン早まりました。',split[4])
  ];
  const traces=[
    ['港','丘','関','駅'],['港','谷','湾','島','駅'],['港','港','谷','関','駅']
  ];
  for (const sequence of [fleet,restricted,bottleneck]) {
    for (let i=1;i<sequence.length;i++) sequence[i].from=sequence[i-1].at;
  }
  bottleneck.at(-1).from=split[3];
  const layers=[
    page('七つの地点を時間ごとに並べると？','横は出発時から4ターン目まで、縦は地図にある七つの地点です。点一つが「その時刻に、その場所にいる」を表します。ここには三台の予定で使う移動だけを描きます。',{lengths:[0,0,0],footer:'右に一列進むと1ターン経過'}),
    page('1号機の道を時刻と組にする','港を出て1ターン目に丘、2ターン目に関、3ターン目に駅です。線が関の段を通るのは2の列だけです。',{lengths:[4,0,0],footer:'1号機　港 → 丘 → 関 → 駅'}),
    page('2号機は別の列を通って駅へ','2号機は谷、湾、島の順に進み、4ターン目に駅です。到着時刻が1号機と違うことを、線の終わる列で確かめられます。',{lengths:[4,5,0],footer:'2号機　港 → 谷 → 湾 → 島 → 駅'}),
    page('港から港への一歩は待機','3号機の最初の線は水平です。左の港は出発時、右の港は1ターン目。同じ港にいても、時間が一つ進んでいます。',{lengths:[4,5,2],footer:'3号機　港で1ターン待機'}),
    page('同じ関を別のターンに使う','3号機は2ターン目に谷、3ターン目に関、4ターン目に駅です。1号機が関を使ったのは2ターン目。二つの点は別の列なので、定員1台の関を共有できます。',{lengths:[4,5,5],footer:'関を使う時刻　1号機は2、3号機は3'})
  ];
  const flow=[
    page('二つの出口がある地図の最大流とは？','出発するのは三台です。期限までに、関から駅に入る道と、島から駅に入る道を合わせて何台届けられるか考えます。すべて普通のゾーンで、途中の地点と通路の定員は各1台です。',{board:'air',lit:['関駅','島駅'],footer:'駅へ入る最後の通路　関–駅、島–駅'}),
    page('期限が2ターンなら、まだ0台','港から駅へはどの経路も最低三本。2ターン目までの列には、港から出発して駅に着く線を引けません。',{lengths:[3,0,0],limit:2,footer:'2ターン以内　最大0台'}),
    page('期限が3ターンなら、最大1台','3ターンで駅に着くすべての道は、2ターン目の関を通ります。関の定員は1台なので、これが上限です。図の1号機が実際に届くので、この期限の最大流は1です。',{lengths:[4,0,0],limit:3,footer:'3ターン以内　最大1台'}),
    page('期限が4ターンなら、別の出口も使える','2号機は谷・湾・島を通って4ターン目に駅へ届きます。1号機と合わせて2台です。さらに、関が空く3ターン目を使えます。',{lengths:[4,5,0],footer:'4ターン以内　まず2台の道を確保'}),
    page('3台分の流れが同時に成り立つ','3号機は港で待ってから谷、関、駅と進みます。4ターン目は島と関から各1台が駅に到着。すべての定員を守って三台を届けられました。出発が三台なので、これが最大です。',{lengths:[4,5,5],footer:'3ターンで最大1台　→　4ターンで全3台'})
  ];
  const specs={
    graph:['分岐と閉路のある町','town',graph],
    'map-file':['九つの地点を地図から読む','town',mapPages],
    bfs:['港から駅へ、近い順に探索','town',breadth()],
    dfs:['行き止まりから分岐へ戻る','town',depth()],
    dijkstra:['七地点の道路網で候補を更新','roads',weighted(false)],
    astar:['壁のある迷路でA*探索','grid',maze()],
    fleet:['三台を二つの経路に配る','air',fleet],
    restricted:['別々の通路から制限ゾーンへ','air',restricted],
    bottleneck:['合流に並ぶか、湾を回るか','air',bottleneck],
    'time-expanded':['七地点・三台の時間展開','layers',layers],
    'max-flow':['二つの出口と配送期限','layers',flow]
  };
  const examples=Object.fromEntries(Object.entries(specs).map(([base,[name,board,pages]])=>[base,{
    id:base+'-example',base,name,board,pages
  }]));
  const bellman={id:'bellman-ford',name:'ベルマン–フォード法',summary:'補足。割引のある有向グラフで、最小の料金を繰り返し更新する。',board:'fares',pages:weighted(true)};
  return {examples,bellman,boards,grid,traces,fileLines};
})();
