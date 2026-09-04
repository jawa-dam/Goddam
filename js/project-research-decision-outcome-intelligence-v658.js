const arr=v=>Array.isArray(v)?v:[];
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const esc=v=>String(v??'').replace(/[&<>\"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[x]));
const el=id=>document.getElementById(id);
const OUT='geiProjectResearchDecisionExecutionOutcomeV657',KEY='geiProjectResearchDecisionOutcomeIntelligenceV658';
const outcomes=arr(read(OUT,[]));let records=arr(read(KEY,[]));
const ids=[...new Set(outcomes.map(x=>x.artifactId).filter(Boolean))];let selected=ids[0];
const MAP={
  SUCCESSFUL:{meaning:'DECISION EXECUTION EFFECTIVE',strength:'STRONG',recommendation:'ADVANCE TO VERIFICATION',route:'V6.24',priority:'NORMAL'},
  PARTIAL:{meaning:'DECISION EXECUTION PARTIALLY EFFECTIVE',strength:'MODERATE',recommendation:'IDENTIFY THE REMAINING GAP AND REFINE',route:'V6.32',priority:'HIGH'},
  'NO MEASURABLE OUTCOME':{meaning:'DECISION EFFECT UNCLEAR',strength:'WEAK',recommendation:'REASSESS THE DECISION OR MEASUREMENT',route:'V6.31',priority:'HIGH'},
  FAILED:{meaning:'DECISION EXECUTION INEFFECTIVE',strength:'CRITICAL',recommendation:'CORRECT AND RE-PLAN THE DECISION',route:'V6.31',priority:'CRITICAL'},
  INCONCLUSIVE:{meaning:'DECISION EXECUTION RESULT UNCERTAIN',strength:'MODERATE',recommendation:'GATHER MORE EVIDENCE',route:'V6.31',priority:'HIGH'}
};
function by(a,id){return a.filter(x=>x.artifactId===id)}
function latest(a){return a.slice().sort((x,y)=>new Date(y.createdAt||y.updatedAt||0)-new Date(x.createdAt||x.updatedAt||0))[0]}
function derive(id){const o=by(outcomes,id),r=by(records,id),outcome=latest(o),interpretation=MAP[String(outcome?.outcome||'').toUpperCase()]||null;const history=outcome?r.filter(x=>(x.sourceOutcomeId||x.outcomeId)===outcome.id):[];return{o,r,outcome,interpretation,history}}
function save(d){if(!d.outcome||!d.interpretation)return;const note=String(el('note').value||'').trim();const rec={id:crypto.randomUUID?.()||String(Date.now()),artifactId:selected,decisionId:d.outcome.decisionId,title:d.outcome.title,outcome:d.outcome.outcome,meaning:d.interpretation.meaning,strength:d.interpretation.strength,recommendation:d.interpretation.recommendation,route:d.interpretation.route,priority:d.interpretation.priority,note,sourceOutcomeId:d.outcome.id,createdAt:new Date().toISOString(),lineage:'V6.51 → V6.52 → V6.53 → V6.54 → V6.55 → V6.23 → V6.56 → V6.57 → V6.58'};records.push(rec);records=records.slice(-500);localStorage.setItem(KEY,JSON.stringify(records));render()}
function render(){
  el('status').textContent=ids.length?'🧠 Interpreting documented decision outcomes across '+ids.length+' artifact(s)':'No V6.57 decision execution outcomes found';
  el('selector').innerHTML=ids.length?'<select id="artifact">'+ids.map(x=>'<option value="'+esc(x)+'" '+(x===selected?'selected':'')+'>'+esc(x)+'</option>').join('')+'</select>':'<p class="hint">Record a V6.57 execution outcome first.</p>';
  const s=document.getElementById('artifact');if(s)s.onchange=()=>{selected=s.value;render()};
  if(!selected){el('stats').innerHTML='';el('current').innerHTML='';el('history').innerHTML='';el('trace').innerHTML='';return}
  const d=derive(selected),history=d.history;
  el('stats').innerHTML=[['Documented Outcome',d.outcome?.outcome||'NONE'],['Meaning',d.interpretation?.meaning||'NONE'],['Strength',d.interpretation?.strength||'NONE'],['Priority',d.interpretation?.priority||'NONE'],['Recommended Route',d.interpretation?.route||'NONE'],['Intelligence Records',history.length]].map(x=>'<div class="stat"><b>'+esc(x[1])+'</b>'+esc(x[0])+'</div>').join('');
  el('current').innerHTML='<div class="item '+(d.interpretation?.strength==='CRITICAL'?'blocked':'good')+'"><span class="tag">🧠 '+esc(d.interpretation?.meaning||'AWAITING OUTCOME')+'</span><h3>'+esc(d.outcome?.title||'No documented outcome')+'</h3><p><b>Outcome:</b> '+esc(d.outcome?.outcome||'—')+'<br><b>Interpretation strength:</b> '+esc(d.interpretation?.strength||'—')+'<br><b>Recommended next step:</b> '+esc(d.interpretation?.recommendation||'—')+'<br><b>Route:</b> '+esc(d.interpretation?.route||'—')+'<br><b>Priority:</b> '+esc(d.interpretation?.priority||'—')+'</p><p class="hint">'+esc(d.outcome?.observation||'No observation recorded.')+'</p><textarea id="note" placeholder="Optional intelligence note…"></textarea><button id="record" class="btn" '+(d.interpretation?'':'disabled')+'>🧠 RECORD OUTCOME INTELLIGENCE</button></div>';
  const b=el('record');if(b)b.onclick=()=>save(d);
  el('history').innerHTML=history.slice().reverse().map(x=>'<div class="item"><span class="tag">'+esc(x.meaning)+' • '+esc(x.strength)+'</span><b>'+esc(x.recommendation)+'</b><p class="hint">Route: '+esc(x.route)+' • Priority: '+esc(x.priority)+'<br>Note: '+esc(x.note||'None')+'<br>'+new Date(x.createdAt||0).toLocaleString()+'</p></div>').join('')||'<p class="hint">No V6.58 intelligence records yet.</p>';
  el('trace').innerHTML=[['V6.57 Execution Outcome',d.outcome?1:0],['Outcome Observation',d.outcome?.observation?1:0],['V6.58 Interpretation',d.interpretation?1:0],['V6.58 Intelligence History',history.length]].map(x=>'<div class="item '+(x[1]?'good':'warn')+'"><b>'+(x[1]?'✅':'⚠️')+' '+esc(x[0])+'</b><p class="hint">'+esc(x[1])+' relevant record(s).</p></div>').join('');
  el('integrity').innerHTML='<p class="hint">V6.58 is a deterministic, local, researcher-controlled interpretation layer. It translates a documented V6.57 outcome into a research-process meaning and recommended route. It does not establish scientific truth, causation, external validity, publication, peer review, acceptance, or real-world impact. V6.59 is the separate next-decision layer.</p>';
}
render();