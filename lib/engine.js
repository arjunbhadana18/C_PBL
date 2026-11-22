// Skip list model. It follows skip_list_module.h: walk right while the next key is smaller, then drop a level.
// Every function also returns "steps" (with a snapshot and a C++ line number) so the UI can replay them.
export const cfg={cap:4};   // max level for new nodes (set from the sidebar)
const MAXL=16;
/* ---- skip list model: sorted nodes with a level, steps carry a snapshot ---- */
const M=()=>({n:[]}),topL=m=>m.n.reduce((a,x)=>Math.max(a,x.lv),0);
const nx=(m,k,l)=>m.n.find(x=>(k===null||x.k>k)&&x.lv>=l)||null;
const mk=(m,t,at,kind,ln)=>({t,at,kind,ln,d:m.n.map(x=>({k:x.k,lv:x.lv}))});
function walk(m,key,st){let cur=null;
 for(let l=topL(m);l>=0;l--){st.push(mk(m,`Level ${l}: at ${cur===null?'HEAD':cur}. Check the next node on this level.`,{l,k:cur},null,1));
  for(;;){const n=nx(m,cur,l);
   if(n&&n.k<key){cur=n.k;st.push(mk(m,`Next is ${n.k}, and ${n.k} < ${key}, so move right.`,{l,k:cur},null,4))}
   else{st.push(mk(m,`Next is ${n?n.k+' (not < '+key+')':'NULL'}, so stop${l?' and drop to level '+(l-1):''}.`,{l,k:cur},null,5));break}}}
 return cur}
function find(m,key){const st=[];st.op='search';const p=walk(m,key,st),n=nx(m,p,0),hit=n&&n.k===key;
 st.push(mk(m,hit?`Found ${key} on level 0.`:`${key} is not in the list.`,{l:0,k:hit?key:p},hit?'found':'miss',hit?9:10));return{st,n:hit?n:null}}
function put(m,key,val,full){const st=[];st.op='insert';const p=walk(m,key,st),n=nx(m,p,0);
 if(n&&n.k===key){n.v=val;st.push(mk(m,`${key} already exists, so its value is updated.`,{l:0,k:key},'found',9));return{st}}
 const hi=!m.n.length||key>m.n[m.n.length-1].k;let lv=0,why;
 if(full&&hi){lv=Math.max(topL(m),2);why=`${key} is the new highest key, so it gets a full-height tower (levels 0 to ${lv}) and becomes the last node.`}
 else{while(Math.random()<.5&&lv<cfg.cap)lv++;why=`Coin flips give the new node level ${lv} (each heads adds a level).`}
 st.push(mk(m,why,{l:0,k:p},null,11));
 m.n.push({k:key,lv,v:val});m.n.sort((a,b)=>a.k-b.k);
 st.push(mk(m,`Link ${key} into levels 0 to ${lv}, right after the nodes where the search stopped.`,{l:lv,k:key},'new',15));return{st}}
function rem(m,key){const st=[];st.op='delete';const p=walk(m,key,st),n=nx(m,p,0);
 if(!n||n.k!==key){st.push(mk(m,`${key} not found, so there is nothing to delete.`,{l:0,k:p},'miss',9));return{st}}
 m.n=m.n.filter(x=>x!==n);st.push(mk(m,`Found ${key}. Unlink it from every level it was on.`,{l:0,k:p},'found',11));return{st,ok:1}}
function rng(m,lo,hi){const st=[];st.op='range';const p=walk(m,lo,st),f=[];let n=nx(m,p,0);
 st.push(mk(m,`Reached the first key ≥ ${lo}. Now scan along level 0.`,{l:0,k:p},null,7));
 while(n&&n.k<=hi){f.push(n);st.push(mk(m,`${n.k} ≤ ${hi}, so include ${n.k}.`,{l:0,k:n.k},'found',9));n=nx(m,n.k,0)}
 st.push(mk(m,`${n?n.k+' > '+hi:'End of list'}, so stop. ${f.length} key(s) in range.`,{l:0,k:n?n.k:null},null,8));return{st,f}}
const trav=m=>{let s='';for(let l=topL(m);l>=0;l--)s+=`Level ${l}: HEAD`+m.n.filter(x=>x.lv>=l).map(x=>' -> '+x.k).join('')+' -> NULL\n';return s.trim()};
/* ---- drawing ---- */
function draw(d,at,tr,kind){const tp=Math.max(d.reduce((a,x)=>Math.max(a,x.lv),0),2),W=58,R=36,Lm=40,cols=d.length+2;
 const X=i=>Lm+i*W,Y=l=>(tp-l)*R+4;let s=`<svg width="${Lm+cols*W}" height="${(tp+1)*R+6}" role="img" aria-label="Skip list levels">`;
 d.forEach((n,i)=>s+=`<line class="gd" x1="${X(i+1)+22}" x2="${X(i+1)+22}" y1="${Y(n.lv)+14}" y2="${Y(0)+14}"/>`);
 for(let l=0;l<=tp;l++){s+=`<text class="lb" x="2" y="${Y(l)+18}">L${l}</text>`;
  const cs=[{c:0,k:null}].concat(d.map((n,i)=>n.lv>=l?{c:i+1,k:n.k}:null).filter(Boolean),[{c:cols-1,k:'NULL'}]);
  cs.forEach((e,j)=>{if(j)s+=`<line class="ar" x1="${X(cs[j-1].c)+44}" x2="${X(e.c)}" y1="${Y(l)+14}" y2="${Y(l)+14}"/>`;
   const nul=e.k==='NULL',cur=!nul&&at&&at.l===l&&at.k===e.k,t=tr.has(l+'|'+e.k);
   s+=`<g class="${cur?'cur k-'+kind:t?'tr':''}${nul?' nl':''}"><rect class="box" x="${X(e.c)}" y="${Y(l)}" width="44" height="28" rx="6"/><text x="${X(e.c)+22}" y="${Y(l)+18}">${e.k===null?'HEAD':e.k}</text></g>`})}
 return s+'</svg>'}
const HD=['Node *ptr = head;','for (i = currentLevel; i >= 0; i--) {','  while (ptr->forward[i] &&','         ptr->forward[i]->key < key)','    ptr = ptr->forward[i];  // move right','  update[i] = ptr;  // stop, drop a level','}'];
const CODE={search:HD.concat(['ptr = ptr->forward[0];','if (ptr && ptr->key == key)','  return true;   // found','return false;    // not found']),
insert:HD.concat(['ptr = ptr->forward[0];','if (ptr && ptr->key == key) {','  ptr->value = value; return;  // update','}','newLevel = getRandomLevel();  // coin flips','newNode = new Node(key, value, newLevel);','for (i = 0; i <= newLevel; i++) {','  newNode->forward[i] = update[i]->forward[i];','  update[i]->forward[i] = newNode;  // link','}']),
delete:HD.concat(['ptr = ptr->forward[0];','if (!ptr || ptr->key != key)','  return false;  // not found','for (i = 0; i <= currentLevel; i++)','  update[i]->forward[i] = ptr->forward[i];','delete ptr;  // gone from every level']),
range:HD.concat(['ptr = ptr->forward[0];  // first key >= low','while (ptr && ptr->key <= high) {','  result.push_back(ptr);  // include','  ptr = ptr->forward[0];','}'])};
const CN={search:'searchData',insert:'insertData',delete:'deleteData',range:'getRange'};
/* ---- measure real comparisons ---- */
function avl(keys){const h=n=>n?n.h:0,up=n=>{n.h=1+Math.max(h(n.l),h(n.r))};
 const rR=y=>{const x=y.l;y.l=x.r;x.r=y;up(y);up(x);return x},rL=x=>{const y=x.r;x.r=y.l;y.l=x;up(x);up(y);return y};
 const ins=(n,k)=>{if(!n)return{k,h:1,l:null,r:null};if(k<n.k)n.l=ins(n.l,k);else n.r=ins(n.r,k);up(n);const b=h(n.l)-h(n.r);
  if(b>1){if(h(n.l.l)<h(n.l.r))n.l=rL(n.l);return rR(n)}if(b<-1){if(h(n.r.r)<h(n.r.l))n.r=rR(n.r);return rL(n)}return n};
 let root=null;for(const k of keys)root=ins(root,k);return{root,height:h(root)}}
function chart(rows){const W=640,Hc=300,L=64,R=20,T=34,B=48,iw=W-L-R,ih=Hc-T-B;
 const my=Math.ceil(Math.max(...rows.map(r=>Math.max(r.sl,r.av,r.lg)))/5)*5,X=i=>L+i*iw/(rows.length-1),Y=v=>T+ih-v/my*ih;
 let s=`<svg viewBox="0 0 ${W} ${Hc}" width="100%" style="max-width:${W}px" role="img" aria-label="Average comparisons per search against number of keys">`;
 for(let g=0;g<=5;g++){const v=my*g/5;s+=`<line class="gd" x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}"/><text class="lb" x="${L-8}" y="${Y(v)+4}" style="text-anchor:end">${v}</text>`}
 rows.forEach((r,i)=>s+=`<text x="${X(i)}" y="${Hc-B+18}">${r.n.toLocaleString()}</text>`);
 s+=`<text x="${L+iw/2}" y="${Hc-8}">Number of keys (n)</text><text transform="rotate(-90)" x="${-(T+ih/2)}" y="14">Avg comparisons per search</text>`;
 const ln=(k,c,d)=>`<polyline fill="none" stroke="${c}" stroke-width="2.5" ${d?'stroke-dasharray="6 4"':''} points="${rows.map((r,i)=>X(i)+','+Y(r[k])).join(' ')}"/>`+(d?'':rows.map((r,i)=>`<circle cx="${X(i)}" cy="${Y(r[k])}" r="4" fill="${c}"/><text x="${X(i)}" y="${Y(r[k])+(k==='sl'?-9:17)}" style="fill:${c}">${r[k].toFixed(1)}</text>`).join(''));
 s+=ln('lg','var(--mut)',1)+ln('sl','var(--ac)')+ln('av','var(--wa)');
 [['Skip list','var(--ac)'],['AVL tree','var(--wa)'],['log₂ n (reference)','var(--mut)']].forEach(([t,c],i)=>s+=`<rect x="${L+i*150}" y="8" width="14" height="4" fill="${c}"/><text class="lb" x="${L+i*150+20}" y="14">${t}</text>`);
 return s+'</svg>'}
function bench(){const rows=[];for(const n of [100,1000,10000,100000]){
 const ks=new Set();while(ks.size<n)ks.add(Math.floor(Math.random()*1e9));const a=[...ks],hd={f:[]},up=[];let lv=0;
 for(const k of a){let p=hd;for(let i=lv;i>=0;i--){while(p.f[i]&&p.f[i].k<k)p=p.f[i];up[i]=p}
  let l=0;while(Math.random()<.5&&l<MAXL)l++;if(l>lv){for(let i=lv+1;i<=l;i++)up[i]=hd;lv=l}
  const d={k,f:[]};for(let i=0;i<=l;i++){d.f[i]=up[i].f[i]||null;up[i].f[i]=d}}
 const qs=[];for(let q=0;q<3000;q++)qs.push(a[Math.floor(Math.random()*n)]);let c=0,c2=0;
 for(const k of qs){let p=hd;for(let i=lv;i>=0;i--)while(p.f[i]&&(c++,p.f[i].k<k))p=p.f[i]}
 const A=avl(a);for(const k of qs){let p=A.root;while(p){c2++;if(k===p.k)break;p=k<p.k?p.l:p.r}}
 rows.push({n,sl:c/3000,av:c2/3000,lg:Math.log2(n),lv:lv+1,ah:A.height})}
 return rows}

export{M,topL,nx,find,put,rem,rng,trav,draw,CODE,CN,chart,bench};
