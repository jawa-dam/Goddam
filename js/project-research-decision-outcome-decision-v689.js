const arr=v=>Array.isArray(v)?v:[];
const read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const esc=v=>String(v??'').replace(/[&<>\"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[x]));
const el=id=>document.getElementById(id);
const INTEL='geiProjectResearchDecisionOutcomeIntelligenceV688';
const OUTCOME='geiProjectResearchDecisionExecutionOutcomeV687';
const KEY='geiProjectResearchDecisionOutcomeDecisionV689';
const intelligence=arr(read(INTEL));
const outcomes=arr(read(OUTCOME));
let records=arr(read(KEY));
const ids=[...new Set(intelligence.map(x=>x.artifactId).filter(Boolean))];
let selected=ids[0]||'';
const MAP={
 'DECISION EXECUTION EFFECTIVE':[
  {decision:'ADVANCE TO VERIFICATION',priority:'NORMAL',score:90,route:'V6.24'},
  {decision:'PRESERVE DECISION EXECUTION OUTCOME RECORD',priority:'NORMAL',score:72,route:'V6.24'}
 ],
 'DECISION EXECUTION PARTIALLY EFFECTIVE':[
  {decision:'REFINE AND RE-EXECUTE THE DECISION',priority:'HIGH',score:96,route:'V6.32'},
  {decision:'IDENTIFY THE REMAINING DECISION GAP',priority:'HIGH',score:84,route:'V6.31'}
 ],
 'DECISION EFFECT UNCLEAR':[
  {decision:'REASSESS THE DECISION BASIS OR MEASUREMENT',priority:'HIGH',score:97,route:'V6.31'},
  {decision:'GATHER BETTER OBSERVATION EVIDENCE',priority:'HIGH',score:81,route:'V6.31'}
 ],
 'DECISION EXECUTION INEFFECTIVE':[
  {decision:'CORRECT AND RE-PLAN THE DECISION',priority:'CRITICAL',score:100,route:'V6.31'},
  {decision:'PRESERVE FAILURE EVIDENCE',priority:'HIGH',score:86,route:'V6.31'}
 ],
 'DECISION EXECUTION RESULT UNCERTAIN':[
  {decision:'GATHER MORE EVIDENCE',priority:'HIGH',score:98,route:'V6.31'},
  {decision:'DEFINE THE UNCERTAINTY TO BE RESOLVED',priority:'HIGH',score:83,route:'V6.31'}
 ]
};
const order={CRITICAL:0,HIGH:1,NORMAL:2,LOW:3};
function by(a,id){return a.filter(x=>x.artifactId===id)}
function latest(a){return a.slice().sort((x,y)=>new Date(y.createdAt||y.updatedAt||0)-new Date(x.createdAt||x.updatedAt||0))[0]}
function candidates(id){const i=latest(by(intelligence,id));if(!i)return [];return (MAP[i.meaning]||[]).map(x=>({...x,artifactId:id,sourceIntelligenceId:i.id,sourceOutcomeId:i.sourceOutcomeId||'',meaning:i.meaning,strength:i.strength})).sort((a,b)=>(order[a.priority]??9)-(order[b.priority]??9)||b.score-a.score)}
function save(d){
 if(!d){alert('Select a ranked decision first.');return;}
 const note=String(el('note')?.value||'').trim();
 const rec={id:crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,artifactId:selected,sourceIntelligenceId:d.sourceIntelligenceId,sourceOutcomeId:d.sourceOutcomeId,decision:d.decision,priority:d.priority,score:d.score,route:d.route,status:'SELECTED',note,meaning:d.meaning,strength:d.strength,createdAt:new Date().toISOString(),lineage:'V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → V6.78 → V6.79 → V6.80 → V6.81 → V6.82 → V6.83 → V6.84 → V6.85 → V6.86 → V6.87 → V6.88 → V6.89'};
 records=[...records,rec].slice(-500);localStorage.setItem(KEY,JSON.stringify(records));if(el('note'))el('note').value='';render();
}
function render(){
 const sel=el('artifact');sel.innerHTML=ids.length?ids.map(x=>`<option value="${esc(x)}" ${x===selected?'selected':''}>${esc(x)}</option>`).join(''):'<option value="">No V6.88 intelligence yet</option>';
 const list=candidates(selected),hist=records.filter(x=>!selected||x.artifactId===selected).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
 const i=latest(by(intelligence,selected));
 el('status').innerHTML=i?'<strong>DECISION ENGINE READY</strong><br>V6.88 intelligence is available and V6.89 can rank the next research decisions.':'<strong>AWAITING INTELLIGENCE</strong><br>Record V6.88 outcome intelligence before V6.89 can generate the next decision.';
 el('current').innerHTML=i?`<div class="item good"><span class="tag">${esc(i.priority)} • ${esc(i.strength)}</span><h3>${esc(i.meaning)}</h3><p class="hint"><b>Outcome:</b> ${esc(i.outcome)}<br><b>Direction:</b> ${esc(i.direction)}<br><b>Route:</b> ${esc(i.route)}</p></div>`:'<p class="hint">No current V6.88 intelligence is available.</p>';
 el('decisions').innerHTML=list.map((d,n)=>`<div class="item"><span class="tag">#${n+1} • ${esc(d.priority)} • Score ${esc(d.score)}</span><h3>${esc(d.decision)}</h3><p class="hint">Route: <b>${esc(d.route)}</b></p><button class="btn choose" data-i="${n}">🎯 SELECT THIS DECISION</button></div>`).join('')||'<p class="hint">No ranked decisions available.</p>';
 document.querySelectorAll('.choose').forEach(b=>b.onclick=()=>save(list[Number(b.dataset.i)]));
 el('history').innerHTML=hist.map(x=>`<div class="item"><span class="tag">${esc(x.status)} • ${esc(x.priority)} • ${esc(x.score)}</span><h3>${esc(x.decision)}</h3><p class="hint"><b>Intelligence:</b> ${esc(x.meaning||'—')}<br>Route: ${esc(x.route)}<br><b>Note:</b> ${esc(x.note||'None')}<br>${new Date(x.createdAt||0).toLocaleString()}</p></div>`).join('')||'<p class="hint">No V6.89 decision history yet.</p>';
 el('trace').innerHTML=[['V6.88 Decision Outcome Intelligence',by(intelligence,selected).length],['V6.87 Decision Execution Outcomes',by(outcomes,selected).length],['V6.89 Decision Records',hist.length]].map(([label,n])=>`<div class="item ${n?'good':'warn'}"><b>${n?'✅':'⚠️'} ${esc(label)}</b><p class="hint">${n} record(s).</p></div>`).join('')+`<p class="hint"><strong>Lineage:</strong> V6.69 → V6.70 → V6.71 → V6.72 → V6.73 → V6.23 → V6.74 → V6.75 → V6.76 → V6.77 → V6.78 → V6.79 → V6.80 → V6.81 → V6.82 → V6.83 → V6.84 → V6.85 → V6.86 → V6.87 → V6.88 → V6.89</p>`;
 el('integrity').innerHTML='<p class="hint">V6.89 is deterministic, local-first, and researcher-controlled. It converts the fixed V6.88 outcome-intelligence classification into ranked process decisions. It does not establish scientific truth, causation, external validity, publication, peer review, acceptance, or real-world impact. V6.90 will orchestrate selected decisions.</p>';
}
document.addEventListener('DOMContentLoaded',()=>{el('artifact')?.addEventListener('change',e=>{selected=e.target.value;render()});render()});
