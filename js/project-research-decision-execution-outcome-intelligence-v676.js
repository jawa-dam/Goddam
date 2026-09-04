const arr=v=>Array.isArray(v)?v:[];
const read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const esc=v=>String(v??'').replace(/[&<>\"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[x]));
const el=id=>document.getElementById(id);
const OUTCOME='geiProjectResearchDecisionExecutionOutcomeV675';
const KEY='geiProjectResearchDecisionExecutionOutcomeIntelligenceV676';
const outcomes=arr(read(OUTCOME));
let records=arr(read(KEY));
const ids=[...new Set(outcomes.map(x=>x.artifactId).filter(Boolean))];
let selected=ids[0]||'';
const MAP={
 SUCCESSFUL:{meaning:'DECISION EXECUTION EFFECTIVE',strength:'STRONG',recommendation:'ADVANCE TO VERIFICATION',route:'V6.24',priority:'NORMAL'},
 PARTIAL:{meaning:'DECISION EXECUTION PARTIALLY EFFECTIVE',strength:'MODERATE',recommendation:'IDENTIFY THE REMAINING GAP AND REFINE',route:'V6.32',priority:'HIGH'},
 'NO MEASURABLE OUTCOME':{meaning:'DECISION EFFECT UNCLEAR',strength:'WEAK',recommendation:'REASSESS THE DECISION OR MEASUREMENT',route:'V6.31',priority:'HIGH'},
 FAILED:{meaning:'DECISION EXECUTION INEFFECTIVE',strength:'CRITICAL',recommendation:'CORRECT AND RE-PLAN THE DECISION',route:'V6.31',priority:'CRITICAL'},
 INCONCLUSIVE:{meaning:'DECISION EXECUTION RESULT UNCERTAIN',strength:'MODERATE',recommendation:'GATHER MORE EVIDENCE',route:'V6.31',priority:'HIGH'}
};
function by(a,id){return a.filter(x=>x.artifactId===id)}
function latest(a){return a.slice().sort((x,y)=>new Date(y.createdAt||0)-new Date(x.createdAt||0))[0]}
function interpret(id){const source=latest(by(outcomes,id));return source?{source,m:MAP[source.outcome]||null}:{} }
function save(a){
 if(!a.source||!a.m){alert('Record a valid V6.75 execution outcome before creating V6.76 intelligence.');return;}
 const note=String(el('note')?.value||'').trim();
 const rec={id:crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,artifactId:selected,sourceOutcomeId:a.source.id,outcome:a.source.outcome,meaning:a.m.meaning,strength:a.m.strength,recommendation:a.m.recommendation,route:a.m.route,priority:a.m.priority,note,createdAt:new Date().toISOString(),lineage:'V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76'};
 records=[...records,rec].slice(-500);localStorage.setItem(KEY,JSON.stringify(records));el('note').value='';render();
}
function render(){
 const sel=el('artifact');sel.innerHTML=ids.length?ids.map(x=>`<option value="${esc(x)}" ${x===selected?'selected':''}>${esc(x)}</option>`).join(''):'<option value="">No V6.75 outcome yet</option>';
 const a=interpret(selected),hist=records.filter(x=>!selected||x.artifactId===selected).sort((x,y)=>new Date(y.createdAt||0)-new Date(x.createdAt||0));
 el('status').innerHTML=a.source?'<strong>OUTCOME INTELLIGENCE READY</strong><br>V6.76 has a documented V6.75 execution outcome to interpret.':'<strong>AWAITING OUTCOME</strong><br>Record a V6.75 decision-execution outcome before V6.76 can interpret it.';
 el('current').innerHTML=a.source&&a.m?`<div class="item good"><span class="tag">${esc(a.m.strength)} • ${esc(a.m.priority)}</span><h3>${esc(a.m.meaning)}</h3><p class="hint"><b>Outcome:</b> ${esc(a.source.outcome)}<br><b>Observation:</b> ${esc(a.source.observation)}<br><b>Recommended response:</b> ${esc(a.m.recommendation)}<br><b>Route:</b> ${esc(a.m.route)}</p></div>`:'<p class="hint">No current V6.75 outcome is available for this artifact.</p>';
 el('record').disabled=!a.source||!a.m;
 el('signals').innerHTML=a.source&&a.m?`<div class="item"><h3>${esc(a.m.recommendation)}</h3><p class="hint">V6.76 classifies the documented outcome as <b>${esc(a.m.meaning)}</b> with <b>${esc(a.m.strength)}</b> interpretive strength and routes the next research-process step to <b>${esc(a.m.route)}</b>.</p></div>`:'<p class="hint">V6.76 will generate an intelligence signal after V6.75 records an outcome.</p>';
 el('history').innerHTML=hist.map(x=>`<div class="item"><span class="tag">${esc(x.meaning)}</span><h3>${esc(x.outcome)}</h3><p class="hint"><b>Recommendation:</b> ${esc(x.recommendation)}<br><b>Route:</b> ${esc(x.route)} • <b>Priority:</b> ${esc(x.priority)}<br><b>Note:</b> ${esc(x.note||'None')}<br>${new Date(x.createdAt||0).toLocaleString()}</p></div>`).join('')||'<p class="hint">No V6.76 intelligence history yet.</p>';
 el('trace').innerHTML=[['V6.75 Execution Outcomes',by(outcomes,selected).length],['V6.76 Intelligence Records',hist.length]].map(([label,n])=>`<div class="item ${n?'good':'warn'}"><b>${n?'✅':'⚠️'} ${esc(label)}</b><p class="hint">${n} record(s).</p></div>`).join('')+`<p class="hint"><strong>Lineage:</strong> V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76</p>`;
 el('integrity').innerHTML='<p class="hint">V6.76 is deterministic, local-first, and researcher-controlled. It interprets the researcher-stated V6.75 outcome using a fixed outcome-to-intelligence mapping. It does not independently verify evidence, establish scientific truth, causation, external validity, publication, peer review, acceptance, or real-world impact. V6.77 will turn this intelligence into the next decision.</p>';
}
document.addEventListener('DOMContentLoaded',()=>{el('artifact')?.addEventListener('change',e=>{selected=e.target.value;render()});el('record')?.addEventListener('click',()=>save(interpret(selected)));render()});