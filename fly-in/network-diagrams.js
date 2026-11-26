function drawNetworkExample(svg,lesson,p,draw) {
  const {label,box,line,dot,paint,ink,muted,green,brown,blue,rail}=draw;
  const fleetColors=[brown,blue,'#72509a'];
  const kind=p.board ?? lesson.board;
  const subject=lesson.base ?? lesson.id;
  function strip(text){
    box(svg,10,260,340,34,'#e9f1ec');
    label(svg,180,282,text,14,green);
  }
  function network(board){
    const visibleEdges=board.edges.slice(0,p.edgeCount ?? board.edges.length);
    const labelText=board.weights ? (board.directed?'矢印は進める向き　／　線の数は運賃':'線の数は所要時間（分）') :
      kind==='town'?'港から駅までの地図':subject==='restricted'?'関は制限ゾーン。入るのに2ターン':'各通路は1ターン。途中の定員は1台';
    label(svg,15,24,labelText,15,ink,650,'start');
    for(const [i,edge] of visibleEdges.entries()){
      const a=board.points[edge[0]],b=board.points[edge[1]];
      const on=p.lit?.includes(edge) || (!board.directed && p.lit?.includes(edge[1]+edge[0]));
      const color=on ? brown : rail;
      line(svg,a,b,color,on ? 5 : 3);
      const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);
      const ux=dx/len,uy=dy/len;
      if(board.directed){
        const x=b[0]-ux*17,y=b[1]-uy*17;
        paint(svg,'polygon',{points:[[x,y],[x-10*ux+4*uy,y-10*uy-4*ux],[x-10*ux-4*uy,y-10*uy+4*ux]].map(v=>v.join(',')).join(' '),fill:on?brown:muted});
      }
      if(board.weights){
        const x=(a[0]+b[0])/2, y=(a[1]+b[1])/2;
        box(svg,x-10,y-9,20,18,'#fff');
        label(svg,x,y+5,String(board.weights[i]),14,on?brown:ink,700);
      }
    }
    function position(k) {
      const a=board.points[k[0]];
      if(k.length===1)return a;
      const b=board.points[k[1]];
      return [(a[0]+b[0])/2,(a[1]+b[1])/2];
    }
    if(p.from) p.at.forEach((k,i)=>{
      if(k!==p.from[i]) line(svg,position(p.from[i]),position(k),fleetColors[i],4);
    });
    for(const [k,[x,y]] of Object.entries(board.points)){
      const current=k===p.current,open=p.open?.includes(k),done=p.done?.includes(k);
      if(current || (subject==='restricted' && k==='関'))dot(svg,x,y,17,'white',current?brown:green,2.5);
      dot(svg,x,y,13.5,current?brown:open?blue:done?green:'#486275');
      label(svg,x,y+5,k,16,'white',700);
      if(p.dist){
        box(svg,x-13,y+15,26,17,'#f2f5ef');
        label(svg,x,y+28,Number.isFinite(p.dist[k])?String(p.dist[k]):'∞',14,ink);
      }
    }
    if(p.at){
      p.at.forEach((k,i)=>{
        const [x,y]=position(k);
        if(k.length===2)dot(svg,x,y,6,'white',green,2);
        const together=p.at.map((place,index)=>place===k?index:-1).filter(n=>n>=0);
        const cx=x+(together.indexOf(i)-(together.length-1)/2)*16;
        dot(svg,cx,y-21,8.5,fleetColors[i],'white',1);
        label(svg,cx,y-17,String(i+1),12,'white',750);
      });
      label(svg,15,239,'数字は機体の番号',13,muted,600,'start');
      strip(p.at.map((k,i)=>(i+1)+'号　'+(k.length===2?k[0]+'–'+k[1]+'間':k)).join('　 '));
    }else{
      const hint=p.dist?'丸の下は出発地からの仮の合計':(subject==='bfs')?'茶＝今の地点　青＝候補　緑＝調べた地点':subject==='dfs'?'茶＝今の地点　緑＝訪問済み　太線＝たどった道':'太い線は、この手順で注目する通路';
      label(svg,15,244,hint,13,muted,600,'start');
      strip(p.footer);
    }
    return labelText+'。通路は'+visibleEdges.map(edge=>edge.split('').join(board.directed?'から':'と')).join('、')+'。'+(p.footer??p.at?.join('、')??'');
  }
  function maze(){
    label(svg,15,24,'上下左右に1歩ずつ進む迷路',15,ink,650,'start');
    const side=33,x0=69,y0=50;
    for(let y=0;y<networkCourse.grid.length;y++){
      label(svg,x0-15,y0+side*y+22,String(y+1),12,muted);
      [...networkCourse.grid[y]].forEach((v,x)=>{
        const n=y*7+x,px=x0+side*x,py=y0+side*y;
        if(!y)label(svg,px+side/2,y0-6,String(x+1),12,muted);
        const fill=v==='#'?'#4e5f60':p.path?.includes(n)?'#fae1bd':p.open?.includes(n)?'#cce4f6':p.done?.includes(n)?'#dbebd9':'#fff';
        paint(svg,'rect',{x:px+1,y:py+1,width:side-2,height:side-2,rx:3,fill,stroke:n===p.current?brown:'#a9bbb3','stroke-width':n===p.current?3:1});
        const value=v==='S'||v==='G'?v:p.scores?.[n];
        if(value!==undefined)label(svg,px+side/2,py+22,String(value),15,ink);
      });
    }
    label(svg,180,242,'水色＝候補（数字は f）　緑＝調査済み　濃色＝壁',13,muted);
    strip(p.footer);
    return '横7、縦5の格子。左のSから右のGへ、壁を避けて進む。'+p.title+'。'+p.footer;
  }
  function layers(){
    const rows=['港','丘','谷','関','湾','島','駅'],last=p.limit??4;
    const x=t=>59+68*t,y=r=>66+25*r;
    label(svg,15,23,'横はターン　／　縦は地点',15,ink,650,'start');
    for(let t=0;t<=last;t++){
      box(svg,x(t)-14,52,28,177,t%2?'#f7f9f8':'#eff4f1');
      label(svg,x(t),45,t===0?'出発時':String(t),14,muted);
    }
    rows.forEach((k,r)=>{
      label(svg,22,y(r)+5,k,14,ink);
      for(let t=0;t<=last;t++)dot(svg,x(t),y(r),3.8,'white',rail,1.5);
    });
    networkCourse.traces.forEach((path,i)=>{
      const pts=path.slice(0,p.lengths[i]).map((k,t)=>[x(t),y(rows.indexOf(k))]);
      for(let n=1;n<pts.length;n++){
        line(svg,pts[n-1],pts[n],fleetColors[i],3.2,['','6 3','2 4'][i]);
      }
      for(const [cx,cy] of pts)dot(svg,cx,cy,4.3,fleetColors[i]);
      const lx=32+i*114;
      line(svg,[lx,242],[lx+21,242],fleetColors[i],3,['','6 3','2 4'][i]);
      label(svg,lx+28,247,(i+1)+'号機',13,ink,600,'start');
    });
    strip(p.footer);
    return '時刻順の位置。'+networkCourse.traces.map((route,i)=>(i+1)+'号機 '+route.slice(0,p.lengths[i]).join('、')).join('。')+'。'+p.footer;
  }
  if(kind==='grid')return maze();
  if(kind==='layers')return layers();
  return network(networkCourse.boards[kind]);
}
