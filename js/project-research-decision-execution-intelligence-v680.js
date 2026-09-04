const arr=v=>Array.isArray(v)?v:[];
const read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const esc=v=>String(v??'').replace(/[&<>\"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[x]));
const el=id=>document.getElementById(id);
const HANDOFF='geiProjectResearchDecisionExecutionHandoffV679';
const EXEC='geiProjectResearchExecutionV623';
const KEY='geiProjectResearchDecisionExecutionIntelligenceV680';
const handoffs=arr(read(HANDOFF));
const execution=arr(read(EXEC));
let records=arr(read(KEY));
const ids=[...new Set(handoffs.map(x=>x.artifactId).filter(Boolean))];
let selected=ids[0]||'';

function by(a,id){return a.filter(x=>x.artifactId===id)}
function latest(a){return a.slice().sort((x,y)=>new Date(y.createdAt||y.updatedAt||0)-new Date(x.createdAt||x.updatedAt||0))[0]}
function taskStatus(x){return String(x.status||'').toUpperCase().replaceAll('_',' ')}
function tasks(id){return by(execution,id).filter(x=>x.taskId||x.id)}
function analyze(id){
 const hs=by(handoffs,id);
 const h=latest(hs);
 const ts=tasks(id);
 const counts=ts.reduce((a,x)=>{const s=taskStatus(x);a[s]=(a[s]||0)+1;return a},{});
 const total=ts.length;
 const done=counts.COMPLETE||0;
 const active=(counts.ACTIVE||0)+(counts['IN PROGRESS']||0);
 const blocked=counts.BLOCKED||0;
 let state='NOT STARTED',signal='AWAITING EXECUTION';
 if(!h){state='NOT STARTED';signal='AWAITING EXECUTION'}
 else if(String(h.status||'').toUpperCase()!=='READY FOR EXECUTION'){state='BLOCKED';signal='EXECUTION HANDOFF BLOCKED'}
 else if(blocked){state='BLOCKED';signal='EXECUTION BLOCKED'}
 else if(total&&done===total){state='COMPLETED';signal='DECISION EXECUTION COMPLETE'}
 else if(active){state='IN PROGRESS';signal='DECISION EXECUTION ACTIVE'}
 else if(total){state='READY';signal='EXECUTION ACTIVITY DETECTED'}
 else{state='READY';signal='EXECUTION READY TO BEGIN'}
 const progress=total?Math.round(done/total*100):0;
 return {h,ts,counts,total,done,active,blocked,state,signal,progress};
}
function save(a){
 const note=String(el('note')?.value||'').trim();
 const rec={
  id:crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,
  artifactId:selected,
  sourceHandoffId:a.h?.id||'',
  decisionId:a.h?.decisionId||'',
  orchestrationId:a.h?.orchestrationId||'',
  title:a.h?.title||'Decision execution',
  state:a.state,
  signal:a.signal,
  progress:a.progress,
  totalTasks:a.total,
  completedTasks:a.done,
  activeTasks:a.active,
  blockedTasks:a.blocked,
  note,
  createdAt:new Date().toISOString(),
  lineage:'V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → V6.78 → V6.79 → V6.80'
 };
 records=[...records,rec].slice(-500);
 localStorage.setItem(KEY,JSON.stringify(records));
 render();
}
function render(){
 const sel=el('artifact');
 sel.innerHTML=ids.length?ids.map(x=>`<option value="${esc(x)}" ${x===selected?'selected':''}>${esc(x)}</option>`).join(''):'<option value="">No V6.79 handoff yet</option>';
 const item=analyze(selected);
 const hist=records.filter(x=>!selected||x.artifactId===selected).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
 const tone=item.blocked?'blocked':item.state==='COMPLETED'?'good':'warn';
 el('status').innerHTML=ids.length?'<strong>INTELLIGENCE ENGINE READY</strong><br>V6.80 monitors the documented V6.79 decision-execution handoff and V6.23 execution state for the selected research artifact.':'<strong>AWAITING HANDOFF</strong><br>Create a V6.79 execution handoff before V6.80 can evaluate decision execution.';
 el('current').innerHTML=item.h?`<div class="item ${tone}"><span class="tag">${esc(item.state)} • ${item.progress}%</span><h3>${esc(item.h.title)}</h3><p class="hint"><b>Handoff:</b> ${esc(item.h.status)}<br><b>Tasks:</b> ${item.done} / ${item.total} complete<br><b>Active:</b> ${item.active} • <b>Blocked:</b> ${item.blocked}<br><b>Route:</b> V6.23 Execution</p></div>`:'<p class="hint">No current V6.79 handoff found.</p>';
 el('signals').innerHTML=`<div class="item ${tone}"><h3>${esc(item.signal)}</h3><p class="hint">Execution state: <b>${esc(item.state)}</b> • Progress: <b>${item.progress}%</b></p><p class="hint">V6.80 interprets documented local execution records; it does not independently observe external activity.</p></div><textarea id="note" placeholder="Optional researcher note about this decision-execution state…"></textarea><button id="record" class="btn">📝 RECORD CURRENT EXECUTION INTELLIGENCE</button>`;
 el('record').onclick=()=>save(item);
 el('history').innerHTML=hist.map(x=>`<div class="item"><span class="tag">${esc(x.state)} • ${esc(x.progress)}%</span><h3>${esc(x.title)}</h3><p class="hint">Signal: ${esc(x.signal)}<br>Tasks: ${x.completedTasks}/${x.totalTasks} complete • Active: ${x.activeTasks} • Blocked: ${x.blockedTasks}<br><b>Note:</b> ${esc(x.note||'None')}<br>${new Date(x.createdAt||0).toLocaleString()}</p></div>`).join('')||'<p class="hint">No V6.80 intelligence history yet.</p>';
 el('trace').innerHTML=[['V6.79 Decision Execution Handoff',by(handoffs,selected).length],['V6.23 Execution Records',item.total],['Completed Tasks',item.done],['V6.80 Intelligence Records',hist.length]].map(([label,n])=>`<div class="item ${n?'good':'warn'}"><b>${n?'✅':'⚠️'} ${esc(label)}</b><p class="hint">${n} record(s).</p></div>`).join('')+`<p class="hint"><strong>Lineage:</strong> V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → V6.78 → V6.79 → V6.80</p>`;
 el('integrity').innerHTML='<p class="hint">V6.80 is deterministic, local-first, and researcher-controlled. It summarizes documented V6.79 decision-execution handoff and V6.23 execution records into decision-execution state, progress, and signals. It does not independently verify external execution, establish scientific truth, causation, external validity, publication, peer review, acceptance, or real-world impact. V6.81 will document the decision-execution outcome.</p>';
}
document.addEventListener('DOMContentLoaded',()=>{el('artifact')?.addEventListener('change',e=>{selected=e.target.value;render()});render()});
