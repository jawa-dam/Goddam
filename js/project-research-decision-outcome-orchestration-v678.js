const DECISION='geiProjectResearchDecisionOutcomeDecisionV677';
const KEY='geiProjectResearchDecisionOutcomeOrchestrationV678';
const arr=v=>Array.isArray(v)?v:[];
const read=(k,f=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const esc=v=>String(v??'').replace(/[&<>\"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[x]));
const order={CRITICAL:0,HIGH:1,NORMAL:2,LOW:3};
const phaseFor=i=>i===0?'NOW':i===1?'NEXT':'LATER';

function selectedDecisions(artifactId){
 return arr(read(DECISION)).filter(x=>x.status==='SELECTED'&&(!artifactId||x.artifactId===artifactId)).sort((a,b)=>(order[a.priority]??9)-(order[b.priority]??9)||Number(b.score||0)-Number(a.score||0)||String(a.createdAt||'').localeCompare(String(b.createdAt||'')));
}
function buildPlan(artifactId){
 const ds=selectedDecisions(artifactId); const history=arr(read(KEY));
 return ds.map((d,i)=>{
  const prior=history.filter(x=>x.sourceDecisionId===d.id).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0))[0];
  const dependency= i?ds[i-1]:null;
  const dependencyHistory=dependency?history.filter(x=>x.sourceDecisionId===dependency.id).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0))[0]:null;
  const dependencyComplete=!!dependencyHistory&&dependencyHistory.status==='COMPLETED';
  let status=prior?.status==='COMPLETED'?'COMPLETED':prior?.status==='IN PROGRESS'?'IN PROGRESS':(!dependency||dependencyComplete)?'READY':'BLOCKED';
  return {id:prior?.id||uid(),artifactId,decisionId:d.id,sourceDecisionId:d.id,title:d.decision,priority:d.priority,score:d.score,route:d.route,phase:phaseFor(i),dependencyId:dependency?.id||null,dependencyTitle:dependency?.decision||null,status,sourceIntelligenceId:d.sourceIntelligenceId,sourceOutcomeId:d.sourceOutcomeId,createdAt:prior?.createdAt||new Date().toISOString(),lineage:'V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → V6.78'};
 });
}
function render(){
 const all=arr(read(DECISION));
 const ids=[...new Set(all.filter(x=>x.status==='SELECTED'&&x.artifactId).map(x=>x.artifactId))];
 const sel=el('artifact');
 sel.innerHTML=ids.length?ids.map(id=>`<option value="${esc(id)}">${esc(id)}</option>`).join(''):'<option value="">No V6.77 decisions yet</option>';
 const artifact=sel.value||ids[0]||''; const plan=buildPlan(artifact); const hist=arr(read(KEY)).filter(x=>!artifact||x.artifactId===artifact).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
 el('status').innerHTML=plan.length?'<strong>ORCHESTRATION READY</strong><br>V6.77 decisions have been converted into a deterministic NOW → NEXT → LATER sequence with explicit dependencies.':'<strong>AWAITING DECISION</strong><br>Select a V6.77 decision before V6.78 can orchestrate it.';
 el('plan').innerHTML=plan.length?plan.map((p,i)=>`<div class="item ${p.status==='READY'||p.status==='IN PROGRESS'||p.status==='COMPLETED'?'good':'warn'}"><div class="tag">${esc(p.phase)}</div> <div class="tag">${esc(p.priority)}</div> <div class="tag">${esc(p.status)}</div><h3>${i+1}. ${esc(p.title)}</h3><p class="hint">Score: ${esc(p.score)} · Route: ${esc(p.route)}</p><p class="hint">Dependency: ${esc(p.dependencyTitle||'None — first decision in sequence')}</p><button class="btn start" data-id="${esc(p.id)}">${p.status==='READY'?'▶️ START ORCHESTRATION':p.status==='IN PROGRESS'?'⏳ IN PROGRESS':p.status==='COMPLETED'?'✅ COMPLETED':'🔒 BLOCKED UNTIL PREREQUISITE COMPLETES'}</button></div>`).join(''):'<div class="item hint">No orchestration plan is available yet.</div>';
 el('history').innerHTML=hist.length?hist.map(x=>`<div class="item"><span class="tag">${esc(x.phase)} • ${esc(x.status)}</span><h3>${esc(x.title)}</h3><p class="hint">Priority: ${esc(x.priority)} · Score: ${esc(x.score)}<br>Dependency: ${esc(x.dependencyTitle||'None')}<br><b>Note:</b> ${esc(x.note||'None')}<br>${new Date(x.createdAt||0).toLocaleString()}</p></div>`).join(''):'<div class="item hint">No V6.78 orchestration history yet.</div>';
 el('trace').innerHTML=`<p class="hint"><strong>V6.77 Decisions:</strong> ${selectedDecisions(artifact).length} selected decision(s).</p><p class="hint"><strong>V6.78 Records:</strong> ${hist.length} orchestration record(s).</p><p class="hint"><strong>Lineage:</strong> V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → <strong>V6.78</strong></p>`;
 el('integrity').innerHTML='<p class="hint">V6.78 is deterministic, local-first, and researcher-controlled. It orders researcher-selected V6.77 decisions and records orchestration state. It does not execute decisions or establish scientific truth, causation, external validity, publication, peer review, acceptance, or real-world impact.</p>';
 document.querySelectorAll('.start').forEach(btn=>btn.onclick=()=>{
  const p=plan.find(x=>x.id===btn.dataset.id); if(!p||p.status!=='READY')return;
  const note=prompt('Optional researcher note:')||''; const records=arr(read(KEY));
  const rec={...p,status:'IN PROGRESS',startedAt:new Date().toISOString(),note};
  const next=records.filter(x=>x.id!==p.id); next.unshift(rec); write(KEY,next.slice(0,500)); render();
 });
}
function el(id){return document.getElementById(id)}
document.addEventListener('DOMContentLoaded',()=>{el('artifact')?.addEventListener('change',render);render()});