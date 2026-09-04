const arr=v=>Array.isArray(v)?v:[];
const read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const esc=v=>String(v??'').replace(/[&<>\"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[x]));
const el=id=>document.getElementById(id);
const OUTCOME='geiProjectResearchDecisionExecutionOutcomeV681';
const KEY='geiProjectResearchDecisionOutcomeIntelligenceV682';
const outcomes=arr(read(OUTCOME));
let records=arr(read(KEY));
const ids=[...new Set(outcomes.map(x=>x.artifactId).filter(Boolean))];
let selected=ids[0]||'';
const MAP={
 'SUCCESSFUL':{interpretation:'DECISION EXECUTION EFFECTIVE',strength:'STRONG',direction:'ADVANCE TO VERIFICATION',route:'V6.24',priority:'NORMAL'},
 'PARTIAL':{interpretation:'DECISION EXECUTION PARTIALLY EFFECTIVE',strength:'MODERATE',direction:'IDENTIFY THE REMAINING GAP AND REFINE',route:'V6.32',priority:'HIGH'},
 'NO MEASURABLE OUTCOME':{interpretation:'DECISION EFFECT UNCLEAR',strength:'WEAK',direction:'REASSESS THE DECISION OR MEASUREMENT',route:'V6.31',priority:'HIGH'},
 'FAILED':{interpretation:'DECISION EXECUTION INEFFECTIVE',strength:'CRITICAL',direction:'CORRECT AND RE-PLAN THE DECISION',route:'V6.31',priority:'CRITICAL'},
 'INCONCLUSIVE':{interpretation:'DECISION EXECUTION RESULT UNCERTAIN',strength:'MODERATE',direction:'GATHER MORE EVIDENCE',route:'V6.31',priority:'HIGH'}
};
function by(id){return outcomes.filter(x=>x.artifactId===id)}
function latest(a){return a.slice().sort((x,y)=>new Date(y.createdAt||y.updatedAt||0)-new Date(x.createdAt||x.updatedAt||0))[0]}
function interpret(o){return o?MAP[o.outcome]||{interpretation:'UNCLASSIFIED OUTCOME',strength:'UNSPECIFIED',direction:'REVIEW THE RECORDED OUTCOME',route:'V6.31',priority:'NORMAL'}:null}
function save(o,i){
 if(!o||!i){alert('Record a V6.81 decision-execution outcome before interpreting it.');return;}
 const note=String(el('note')?.value||'').trim();
 const rec={id:crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,artifactId:selected,sourceOutcomeId:o.id,title:o.title||'Decision outcome intelligence',outcome:o.outcome,interpretation:i.interpretation,strength:i.strength,direction:i.direction,route:i.route,priority:i.priority,researcherNote:note,observation:o.observation||'',createdAt:new Date().toISOString(),lineage:'V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → V6.78 → V6.79 → V6.80 → V6.81 → V6.82'};
 records=[...records,rec].slice(-500);localStorage.setItem(KEY,JSON.stringify(records));if(el('note'))el('note').value='';render();
}
function render(){
 const sel=el('artifact');sel.innerHTML=ids.length?ids.map(x=>`<option value="${esc(x)}" ${x===selected?'selected':''}>${esc(x)}</option>`).join(''):'<option value="">No V6.81 outcome yet</option>';
 const o=latest(by(selected));const i=interpret(o);const hist=records.filter(x=>!selected||x.artifactId===selected).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
 el('status').innerHTML=o?'<strong>INTELLIGENCE ENGINE READY</strong><br>V6.82 can interpret the latest documented V6.81 decision-execution outcome.':'<strong>AWAITING OUTCOME</strong><br>Record a V6.81 decision-execution outcome before V6.82 can interpret it.';
 el('current').innerHTML=o&&i?`<div class="item good"><span class="tag">${esc(o.outcome)}</span><h3>${esc(o.title)}</h3><p class="hint"><b>Observation:</b> ${esc(o.observation)}<br><b>Interpretation:</b> ${esc(i.interpretation)}<br><b>Strength:</b> ${esc(i.strength)} • <b>Priority:</b> ${esc(i.priority)}<br><b>Direction:</b> ${esc(i.direction)} • <b>Route:</b> ${esc(i.route)}</p></div>`:'<p class="hint">No V6.81 outcome is available for the selected artifact.</p>';
 el('intelligence').innerHTML=i?`<div class="item good"><h3>${esc(i.interpretation)}</h3><p class="hint"><b>Strength:</b> ${esc(i.strength)}<br><b>Recommended direction:</b> ${esc(i.direction)}<br><b>Suggested route:</b> ${esc(i.route)}<br><b>Priority:</b> ${esc(i.priority)}</p></div><textarea id="note" placeholder="Optional researcher note about what this outcome means for the research process…"></textarea><button id="record" class="btn">🧠 RECORD OUTCOME INTELLIGENCE</button>`:'<p class="hint">Outcome intelligence will appear here after a V6.81 outcome is recorded.</p>';
 if(el('record'))el('record').onclick=()=>save(o,i);
 el('history').innerHTML=hist.map(x=>`<div class="item"><span class="tag">${esc(x.interpretation)} • ${esc(x.strength)}</span><h3>${esc(x.title)}</h3><p class="hint"><b>Outcome:</b> ${esc(x.outcome)}<br><b>Direction:</b> ${esc(x.direction)}<br><b>Route:</b> ${esc(x.route)} • <b>Priority:</b> ${esc(x.priority)}<br><b>Note:</b> ${esc(x.researcherNote||'None')}<br>${new Date(x.createdAt||0).toLocaleString()}</p></div>`).join('')||'<p class="hint">No V6.82 intelligence history yet.</p>';
 el('trace').innerHTML=[['V6.81 Decision Execution Outcomes',by(selected).length],['V6.82 Intelligence Records',hist.length]].map(([label,n])=>`<div class="item ${n?'good':'warn'}"><b>${n?'✅':'⚠️'} ${esc(label)}</b><p class="hint">${n} record(s).</p></div>`).join('')+`<p class="hint"><strong>Lineage:</strong> V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → V6.78 → V6.79 → V6.80 → V6.81 → V6.82</p>`;
 el('integrity').innerHTML='<p class="hint">V6.82 is deterministic, local-first, and researcher-controlled. It converts the fixed V6.81 outcome classification into structured process intelligence and a suggested research direction. It does not establish scientific truth, causation, external validity, publication, peer review, acceptance, or real-world impact. V6.83 will use this intelligence to support the next decision.</p>';
}
document.addEventListener('DOMContentLoaded',()=>{el('artifact')?.addEventListener('change',e=>{selected=e.target.value;render()});render()});
