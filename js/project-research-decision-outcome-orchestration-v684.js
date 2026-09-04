const arr=v=>Array.isArray(v)?v:[];
const read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const esc=v=>String(v??'').replace(/[&<>\"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[x]));
const el=id=>document.getElementById(id);
const DECISION='geiProjectResearchDecisionOutcomeDecisionV683';
const KEY='geiProjectResearchDecisionOutcomeOrchestrationV684';
const decisions=arr(read(DECISION));
let records=arr(read(KEY));
const ids=[...new Set(decisions.map(x=>x.artifactId).filter(Boolean))];
let selected=ids[0]||'';
const order={CRITICAL:0,HIGH:1,NORMAL:2,LOW:3};
const phase=i=>i===0?'NOW':i===1?'NEXT':'LATER';
function by(a,id){return a.filter(x=>x.artifactId===id)}
function latest(a){return a.slice().sort((x,y)=>new Date(y.createdAt||0)-new Date(x.createdAt||0))[0]}
function selectedDecisions(id){return by(decisions,id).filter(x=>x.status==='SELECTED').sort((a,b)=>(order[a.priority]??9)-(order[b.priority]??9)||Number(b.score||0)-Number(a.score||0)||new Date(a.createdAt||0)-new Date(b.createdAt||0))}
function historyFor(id){return by(records,id)}
function buildPlan(id){
 const ds=selectedDecisions(id),hist=historyFor(id);
 return ds.map((d,i)=>{
  const prior=ds[i-1];
  const old=hist.find(x=>x.decisionId===d.id);
  const dependencyId=prior?.id||null;
  const dependencyComplete=!prior||hist.some(x=>x.decisionId===prior.id&&x.status==='COMPLETED');
  let status=old?.status||((i===0||dependencyComplete)?'READY':'BLOCKED');
  if(old?.status==='COMPLETED')status='COMPLETED';
  return {id:old?.id||crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,artifactId:id,decisionId:d.id,sourceDecisionId:d.id,decision:d.decision,priority:d.priority,score:d.score,route:d.route,phase:phase(i),dependencyId,dependencyTitle:prior?.decision||null,status,createdAt:old?.createdAt||new Date().toISOString(),updatedAt:old?.updatedAt||old?.createdAt||new Date().toISOString(),lineage:'V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → V6.78 → V6.79 → V6.80 → V6.81 → V6.82 → V6.83 → V6.84'};
 });
}
function save(item,status){
 if(!item)return;
 const existing=records.findIndex(x=>x.id===item.id);
 const rec={...item,status,updatedAt:new Date().toISOString()};
 if(existing>=0)records[existing]=rec;else records.push(rec);
 records=records.slice(-500);localStorage.setItem(KEY,JSON.stringify(records));render();
}
function render(){
 const sel=el('artifact');sel.innerHTML=ids.length?ids.map(x=>`<option value="${esc(x)}" ${x===selected?'selected':''}>${esc(x)}</option>`).join(''):'<option value="">No V6.83 decisions yet</option>';
 const plan=buildPlan(selected),hist=historyFor(selected).sort((a,b)=>new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0));
 el('status').innerHTML=plan.length?'<strong>ORCHESTRATION ENGINE READY</strong><br>V6.83 selected decisions are organized into an ordered NOW → NEXT → LATER plan.':'<strong>AWAITING SELECTED DECISIONS</strong><br>Select at least one V6.83 decision before V6.84 can build an orchestration plan.';
 el('plan').innerHTML=plan.map((x,n)=>`<div class="item ${x.status==='BLOCKED'?'blocked':x.status==='COMPLETED'?'good':''}"><span class="tag">${esc(x.phase)} • ${esc(x.status)} • ${esc(x.priority)} • ${esc(x.score)}</span><h3>${n+1}. ${esc(x.decision)}</h3><p class="hint"><b>Route:</b> ${esc(x.route)}<br><b>Dependency:</b> ${esc(x.dependencyTitle||'None')}</p>${x.status!=='COMPLETED'?`<button class="btn start" data-id="${esc(x.id)}">${x.status==='IN PROGRESS'?'🔄 KEEP IN PROGRESS':'▶️ START ORCHESTRATION'}</button><button class="btn complete" data-id="${esc(x.id)}" ${x.status==='BLOCKED'?'disabled':''}>✅ MARK COMPLETED</button>`:'<p class="hint"><b>Completed.</b> Downstream items can now become ready.</p>'}</div>`).join('')||'<p class="hint">No orchestration plan yet.</p>';
 document.querySelectorAll('.start').forEach(b=>b.onclick=()=>{const x=plan.find(p=>p.id===b.dataset.id);if(x&&x.status!=='BLOCKED')save(x,'IN PROGRESS')});
 document.querySelectorAll('.complete').forEach(b=>b.onclick=()=>{const x=plan.find(p=>p.id===b.dataset.id);if(x&&x.status!=='BLOCKED')save(x,'COMPLETED')});
 el('history').innerHTML=hist.map(x=>`<div class="item"><span class="tag">${esc(x.status)} • ${esc(x.phase)}</span><h3>${esc(x.decision)}</h3><p class="hint">Priority: ${esc(x.priority)} • Score: ${esc(x.score)}<br>Route: ${esc(x.route)}<br>Dependency: ${esc(x.dependencyTitle||'None')}<br>${new Date(x.updatedAt||x.createdAt||0).toLocaleString()}</p></div>`).join('')||'<p class="hint">No V6.84 orchestration history yet.</p>';
 el('trace').innerHTML=[['V6.83 Selected Decisions',by(decisions,selected).filter(x=>x.status==='SELECTED').length],['V6.84 Orchestration Records',hist.length]].map(([label,n])=>`<div class="item ${n?'good':'warn'}"><b>${n?'✅':'⚠️'} ${esc(label)}</b><p class="hint">${n} record(s).</p></div>`).join('')+`<p class="hint"><strong>Lineage:</strong> V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → V6.78 → V6.79 → V6.80 → V6.81 → V6.82 → V6.83 → V6.84</p>`;
 el('integrity').innerHTML='<p class="hint">V6.84 is deterministic, local-first, and researcher-controlled. It orders researcher-selected V6.83 decisions into NOW, NEXT, and LATER phases, with explicit dependencies and local status tracking. It does not execute decisions or establish scientific truth, causation, external validity, publication, peer review, acceptance, or real-world impact. V6.85 will evaluate execution handoff readiness.</p>';
}
document.addEventListener('DOMContentLoaded',()=>{el('artifact')?.addEventListener('change',e=>{selected=e.target.value;render()});render()});
