// All coordinates use the same responsive viewBox. Text and positions come from the lesson data.
const lessonDiagram = (() => {
  const ink = '#253c35', muted = '#4e665d', green = '#176948', brown = '#9b451b', blue = '#265a9b';
  const rail = '#b7c7c0', pale = '#e7efea';
  function element(tag, attributes, content) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attributes)) el.setAttribute(key, value);
    if (content !== undefined) el.textContent = content;
    return el;
  }
  function paint(svg, tag, attributes, content) { svg.append(element(tag, attributes, content)); }
  function label(svg, x, y, content, size = 15, color = ink, weight = 600, anchor = 'middle') {
    paint(svg, 'text', {x,y,'text-anchor':anchor,'font-size':size,'font-weight':weight,fill:color}, content);
  }
  function box(svg, x, y, width, height, fill) {
    paint(svg, 'rect', {x,y,width,height,rx:7,fill});
  }
  function line(svg, a, b, fill = rail, width = 4, dash) {
    const style = {x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:fill,'stroke-width':width,'stroke-linecap':'round'};
    if (dash) style['stroke-dasharray'] = dash;
    paint(svg, 'line', style);
  }
  function dot(svg, x, y, r, fill, stroke = 'none', width = 1) {
    paint(svg,'circle',{cx:x,cy:y,r,fill,stroke,'stroke-width':width});
  }
  function place(svg, point, name, special = false) {
    const [x,y] = point;
    if (special) dot(svg,x,y,22,'white',green,2);
    dot(svg,x,y,17,special ? green : '#446b83');
    label(svg,x,y+6,name,18,'white',750);
  }
  function top(svg, title, sub) {
    label(svg,17,29,title,18,ink,720,'start');
    label(svg,17,51,sub,13,muted,500,'start');
  }
  function bar(svg, text) {
    box(svg,12,258,336,33,pale);
    label(svg,180,280,text,15,green);
  }
  function fleet(svg, positions, at) {
    at.forEach((key,i) => {
      const [x,y] = positions[key];
      const cx = x + (at[0] === at[1] ? (i === 0 ? -11 : 11) : 0);
      dot(svg,cx,y-28,10.5,i === 0 ? brown : blue,'white',1.5);
      label(svg,cx,y-24,String(i+1),13,'white',750);
    });
    box(svg,12,258,336,33,pale);
    at.forEach((key,i) => {
      const x = 30 + i*164;
      dot(svg,x,275,9,i === 0 ? brown : blue);
      label(svg,x,279,String(i+1),12,'white');
      label(svg,x+16,280,key === '途中' ? '通路の途中' : key === 'G' ? 'Gに到着' : key+'にいる',15,ink,600,'start');
    });
  }
  const restrictedPoints = {S:[42,158],途中:[109,158],R:[182,158],G:[316,158]};
  function restricted(svg,p) {
    const q = restrictedPoints;
    top(svg,p.scene ? 'Sから制限ゾーンRへ' : p.turn ? p.turn+'ターン目の終了時' : '出発前', 'S　出発地　　 R　制限ゾーン　　 G　目的地');
    line(svg,q.S,q.R,brown,5);
    line(svg,q.R,q.G);
    paint(svg,'polygon',{points:'109,150 117,158 109,166 101,158',fill:'white',stroke:brown,'stroke-width':2.5});
    for (const k of ['S','R','G']) place(svg,q[k],k,k==='R');
    label(svg,108,203,'通路の途中',14,brown);
    label(svg,246,203,'普通の移動',14,muted);
    if (p.scene) {
      label(svg,109,118,'1ターン目',14,brown);
      label(svg,185,91,'2ターン目',14,green);
      line(svg,[182,98],[182,130],green,1.5);
      bar(svg,'SからRへは2ターン　／　RからGへは1ターン');
    } else fleet(svg,q,p.at);
  }
  const mergePoints = {S:[36,155],A:[109,98],B:[109,212],M:[215,155],G:[322,155]};
  function bottleneck(svg,p) {
    const q = mergePoints;
    top(svg,p.scene ? '2本の道がMで合流する' : p.turn+'ターン目の終了時','S　出発地　　 M　定員1台　　 G　目的地');
    for (const [a,b] of ['SA','SB','AM','BM','MG']) line(svg,q[a],q[b],b==='M' ? green : rail);
    for (const [name,point] of Object.entries(q)) place(svg,point,name,name==='M');
    label(svg,216,201,'合流地点',14,green);
    fleet(svg,q,p.at);
  }
  function arrow(svg, a, b, color, width, dash) {
    const dx = b[0]-a[0], dy = b[1]-a[1], length = Math.hypot(dx,dy);
    const ux = dx/length, uy = dy/length;
    const head = [b[0]-ux*9,b[1]-uy*9], end = [head[0]-ux*7,head[1]-uy*7];
    line(svg,[a[0]+ux*6,a[1]+uy*6],end,color,width,dash);
    paint(svg,'polygon',{points:[head,[end[0]-uy*3.7,end[1]+ux*3.7],[end[0]+uy*3.7,end[1]-ux*3.7]].map(pair=>pair.join(',')).join(' '),fill:color});
  }
  function timeline(svg,p) {
    top(svg,'地図　 S ─ A ─ G','Sは出発地、Gは目的地。Aの定員は1台。');
    const points = {};
    const ys = {S:108,A:164,G:220};
    const startX = p.horizon===2 ? 73 : 66;
    const gap = p.horizon===2 ? 111 : 83;
    label(svg,19,77,'時刻',13,muted);
    for (let t=0; t<=p.horizon; t++) {
      const x = startX + gap*t;
      box(svg,x-17,85,34,151,t%2===0 ? '#f1f5f2' : '#f7f9f7');
      label(svg,x,77,t===0 ? '出発時' : t+'ターン',13,muted);
      for (const [k,y] of Object.entries(ys)) points[k+t] = [x,y];
    }
    for (const [k,y] of Object.entries(ys)) label(svg,20,y+6,k,18,ink,750);
    // Show the forward moves and waits relevant to these two delivery schedules.
    for (let t=0; t<p.horizon; t++) {
      for (const [a,b] of ['SS','SA','AG']) arrow(svg,points[a+t],points[b+(t+1)],rail,1.7);
    }
    p.paths.forEach((path,i) => {
      for (let n=1; n<path.length; n++) arrow(svg,points[path[n-1]],points[path[n]],i===0 ? brown : blue,3.5,i===1 ? '6 4' : '');
    });
    for (const [k,[x,y]] of Object.entries(points)) {
      const included = p.paths.filter(path => path.includes(k)).length;
      dot(svg,x,y,5.5,included ? ink : 'white', included ? ink : '#92a79b',1.7);
    }
    if (p.focus) dot(svg,...points[p.focus],13,'none',brown,2.5);
    if (p.result) label(svg,180,249,p.result,14,green);
    if (p.paths.some(path=>path.length)) {
      box(svg,12,258,336,33,pale);
      line(svg,[31,275],[57,275],brown,3.5);
      label(svg,66,280,'1号機',14,ink,650,'start');
      line(svg,[192,275],[218,275],blue,3.5,'5 4');
      label(svg,227,280,'2号機',14,ink,650,'start');
    } else bar(svg,'横は時刻　／　縦は場所');
  }
  function flowIntro(svg) {
    top(svg,'2台をSからGへ届ける','どの通路も1ターン。途中のAには同時に1台まで。');
    const q = {S:[48,148],A:[180,148],G:[312,148]};
    for (const [a,b] of ['SA','AG']) line(svg,q[a],q[b]);
    for (const [k,point] of Object.entries(q)) place(svg,point,k,k==='A');
    label(svg,48,196,'出発地',15,muted);
    label(svg,180,196,'定員1台',15,green);
    label(svg,312,196,'目的地',15,muted);
    dot(svg,37,118,10,brown); label(svg,37,122,'1',12,'white');
    dot(svg,59,118,10,blue); label(svg,59,122,'2',12,'white');
    bar(svg,'届く台数　　2ターンで1台　／　3ターンで2台');
  }
  const starPoints = {S:[36,144],A:[176,92],B:[92,199],C:[178,210],E:[266,199],G:[324,144]};
  function astar(svg,p) {
    const q = starPoints;
    top(svg,'SからGまでの道を比べる','Aに入るときは2ターン。ほかはすべて1ターン。');
    const highlighted = {
      intro: [], cost: ['SA','SB'], estimate: ['AG','BC','CE','EG'], compare: ['SA'], finish: ['SA','AG']
    }[p.scene];
    for (const pair of ['SA','AG','SB','BC','CE','EG']) {
      const [a,b] = pair;
      line(svg,q[a],q[b],highlighted.includes(pair) ? (['SB','BC','CE','EG'].includes(pair) ? blue : brown) : rail);
    }
    for (const [name,point] of Object.entries(q)) place(svg,point,name,name==='A');
    const labels = {
      intro:'ここまでの時間 ＋ 残り時間の見積もり',
      cost:'ここまで　　Aは2ターン　／　Bは1ターン',
      estimate:'残りの通路　　Aから1本　／　Bから3本',
      compare:'Aは 2＋1＝3　　Bは 1＋3＝4',
      finish:'Gは 3＋0＝3　　Bは 1＋3＝4'
    };
    bar(svg,labels[p.scene]);
  }
  const renderers = {restricted,bottleneck,astar,'time-expanded':timeline,'max-flow':(svg,p)=>p.scene==='intro' ? flowIntro(svg) : timeline(svg,p)};
  return (svg,topic,page) => {
    svg.replaceChildren();
    renderers[topic](svg,page);
    const layouts = {
      restricted:'Sから通路の途中を経て制限ゾーンR、その先に目的地G。',
      bottleneck:'Sで上下に分かれ、AとBのどちらを通ってもMで合流し、Gへ進む。',
      astar:'上の道はS、A、G。下の道はS、B、C、E、G。',
      'time-expanded':'左から右へ時刻が進み、上から順にS、A、Gの段。',
      'max-flow':page.scene ? 'S、定員1台のA、Gが一直線に並ぶ。' : '横に時刻、縦にS、A、Gを並べた図。'
    };
    const labels = Array.from(svg.querySelectorAll('text'), el => el.textContent);
    const routes = (page.paths || []).flatMap((path,i) =>
      path.length ? [(i+1)+'号機の経路は'+path.join(' → ')] : []);
    svg.setAttribute('aria-label',[layouts[topic],...labels,...routes].join('　'));
  };
})();
