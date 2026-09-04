const ORCH='geiProjectResearchDecisionOutcomeOrchestrationV678';
const EXEC='geiProjectResearchExecutionV623';
const KEY='geiProjectResearchDecisionExecutionHandoffV679';
const arr=v=>Array.isArray(v)?v:[];
const read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc=v=>String(v??'').replace(/[&<>\"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[x]));
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const latest=(a)=>a.slice().sort((x,y)=>new Date(y.createdAt||0)-new Date(x.createdAt||0))[0];
function orchestration(artifactId){return arr(read(ORCH)).filter(x=>x.artifactId===artifactId).sort((a,b)=>{const p={NOW:0,NEXT:1,LATER:2};return (p[a.phase]??9)-(p[b.phase]??9)||new Date(a.createdAt||0)-new Date(b.createdAt||0)})}
function current(artifactId){return orchestration(artifactId).find(x=>x.phase==='NOW'&&!['COMPLETED'].includes(x.status))||null}
function handoffs(artifactId){return arr(read(KEY)).filter(x=>x.artifactId===artifactId)}
function ready(artifactId){
 const plan=orchestration(artifactId), c=current(artifactId); if(!c)return {ok:false,reason:'No active NOW orchestration item is available.'};
 const dependency=c.dependencyId?plan.find(x=>x.sourceDecisionId===c.dependencyId||x.decisionId===c.dependencyId):null;
 const dependencyComplete=!dependency||dependency.status==='COMPLETED';
 const duplicate=handoffs(artifactId).some(x=>x.orchestrationId===c.id&&x.status==='READY FOR EXECUTION');
 if(c.phase!=='NOW')return {ok:false,reason:'Only the current NOW decision can be handed off.'};
 if(!dependencyComplete)return {ok:false,reason:'The prerequisite orchestration item has not been completed.'};
 if(duplicate)return {ok:false,reason:'A READY FOR EXECUTION handoff already exists for this orchestration item.'};
 return {ok:true,reason:'The orchestrated decision is ready for execution handoff.'};
}
function render(){
 const all=arr(read(ORCH));
 const ids=[...new Set(all.filter(x=>x.artifactId).map(x=>x.artifactId))];
 const sel=document.getElementById('artifact');
 sel.innerHTML=ids.length?ids.map(id=>`<option value="${esc(id)}">${esc(id)}</option>`).join(''):'<option value="">No V6.78 orchestration yet</option>';
 const artifact=sel.value||ids[0]||''; const c=current(artifact); const gate=ready(artifact); const hist=handoffs(artifact).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
 document.getElementById('status').innerHTML=c?(gate.ok?'<strong>HANDOFF READY</strong><br>The current V6.78 NOW decision is ready to be handed to execution.':`<strong>HANDOFF BLOCKED</strong><br>${esc(gate.reason)}`):'<strong>AWAITING ORCHESTRATION</strong><br>Complete or create a V6.78 orchestration state before requesting execution handoff.';
 document.getElementById('current').innerHTML=c?`<div class="item ${gate.ok?'good':'warn'}"><span class="tag">${esc(c.phase)} • ${esc(c.status)}</span><h3>${esc(c.title)}</h3><p class="hint"><b>Priority:</b> ${esc(c.priority)} · <b>Score:</b> ${esc(c.score)}<br><b>Route:</b> ${esc(c.route)}<br><b>Dependency:</b> ${esc(c.dependencyTitle||'None — first decision')}</p></div>`:'<p class="hint">No current V6.78 NOW decision is available.</p>';
 document.getElementById('gate').innerHTML=`<div class="item ${gate.ok?'good':'warn'}"><span class="tag">${gate.ok?'READY FOR EXECUTION':'BLOCKED'}</span><h3>${gate.ok?'🚀 Handoff may be created':'🔒 Execution handoff is blocked'}</h3><p class="hint">${esc(gate.reason)}</p></div>`;
 document.getElementById('note').value='';
 document.getElementById('create').disabled=!gate.ok;
 document.getElementById('history').innerHTML=hist.length?hist.map(x=>`<div class="item"><span class="tag">${esc(x.status)}</span><h3>${esc(x.title)}</h3><p class="hint">Priority: ${esc(x.priority)} · Score: ${esc(x.score)}<br>Route: ${esc(x.route)}<br><b>Note:</b> ${esc(x.note||'None')}<br>${new Date(x.createdAt||0).toLocaleString()}</p></div>`).join(''):'<div class="item hint">No V6.79 handoff history yet.</div>';
 document.getElementById('trace').innerHTML=`<p class="hint"><b>V6.78 Orchestration:</b> ${orchestration(artifact).length} record(s).</p><p class="hint"><b>V6.23 Execution:</b> ${arr(read(EXEC)).filter(x=>x.artifactId===artifact).length} record(s).</p><p class="hint"><b>V6.79 Handoffs:</b> ${hist.length} record(s).</p><p class="hint"><strong>Lineage:</strong> V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → V6.78 → <strong>V6.79</strong></p>`;
 document.getElementById('integrity').innerHTML='<p class="hint">V6.79 is deterministic, local-first, and researcher-controlled. It checks the V6.78 orchestration state and records a handoff when the current NOW decision is ready. It does not execute the decision or independently verify external execution, scientific truth, causation, external validity, publication, peer review, acceptance, or real-world impact.</p>';
 document.querySelectorAll('.back').forEach(a=>a.onclick=()=>{});
}
document.addEventListener('DOMContentLoaded',()=>{
 document.getElementById('artifact')?.addEventListener('change',render);
 document.getElementById('create')?.addEventListener('click',()=>{
  const sel=document.getElementById('artifact'); const artifact=sel.value; const c=current(artifact); const gate=ready(artifact); if(!c||!gate.ok)return;
  const note=String(document.getElementById('note')?.value||'').trim(); const records=arr(read(KEY));
  const rec={id:uid(),artifactId:artifact,orchestrationId:c.id,decisionId:c.decisionId||c.sourceDecisionId,title:c.title,priority:c.priority,score:c.score,phase:c.phase,route:'V6.23',status:'READY FOR EXECUTION',note,sourceOrchestrationId:c.id,sourceDecisionId:c.sourceDecisionId,dependencyId:c.dependencyId||null,dependencyTitle:c.dependencyTitle||null,createdAt:new Date().toISOString(),lineage:'V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → V6.78 → V6.79'};
  records.unshift(rec);write(KEY,records.slice(0,500));render();
 });
 render();
});