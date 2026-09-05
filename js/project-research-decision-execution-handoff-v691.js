const arr=v=>Array.isArray(v)?v:[];
const read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const esc=v=>String(v??'').replace(/[&<>\"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[x]));
const el=id=>document.getElementById(id);
const ORCH='geiProjectResearchDecisionOutcomeOrchestrationV690';
const EXEC='geiProjectResearchExecutionV623';
const KEY='geiProjectResearchDecisionExecutionHandoffV691';
const orchestration=arr(read(ORCH));
const execution=arr(read(EXEC));
let history=arr(read(KEY));
const artifacts=[...new Set(orchestration.map(x=>x.artifactId).filter(Boolean))];
let selected=artifacts[0]||'';
const priorityOrder={CRITICAL:0,HIGH:1,NORMAL:2,LOW:3};
function byArtifact(a,id){return a.filter(x=>x.artifactId===id)}
function latest(a){return a.slice().sort((x,y)=>new Date(y.createdAt||y.updatedAt||0)-new Date(x.createdAt||x.updatedAt||0))[0]}
function currentPlan(id){
 const rows=byArtifact(orchestration,id).filter(x=>['NOW','NEXT','LATER'].includes(String(x.phase||'').toUpperCase()));
 return rows.slice().sort((a,b)=>(a.phase==='NOW'?0:a.phase==='NEXT'?1:2)-(b.phase==='NOW'?0:b.phase==='NEXT'?1:2)||((priorityOrder[a.priority]??9)-(priorityOrder[b.priority]??9))||(Number(b.score)||0)-(Number(a.score)||0))[0]||null;
}
function executionTasks(id){return byArtifact(execution,id)}
function handoffs(id){return byArtifact(history,id)}
function dependencyReady(plan,id){
 const depId=plan?.dependencyId;
 if(!depId)return true;
 const dep=orchestration.find(x=>x.id===depId&&x.artifactId===id);
 return String(dep?.status||'').toUpperCase()==='COMPLETED';
}
function isReady(plan,id){
 if(!plan)return false;
 if(String(plan.phase||'').toUpperCase()!=='NOW')return false;
 if(String(plan.status||'').toUpperCase()==='COMPLETED')return false;
 if(!dependencyReady(plan,id))return false;
 return !handoffs(id).some(x=>x.sourcePlanId===plan.id&&String(x.status||'').toUpperCase()==='READY FOR EXECUTION');
}
function save(){
 const plan=currentPlan(selected);
 if(!plan){alert('No V6.90 orchestration plan is available for this artifact.');return;}
 if(!isReady(plan,selected)){alert('This decision is not currently ready for execution handoff. Complete its dependency, keep it as the NOW item, and avoid duplicate READY FOR EXECUTION handoffs.');return;}
 const rec={id:crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,artifactId:selected,sourcePlanId:plan.id,sourceDecisionId:plan.sourceDecisionId||plan.decisionId||'',title:plan.title||plan.decision||'',decision:plan.decision||plan.title||'',priority:plan.priority||'NORMAL',score:plan.score??'',phase:plan.phase||'NOW',route:'V6.23',status:'READY FOR EXECUTION',note:String(el('note')?.value||'').trim(),createdAt:new Date().toISOString(),lineage:'V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → V6.78 → V6.79 → V6.80 → V6.81 → V6.82 → V6.83 → V6.84 → V6.85 → V6.86 → V6.87 → V6.88 → V6.89 → V6.90 → V6.91'};
 history=[...history,rec].slice(-500);localStorage.setItem(KEY,JSON.stringify(history));if(el('note'))el('note').value='';render();
}
function render(){
 const sel=el('artifact');sel.innerHTML=artifacts.length?artifacts.map(x=>`<option value="${esc(x)}" ${x===selected?'selected':''}>${esc(x)}</option>`).join(''):'<option value="">No V6.90 orchestration yet</option>';
 const plan=currentPlan(selected);const tasks=executionTasks(selected);const hs=handoffs(selected).slice().sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
 const ready=isReady(plan,selected);
 el('status').innerHTML=plan?(ready?'<strong>🚂 HANDOFF READY</strong><br>The current V6.90 NOW decision has passed its orchestration readiness gate and can be handed to V6.23 execution.':'<strong>⏳ HANDOFF NOT READY</strong><br>The current V6.90 decision is blocked, completed, not the NOW item, or already has a READY FOR EXECUTION handoff.'):'<strong>AWAITING V6.90</strong><br>Complete V6.90 orchestration before creating a V6.91 execution handoff.';
 el('plan').innerHTML=plan?`<div class="item ${ready?'good':'warn'}"><span class="tag">${esc(plan.phase||'—')} • ${esc(plan.status||'—')}</span><h3>${esc(plan.decision||plan.title||'Unnamed decision')}</h3><p class="hint"><b>Priority:</b> ${esc(plan.priority||'—')} • <b>Score:</b> ${esc(plan.score??'—')}<br><b>Dependency:</b> ${esc(plan.dependencyTitle||'None')}<br><b>Route:</b> V6.23</p></div>`:'<p class="hint">No V6.90 orchestration record is available for this artifact.</p>';
 el('gate').innerHTML=`<div class="item ${plan?.phase==='NOW'?'good':'warn'}"><b>${plan?.phase==='NOW'?'✅':'⚠️'} NOW-phase check</b><p class="hint">${plan?.phase==='NOW'?'The decision is the current execution candidate.':'Only the current NOW decision may be handed off.'}</p></div><div class="item ${dependencyReady(plan,selected)?'good':'warn'}"><b>${dependencyReady(plan,selected)?'✅':'⚠️'} Dependency check</b><p class="hint">${dependencyReady(plan,selected)?'Required predecessor is complete or no dependency is recorded.':'A prerequisite must be completed in V6.90 first.'}</p></div><div class="item ${!hs.some(x=>x.sourcePlanId===plan?.id&&x.status==='READY FOR EXECUTION')?'good':'warn'}"><b>${!hs.some(x=>x.sourcePlanId===plan?.id&&x.status==='READY FOR EXECUTION')?'✅':'⚠️'} Duplicate handoff check</b><p class="hint">${!hs.some(x=>x.sourcePlanId===plan?.id&&x.status==='READY FOR EXECUTION')?'No active READY FOR EXECUTION handoff exists for this plan.':'A READY FOR EXECUTION handoff already exists.'}</p></div>`;
 el('handoffBtn').disabled=!ready;el('handoffBtn').onclick=save;
 el('execution').innerHTML=`<div class="item"><b>V6.23 execution records: ${tasks.length}</b><p class="hint">V6.91 hands the decision to the V6.23 execution layer; it does not execute the work itself.</p></div>`;
 el('history').innerHTML=hs.map(x=>`<div class="item"><span class="tag">${esc(x.status)} • ${esc(x.phase||'—')}</span><h3>${esc(x.decision||x.title)}</h3><p class="hint"><b>Priority:</b> ${esc(x.priority||'—')} • <b>Route:</b> ${esc(x.route)}<br><b>Note:</b> ${esc(x.note||'None')}<br>${new Date(x.createdAt||0).toLocaleString()}</p></div>`).join('')||'<p class="hint">No V6.91 handoff history yet.</p>';
 el('trace').innerHTML=[['V6.90 Decision Outcome Orchestration',byArtifact(orchestration,selected).length],['V6.23 Execution Records',tasks.length],['V6.91 Handoff Records',hs.length]].map(([label,n])=>`<div class="item ${n?'good':'warn'}"><b>${n?'✅':'⚠️'} ${esc(label)}</b><p class="hint">${n} record(s).</p></div>`).join('')+`<p class="hint"><strong>Lineage:</strong> V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → V6.78 → V6.79 → V6.80 → V6.81 → V6.82 → V6.83 → V6.84 → V6.85 → V6.86 → V6.87 → V6.88 → V6.89 → V6.90 → V6.91</p>`;
 el('integrity').innerHTML='<p class="hint">V6.91 is deterministic, local-first, and researcher-controlled. It verifies process readiness from V6.90 orchestration records and creates a documented handoff to V6.23. It does not execute the research, establish scientific truth, causation, external validity, publication, peer review, acceptance, or real-world impact. V6.92 will monitor execution intelligence.</p>';
}
document.addEventListener('DOMContentLoaded',()=>{el('artifact')?.addEventListener('change',e=>{selected=e.target.value;render()});render()});
