const arr=v=>Array.isArray(v)?v:[];
const read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const esc=v=>String(v??'').replace(/[&<>\"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[x]));
const el=id=>document.getElementById(id);
const ORCH='geiProjectResearchDecisionOutcomeOrchestrationV684';
const EXEC='geiProjectResearchExecutionV623';
const KEY='geiProjectResearchDecisionExecutionHandoffV685';
const orchestration=arr(read(ORCH));
const execution=arr(read(EXEC));
let records=arr(read(KEY));
const ids=[...new Set(orchestration.map(x=>x.artifactId).filter(Boolean))];
let selected=ids[0]||'';
function by(a,id){return a.filter(x=>x.artifactId===id)}
function latest(a){return a.slice().sort((x,y)=>new Date(y.updatedAt||y.createdAt||0)-new Date(x.updatedAt||x.createdAt||0))[0]}
function plan(id){return by(orchestration,id).slice().sort((a,b)=>({NOW:0,NEXT:1,LATER:2}[a.phase]??9)-({NOW:0,NEXT:1,LATER:2}[b.phase]??9)||Number(b.score||0)-Number(a.score||0))}
function current(id){return plan(id).find(x=>x.phase==='NOW'&&x.status!=='COMPLETED')||plan(id).find(x=>x.status!=='COMPLETED')}
function ready(item,id){
 if(!item)return {ok:false,reason:'No incomplete V6.84 orchestration item is available.'};
 if(item.status==='COMPLETED')return {ok:false,reason:'The current orchestration item is already completed.'};
 if(item.phase!=='NOW')return {ok:false,reason:'This decision is not the current NOW phase.'};
 if(item.dependencyId){const dep=by(orchestration,id).find(x=>x.id===item.dependencyId);if(!dep||dep.status!=='COMPLETED')return {ok:false,reason:`Dependency not completed: ${item.dependencyTitle||'Required prior decision'}.`}}
 if(records.some(x=>x.orchestrationId===item.id&&x.status==='READY FOR EXECUTION'))return {ok:false,reason:'A READY FOR EXECUTION handoff already exists for this orchestration item.'};
 return {ok:true,reason:'The current V6.84 decision is ready to hand off to V6.23 execution.'};
}
function save(item,note){
 const gate=ready(item,selected);if(!gate.ok){alert(gate.reason);return}
 const rec={id:crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,artifactId:selected,orchestrationId:item.id,decisionId:item.decisionId,title:item.decision||item.title,priority:item.priority,score:item.score,phase:item.phase,route:'V6.23',status:'READY FOR EXECUTION',note:String(note||'').trim(),sourceOrchestrationId:item.id,sourceDecisionId:item.sourceDecisionId||item.decisionId,dependencyId:item.dependencyId||null,dependencyTitle:item.dependencyTitle||null,createdAt:new Date().toISOString(),lineage:'V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → V6.78 → V6.79 → V6.80 → V6.81 → V6.82 → V6.83 → V6.84 → V6.85'};
 records=[...records,rec].slice(-500);localStorage.setItem(KEY,JSON.stringify(records));if(el('note'))el('note').value='';render();
}
function render(){
 const sel=el('artifact');sel.innerHTML=ids.length?ids.map(x=>`<option value="${esc(x)}" ${x===selected?'selected':''}>${esc(x)}</option>`).join(''):'<option value="">No V6.84 orchestration yet</option>';
 const item=current(selected),gate=ready(item,selected),hist=by(records,selected).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
 el('status').innerHTML=item?`<strong>${gate.ok?'HANDOFF READY':'HANDOFF BLOCKED'}</strong><br>${esc(gate.reason)}`:'<strong>AWAITING ORCHESTRATION</strong><br>Complete V6.84 orchestration setup before creating an execution handoff.';
 el('current').innerHTML=item?`<div class="item ${gate.ok?'good':'blocked'}"><span class="tag">${esc(item.phase)} • ${esc(item.status)} • ${esc(item.priority)} • ${esc(item.score)}</span><h3>${esc(item.decision||item.title)}</h3><p class="hint"><b>Route:</b> V6.23<br><b>Dependency:</b> ${esc(item.dependencyTitle||'None')}<br><b>Readiness:</b> ${esc(gate.reason)}</p></div>`:'<p class="hint">No current V6.84 orchestration item is available.</p>';
 el('button').disabled=!gate.ok;
 el('history').innerHTML=hist.map(x=>`<div class="item"><span class="tag">${esc(x.status)} • ${esc(x.phase)}</span><h3>${esc(x.title)}</h3><p class="hint">Route: ${esc(x.route)}<br>Priority: ${esc(x.priority)} • Score: ${esc(x.score)}<br>Dependency: ${esc(x.dependencyTitle||'None')}<br>Note: ${esc(x.note||'None')}<br>${new Date(x.createdAt||0).toLocaleString()}</p></div>`).join('')||'<p class="hint">No V6.85 handoff history yet.</p>';
 el('trace').innerHTML=[['V6.84 Orchestration',by(orchestration,selected).length],['V6.23 Execution Records',by(execution,selected).length],['V6.85 Handoff Records',hist.length]].map(([label,n])=>`<div class="item ${n?'good':'warn'}"><b>${n?'✅':'⚠️'} ${esc(label)}</b><p class="hint">${n} record(s).</p></div>`).join('')+`<p class="hint"><strong>Lineage:</strong> V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → V6.78 → V6.79 → V6.80 → V6.81 → V6.82 → V6.83 → V6.84 → V6.85</p>`;
 el('integrity').innerHTML='<p class="hint">V6.85 is deterministic, local-first, and researcher-controlled. It checks the V6.84 orchestration state and creates a documented handoff record to V6.23 when the current decision is ready. It does not execute the decision or independently verify execution, scientific truth, causation, external validity, publication, peer review, acceptance, or real-world impact.</p>';
}
document.addEventListener('DOMContentLoaded',()=>{el('artifact')?.addEventListener('change',e=>{selected=e.target.value;render()});el('button')?.addEventListener('click',()=>save(current(selected),el('note')?.value));render()});
