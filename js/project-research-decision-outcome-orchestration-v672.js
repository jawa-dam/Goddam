const DECISION='geiProjectResearchDecisionOutcomeDecisionV671';
const KEY='geiProjectResearchDecisionOutcomeOrchestrationV672';
const arr=v=>Array.isArray(v)?v:[];
const read=(k,f=[])=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const order={CRITICAL:0,HIGH:1,NORMAL:2,LOW:3};

function selectedDecisions(artifactId){
 return arr(read(DECISION)).filter(x=>x.status==='SELECTED' && (!artifactId||x.artifactId===artifactId)).sort((a,b)=>(order[a.priority]??9)-(order[b.priority]??9)||Number(b.score||0)-Number(a.score||0)||String(a.selectedAt||a.createdAt).localeCompare(String(b.selectedAt||b.createdAt)));
}
function buildPlan(artifactId){
 const ds=selectedDecisions(artifactId); return ds.map((d,i)=>({
  id:uid(),artifactId,decisionId:d.id,sourceDecisionId:d.id,title:d.decision,priority:d.priority,score:d.score,route:d.route,
  phase:i===0?'NOW':i===1?'NEXT':'LATER',dependencyId:i?ds[i-1].id:null,dependencyTitle:i?ds[i-1].decision:null,
  status:i?'BLOCKED':'READY',createdAt:new Date().toISOString(),lineage:'V6.69 → V6.70 → V6.71 → V6.72'
 }));
}
function render(){
 const all=arr(read(DECISION)); const ids=[...new Set(all.filter(x=>x.status==='SELECTED'&&x.artifactId).map(x=>x.artifactId))];
 const sel=document.getElementById('artifact');
 sel.innerHTML=ids.length?ids.map(id=>`<option value="${String(id).replaceAll('"','&quot;')}">${id}</option>`).join(''):'<option value="">No V6.71 decisions yet</option>';
 const artifact=sel.value||ids[0]||''; const plan=buildPlan(artifact); const hist=arr(read(KEY)).filter(x=>!artifact||x.artifactId===artifact).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
 document.getElementById('status').innerHTML=plan.length?'<strong>ORCHESTRATION READY</strong><br>V6.71 decisions have been converted into a deterministic NOW → NEXT → LATER sequence.':'<strong>AWAITING DECISION</strong><br>Record a V6.71 decision before V6.72 can orchestrate it.';
 document.getElementById('plan').innerHTML=plan.length?plan.map((p,i)=>`<div class="item ${p.status==='READY'?'good':'warn'}"><div class="tag">${p.phase}</div> <div class="tag">${p.priority}</div><h3>${i+1}. ${p.title}</h3><p class="hint">Score: ${p.score} · Route: ${p.route}</p><p class="hint">Dependency: ${p.dependencyTitle||'None — first action'}</p><button class="btn start" data-id="${p.id}">${p.status==='READY'?'▶️ START ORCHESTRATION':'🔒 BLOCKED UNTIL PREREQUISITE COMPLETES'}</button></div>`).join(''):'<div class="item hint">No orchestration plan is available yet.</div>';
 document.getElementById('history').innerHTML=hist.length?hist.map(x=>`<div class="item"><strong>${x.title}</strong><br><span class="hint">${x.phase} · ${x.status} · ${new Date(x.createdAt).toLocaleString()}</span><br>${x.note||''}</div>`).join(''):'<div class="item hint">No orchestration history yet.</div>';
 document.getElementById('trace').innerHTML='<p class="hint">V6.69 → V6.70 → V6.71 → <strong>V6.72</strong></p><p class="hint">V6.72 consumes researcher-selected V6.71 decisions and determines their process order. It does not execute the decision.</p>';
 document.getElementById('integrity').innerHTML='<p class="hint">Deterministic, local-first, researcher-controlled. Orchestration order is a process recommendation, not proof of scientific truth, causation, external validity, publication, peer review, acceptance, or real-world impact.</p>';
 document.querySelectorAll('.start').forEach(btn=>btn.onclick=()=>{
  const p=plan.find(x=>x.id===btn.dataset.id); if(!p||p.status==='BLOCKED')return;
  const note=prompt('Optional researcher note:')||''; const records=arr(read(KEY));
  records.unshift({...p,status:'IN PROGRESS',startedAt:new Date().toISOString(),note}); write(KEY,records.slice(0,500)); render();
 });
}
document.addEventListener('DOMContentLoaded',()=>{document.getElementById('artifact')?.addEventListener('change',render);render()});