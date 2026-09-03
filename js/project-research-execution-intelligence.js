const arr=v=>Array.isArray(v)?v:[];
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const esc=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const el=id=>document.getElementById(id);
const HANDOFF='geiProjectResearchActionExecutionHandoffV633',EXEC='geiProjectResearchExecutionV623',KEY='geiProjectResearchExecutionIntelligenceV634';
const handoffs=arr(read(HANDOFF,[])),plans=arr(read(EXEC,[]));
let records=arr(read(KEY,[]));
const ids=[...new Set([...handoffs,...plans].map(x=>x.artifactId).filter(Boolean))];
let selected=ids[0];
const STATUS=['NOT STARTED','IN PROGRESS','COMPLETED','STALLED','BLOCKED','NEEDS ANOTHER ATTEMPT'];
function latest(a){return a.slice().sort((x,y)=>new Date(y.createdAt||y.updatedAt||0)-new Date(x.createdAt||x.updatedAt||0))[0]}
function artifactHandoffs(id){return handoffs.filter(x=>x.artifactId===id)}
function planFor(id){return plans.find(x=>x.artifactId===id)}
function latestRecord(id,title){return records.filter(x=>x.artifactId===id&&x.title===title).at(-1)}
function derive(id){
  const hs=artifactHandoffs(id), p=planFor(id), tasks=arr(p?.tasks);
  const current=latest(hs), completed=tasks.filter(t=>t.status==='COMPLETE').length;
  const progress=tasks.length?Math.round(completed/tasks.length*100):0;
  let intelligence='WAITING', detail='No execution handoff has been recorded yet.';
  if(current){
    const prior=latestRecord(id,current.title);
    if(prior){intelligence=prior.status;detail=prior.note||'Researcher-recorded execution state.'}
    else intelligence=current.status==='READY FOR EXECUTION'?'READY TO START':'HANDOFF RECORDED';
    if(tasks.length&&completed===tasks.length){intelligence='COMPLETED';detail='All documented V6.23 execution tasks are complete.'}
    else if(tasks.some(t=>t.status==='BLOCKED')){intelligence='BLOCKED';detail='At least one documented execution task is blocked.'}
    else if(tasks.some(t=>t.status==='ACTIVE')){intelligence='IN PROGRESS';detail='A documented execution task is active.'}
  }
  return {hs,p,tasks,current,progress,completed,intelligence,detail}
}
function saveStatus(x,status,note){
  if(!x)return;
  const rec={id:crypto.randomUUID?.()||String(Date.now()),artifactId:selected,title:x.title,route:x.route,executionEngine:'V6.23',handoffEngine:'V6.33',status,note:String(note||'').trim(),progress:derive(selected).progress,createdAt:new Date().toISOString(),lineage:'V6.24 → V6.32 → V6.33 → V6.23 → V6.34'};
  records.push(rec);records=records.slice(-500);localStorage.setItem(KEY,JSON.stringify(records));render();
}
function render(){
  el('status').textContent=ids.length?'🧠 Tracking documented execution intelligence for '+ids.length+' artifact(s)':'No V6.33 handoff history found';
  el('selector').innerHTML=ids.length?'<select id="artifact">'+ids.map(x=>'<option value="'+esc(x)+'" '+(x===selected?'selected':'')+'>'+esc(x)+'</option>').join('')+'</select>':'<p class="hint">Prepare a V6.33 Action Execution Handoff first.</p>';
  const sel=document.getElementById('artifact');if(sel)sel.onchange=()=>{selected=sel.value;render()};if(!selected)return;
  const d=derive(selected), hs=d.hs;
  const latestByTitle=new Map();hs.forEach(x=>latestByTitle.set(x.title,x));
  const active=records.filter(x=>x.artifactId===selected).at(-1);
  el('stats').innerHTML=[['Execution Intelligence',d.intelligence],['Documented Progress',d.progress+'%'],['V6.23 Tasks',d.tasks.length],['Tasks Complete',d.completed],['V6.33 Handoffs',hs.length],['Intelligence Records',records.filter(x=>x.artifactId===selected).length]].map(x=>'<div class="stat"><b>'+esc(x[1])+'</b>'+esc(x[0])+'</div>').join('');
  el('current').innerHTML=d.current?'<div class="item '+(d.intelligence==='COMPLETED'?'good':d.intelligence==='BLOCKED'||d.intelligence==='STALLED'?'warn':'active')+'"><span class="tag">'+esc(d.current.phase||'NOW')+' • '+esc(d.current.priority||'ACTION')+'</span><h3>'+esc(d.current.title)+'</h3><p class="hint">'+esc(d.detail)+'</p><p><b>Route:</b> '+esc(d.current.route||'V6.23 Workflow Execution')+'</p><p><b>Current intelligence:</b> '+esc(d.intelligence)+'</p><label for="state"><b>Update execution state</b></label><select id="state">'+STATUS.map(s=>'<option '+(s===d.intelligence?'selected':'')+'>'+s+'</option>').join('')+'</select><textarea id="note" placeholder="Optional execution note…">'+esc(active?.note||'')+'</textarea><button id="record" class="btn">💾 RECORD EXECUTION INTELLIGENCE</button><a class="btn secondary" href="project-research-workflow-execution.html">OPEN V6.23 EXECUTION →</a></div>':'<p class="hint">No current V6.33 handoff is available.</p>';
  const rb=document.getElementById('record');if(rb)rb.onclick=()=>saveStatus(d.current,document.getElementById('state').value,document.getElementById('note').value);
  el('queue').innerHTML=[...latestByTitle.values()].map(x=>'<div class="item"><span class="tag">'+esc(x.status||'READY')+'</span><b>'+esc(x.title)+'</b><p class="hint">Handoff created '+new Date(x.createdAt||0).toLocaleString()+'</p></div>').join('')||'<p class="hint">No handoff queue available.</p>';
  const issues=[];if(d.tasks.some(t=>t.status==='BLOCKED'))issues.push('BLOCKED execution task detected');if(d.tasks.some(t=>t.status==='ACTIVE'))issues.push('ACTIVE execution task still in progress');if(d.intelligence==='STALLED')issues.push('Researcher marked the current action STALLED');if(d.intelligence==='NEEDS ANOTHER ATTEMPT')issues.push('Researcher marked the current action for another attempt');
  el('signals').innerHTML=issues.length?issues.map(x=>'<div class="item warn">⚠️ '+esc(x)+'</div>').join(''):'<div class="item good">✅ No documented execution blockage or stall signal detected.</div>';
  const next=d.intelligence==='COMPLETED'?'Proceed to verification when the documented execution is ready.':d.intelligence==='BLOCKED'?'Resolve the documented blocker, then update execution state.':d.intelligence==='STALLED'?'Review the stalled action and record whether it can resume or needs another attempt.':d.intelligence==='NEEDS ANOTHER ATTEMPT'?'Run the next researcher-controlled attempt, then record the outcome.':'Continue the documented execution task and update its state as work progresses.';
  el('next').innerHTML='<div class="item"><b>Recommended next interpretation</b><p class="hint">'+esc(next)+'</p><a class="btn" href="project-research-workflow-verification.html">OPEN V6.24 VERIFICATION →</a></div>';
  el('trace').innerHTML=[['V6.33 Action Execution Handoff',hs.length],['V6.23 Workflow Execution',d.tasks.length],['V6.34 Intelligence Records',records.filter(x=>x.artifactId===selected).length]].map(x=>'<div class="item '+(x[1]?'good':'warn')+'"><b>'+(x[1]?'✅':'⚠️')+' '+esc(x[0])+'</b><p class="hint">'+x[1]+' relevant record(s).</p></div>').join('');
  el('history').innerHTML=records.filter(x=>x.artifactId===selected).slice().reverse().map(x=>'<div class="item"><span class="tag">'+esc(x.status)+'</span><b>'+esc(x.title)+'</b><p class="hint">'+new Date(x.createdAt||0).toLocaleString()+' • '+esc(x.note||'No note')+'</p></div>').join('')||'<p class="hint">No V6.34 execution intelligence records yet.</p>';
}
render();