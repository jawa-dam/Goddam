const arr=v=>Array.isArray(v)?v:[];
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const esc=v=>String(v??'').replace(/[&<>\"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[x]));
const el=id=>document.getElementById(id);
const DEC='geiProjectResearchResponseDecisionV641',KEY='geiProjectResearchResponseDecisionOrchestrationV642';
const decisions=arr(read(DEC,[]));let history=arr(read(KEY,[]));
const ids=[...new Set(decisions.map(x=>x.artifactId).filter(Boolean))];let selected=ids[0];
function source(id,a){return a.filter(x=>x.artifactId===id)}
function latest(a){return a.slice().sort((x,y)=>new Date(y.createdAt||y.updatedAt||0)-new Date(x.createdAt||x.updatedAt||0))[0]}
function build(id){
  const ds=source(id,decisions).filter(x=>x.status==='SELECTED'||x.status==='COMPLETED');
  const latestBy=new Map();ds.forEach(x=>latestBy.set(x.decision,x));
  const list=[...latestBy.values()].sort((a,b)=>(b.priority==='CRITICAL'?3:b.priority==='HIGH'?2:1)-(a.priority==='CRITICAL'?3:a.priority==='HIGH'?2:1)||Number(b.score||0)-Number(a.score||0));
  const items=list.map((d,n)=>({id:d.id,title:d.decision,detail:d.reason||'Complete the selected research decision.',priority:d.priority||'NORMAL',route:d.route||'V6.31',phase:n===0?'NOW':n===1?'NEXT':'LATER',dependsOn:n===0?[]:[list[n-1].decision],sourceStatus:d.status}));
  return {items,selected:ds.length,total:source(id,decisions).length};
}
function stateFor(id,title){return history.filter(x=>x.artifactId===id&&x.title===title).at(-1)?.status||'PLANNED'}
function persist(item){const current=stateFor(selected,item.title);const s=prompt('Set orchestration status: IN PROGRESS or COMPLETED',current==='COMPLETED'?'IN PROGRESS':'IN PROGRESS');if(!s)return;const status=s.trim().toUpperCase();if(!['IN PROGRESS','COMPLETED'].includes(status)){alert('Use IN PROGRESS or COMPLETED.');return}history.push({id:crypto.randomUUID?.()||String(Date.now()),artifactId:selected,title:item.title,status,phase:item.phase,priority:item.priority,route:item.route,dependsOn:item.dependsOn,createdAt:new Date().toISOString(),lineage:'V6.40 → V6.41 → V6.42'});history=history.slice(-500);localStorage.setItem(KEY,JSON.stringify(history));render()}
function render(){
  el('status').textContent=ids.length?'🚂 Orchestrating V6.41 response decisions for '+ids.length+' artifact(s)':'No V6.41 response decisions found';
  el('selector').innerHTML=ids.length?'<select id="artifact">'+ids.map(x=>'<option value="'+esc(x)+'" '+(x===selected?'selected':'')+'>'+esc(x)+'</option>').join('')+'</select>':'<p class="hint">Record a V6.41 response decision first.</p>';
  const s=document.getElementById('artifact');if(s)s.onchange=()=>{selected=s.value;render()};if(!selected)return;
  const a=build(selected);const h=source(selected,history);const completed=h.filter(x=>x.status==='COMPLETED').length;const inProgress=h.filter(x=>x.status==='IN PROGRESS').length;
  el('stats').innerHTML=[['Decision Records',a.total],['Selected Decisions',a.selected],['Planned Actions',a.items.length],['In Progress',inProgress],['Completed',completed]].map(x=>'<div class="stat"><b>'+esc(x[1])+'</b>'+esc(x[0])+'</div>').join('');
  el('plan').innerHTML=a.items.map((x,n)=>{const prior=x.dependsOn.length?stateFor(selected,x.dependsOn[0]):'COMPLETED';const blocked=x.dependsOn.length&&prior!=='COMPLETED';const st=stateFor(selected,x.title);return '<div class="item '+(blocked?'blocked':x.priority==='CRITICAL'?'critical':x.phase==='NOW'?'now':'')+'"><span class="tag">'+esc(blocked?'BLOCKED':x.phase)+' • #'+(n+1)+' • '+esc(x.priority)+'</span><h3>'+esc(x.title)+'</h3><p class="hint">'+esc(x.detail)+'</p><p><b>Route:</b> '+esc(x.route)+' &nbsp; <b>Depends on:</b> '+(x.dependsOn.length?esc(x.dependsOn[0]):'None')+'</p><span class="tag">'+esc(st)+'</span>'+(blocked?'<p class="hint">🔒 Complete the prerequisite before this decision can move forward.</p>':'<button class="btn action" data-id="'+esc(x.id)+'">'+(st==='COMPLETED'?'Update Status':'Record Progress')+'</button>')+'</div>'}).join('')||'<p class="hint">No selected decisions are available to orchestrate.</p>';
  document.querySelectorAll('.action').forEach(b=>b.onclick=()=>{const x=a.items.find(y=>y.id===b.dataset.id);if(x)persist(x)});
  el('logic').innerHTML='<div class="item"><b>Orchestration logic</b><p class="hint">V6.42 converts researcher-selected V6.41 decisions into an ordered NOW → NEXT → LATER sequence. Higher-priority decisions are placed first; each downstream decision depends on the previous decision being documented as COMPLETED. The researcher remains in control of every status.</p></div>';
  el('trace').innerHTML=[['V6.40 Response Outcome Intelligence',source(selected,arr(read('geiProjectResearchResponseOutcomeIntelligenceV640',[]))).length],['V6.41 Response Decisions',a.total],['V6.42 Orchestration History',h.length]].map(x=>'<div class="item '+(x[1]?'good':'warn')+'"><b>'+(x[1]?'✅':'⚠️')+' '+esc(x[0])+'</b><p class="hint">'+x[1]+' relevant record(s).</p></div>').join('');
  el('history').innerHTML=h.slice().reverse().map(x=>'<div class="item"><span class="tag">'+esc(x.status)+' • '+esc(x.phase)+' • '+esc(x.priority)+'</span><b>'+esc(x.title)+'</b><p class="hint">Route: '+esc(x.route)+'<br>Depends on: '+(x.dependsOn?.length?esc(x.dependsOn[0]):'None')+'<br>'+new Date(x.createdAt).toLocaleString()+'</p></div>').join('')||'<p class="hint">No V6.42 orchestration history recorded yet.</p>';
}
render();
