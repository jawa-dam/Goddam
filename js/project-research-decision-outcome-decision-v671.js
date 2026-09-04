const INTEL = 'geiProjectResearchDecisionOutcomeIntelligenceV670';
const OUTCOME = 'geiProjectResearchDecisionExecutionOutcomeV669';
const KEY = 'geiProjectResearchDecisionOutcomeDecisionV671';

const arr = v => Array.isArray(v) ? v : [];
const read = (key, fallback = []) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const uid = () => (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);

const DECISIONS = {
  'DECISION EXECUTION EFFECTIVE': [
    { title:'ADVANCE TO VERIFICATION', priority:'NORMAL', score:90, route:'V6.24' },
    { title:'PRESERVE DECISION OUTCOME RECORD', priority:'NORMAL', score:70, route:'V6.24' }
  ],
  'DECISION EXECUTION PARTIALLY EFFECTIVE': [
    { title:'REFINE AND RE-EXECUTE THE DECISION', priority:'HIGH', score:96, route:'V6.32' },
    { title:'IDENTIFY REMAINING DECISION GAP', priority:'HIGH', score:84, route:'V6.31' }
  ],
  'DECISION EFFECT UNCLEAR': [
    { title:'REASSESS DECISION BASIS OR MEASUREMENT', priority:'HIGH', score:97, route:'V6.31' },
    { title:'GATHER BETTER OBSERVATION EVIDENCE', priority:'HIGH', score:81, route:'V6.31' }
  ],
  'DECISION EXECUTION INEFFECTIVE': [
    { title:'CORRECT AND RE-PLAN DECISION', priority:'CRITICAL', score:100, route:'V6.31' },
    { title:'PRESERVE FAILURE EVIDENCE', priority:'CRITICAL', score:86, route:'V6.31' }
  ],
  'DECISION EXECUTION RESULT UNCERTAIN': [
    { title:'GATHER MORE EVIDENCE', priority:'HIGH', score:98, route:'V6.31' },
    { title:'DEFINE UNCERTAINTY', priority:'HIGH', score:83, route:'V6.31' }
  ]
};

function latestOutcome(artifactId) {
  return arr(read(OUTCOME)).filter(x => !artifactId || x.artifactId === artifactId).sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null;
}

function buildDecisions(artifactId) {
  const outcome = latestOutcome(artifactId);
  const intel = arr(read(INTEL)).filter(x => !artifactId || x.artifactId === artifactId).sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null;
  if (!outcome || !intel) return [];
  const base = DECISIONS[intel.interpretation] || [];
  return base.map((d, i) => ({
    id: uid(),
    artifactId,
    sourceOutcomeId: outcome.id,
    sourceIntelligenceId: intel.id,
    decision: d.title,
    priority: d.priority,
    score: d.score,
    route: d.route,
    rank: i + 1,
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
    lineage: 'V6.60 → V6.61 → V6.23 → V6.62 → V6.63 → V6.64 → V6.65 → V6.66 → V6.67 → V6.68 → V6.69 → V6.70 → V6.71'
  }));
}

function render() {
  const outcomes = arr(read(OUTCOME));
  const ids = [...new Set(outcomes.map(x => x.artifactId).filter(Boolean))];
  const artifact = document.getElementById('artifact');
  if (artifact) {
    artifact.innerHTML = ids.length ? ids.map(id => `<option value="${String(id).replaceAll('"','&quot;')}">${id}</option>`).join('') : '<option value="">No V6.69 outcomes yet</option>';
  }
  const selected = artifact?.value || ids[0] || '';
  const decisions = buildDecisions(selected);
  const history = arr(read(KEY)).filter(x => !selected || x.artifactId === selected).sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  document.getElementById('status').innerHTML = selected && decisions.length
    ? '<strong>DECISION READY</strong><br>V6.70 intelligence is available and V6.71 has generated ranked next decisions.'
    : '<strong>AWAITING DECISION INPUT</strong><br>Complete V6.69 and V6.70 for an artifact before making a V6.71 decision.';

  document.getElementById('decisionList').innerHTML = decisions.length ? decisions.map((d,i) => `
    <div class="card">
      <div class="muted">RANK ${i+1} · ${d.priority} · SCORE ${d.score}</div>
      <h3>${d.decision}</h3>
      <div class="muted">Route: ${d.route}</div>
      <button class="primary choose" data-id="${d.id}">SELECT DECISION</button>
    </div>`).join('') : '<div class="card muted">No ranked decisions are available yet.</div>';

  document.getElementById('history').innerHTML = history.length ? history.map(x => `
    <div class="card"><strong>${x.decision}</strong><br><span class="muted">${x.priority} · ${x.score} · ${x.route} · ${new Date(x.createdAt).toLocaleString()}</span><br>${x.note || ''}</div>`).join('') : '<div class="card muted">No decisions recorded yet.</div>';

  document.querySelectorAll('.choose').forEach(btn => btn.onclick = () => {
    const d = decisions.find(x => x.id === btn.dataset.id);
    if (!d) return;
    document.getElementById('selectedDecision').textContent = d.decision;
    document.getElementById('note').value = '';
    document.getElementById('save').onclick = () => {
      const note = document.getElementById('note').value.trim();
      const records = arr(read(KEY));
      records.unshift({...d, status:'SELECTED', note, selectedAt:new Date().toISOString()});
      write(KEY, records.slice(0,500));
      render();
      document.getElementById('selectedDecision').textContent = 'Decision recorded successfully.';
    };
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const artifact = document.getElementById('artifact');
  artifact?.addEventListener('change', render);
  render();
});