/* ============================================================
   IRON FORGE — Articulated Exercise Motion Engine
   ------------------------------------------------------------
   Real joint-based skeletal animation (forward kinematics +
   inverse kinematics) rendered as inline SVG. Equipment is
   locked to the hands, range-of-motion trails are generated
   from the actual motion, and muscle-glow pulses fire on the
   contraction phase of every rep.

   Public API:
     IFMotion.mount(rootEl[, onRepFactory])
     IFMotion.destroy(rootEl)
     IFMotion.get(el) -> instance { play, pause, setSpeed, onRep, destroy }
   ============================================================ */
(function(){
'use strict';

/* ---------- constants ---------- */
var NS='http://www.w3.org/2000/svg';
var VW=640,VH=360,FLOOR=310;
var REDUCED=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Studio palette (fixed so cards look identical in dark & light themes) */
var C={
  bgBot:'#0c0f15',
  floorLine:'#242c39',
  skin:'#f2d4bd',hair:'#2b2f38',
  suit:'#eef1f6',suitFar:'#9aa7b6',
  accent:'#ff5a1f',accent2:'#ffb020',
  steel:'#8d99a8',steelDark:'#39424f',pad:'#333d4b',padLine:'#2a3340'
};

/* Rig segment lengths */
var L={torso:66,uarm:33,farm:31,thigh:46,shin:44,headR:16,foot:18};

/* ---------- math ---------- */
function rad(d){return d*Math.PI/180;}
function ptDown(p,a,len){return{x:p.x+Math.sin(rad(a))*len,y:p.y+Math.cos(rad(a))*len};}
function ptUp(p,a,len){return{x:p.x+Math.sin(rad(a))*len,y:p.y-Math.cos(rad(a))*len};}
function lerp(a,b,t){return a+(b-a)*t;}
function smooth(t){t=Math.min(1,Math.max(0,t));return t*t*t*(t*(t*6-15)+10);}
function dist(a,b){return Math.hypot(b.x-a.x,b.y-a.y);}
function clamp(v,a,b){return Math.min(b,Math.max(a,v));}

/* Piecewise eased keyframes: frames=[[t,v],...] */
function key(p,frames){
  if(p<=frames[0][0])return frames[0][1];
  for(var i=0;i<frames.length-1;i++){
    var a=frames[i],b=frames[i+1];
    if(p<=b[0])return lerp(a[1],b[1],smooth((p-a[0])/(b[0]-a[0])));
  }
  return frames[frames.length-1][1];
}

/* Two-bone IK: middle joint. flip=±1 picks bend direction. */
function ik(S,T,l1,l2,flip){
  var d=clamp(dist(S,T),Math.abs(l1-l2)+0.01,l1+l2-0.01);
  var base=Math.atan2(T.y-S.y,T.x-S.x);
  var cosA=clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1);
  var a=Math.acos(cosA)*(flip||1);
  return{x:S.x+Math.cos(base+a)*l1,y:S.y+Math.sin(base+a)*l1};
}

/* Smooth bump between a..b of the rep (contraction window) */
function phaseWin(p,a,b){
  if(p<a||p>b)return 0;
  var m=(a+b)/2,h=(b-a)/2;
  return Math.max(0,1-Math.pow(Math.abs((p-m)/h),2));
}

/* ---------- svg helpers ---------- */
function el(name,attrs,parent){
  var n=document.createElementNS(NS,name);
  if(attrs)for(var k in attrs)n.setAttribute(k,attrs[k]);
  if(parent)parent.appendChild(n);
  return n;
}
function line(parent,color,w){return el('line',{stroke:color,'stroke-width':w,'stroke-linecap':'round'},parent);}
function seg(l,x1,y1,x2,y2){l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',x2);l.setAttribute('y2',y2);}
function circle(parent,r,fill,x,y){var c=el('circle',{r:r,fill:fill,cx:x==null?0:x,cy:y==null?0:y},parent);return c;}
function placeG(g,x,y,rot){g.setAttribute('transform','translate('+x+' '+y+')'+(rot?' rotate('+rot+')':''));}

/* ============================================================
   STAGE — static studio backdrop
   ============================================================ */
function buildStage(host,title){
  var svg=el('svg',{viewBox:'0 0 '+VW+' '+VH,role:'img','aria-label':title,class:'exmotion-svg',preserveAspectRatio:'xMidYMid meet'});
  var defs=el('defs',null,svg);
  defs.innerHTML=
    '<radialGradient id="exSpot" cx="50%" cy="16%" r="90%">'+
      '<stop offset="0" stop-color="#222a37" stop-opacity=".9"/>'+
      '<stop offset="55%" stop-color="#151a24" stop-opacity=".55"/>'+
      '<stop offset="100%" stop-color="'+C.bgBot+'" stop-opacity="0"/></radialGradient>'+
    '<linearGradient id="exFloor" x1="0" y1="0" x2="0" y2="1">'+
      '<stop offset="0" stop-color="#141922"/><stop offset="1" stop-color="#0b0e13"/></linearGradient>'+
    '<radialGradient id="exGlow"><stop offset="0" stop-color="#ff6a2a" stop-opacity=".8"/>'+
      '<stop offset="45%" stop-color="#ff6a2a" stop-opacity=".26"/>'+
      '<stop offset="100%" stop-color="#ff6a2a" stop-opacity="0"/></radialGradient>'+
    '<linearGradient id="exPlate" x1="0" y1="0" x2="1" y2="1">'+
      '<stop offset="0" stop-color="'+C.accent+'"/><stop offset="1" stop-color="'+C.accent2+'"/></linearGradient>';
  el('rect',{width:VW,height:VH,fill:C.bgBot},svg);
  el('rect',{width:VW,height:VH,fill:'url(#exSpot)'},svg);
  el('rect',{x:0,y:FLOOR,width:VW,height:VH-FLOOR,fill:'url(#exFloor)'},svg);
  el('line',{x1:12,y1:FLOOR,x2:VW-12,y2:FLOOR,stroke:C.floorLine,'stroke-width':2},svg);
  for(var gx=40;gx<VW;gx+=80)el('line',{x1:gx,y1:FLOOR,x2:gx-14,y2:VH-6,stroke:'#1a212c','stroke-width':1},svg);
  var wm=el('text',{x:VW-16,y:VH-10,'text-anchor':'end',fill:'#39434f','font-size':'11','letter-spacing':'2.5','font-family':'Arial,sans-serif'},svg);
  wm.textContent='IRON FORGE · FORM GUIDE';

  host.innerHTML='';
  host.appendChild(svg);

  return {
    svg:svg,
    trail:el('g',null,svg),
    shadow:el('g',null,svg),
    farLeg:el('g',null,svg),
    farArm:el('g',null,svg),
    torsoL:el('g',null,svg),
    head:el('g',null,svg),
    nearLeg:el('g',null,svg),
    nearArm:el('g',null,svg),
    equip:el('g',null,svg),
    fx:el('g',null,svg),
    rootWrap:el('g',{class:'exmotion-root'},svg)
  };
}
/* NOTE: rootWrap is appended last so it can be moved to wrap everything below */

/* ============================================================
   ARTIST — reusable figure nodes driven every frame
   ============================================================ */
function makeArtist(st){
  var A={trailPts:[]};
  A.limb=function(layer,w,far){
    var col=far?C.suitFar:'#dde3ec';
    var s1=line(layer,col,w),s2=line(layer,far?'#8b98a7':col,w-3);
    var j=circle(layer,w*0.42,'#f4f6fa');
    return{set:function(a,b,c){seg(s1,a.x,a.y,b.x,b.y);seg(s2,b.x,b.y,c.x,c.y);j.setAttribute('cx',b.x);j.setAttribute('cy',b.y);}};
  };
  A.torso=function(layer){var l=line(layer,C.suit,21);return{set:function(a,b){seg(l,a.x,a.y,b.x,b.y);}};};
  A.head=function(layer){
    var g=el('g',null,layer);
    var neckL=line(g,C.skin,9);
    circle(g,L.headR,C.skin);
    var hair=el('path',{d:'M -16 -3 A 16 16 0 0 1 13 -9 L 8 -1 Q 0 -12 -9 -6 Z',fill:C.hair},g);
    return{set:function(neck,c,tilt){seg(neckL,neck.x,neck.y,c.x,c.y);placeG(g,c.x,c.y,tilt||0);}};
  };
  A.barPlate=function(layer){
    var g=el('g',null,layer);
    el('line',{x1:-13,y1:0,x2:13,y2:0,stroke:C.steelDark,'stroke-width':5},g);
    circle(g,26,C.steelDark);circle(g,19,'url(#exPlate)');
    circle(g,7,'#10141b');circle(g,3,C.steel);
    return g;
  };
  A.dbPair=function(layer){
    var g=el('g',null,layer);
    el('rect',{x:-17,y:-6,width:34,height:12,rx:6,fill:'url(#exPlate)'},g);
    var c1=circle(g,8,C.steelDark);c1.setAttribute('cx',-13);
    var c2=circle(g,8,C.steelDark);c2.setAttribute('cx',13);
    return g;
  };
  A.cableLine=function(layer){return el('line',{stroke:C.accent,'stroke-width':2.5,opacity:.85},layer);};
  A.glow=function(layer){
    var c=el('circle',{r:34,fill:'url(#exGlow)',opacity:0},layer);
    return{set:function(x,y,k){
      if(k<=0.02){c.setAttribute('opacity',0);return;}
      c.setAttribute('cx',x);c.setAttribute('cy',y);
      c.setAttribute('opacity',(k*0.9).toFixed(3));
      var s=0.7+k*0.7;
      c.setAttribute('transform','translate('+x+' '+y+') scale('+s+') translate(-'+x+' -'+y+')');
    }};
  };
  A.shadow=function(){
    var e=el('ellipse',{cy:FLOOR+9,rx:110,ry:9,fill:'#000',opacity:.4},st.shadow);
    return{set:function(x){e.setAttribute('cx',x);}};
  };
  A.trailPath=null;
  A.trail=function(){A.trailPath=el('path',{fill:'none',stroke:'#ff8a4d','stroke-width':2.5,'stroke-dasharray':'3 9','stroke-linecap':'round',opacity:.45},st.trail);};
  A.trackPoint=function(x,y){A.trailPts.push({x:x,y:y});};
  A.commitTrail=function(){
    if(!A.trailPath||A.trailPts.length<3)return;
    var d='M'+A.trailPts[0].x.toFixed(1)+' '+A.trailPts[0].y.toFixed(1);
    for(var i=1;i<A.trailPts.length;i++)d+=' L'+A.trailPts[i].x.toFixed(1)+' '+A.trailPts[i].y.toFixed(1);
    A.trailPath.setAttribute('d',d);
  };
  return A;
}

/* standard humanoid node bundle */
function stdFigure(A,st){
  return{
    torso:A.torso(st.torsoL),
    head:A.head(st.head),
    armF:A.limb(st.farArm,14,true),
    armN:A.limb(st.nearArm,16,false),
    legF:A.limb(st.farLeg,16,true),
    legN:A.limb(st.nearLeg,18,false),
    footF:line(st.farLeg,'#8b98a7',10),
    footN:line(st.nearLeg,'#eef1f6',11)
  };
}

/* ============================================================
   KINEMATICS — pose spec -> joints (pure)
   arm/leg spec: fk {sa,eb} / {ha,kb}  or  ik {tx,ty,fl,ox?,oy?}
   fa = absolute foot angle; hd = extra head tilt
   ============================================================ */
function solvePose(P){
  var neck=ptUp(P.b,P.ta,L.torso);
  var headC=ptUp(neck,(P.ta||0)+(P.hd==null?-6:P.hd),L.headR+8);
  var sh={x:lerp(neck.x,P.b.x,0.1),y:lerp(neck.y,P.b.y,0.1)};
  var hipOff=P.hipOff==null?7:P.hipOff;

  function arm(sp){
    if(sp.tx!=null){
      var S2={x:sh.x+(sp.ox||0),y:sh.y+(sp.oy||0)};
      return{sh:S2,e:ik(S2,{x:sp.tx,y:sp.ty},L.uarm,L.farm,sp.fl==null?1:sp.fl),w:{x:sp.tx,y:sp.ty}};
    }
    var e=ptDown(sh,sp.sa,L.uarm);
    return{sh:sh,e:e,w:ptDown(e,sp.sa+(sp.eb||0),L.farm)};
  }
  function leg(hip,sp){
    if(sp.tx!=null)
      return{h:hip,k:ik(hip,{x:sp.tx,y:sp.ty},L.thigh,L.shin,sp.fl==null?-1:sp.fl),a:{x:sp.tx,y:sp.ty}};
    var k=ptDown(hip,sp.ha,L.thigh);
    return{h:hip,k:k,a:ptDown(k,sp.ha-(sp.kb||0),L.shin)};
  }

  var an=P.armN,al=P.armF;
  if(!al)al=an.tx!=null?{tx:an.tx+6,ty:an.ty+3,ox:(an.ox||0)+6,oy:(an.oy||0)+4,fl:an.fl}:{sa:an.sa-6,eb:(an.eb||0)+6};
  var ln=P.legN,ll=P.legF;
  if(!ll)ll=ln.tx!=null?{tx:ln.tx+8,ty:ln.ty,fl:ln.fl}:{ha:ln.ha-5,kb:(ln.kb||0)-4,fa:ln.fa};

  var armN=arm(an),armF=arm(al);
  var legN=leg({x:P.b.x+hipOff,y:P.b.y},ln);
  var legF=leg({x:P.b.x-hipOff,y:P.b.y},ll);
  function toe(a,sp){return ptDown(a,sp.fa==null?88:sp.fa,L.foot);}
  return{b:P.b,neck:neck,head:headC,sh:sh,
    armN:armN,armF:armF,legN:legN,legF:legF,
    toN:toe(legN.a,ln),toF:toe(legF.a,ll),
    eq:P.eq||null};
}

function renderBody(A,J,P){
  A.F.torso.set(J.b,J.neck);
  A.F.head.set(J.neck,J.head,((P.ta||0)+(P.hd||0))*-0.6);
  if(!A.noArms){
    A.F.armF.set(J.armF.sh,J.armF.e,J.armF.w);
    A.F.armN.set(J.armN.sh,J.armN.e,J.armN.w);
  }
  A.F.legF.set(J.legF.h,J.legF.k,J.legF.a);
  seg(A.F.footF,J.legF.a.x,J.legF.a.y,J.toF.x,J.toF.y);
  A.F.legN.set(J.legN.h,J.legN.k,J.legN.a);
  seg(A.F.footN,J.legN.a.x,J.legN.a.y,J.toN.x,J.toN.y);
}

/* ============================================================
   SCENES — one choreography per exercise
   ============================================================ */
var SCENES={

/* ---------------- BARBELL BENCH PRESS ---------------- */
'bench-press':{dur:2800,zoom:1.05,dy:8,still:.47,
  build:function(A,st){
    el('path',{d:'M196 262 H468 a10 10 0 0 1 10 10 v6 H186 v-6 a10 10 0 0 1 10 -10 Z',fill:C.pad},st.torsoL);
    el('path',{d:'M214 280 L206 306 M446 280 L454 306',stroke:C.steelDark,'stroke-width':10,'stroke-linecap':'round'},st.torsoL);
    el('path',{d:'M172 306 V148 M172 156 h26',stroke:C.steelDark,'stroke-width':9,'stroke-linecap':'round'},st.torsoL);
    var plate=A.barPlate(st.equip),glow=A.glow(st.fx),shadow=A.shadow();
    var GX=298;
    return{
      nodes:stdFigure(A,st),eq:plate,glow:glow,shadow:shadow,
      pose:function(p){
        var by=key(p,[[0,166],[.36,240],[.47,246],[.52,246],[.88,166],[1,166]]);
        return{
          b:{x:338,y:key(p,[[0,250],[.36,255],[.52,255],[1,250]])},
          ta:-91,hd:-2,hipOff:8,
          armN:{tx:GX,ty:by,ox:-64,oy:-4,fl:1},
          armF:{tx:GX+5,ty:by+4,ox:-56,oy:2,fl:1},
          legN:{ha:76,kb:66,fa:86},
          eq:{type:'bb',x:GX,y:by}
        };
      },
      trackPt:function(J){return J.eq;},
      pulse:function(J,p){return{p:{x:302,y:240},k:phaseWin(p,.3,.56)};}
    };
  }},

/* ---------------- INCLINE DUMBBELL PRESS ---------------- */
'incline-db-press':{dur:2900,zoom:1.05,dy:6,still:.47,
  build:function(A,st){
    el('path',{d:'M216 296 L420 190',stroke:C.pad,'stroke-width':20,'stroke-linecap':'round'},st.torsoL);
    el('path',{d:'M232 300 L218 308 M402 202 L430 262 L446 304',stroke:C.steelDark,'stroke-width':10,'stroke-linecap':'round',fill:'none'},st.torsoL);
    var db=A.dbPair(st.equip),dbF=A.dbPair(st.equip);
    dbF.setAttribute('opacity','.72');
    var glow=A.glow(st.fx),shadow=A.shadow();
    return{
      nodes:stdFigure(A,st),eq:db,eqF:dbF,glow:glow,shadow:shadow,
      pose:function(p){
        var e=key(p,[[0,1],[.36,.02],[.47,-.08],[.52,-.08],[.88,1],[1,1]]);
        var hx=lerp(298,328,e),hy=lerp(210,126,e);
        return{
          b:{x:352,y:228},ta:-37,hd:-2,hipOff:8,
          armN:{tx:hx,ty:hy,ox:-32,oy:8,fl:1},
          armF:{tx:hx+9,ty:hy+7,ox:-26,oy:12,fl:1},
          legN:{ha:52,kb:40,fa:88},
          eq:{type:'db',x:hx,y:hy},
          _dbF:{x:hx+9,y:hy+7}
        };
      },
      trackPt:function(J){return{x:J.eq.x,y:J.eq.y};},
      pulse:function(J,p){return{p:{x:320,y:194},k:phaseWin(p,.3,.56)};}
    };
  }},

/* ---------------- PUSH-UP ---------------- */
'pushup':{dur:2500,zoom:1.06,dy:12,still:.47,
  build:function(A,st){
    var glow=A.glow(st.fx),shadow=A.shadow();
    return{
      nodes:stdFigure(A,st),glow:glow,shadow:shadow,
      pose:function(p){
        var d=key(p,[[0,0],[.4,1],[.5,1],[1,0]]);
        return{
          b:{x:lerp(392,382,d),y:lerp(246,263,d)},
          ta:lerp(-82,-68,d),hd:16,hipOff:8,
          armN:{tx:256,ty:298,ox:-70,oy:0,fl:-1},
          armF:{tx:260,ty:301,ox:-64,oy:4,fl:-1},
          legN:{ha:62,kb:12,fa:84}
        };
      },
      pulse:function(J,p){return{p:{x:332,y:252},k:phaseWin(p,.32,.55)};}
    };
  }},

/* ---------------- LAT PULLDOWN ---------------- */
'lat-pulldown':{dur:2800,zoom:1.04,dy:0,still:.48,
  build:function(A,st){
    el('path',{d:'M438 306 V54 h-96',stroke:C.steelDark,'stroke-width':12,'stroke-linecap':'round',fill:'none'},st.torsoL);
    var pulleyTop=circle(st.torsoL,11,'#414c5c',342,58);
    pulleyTop.setAttribute('stroke',C.steel);pulleyTop.setAttribute('stroke-width','3');
    el('rect',{x:238,y:264,width:130,height:14,rx:7,fill:C.pad},st.torsoL);
    el('rect',{x:254,y:220,width:104,height:12,rx:6,fill:C.pad,opacity:.92},st.torsoL);
    el('path',{d:'M258 278 v28 M344 278 v28',stroke:C.steelDark,'stroke-width':8,'stroke-linecap':'round'},st.torsoL);
    var cable=A.cableLine(st.equip);
    var bar=el('rect',{x:-46,y:-4,width:92,height:8,rx:4,fill:'url(#exPlate)'},st.equip);
    var glow=A.glow(st.fx),shadow=A.shadow();
    var PU={x:342,y:62};
    return{
      nodes:stdFigure(A,st),glow:glow,shadow:shadow,
      pose:function(p){
        var gy=key(p,[[0,122],[.4,196],[.5,202],[.6,202],[1,122]]);
        var ta=key(p,[[0,-5],[.42,-20],[.55,-20],[1,-5]]);
        var b={x:314,y:212};
        return{
          b:b,ta:ta,hd:-8,hipOff:8,
          armN:{tx:b.x+6,ty:gy,ox:2,oy:-4,fl:-1},
          armF:{tx:b.x-4,ty:gy-3,ox:-6,oy:-2,fl:-1},
          legN:{ha:86,kb:84,fa:88},
          eq:{type:'wide',x:b.x+2,y:gy},
          _pu:PU
        };
      },
      trackPt:function(J){return{x:J.eq.x,y:J.eq.y};},
      pulse:function(J,p){return{p:{x:298,y:198},k:phaseWin(p,.34,.62)};},
      custom:function(A,J,P){
        var pu=P._pu||PU;
        seg(cable,pu.x,pu.y,J.eq.x,J.eq.y-4);
        placeG(bar,J.eq.x,J.eq.y,0);
      }
    };
  }},

/* ---------------- DEADLIFT ---------------- */
'deadlift':{dur:3200,zoom:1.03,dy:0,still:.54,
  build:function(A,st){
    var plate=A.barPlate(st.equip),glow=A.glow(st.fx),shadow=A.shadow();
    return{
      nodes:stdFigure(A,st),eq:plate,glow:glow,shadow:shadow,
      pose:function(p){
        var by=key(p,[[0,286],[.5,182],[.58,182],[1,286]]);
        return{
          b:{x:key(p,[[0,310],[.5,326],[.58,326],[1,310]]),
             y:key(p,[[0,236],[.5,204],[.58,204],[1,236]])},
          ta:key(p,[[0,54],[.5,-3],[.58,-3],[1,54]]),
          hd:key(p,[[0,-28],[.5,-4],[.58,-4],[1,-28]]),
          hipOff:8,
          armN:{tx:282,ty:by-4,ox:2,oy:8,fl:-1},
          armF:{tx:287,ty:by,ox:6,oy:10,fl:-1},
          legN:{ha:key(p,[[0,-30],[.5,4],[.58,4],[1,-30]]),
                kb:key(p,[[0,56],[.5,8],[.58,8],[1,56]]),fa:88},
          eq:{type:'bb',x:284,y:by}
        };
      },
      trackPt:function(J){return J.eq;},
      pulse:function(J,p){return{p:{x:318,y:240},k:phaseWin(p,.42,.68)};}
    };
  }},

/* ---------------- BENT-OVER ROW ---------------- */
'bent-row':{dur:2700,zoom:1.04,dy:0,still:.49,
  build:function(A,st){
    var plate=A.barPlate(st.equip),glow=A.glow(st.fx),shadow=A.shadow();
    return{
      nodes:stdFigure(A,st),eq:plate,glow:glow,shadow:shadow,
      pose:function(p){
        var pull=key(p,[[0,0],[.42,1],[.53,1],[1,0]]);
        var ta=48;
        var chest=ptUp({x:322,y:230},ta,52);
        var gx=chest.x+4,gy=lerp(270,208,pull);
        return{
          b:{x:322,y:230},ta:ta,hd:-34,hipOff:8,
          armN:{tx:gx,ty:gy,ox:0,oy:6,fl:1},
          armF:{tx:gx+6,ty:gy+4,ox:6,oy:10,fl:1},
          legN:{ha:14,kb:24,fa:88},
          eq:{type:'bb',x:gx,y:gy}
        };
      },
      trackPt:function(J){return J.eq;},
      pulse:function(J,p){return{p:{x:332,y:206},k:phaseWin(p,.36,.6)};}
    };
  }},

/* ---------------- BARBELL SQUAT ---------------- */
'squat':{dur:2800,zoom:1.05,dy:0,still:.5,
  build:function(A,st){
    var plate=A.barPlate(st.equip),glow=A.glow(st.fx),shadow=A.shadow();
    return{
      nodes:stdFigure(A,st),eq:plate,glow:glow,shadow:shadow,
      pose:function(p){
        var d=key(p,[[0,0],[.44,1],[.55,1],[1,0]]);
        var P={
          b:{x:lerp(324,302,d),y:lerp(218,256,d)},
          ta:lerp(-4,25,d),hd:lerp(4,-12,d),hipOff:8,
          armN:{sa:152,eb:-58},
          legN:{ha:lerp(4,74,d),kb:lerp(6,102,d),fa:88}
        };
        var traps=ptUp(ptUp(P.b,P.ta,L.torso),P.ta+6,4);
        P.eq={type:'bb',x:traps.x+2,y:traps.y};
        return P;
      },
      trackPt:function(J){return J.eq;},
      pulse:function(J,p){return{p:{x:314,y:250},k:phaseWin(p,.36,.62)};}
    };
  }},

/* ---------------- LUNGES ---------------- */
'lunges':{dur:2800,zoom:1.04,dy:0,still:.5,
  build:function(A,st){
    var glow=A.glow(st.fx),shadow=A.shadow();
    return{
      nodes:stdFigure(A,st),glow:glow,shadow:shadow,
      pose:function(p){
        var d=key(p,[[0,0],[.42,1],[.54,1],[1,0]]);
        return{
          b:{x:322,y:lerp(220,250,d)},ta:-2,hd:2,hipOff:8,
          armN:{sa:88,eb:-118},
          legN:{ha:lerp(22,50,d),kb:lerp(14,86,d),fa:88},
          legF:{ha:lerp(-16,-40,d),kb:lerp(22,78,d),fa:66}
        };
      },
      trackPt:function(J){return{x:J.b.x,y:J.b.y};},
      pulse:function(J,p){return{p:{x:340,y:262},k:phaseWin(p,.34,.6)};}
    };
  }},

/* ---------------- LEG PRESS ---------------- */
'leg-press':{dur:2900,zoom:1.04,dy:0,still:.48,
  build:function(A,st){
    el('path',{d:'M212 252 L268 236',stroke:C.pad,'stroke-width':22,'stroke-linecap':'round'},st.torsoL);
    el('path',{d:'M228 260 v46',stroke:C.steelDark,'stroke-width':10,'stroke-linecap':'round'},st.torsoL);
    el('line',{x1:356,y1:176,x2:502,y2:266,stroke:C.steelDark,'stroke-width':6,'stroke-linecap':'round'},st.torsoL);
    el('line',{x1:366,y1:168,x2:512,y2:258,stroke:C.padLine,'stroke-width':2},st.torsoL);
    var sled=el('g',null,st.equip);
    el('rect',{x:-24,y:-46,width:48,height:92,rx:12,fill:C.steelDark},sled);
    el('rect',{x:-16,y:-38,width:32,height:76,rx:9,fill:'#414c5c'},sled);
    var glow=A.glow(st.fx),shadow=A.shadow();
    return{
      nodes:stdFigure(A,st),glow:glow,shadow:shadow,
      pose:function(p){
        var s=key(p,[[0,1],[.4,0],[.5,-.08],[.6,-.08],[1,1]]);
        var px=lerp(380,462,s),py=lerp(246,192,s);
        return{
          b:{x:262,y:242},ta:-116,hd:-14,hipOff:6,
          armN:{sa:-64,eb:-30},
          legN:{tx:px-4,ty:py,fl:1},
          legF:{tx:px+7,ty:py+9,fl:1},
          eq:{type:'sled',x:px,y:py}
        };
      },
      trackPt:function(J){return J.eq;},
      pulse:function(J,p){return{p:{x:330,y:248},k:phaseWin(p,.42,.68)};},
      customEq:function(J){placeG(sled,J.eq.x,J.eq.y,40);}
    };
  }},

/* ---------------- OVERHEAD PRESS ---------------- */
'ohp':{dur:2800,zoom:1.06,dy:0,still:.48,
  build:function(A,st){
    var plate=A.barPlate(st.equip),glow=A.glow(st.fx),shadow=A.shadow();
    return{
      nodes:stdFigure(A,st),eq:plate,glow:glow,shadow:shadow,
      pose:function(p){
        var press=key(p,[[0,0],[.42,1],[.52,1],[1,0]]);
        var gy=lerp(174,112,press);
        return{
          b:{x:322,y:220},ta:lerp(-2,-6,press),hd:lerp(2,-8,press),hipOff:8,
          armN:{tx:326,ty:gy,ox:0,oy:-2,fl:1},
          armF:{tx:332,ty:gy+3,ox:5,oy:2,fl:1},
          legN:{ha:3,kb:5,fa:89},
          eq:{type:'bb',x:329,y:gy}
        };
      },
      trackPt:function(J){return J.eq;},
      pulse:function(J,p){return{p:{x:322,y:178},k:phaseWin(p,.36,.6)};}
    };
  }},

/* ---------------- LATERAL RAISE (mirrored front view) ---------------- */
'lateral-raise':{dur:2700,zoom:1.08,dy:0,still:.48,
  build:function(A,st){
    var dbN=A.dbPair(st.equip),dbF=A.dbPair(st.equip);
    dbF.setAttribute('opacity','.72');
    var glow=A.glow(st.fx),shadow=A.shadow();
    return{
      nodes:stdFigure(A,st),eq:dbN,eqF:dbF,glow:glow,shadow:shadow,
      pose:function(p){
        var r=key(p,[[0,0],[.42,1],[.52,1],[1,0]]);
        var sa=lerp(12,93,r);
        var Jpose={
          b:{x:322,y:224},ta:0,hd:0,hipOff:9,
          armN:{sa:sa,eb:lerp(8,2,r)},
          legN:{ha:7,kb:4,fa:87},
          legF:{ha:-7,kb:4,fa:93}
        };
        var tmp=solvePose(Jpose);
        Jpose.eq={type:'db',x:tmp.armN.w.x,y:tmp.armN.w.y};
        return Jpose;
      },
      trackPt:function(J){return{x:J.armN.w.x,y:J.armN.w.y};},
      pulse:function(J,p){return{p:{x:350,y:190},k:phaseWin(p,.36,.6)*.9};},
      custom:function(A,J,P){
        placeG(dbN,J.armN.w.x,J.armN.w.y,0);
        placeG(dbF,J.armF.w.x,J.armF.w.y,0);
      },
      noAutoEq:true
    };
  }},

/* ---------------- BARBELL CURL ---------------- */
'barbell-curl':{dur:2500,zoom:1.08,dy:0,still:.47,
  build:function(A,st){
    var plate=A.barPlate(st.equip),glow=A.glow(st.fx),shadow=A.shadow();
    return{
      nodes:stdFigure(A,st),eq:plate,glow:glow,shadow:shadow,
      pose:function(p){
        var c=key(p,[[0,0],[.4,1],[.52,1],[1,0]]);
        var sway=lerp(0,-5,c);
        var P={
          b:{x:322,y:220},ta:sway*.35,hd:2,hipOff:8,
          armN:{sa:6+sway,eb:lerp(8,138,c)},
          legN:{ha:3,kb:5,fa:89}
        };
        var tmp=solvePose(P);
        P.eq={type:'bb',x:(tmp.armN.w.x+tmp.armF.w.x)/2,y:(tmp.armN.w.y+tmp.armF.w.y)/2};
        return P;
      },
      trackPt:function(J){return J.eq;},
      pulse:function(J,p){return{p:{x:338,y:206},k:phaseWin(p,.32,.58)};}
    };
  }},

/* ---------------- TRICEPS PUSHDOWN ---------------- */
'tricep-pushdown':{dur:2400,zoom:1.07,dy:0,still:.45,
  build:function(A,st){
    el('path',{d:'M450 306 V56 h-60',stroke:C.steelDark,'stroke-width':12,'stroke-linecap':'round',fill:'none'},st.torsoL);
    var pul=circle(st.torsoL,9,'#414c5c',390,62);
    pul.setAttribute('stroke',C.steel);pul.setAttribute('stroke-width','3');
    el('path',{d:'M450 306 h-42',stroke:C.steelDark,'stroke-width':10,'stroke-linecap':'round'},st.torsoL);
    var cable=A.cableLine(st.equip);
    var handle=el('rect',{x:-16,y:-4,width:32,height:8,rx:4,fill:'url(#exPlate)'},st.equip);
    var glow=A.glow(st.fx),shadow=A.shadow();
    var PU={x:390,y:66};
    return{
      nodes:stdFigure(A,st),glow:glow,shadow:shadow,noAutoEq:true,
      pose:function(p){
        var push=key(p,[[0,0],[.4,1],[.5,1],[1,0]]);
        var eb=lerp(104,6,push);
        var P={
          b:{x:318,y:218},ta:10,hd:6,hipOff:8,
          armN:{sa:16,eb:eb},
          legN:{ha:8,kb:10,fa:86}
        };
        var tmp=solvePose(P);
        P._w=tmp.armN.w;
        return P;
      },
      trackPt:function(J){return{x:J.armN.w.x,y:J.armN.w.y};},
      pulse:function(J,p){return{p:{x:330,y:214},k:phaseWin(p,.34,.58)};},
      custom:function(A,J,P){
        var w=P._w||J.armN.w;
        seg(cable,PU.x,PU.y,w.x,w.y-2);
        placeG(handle,w.x,w.y+6,0);
      }
    };
  }},

/* ---------------- PLANK (breathing hold) ---------------- */
'plank':{dur:3400,zoom:1.07,dy:12,still:.5,hold:true,
  build:function(A,st){
    el('rect',{x:150,y:302,width:370,height:10,rx:5,fill:'#232b38'},st.torsoL);
    var foreU=line(st.nearArm,'#dde3ec',14),foreL=line(st.nearArm,'#eef1f6',12);
    var foreUf=line(st.farArm,'#8b98a7',12),foreLf=line(st.farArm,'#9aa7b6',10);
    var glow=A.glow(st.fx),shadow=A.shadow();
    return{
      nodes:stdFigure(A,st),glow:glow,shadow:shadow,noArms:true,
      pose:function(p,tMs){
        var br=Math.sin(((tMs||0)%3400)/3400*Math.PI*2);
        return{
          b:{x:380,y:256+br*2.4},ta:-86+br*1.1,hd:18,hipOff:8,
          armN:{sa:0,eb:0},
          legN:{ha:64,kb:10,fa:82}
        };
      },
      pulse:function(J,p,tMs){
        var br=Math.sin(((tMs||0)%3400)/3400*Math.PI*2);
        return{p:{x:352,y:262},k:.45+.3*br};
      },
      custom:function(A,J,P){
        function fore(upper,lower,s){
          var e={x:s.x-4,y:295},h={x:s.x+36,y:299};
          seg(upper,s.x,s.y,e.x,e.y);seg(lower,e.x,e.y,h.x,h.y);
        }
        fore(foreUf,foreLf,{x:J.armF.sh.x-6,y:J.armF.sh.y});
        fore(foreU,foreL,J.armN.sh);
      }
    };
  }},

/* ---------------- CRUNCHES ---------------- */
'crunches':{dur:2600,zoom:1.08,dy:10,still:.45,
  build:function(A,st){
    el('rect',{x:170,y:298,width:330,height:12,rx:6,fill:'#232b38'},st.torsoL);
    var glow=A.glow(st.fx),shadow=A.shadow();
    return{
      nodes:stdFigure(A,st),glow:glow,shadow:shadow,
      pose:function(p){
        var curl=key(p,[[0,0],[.38,1],[.52,1],[1,0]]);
        var ta=lerp(-92,-58,curl);
        var b={x:336,y:268-curl*4};
        var hc=ptUp(b,ta,L.torso+8+L.headR-6);
        return{
          b:b,ta:ta,hd:6,hipOff:8,
          armN:{tx:hc.x+9,ty:hc.y+3,ox:-4,oy:6,fl:-1},
          armF:{tx:hc.x+3,ty:hc.y+7,ox:-10,oy:8,fl:-1},
          legN:{ha:66,kb:76,fa:84}
        };
      },
      trackPt:function(J){return{x:J.head.x,y:J.head.y};},
      pulse:function(J,p){return{p:{x:332,y:250},k:phaseWin(p,.3,.56)};}
    };
  }},

/* ---------------- TREADMILL RUN ---------------- */
'treadmill':{dur:900,zoom:1.06,dy:0,still:.25,
  build:function(A,st){
    el('path',{d:'M150 296 H490',stroke:C.steelDark,'stroke-width':14,'stroke-linecap':'round'},st.torsoL);
    circle(st.torsoL,15,'#252d38',168,303).setAttribute('stroke',C.steel);
    circle(st.torsoL,15,'#252d38',472,303).setAttribute('stroke',C.steel);
    el('path',{d:'M448 296 L472 160 h62 M472 160 h-50',stroke:C.steelDark,'stroke-width':10,'stroke-linecap':'round',fill:'none'},st.torsoL);
    el('rect',{x:492,y:146,width:40,height:16,rx:6,fill:C.pad},st.torsoL);
    el('line',{class:'belt-dashes',x1:162,y1:296,x2:478,y2:296,stroke:C.accent,'stroke-width':3,'stroke-dasharray':'10 12',opacity:.5},st.torsoL);
    var shadow=A.shadow();
    return{
      nodes:stdFigure(A,st),shadow:shadow,
      pose:function(p){
        var ph=p*Math.PI*2;
        var sN=Math.sin(ph),sF=Math.sin(ph+Math.PI);
        var bounce=Math.abs(Math.cos(ph));
        return{
          b:{x:322,y:222-bounce*5},ta:-8+bounce*2,hd:6,hipOff:8,
          armN:{sa:-14-sN*36,eb:88},
          legN:{ha:16+sN*30,kb:16+Math.max(0,Math.sin(ph+1.25))*58,fa:80+sN*10}
        };
      },
      pulse:function(){return{k:0};}
    };
  }},

/* ---------------- JUMP ROPE (mirrored front view) ---------------- */
'jump-rope':{dur:1000,zoom:1.08,dy:0,still:.42,
  build:function(A,st){
    var ropeBack=el('path',{fill:'none',stroke:'#7c5a3a','stroke-width':4,'stroke-linecap':'round',opacity:.45},st.torsoL);
    var ropeFront=el('path',{fill:'none',stroke:'#c98a4b','stroke-width':4.5,'stroke-linecap':'round'},st.equip);
    var shadow=A.shadow();
    return{
      nodes:stdFigure(A,st),shadow:shadow,noAutoEq:true,
      pose:function(p){
        var air=key(p,[[0,0],[.14,0],[.3,1],[.55,1],[.72,0],[.86,.25],[1,0]]);
        var crouch=key(p,[[0,0],[.14,1],[.3,.2],[.55,.1],[1,0]]);
        var by=lerp(lerp(224,236,crouch),198,air);
        return{
          b:{x:322,y:by},ta:0,hd:0,hipOff:9,
          armN:{sa:64,eb:74},
          legN:{ha:6+air*10,kb:6+crouch*22+air*32,fa:86-air*8},
          legF:{ha:-6-air*10,kb:6+crouch*22+air*32,fa:94+air*8},
          _spin:p*Math.PI*2
        };
      },
      pulse:function(){return{k:0};},
      custom:function(A,J,P){
        var ry=Math.abs(Math.sin(P._spin))*66+8;
        var wl=J.armN.w,wr=J.armF.w,hx=(wl.x+wr.x)/2;
        ropeFront.setAttribute('d','M '+wl.x.toFixed(1)+' '+wl.y.toFixed(1)+' Q '+hx.toFixed(1)+' '+(240+ry).toFixed(1)+' '+wr.x.toFixed(1)+' '+wr.y.toFixed(1));
        ropeBack.setAttribute('d','M '+wl.x.toFixed(1)+' '+wl.y.toFixed(1)+' Q '+hx.toFixed(1)+' '+(240-ry*.9).toFixed(1)+' '+wr.x.toFixed(1)+' '+wr.y.toFixed(1));
      }
    };
  }}
};

/* ============================================================
   ENGINE INSTANCE
   ============================================================ */
function MotionInstance(host,exId,onRep){
  var scene=SCENES[exId]||SCENES['pushup'];
  this.id=exId;this.dur=scene.dur;
  var st=buildStage(host,exId);
  var A=makeArtist(st);
  var parts=scene.build(A,st);
  A.F=parts.nodes;
  A.noArms=!!parts.noArms;

  var zoom=scene.zoom||1,dy=scene.dy||0;
  st.rootWrap.setAttribute('transform',
    'translate('+(VW*(1-zoom)/2).toFixed(1)+' '+((dy+VH*(1-zoom)/2)).toFixed(1)+') scale('+zoom+')');

  /* Range-of-motion trail sampled from the real motion */
  if(!scene.hold&&parts.trackPt){
    A.trail();
    for(var i=0;i<=30;i++){
      var Ps=parts.pose(i/30,0);
      var Js=solvePose(Ps);
      if(parts.custom)parts.custom(A,Js,Ps);
      var tp=parts.trackPt(Js);
      if(tp&&isFinite(tp.x)&&isFinite(tp.y)&&Math.abs(tp.x)>1&&(tp.y>-50&&tp.y<VH+50))A.trackPoint(tp.x,tp.y);
    }
    A.commitTrail();A.trailPts=[];
  }

  var self=this;
  this._playing=!REDUCED;
  this._speed=1;
  this._last=0;this._acc=REDUCED?(scene.still!=null?scene.still:0.45)*scene.dur:0;
  this._onRep=onRep||null;
  this._visible=true;
  this._raf=null;

  function frame(now){
    if(self._playing&&self._visible&&!document.hidden){
      if(!self._last)self._last=now;
      self._acc+=(now-self._last)*self._speed;
      var cyc=Math.floor(self._acc/self.dur);
      if(cyc>0){self._acc-=cyc*self.dur;if(self._onRep)self._onRep();}
    }
    self._last=now;
    draw(self._acc/self.dur,now);
    self._raf=requestAnimationFrame(frame);
  }
  function draw(p,now){
    var P=parts.pose(p,now||0);
    var J=solvePose(P);
    renderBody(A,J,P);
    if(parts.custom)parts.custom(A,J,P);
    if(!parts.noAutoEq&&J.eq&&parts.eq){
      if(J.eq.type==='bb')placeG(parts.eq,J.eq.x,J.eq.y,0);
      else if(J.eq.type==='db'){
        placeG(parts.eq,J.eq.x,J.eq.y,0);
        if(P._dbF&&parts.eqF)placeG(parts.eqF,P._dbF.x,P._dbF.y,0);
      }
    }
    if(parts.customEq)parts.customEq(J);
    if(parts.glow){
      var g=parts.pulse?parts.pulse(J,p,now||0):null;
      if(g&&g.k>0&&g.p)parts.glow.set(g.p.x,g.p.y,g.k);
      else parts.glow.set(0,-999,0);
    }
    if(parts.shadow)parts.shadow.set(J.b.x);
  }

  if(REDUCED){
    draw(scene.still!=null?scene.still:0.45,0);
  }else{
    this._raf=requestAnimationFrame(frame);
  }

  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){self._visible=en.isIntersecting;});
  },{threshold:.05});
  io.observe(host);

  this.destroy=function(){if(this._raf)cancelAnimationFrame(this._raf);io.disconnect();host.innerHTML='';};
  this.play=function(){this._playing=true;};
  this.pause=function(){this._playing=false;};
  this.isPlaying=function(){return this._playing;};
  this.setSpeed=function(s){this._speed=s;};
  this.onRep=function(cb){this._onRep=cb;};
}

/* ---------- mount API ---------- */
var registry=new WeakMap();
window.IFMotion={
  mount:function(root,onRepFactory){
    var els=(root||document).querySelectorAll('[data-exmotion]');
    Array.prototype.forEach.call(els,function(elm){
      if(registry.has(elm))return;
      var id=elm.getAttribute('data-exercise');
      registry.set(elm,new MotionInstance(elm,id,typeof onRepFactory==='function'?onRepFactory(elm):null));
    });
  },
  destroy:function(root){
    Array.prototype.forEach.call((root||document).querySelectorAll('[data-exmotion]'),function(elm){
      var inst=registry.get(elm);
      if(inst){inst.destroy();registry.delete(elm);}
    });
  },
  get:function(elm){return registry.get(elm)||null;}
};

})();
