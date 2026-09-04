const arr=v=>Array.isArray(v)?v:[];
const read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const esc=v=>String(v??'').replace(/[&<>\"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[x]));
const el=id=>document.getElementById(id);
const HANDOFF='geiProjectResearchDecisionExecutionHandoffV673';
const INTEL='geiProjectResearchDecisionExecutionIntelligenceV674';
const EXEC='geiProjectResearchExecutionV623';
const KEY='geiProjectResearchDecisionExecutionOutcomeV675';
const handoffs=arr(read(HANDOFF));
const intelligence=arr(read(INTEL));
const execution=arr(read(EXEC));
let records=arr(read(KEY));
const ids=[...new Set(handoffs.map(x=>x.artifactId).filter(Boolean))];
let selected=ids[0]||'';
const outcomes=['SUCCESSFUL','PARTIAL','NO MEASURABLE OUTCOME','FAILED','INCONCLUSIVE'];
function by(a,id){return a.filter(x=>x.artifactId===id)}
function latest(a){return a.slice().sort((x,y)=>new Date(y.createdAt||y.updatedAt||0)-new Date(x.createdAt||x.updatedAt||0))[0]}
function taskStatus(x){return String(x.status||'').toUpperCase().replaceAll('_',' ')}
function tasks(id){return by(execution,id).filter(x=>x.taskId||x.id)}
function analyze(id){
 const hs=by(handoffs,id), h=latest(hs), ts=tasks(id);
 const counts=ts.reduce((a,x)=>{const s=taskStatus(x);a[s]=(a[s]||0)+1;return a},{});
 const total=ts.length, done=counts.COMPLETE||0, active=(counts.ACTIVE||0)+(counts['IN PROGRESS']||0), blocked=counts.BLOCKED||0;
 const intel=latest(by(intelligence,id));
 const handoffReady=!!h&&String(h.status||'').toUpperCase()==='READY FOR EXECUTION';
 const executionComplete=total===0||done===total;
 const ready=handoffReady&&executionComplete;
 return {h,intel,ts,counts,total,done,active,blocked,handoffReady,executionComplete,ready,progress:total?Math.round(done/total*100):0};
}
function save(a){
 const outcome=String(el('outcome')?.value||'').trim();
 const observation=String(el('observation')?.value||'').trim();
 if(!outcome||!observation){alert('Select an outcome and enter the required observation.');return;}
 if(!a.ready){alert('V6.75 is not ready. A V6.73 handoff must be READY FOR EXECUTION and all documented V6.23 tasks must be COMPLETE.');return;}
 const rec={
  id:crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,
  artifactId:selected,
  sourceHandoffId:a.h?.id||'',
  sourceIntelligenceId:a.intel?.id||'',
  decisionId:a.h?.decisionId||'',
  orchestrationId:a.h?.orchestrationId||'',
  title:a.h?.title||'Decision execution outcome',
  outcome,
  observation,
  supportingEvidence:String(el('evidence')?.value||'').trim(),
  recommendedNextAction:String(el('nextAction')?.value||'').trim(),
  progress:a.progress,
  totalTasks:a.total,
  completedTasks:a.done,
  activeTasks:a.active,
  blockedTasks:a.blocked,
  executionState:a.intel?.state||'COMPLETED',
  executionSignal:a.intel?.signal||'DECISION EXECUTION COMPLETE',
  createdAt:new Date().toISOString(),
  lineage:'V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75'
 };
 records=[...records,rec].slice(-500);
 localStorage.setItem(KEY,JSON.stringify(records));
 ['observation','evidence','nextAction'].forEach(id=>{if(el(id))el(id).value=''});
 render();
}
function render(){
 const sel=el('artifact');
 sel.innerHTML=ids.length?ids.map(x=>`<option value="${esc(x)}" ${x===selected?'selected':''}>${esc(x)}</option>`).join(''):'<option value="">No V6.73 handoff yet</option>';
 const item=analyze(selected);
 const hist=records.filter(x=>!selected||x.artifactId===selected).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
 const tone=!item.ready?'blocked':'good';
 el('status').innerHTML=item.ready?'<strong>OUTCOME ENGINE READY</strong><br>Execution is documented as complete and V6.75 can record the researcher-stated outcome.':'<strong>OUTCOME GATE ACTIVE</strong><br>V6.75 waits for a READY FOR EXECUTION V6.73 handoff and completion of all documented V6.23 execution tasks.';
 el('current').innerHTML=item.h?`<div class="item ${tone}"><span class="tag">${item.ready?'READY FOR OUTCOME':'NOT READY'} • ${item.progress}%</span><h3>${esc(item.h.title)}</h3><p class="hint"><b>Handoff:</b> ${esc(item.h.status)}<br><b>Tasks:</b> ${item.done} / ${item.total} complete<br><b>Active:</b> ${item.active} • <b>Blocked:</b> ${item.blocked}<br><b>Execution state:</b> ${esc(item.intel?.state||'—')}<br><b>Signal:</b> ${esc(item.intel?.signal||'—')}</p></div>`:'<p class="hint">No current V6.73 handoff found.</p>';
 el('form').innerHTML=`<label><b>Execution Outcome</b></label><select id="outcome"><option value="">Choose outcome…</option>${outcomes.map(x=>`<option>${x}</option>`).join('')}</select><label><b>Required Observation</b></label><textarea id="observation" placeholder="What did you observe as the result of executing this decision?"></textarea><label><b>Supporting Evidence / Artifact</b> <span class="hint">(optional)</span></label><textarea id="evidence" placeholder="Describe or identify supporting evidence or an artifact…"></textarea><label><b>Recommended Next Action</b> <span class="hint">(optional)</span></label><textarea id="nextAction" placeholder="What should happen next, if anything?"></textarea><button id="record" class="btn" ${item.ready?'':'disabled'}>🎯 RECORD DECISION EXECUTION OUTCOME</button>`;
 el('record').onclick=()=>save(item);
 el('history').innerHTML=hist.map(x=>`<div class="item"><span class="tag">${esc(x.outcome)}</span><h3>${esc(x.title)}</h3><p class="hint"><b>Observation:</b> ${esc(x.observation)}<br><b>Evidence:</b> ${esc(x.supportingEvidence||'None')}<br><b>Next action:</b> ${esc(x.recommendedNextAction||'None')}<br>Tasks: ${x.completedTasks}/${x.totalTasks} complete • ${new Date(x.createdAt||0).toLocaleString()}</p></div>`).join('')||'<p class="hint">No V6.75 outcome history yet.</p>';
 el('trace').innerHTML=[['V6.73 Execution Handoff',by(handoffs,selected).length],['V6.74 Execution Intelligence',by(intelligence,selected).length],['V6.23 Execution Records',item.total],['Completed Tasks',item.done],['V6.75 Outcome Records',hist.length]].map(([label,n])=>`<div class="item ${n?'good':'warn'}"><b>${n?'✅':'⚠️'} ${esc(label)}</b><p class="hint">${n} record(s).</p></div>`).join('')+`<p class="hint"><strong>Lineage:</strong> V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75</p>`;
 el('integrity').innerHTML='<p class="hint">V6.75 is deterministic, local-first, and researcher-controlled. It documents the researcher-stated outcome of a completed decision execution using local V6.73, V6.74, and V6.23 records. Evidence is researcher-provided and not independently verified. This engine does not establish scientific truth, causation, external validity, publication, peer review, acceptance, or real-world impact. V6.76 will interpret the recorded outcome.</p>';
}
document.addEventListener('DOMContentLoaded',()=>{el('artifact')?.addEventListener('change',e=>{selected=e.target.value;render()});render()});