const arr=v=>Array.isArray(v)?v:[];
const read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const esc=v=>String(v??'').replace(/[&<>\"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[x]));
const el=id=>document.getElementById(id);
const HANDOFF='geiProjectResearchDecisionExecutionHandoffV685';
const INTEL='geiProjectResearchDecisionExecutionIntelligenceV686';
const EXEC='geiProjectResearchExecutionV623';
const KEY='geiProjectResearchDecisionExecutionOutcomeV687';
const handoffs=arr(read(HANDOFF)), intelligence=arr(read(INTEL)), execution=arr(read(EXEC));
let records=arr(read(KEY));
const ids=[...new Set(handoffs.map(x=>x.artifactId).filter(Boolean))];
let selected=ids[0]||'';
const OUTCOMES=['SUCCESSFUL','PARTIAL','NO MEASURABLE OUTCOME','FAILED','INCONCLUSIVE'];
function by(a,id){return a.filter(x=>x.artifactId===id)}
function latest(a){return a.slice().sort((x,y)=>new Date(y.createdAt||y.updatedAt||0)-new Date(x.createdAt||x.updatedAt||0))[0]}
function taskStatus(x){return String(x.status||'').toUpperCase().replaceAll('_',' ')}
function tasks(id){return by(execution,id).filter(x=>x.taskId||x.id)}
function snapshot(id){
 const h=latest(by(handoffs,id)), i=latest(by(intelligence,id)), ts=tasks(id);
 const counts=ts.reduce((a,x)=>{const s=taskStatus(x);a[s]=(a[s]||0)+1;return a},{});
 const total=ts.length,done=counts.COMPLETE||0,active=(counts.ACTIVE||0)+(counts['IN PROGRESS']||0),blocked=counts.BLOCKED||0;
 const ready=!!h&&String(h.status||'').toUpperCase()==='READY FOR EXECUTION'&&(total>0?done===total:false);
 return {h,i,total,done,active,blocked,ready,progress:total?Math.round(done/total*100):0};
}
function save(a){
 const outcome=String(el('outcome')?.value||'').trim(),observation=String(el('observation')?.value||'').trim();
 if(!outcome){alert('Select an execution outcome first.');return}
 if(!observation){alert('Add an observation before recording the outcome.');return}
 const rec={id:crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,artifactId:selected,sourceHandoffId:a.h?.id||'',sourceIntelligenceId:a.i?.id||'',decisionId:a.h?.decisionId||'',orchestrationId:a.h?.orchestrationId||'',title:a.h?.title||'Decision execution',outcome,observation,supportingEvidence:String(el('evidence')?.value||'').trim(),recommendedNextAction:String(el('nextAction')?.value||'').trim(),progress:a.progress,totalTasks:a.total,completedTasks:a.done,activeTasks:a.active,blockedTasks:a.blocked,executionState:a.i?.state||'',executionSignal:a.i?.signal||'',createdAt:new Date().toISOString(),lineage:'V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → V6.78 → V6.79 → V6.80 → V6.81 → V6.82 → V6.83 → V6.84 → V6.85 → V6.86 → V6.87'};
 records=[...records,rec].slice(-500);localStorage.setItem(KEY,JSON.stringify(records));render();
}
function render(){
 const sel=el('artifact');sel.innerHTML=ids.length?ids.map(x=>`<option value="${esc(x)}" ${x===selected?'selected':''}>${esc(x)}</option>`).join(''):'<option value="">No V6.85 handoff yet</option>';
 const a=snapshot(selected),hist=records.filter(x=>!selected||x.artifactId===selected).sort((x,y)=>new Date(y.createdAt||0)-new Date(x.createdAt||0));
 const tone=a.blocked?'blocked':a.ready?'good':'warn';
 el('status').innerHTML=ids.length?'<strong>OUTCOME ENGINE READY</strong><br>V6.87 can document the researcher-recorded outcome of the selected V6.85 decision execution.':'<strong>AWAITING HANDOFF</strong><br>Create a V6.85 execution handoff before V6.87 can document a decision-execution outcome.';
 el('current').innerHTML=a.h?`<div class="item ${tone}"><span class="tag">${esc(a.i?.state||'UNKNOWN')} • ${a.progress}%</span><h3>${esc(a.h.title)}</h3><p class="hint"><b>Handoff:</b> ${esc(a.h.status)}<br><b>Tasks:</b> ${a.done} / ${a.total} complete<br><b>Active:</b> ${a.active} • <b>Blocked:</b> ${a.blocked}<br><b>Outcome readiness:</b> ${a.ready?'READY':'NOT READY'}</p></div>`:'<p class="hint">No current V6.85 handoff found.</p>';
 el('form').innerHTML=`<label for="outcome"><b>Execution Outcome</b></label><select id="outcome"><option value="">Select outcome…</option>${OUTCOMES.map(x=>`<option>${x}</option>`).join('')}</select><label for="observation"><b>Observation *</b></label><textarea id="observation" placeholder="What happened when the decision was executed?"></textarea><label for="evidence"><b>Supporting Evidence / Artifact</b></label><textarea id="evidence" placeholder="Optional researcher-provided evidence or artifact reference…"></textarea><label for="nextAction"><b>Recommended Next Action</b></label><textarea id="nextAction" placeholder="Optional recommended next action…"></textarea><button id="record" class="btn">🎯 RECORD DECISION EXECUTION OUTCOME</button>`;
 el('record').onclick=()=>save(a);
 el('history').innerHTML=hist.map(x=>`<div class="item"><span class="tag">${esc(x.outcome)} • ${esc(x.progress)}%</span><h3>${esc(x.title)}</h3><p class="hint"><b>Observation:</b> ${esc(x.observation)}<br><b>Evidence:</b> ${esc(x.supportingEvidence||'None')}<br><b>Next Action:</b> ${esc(x.recommendedNextAction||'None')}<br>Tasks: ${x.completedTasks}/${x.totalTasks} complete • Active: ${x.activeTasks} • Blocked: ${x.blockedTasks}<br>${new Date(x.createdAt||0).toLocaleString()}</p></div>`).join('')||'<p class="hint">No V6.87 outcome history yet.</p>';
 el('trace').innerHTML=[['V6.85 Decision Execution Handoff',by(handoffs,selected).length],['V6.86 Execution Intelligence',by(intelligence,selected).length],['V6.23 Execution Records',a.total],['V6.87 Outcome Records',hist.length]].map(([label,n])=>`<div class="item ${n?'good':'warn'}"><b>${n?'✅':'⚠️'} ${esc(label)}</b><p class="hint">${n} record(s).</p></div>`).join('')+`<p class="hint"><strong>Lineage:</strong> V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → V6.78 → V6.79 → V6.80 → V6.81 → V6.82 → V6.83 → V6.84 → V6.85 → V6.86 → V6.87</p>`;
 el('integrity').innerHTML='<p class="hint">V6.87 is deterministic, local-first, and researcher-controlled. It documents a researcher-stated outcome and observation for completed decision execution. Supporting evidence is researcher-provided and not independently verified. This engine does not establish scientific truth, causation, external validity, publication, peer review, acceptance, or real-world impact. V6.88 will interpret the recorded outcome.</p>';
}
document.addEventListener('DOMContentLoaded',()=>{el('artifact')?.addEventListener('change',e=>{selected=e.target.value;render()});render()});
