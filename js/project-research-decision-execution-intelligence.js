const arr=v=>Array.isArray(v)?v:[];
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const esc=v=>String(v??'').replace(/[&<>\"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[x]));
const el=id=>document.getElementById(id);
const HANDOFF='geiProjectResearchDecisionExecutionHandoffV643',EXEC='geiProjectResearchExecutionV623',KEY='geiProjectResearchDecisionExecutionIntelligenceV644';
const handoffs=arr(read(HANDOFF,[])),plans=arr(read(EXEC,[]));
let records=arr(read(KEY,[]));
const ids=[...new Set([...handoffs,...plans].map(x=>x.artifactId).filter(Boolean))];
let selected=ids[0];
const STATUS=['NOT STARTED','IN PROGRESS','COMPLETED','STALLED','BLOCKED','NEEDS ANOTHER ATTEMPT'];
function latest(a){return a.slice().sort((x,y)=>new Date(y.createdAt||y.updatedAt||0)-new Date(x.createdAt||x.updatedAt||0))[0]}
function hsFor(id){return handoffs.filter(x=>x.artifactId===id)}
function planFor(id){return latest(plans.filter(x=>x.artifactId===id))}
function recsFor(id){return records.filter(x=>x.artifactId===id)}
function derive(id){
 const hs=hsFor(id), p=planFor(id), tasks=arr(p?.tasks), h=latest(hs), r=latest(recsFor(id));
 const complete=tasks.filter(t=>t.status==='COMPLETE').length;
 const active=tasks.filter(t=>t.status==='ACTIVE').length;
 const blocked=tasks.filter(t=>t.status==='BLOCKED').length;
 const progress=tasks.length?Math.round(complete/tasks.length*100):0;
 let state=r?.status||'NOT STARTED', interpretation='The decision has not yet produced a documented execution-state record.';
 if(h){
   if(!r) state=h.status==='READY FOR EXECUTION'?'READY TO START':h.status||'HANDOFF RECORDED';
   interpretation=r?.note||'Researcher-recorded decision execution intelligence.';
   if(complete===tasks.length&&tasks.length) {state='COMPLETED';interpretation='All documented V6.23 execution tasks associated with the handed-off decision are complete.'}
   else if(blocked) {state='BLOCKED';interpretation='One or more documented V6.23 execution tasks are blocked.'}
   else if(active) {state='IN PROGRESS';interpretation='At least one documented V6.23 execution task is active.'}
 }
 return {hs,p,tasks,h,r,complete,active,blocked,progress,state,interpretation};
}
function save(d,status,note){if(!d.h)return;const rec={id:crypto.randomUUID?.()||String(Date.now()),artifactId:selected,decisionId:d.h.decisionId||d.h.id||'',title:d.h.title,status,note:String(note||'').trim(),handoffStatus:d.h.status,phase:d.h.phase||'NOW',priority:d.h.priority||'NORMAL',route:'V6.23',executionPlanExists:!!d.p,progress:d.progress,tasks:d.tasks.length,tasksComplete:d.complete,createdAt:new Date().toISOString(),lineage:'V6.41 → V6.42 → V6.43 → V6.23 → V6.44'};records.push(rec);records=records.slice(-500);localStorage.setItem(KEY,JSON.stringify(records));render()}
function render(){
 el('status').textContent=ids.length?'🧠 Tracking decision-centric execution intelligence across '+ids.length+' artifact(s)':'No V6.43 decision handoff history found';
 el('selector').innerHTML=ids.length?'<select id="artifact">'+ids.map(x=>'<option value="'+esc(x)+'" '+(x===selected?'selected':'')+'>'+esc(x)+'</option>').join('')+'</select>':'<p class="hint">Create a V6.43 Decision Execution Handoff first.</p>';
 const sel=document.getElementById('artifact');if(sel)sel.onchange=()=>{selected=sel.value;render()};if(!selected)return;
 const d=derive(selected), rr=recsFor(selected);
 el('stats').innerHTML=[['Decision Intelligence',d.state],['Execution Progress',d.progress+'%'],['V6.23 Tasks',d.tasks.length],['Tasks Complete',d.complete],['Decision Handoffs',d.hs.length],['Intelligence Records',rr.length]].map(x=>'<div class="stat"><b>'+esc(x[1])+'</b>'+esc(x[0])+'</div>').join('');
 el('current').innerHTML=d.h?'<div class="item '+(d.state==='COMPLETED'?'good':d.state==='BLOCKED'||d.state==='STALLED'?'warn':'active')+'"><span class="tag">'+esc(d.h.phase||'NOW')+' • '+esc(d.h.priority||'NORMAL')+'</span><h3>'+esc(d.h.title)+'</h3><p class="hint"><b>Decision-centric interpretation:</b> '+esc(d.interpretation)+'</p><p><b>Handoff:</b> '+esc(d.h.status)+' &nbsp; <b>Execution route:</b> V6.23</p><p><b>Documented progress:</b> '+d.progress+'% ('+d.complete+'/'+d.tasks.length+' tasks complete)</p><label for="state"><b>Record decision execution state</b></label><select id="state">'+STATUS.map(s=>'<option '+(s===d.state?'selected':'')+'>'+s+'</option>').join('')+'</select><textarea id="note" placeholder="What is happening with this handed-off decision? Optional note…">'+esc(d.r?.note||'')+'</textarea><button id="record" class="btn">💾 RECORD DECISION EXECUTION INTELLIGENCE</button></div>':'<p class="hint">No V6.43 decision handoff is available for this artifact.</p>';
 const rb=document.getElementById('record');if(rb)rb.onclick=()=>save(d,document.getElementById('state').value,document.getElementById('note').value);
 el('signals').innerHTML=[d.blocked?'<div class="item warn">⚠️ BLOCKED: at least one V6.23 task is blocked.</div>':'',d.active?'<div class="item now">🔄 IN PROGRESS: an execution task is active.</div>':'',(!d.p?'<div class="item warn">⚠️ No V6.23 execution plan is currently documented for this decision.</div>':''),(!d.blocked&&!d.active&&d.p?'<div class="item good">✅ No current blocked or active task signal detected.</div>':'')].join('');
 const next=d.state==='COMPLETED'?'Decision execution is documented as complete; review the result through V6.35 and verification through V6.24.':d.state==='BLOCKED'?'Resolve the documented execution blocker, then update the decision execution state.':d.state==='STALLED'?'Review why the decision is stalled and determine whether to resume or attempt another route.':d.state==='NEEDS ANOTHER ATTEMPT'?'Carry out the next researcher-controlled attempt, then record the new state or outcome.':'Continue the V6.23 execution workflow and update this decision-centric status as it changes.';
 el('next').innerHTML='<div class="item"><b>Recommended next interpretation</b><p class="hint">'+esc(next)+'</p><a class="btn" href="project-research-execution-outcome.html">OPEN V6.35 EXECUTION OUTCOME →</a><a class="btn secondary" href="project-research-workflow-execution.html">OPEN V6.23 EXECUTION →</a></div>';
 el('queue').innerHTML=d.hs.slice().reverse().map(x=>'<div class="item"><span class="tag">'+esc(x.status)+' • '+esc(x.phase||'NOW')+'</span><b>'+esc(x.title)+'</b><p class="hint">Priority: '+esc(x.priority||'NORMAL')+'<br>Route: V6.23<br>Created: '+new Date(x.createdAt||0).toLocaleString()+'</p></div>').join('')||'<p class="hint">No decision handoff queue available.</p>';
 el('trace').innerHTML=[['V6.41 Response Decision',1],['V6.42 Decision Orchestration',1],['V6.43 Decision Execution Handoff',d.hs.length],['V6.23 Workflow Execution',d.tasks.length],['V6.44 Intelligence Records',rr.length]].map(x=>'<div class="item '+(x[1]?'good':'warn')+'"><b>'+(x[1]?'✅':'⚠️')+' '+esc(x[0])+'</b><p class="hint">'+x[1]+' relevant record(s).</p></div>').join('');
 el('history').innerHTML=rr.slice().reverse().map(x=>'<div class="item"><span class="tag">'+esc(x.status)+' • '+esc(x.progress)+'%</span><b>'+esc(x.title)+'</b><p class="hint">'+new Date(x.createdAt||0).toLocaleString()+' • '+esc(x.note||'No note')+'</p></div>').join('')||'<p class="hint">No V6.44 decision execution intelligence records yet.</p>';
 el('integrity').innerHTML='<p class="hint">V6.44 is a local, researcher-controlled decision-centric intelligence layer. It interprets the documented handoff and V6.23 workflow state for the decision that was handed off. It does not replace V6.23 execution tracking, V6.34 action execution intelligence, V6.35 execution outcome recording, or V6.24 verification. It does not prove external execution, scientific truth, causation, publication, peer review, acceptance, or real-world impact.</p>';
}
render();
