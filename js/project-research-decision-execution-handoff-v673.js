const arr=v=>Array.isArray(v)?v:[];
const read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const esc=v=>String(v??'').replace(/[&<>\"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[x]));
const el=id=>document.getElementById(id);
const ORCH='geiProjectResearchDecisionOutcomeOrchestrationV672';
const EXEC='geiProjectResearchExecutionV623';
const KEY='geiProjectResearchDecisionExecutionHandoffV673';
const orchestration=arr(read(ORCH));
const execution=arr(read(EXEC));
let records=arr(read(KEY));
const ids=[...new Set(orchestration.map(x=>x.artifactId).filter(Boolean))];
let selected=ids[0]||'';

function rows(id){return orchestration.filter(x=>x.artifactId===id)}
function completed(rowsList,id){return rowsList.some(x=>x.id===id&&String(x.status||'').toUpperCase()==='COMPLETED')}
function current(id){
 const rs=rows(id).filter(x=>['NOW','NEXT','LATER'].includes(String(x.phase||'').toUpperCase()));
 return rs.find(x=>String(x.phase||'').toUpperCase()==='NOW' && String(x.status||'').toUpperCase()!=='COMPLETED')
   || rs.find(x=>String(x.phase||'').toUpperCase()==='NOW')
   || null;
}
function readiness(item,id){
 if(!item)return{ready:false,reason:'No V6.72 orchestration decision is available for this artifact.'};
 const rs=rows(id);
 const dependencyReady=!item.dependencyId||completed(rs,item.dependencyId);
 const duplicate=records.some(x=>x.artifactId===id&&x.orchestrationId===item.id&&x.status==='READY FOR EXECUTION');
 if(duplicate)return{ready:false,reason:'A V6.73 execution handoff already exists for this orchestration item.'};
 if(!dependencyReady)return{ready:false,reason:'The prerequisite V6.72 orchestration step must be marked COMPLETED before this decision can be handed off.'};
 if(String(item.phase||'').toUpperCase()!=='NOW')return{ready:false,reason:'Only the current NOW orchestration decision can be handed off to execution.'};
 return{ready:true,reason:'The V6.72 NOW decision has no unresolved prerequisite and is ready for controlled execution handoff.'};
}
function save(item){
 const gate=readiness(item,selected); if(!gate.ready)return;
 const note=String(el('note').value||'').trim();
 const rec={
  id:crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,
  artifactId:selected,orchestrationId:item.id,decisionId:item.decisionId||item.sourceDecisionId||'',title:item.title,
  priority:item.priority,score:item.score,phase:item.phase,route:'V6.23',status:'READY FOR EXECUTION',note,
  sourceOrchestrationId:item.id,sourceDecisionId:item.sourceDecisionId||item.decisionId||'',
  dependencyId:item.dependencyId||null,dependencyTitle:item.dependencyTitle||null,
  createdAt:new Date().toISOString(),
  lineage:'V6.69 → V6.70 → V6.71 → V6.72 → V6.73'
 };
 records=[...records,rec].slice(-500);localStorage.setItem(KEY,JSON.stringify(records));el('note').value='';render();
}
function render(){
 const sel=el('artifact');
 sel.innerHTML=ids.length?ids.map(x=>`<option value="${esc(x)}" ${x===selected?'selected':''}>${esc(x)}</option>`).join(''):'<option value="">No V6.72 orchestration yet</option>';
 const item=current(selected); const gate=readiness(item,selected);
 const hist=records.filter(x=>!selected||x.artifactId===selected).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
 el('status').innerHTML=ids.length?'<strong>HANDOFF ENGINE READY</strong><br>V6.73 evaluates the V6.72 orchestration state and prepares only the current NOW decision for execution.':'<strong>AWAITING ORCHESTRATION</strong><br>Complete V6.71 → V6.72 before creating a V6.73 handoff.';
 el('readiness').innerHTML=`<div class="item ${gate.ready?'good':'warn'}"><b>${gate.ready?'🟢 READY FOR EXECUTION HANDOFF':'🟡 HANDOFF NOT READY'}</b><p class="hint">${esc(gate.reason)}</p>${item?`<p><b>Current decision:</b> ${esc(item.title)}<br><b>Phase:</b> ${esc(item.phase)} · <b>Priority:</b> ${esc(item.priority)} · <b>Score:</b> ${esc(item.score)}<br><b>Route:</b> V6.23</p>`:''}</div>`;
 el('current').innerHTML=hist[0]?`<div class="item good"><b>Latest V6.73 handoff:</b> ${esc(hist[0].title)}<p class="hint">READY FOR EXECUTION · ${new Date(hist[0].createdAt||0).toLocaleString()}</p></div>`:'<p class="hint">No V6.73 execution handoff has been recorded yet.</p>';
 el('create').disabled=!gate.ready; el('create').onclick=()=>save(item);
 const sourceCount=rows(selected).length; const execCount=execution.filter(x=>x.artifactId===selected).length;
 el('trace').innerHTML=[['V6.72 Orchestration Records',sourceCount],['V6.23 Execution Records',execCount],['V6.73 Handoff Records',hist.length]].map(([label,n])=>`<div class="item ${n?'good':'warn'}"><b>${n?'✅':'⚠️'} ${label}</b><p class="hint">${n} record(s).</p></div>`).join('')+`<p class="hint"><strong>Lineage:</strong> V6.69 → V6.70 → V6.71 → V6.72 → V6.73</p>`;
 el('history').innerHTML=hist.map(x=>`<div class="item"><span class="tag">READY FOR EXECUTION · ${esc(x.phase)}</span><h3>${esc(x.title)}</h3><p class="hint">Priority: ${esc(x.priority)} · Score: ${esc(x.score)}<br>Route: V6.23<br>Dependency: ${esc(x.dependencyTitle||'None') }<br><b>Note:</b> ${esc(x.note||'None')}<br>${new Date(x.createdAt||0).toLocaleString()}</p></div>`).join('')||'<p class="hint">No V6.73 handoff history yet.</p>';
 el('integrity').innerHTML='<p class="hint">V6.73 is deterministic, local-first, and researcher-controlled. It checks the V6.72 orchestration phase, prerequisite completion, and duplicate-handoff prevention before recording a handoff to V6.23. A handoff record documents readiness; it does not prove that execution occurred or establish scientific truth, causation, external validity, publication, peer review, acceptance, or real-world impact. Execution intelligence is handled downstream.</p>';
}
document.addEventListener('DOMContentLoaded',()=>{el('artifact')?.addEventListener('change',e=>{selected=e.target.value;render()});render()});