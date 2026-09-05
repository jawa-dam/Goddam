const arr=v=>Array.isArray(v)?v:[];
const read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const esc=v=>String(v??'').replace(/[&<>\"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[x]));
const el=id=>document.getElementById(id);
const OUTCOME='geiProjectResearchDecisionExecutionOutcomeV687';
const KEY='geiProjectResearchDecisionOutcomeIntelligenceV688';
const outcomes=arr(read(OUTCOME));
let records=arr(read(KEY));
const ids=[...new Set(outcomes.map(x=>x.artifactId).filter(Boolean))];
let selected=ids[0]||'';
const MAP={
 'SUCCESSFUL':{meaning:'DECISION EXECUTION EFFECTIVE',strength:'STRONG',direction:'ADVANCE TO VERIFICATION',route:'V6.24',priority:'NORMAL'},
 'PARTIAL':{meaning:'DECISION EXECUTION PARTIALLY EFFECTIVE',strength:'MODERATE',direction:'IDENTIFY THE REMAINING GAP AND REFINE',route:'V6.32',priority:'HIGH'},
 'NO MEASURABLE OUTCOME':{meaning:'DECISION EFFECT UNCLEAR',strength:'WEAK',direction:'REASSESS THE DECISION OR MEASUREMENT',route:'V6.31',priority:'HIGH'},
 'FAILED':{meaning:'DECISION EXECUTION INEFFECTIVE',strength:'CRITICAL',direction:'CORRECT AND RE-PLAN THE DECISION',route:'V6.31',priority:'CRITICAL'},
 'INCONCLUSIVE':{meaning:'DECISION EXECUTION RESULT UNCERTAIN',strength:'MODERATE',direction:'GATHER MORE EVIDENCE',route:'V6.31',priority:'HIGH'}
};
function by(a,id){return a.filter(x=>x.artifactId===id)}
function latest(a){return a.slice().sort((x,y)=>new Date(y.createdAt||y.updatedAt||0)-new Date(x.createdAt||x.updatedAt||0))[0]}
function save(a){
 const m=MAP[a.outcome];
 if(!m){alert('No interpretable V6.87 outcome is selected.');return}
 const note=String(el('note')?.value||'').trim();
 const rec={id:crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,artifactId:selected,sourceOutcomeId:a.id||'',decisionId:a.decisionId||'',title:a.title||'Decision outcome',outcome:a.outcome,meaning:m.meaning,strength:m.strength,direction:m.direction,route:m.route,priority:m.priority,researcherNote:note,sourceObservation:a.observation||'',supportingEvidence:a.supportingEvidence||'',createdAt:new Date().toISOString(),lineage:'V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → V6.78 → V6.79 → V6.80 → V6.81 → V6.82 → V6.83 → V6.84 → V6.85 → V6.86 → V6.87 → V6.88'};
 records=[...records,rec].slice(-500);localStorage.setItem(KEY,JSON.stringify(records));render();
}
function render(){
 const sel=el('artifact');sel.innerHTML=ids.length?ids.map(x=>`<option value="${esc(x)}" ${x===selected?'selected':''}>${esc(x)}</option>`).join(''):'<option value="">No V6.87 outcome yet</option>';
 const a=latest(by(outcomes,selected));
 const hist=records.filter(x=>!selected||x.artifactId===selected).sort((x,y)=>new Date(y.createdAt||0)-new Date(x.createdAt||0));
 const m=a?MAP[String(a.outcome||'').toUpperCase()]:null;
 el('status').innerHTML=a&&m?'<strong>INTELLIGENCE ENGINE READY</strong><br>V6.88 can interpret the selected V6.87 decision-execution outcome.':'<strong>AWAITING OUTCOME</strong><br>Record a V6.87 decision-execution outcome before V6.88 can interpret it.';
 el('current').innerHTML=a&&m?`<div class="item good"><span class="tag">${esc(a.outcome)} • ${esc(m.strength)}</span><h3>${esc(a.title)}</h3><p class="hint"><b>Outcome:</b> ${esc(a.outcome)}<br><b>Observation:</b> ${esc(a.observation)}<br><b>Decision:</b> ${esc(a.decisionId||'Not recorded')}<br><b>Interpretation:</b> ${esc(m.meaning)}<br><b>Recommended Direction:</b> ${esc(m.direction)}<br><b>Route:</b> ${esc(m.route)} • <b>Priority:</b> ${esc(m.priority)}</p></div>`:'<p class="hint">No interpretable V6.87 outcome found for the selected artifact.</p>';
 el('form').innerHTML=a&&m?`<label for="note"><b>Researcher Note</b></label><textarea id="note" placeholder="Optional: explain why this interpretation matters to your research process…"></textarea><button id="record" class="btn">🧠 RECORD OUTCOME INTELLIGENCE</button>`:'<p class="hint">V6.88 becomes recordable after a V6.87 outcome exists.</p>';
 if(el('record'))el('record').onclick=()=>save(a);
 el('history').innerHTML=hist.map(x=>`<div class="item"><span class="tag">${esc(x.meaning)} • ${esc(x.strength)}</span><h3>${esc(x.title)}</h3><p class="hint"><b>Outcome:</b> ${esc(x.outcome)}<br><b>Direction:</b> ${esc(x.direction)}<br><b>Route:</b> ${esc(x.route)} • <b>Priority:</b> ${esc(x.priority)}<br><b>Note:</b> ${esc(x.researcherNote||'None')}<br>${new Date(x.createdAt||0).toLocaleString()}</p></div>`).join('')||'<p class="hint">No V6.88 intelligence history yet.</p>';
 el('trace').innerHTML=[['V6.87 Decision Execution Outcomes',by(outcomes,selected).length],['V6.88 Intelligence Records',hist.length]].map(([label,n])=>`<div class="item ${n?'good':'warn'}"><b>${n?'✅':'⚠️'} ${esc(label)}</b><p class="hint">${n} record(s).</p></div>`).join('')+`<p class="hint"><strong>Lineage:</strong> V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → V6.78 → V6.79 → V6.80 → V6.81 → V6.82 → V6.83 → V6.84 → V6.85 → V6.86 → V6.87 → V6.88</p>`;
 el('integrity').innerHTML='<p class="hint">V6.88 is deterministic, local-first, and researcher-controlled. It interprets a researcher-recorded V6.87 decision-execution outcome and does not independently verify the outcome or evidence. This engine does not establish scientific truth, causation, external validity, publication, peer review, acceptance, or real-world impact. V6.89 will use the interpreted outcome intelligence to present the next decision layer.</p>';
}
document.addEventListener('DOMContentLoaded',()=>{el('artifact')?.addEventListener('change',e=>{selected=e.target.value;render()});render()});
