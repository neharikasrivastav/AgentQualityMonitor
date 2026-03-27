// ─── BUILD FLAG ROW HTML ──────────────────────────────────
function buildFlagRow(f) {
  const st = state.flagStatuses[f.id];
  const hidden = f.conf >= state.threshold && st === 'open';
  const confColor = f.conf < 65 ? 'var(--red)' : f.conf < 80 ? 'var(--amber)' : 'var(--green)';
  const confBg    = f.conf < 65 ? 'var(--red-dim)' : f.conf < 80 ? 'var(--amber-dim)' : 'var(--green-dim)';
  const stLabel   = st === 'resolved'  ? '<span style="font-size:9px;color:var(--green)">✓ resolved</span>'
                  : st === 'escalated' ? '<span style="font-size:9px;color:var(--red)">↑ escalated</span>'
                  : `<span style="font-size:9px;color:var(--muted)">${f.disposition}</span>`;
  return {
    visible: st === 'open' && !hidden,
    html: `<div class="flag-row ${st !== 'open' ? 'resolved' : ''} ${hidden ? 'hidden-flag' : ''}" id="flag-row-${f.id}" onclick="openFlag('${f.id}')">
      <div class="flag-left">
        <div class="flag-q">${f.query}</div>
        <div class="flag-meta"><span>${f.agent}</span><span>·</span><span>${f.user}</span><span>·</span><span>${f.time}</span></div>
      </div>
      <div class="flag-right">
        <span class="conf-pill" style="background:${confBg};color:${confColor}">${f.conf}% conf</span>
        ${stLabel}
      </div>
    </div>`
  };
}

// ─── RENDER FLAGS ─────────────────────────────────────────
function renderFlags() {
  let open = 0, allHTML = '';
  flagData.forEach(f => {
    const { visible, html } = buildFlagRow(f);
    if (visible) open++;
    allHTML += html;
  });

  const emptyState = `<div class="no-flags"><div class="no-flags-icon">✓</div><div style="font-weight:600;color:var(--green);margin-bottom:4px;">All flags resolved</div><div>No open queries require review at this time.</div></div>`;

  const fl = document.getElementById('flag-list');
  if (fl) fl.innerHTML = open === 0 ? emptyState : allHTML;

  const full = document.getElementById('flag-list-full');
  if (full) full.innerHTML = allHTML; // always show all in Flags view

  document.getElementById('open-flag-ct').textContent = `${open} open`;
  const fvCt = document.getElementById('flags-view-ct');
  if (fvCt) fvCt.textContent = `${open} open`;
  document.getElementById('stat-flags').textContent = open;
  document.getElementById('sb-open').textContent = open;

  updateThresholdCounts();
  renderEscalations();
}

// ─── THRESHOLD COUNTS ─────────────────────────────────────
function updateThresholdCounts() {
  const thresh = state.threshold;
  let suppressed = 0, flagged = 0, ok = 0;
  flagData.forEach(f => {
    if (state.flagStatuses[f.id] !== 'open') return;
    if (f.conf >= thresh) ok++;
    else if (f.conf >= 60) flagged++;
    else suppressed++;
  });
  document.getElementById('tc-suppressed').textContent = `${suppressed} suppressed`;
  document.getElementById('tc-flagged').textContent = `${flagged} flagged`;
  document.getElementById('tc-ok').textContent = `${ok} ok`;
  const flaggedPct = (suppressed + flagged) / flagData.length;
  const estimated = Math.round(DAILY_QUERIES * flaggedPct);
  document.getElementById('threshold-impact').textContent =
    `At ${thresh}% threshold, ~${estimated} queries/day would be flagged or suppressed`;
}

// ─── FLAG DETAIL PANEL ────────────────────────────────────
function openFlag(id) {
  const f = flagData.find(x => x.id === id);
  state.openFlagId = id;
  const st = state.flagStatuses[id];
  const confColor = f.conf < 65 ? 'var(--red)' : f.conf < 80 ? 'var(--amber)' : 'var(--green)';

  const actionHtml = st === 'resolved'
    ? `<div class="resolved-badge">✓ Resolved — correction queued for retraining</div>`
    : st === 'escalated'
    ? `<div class="escalated-badge">↑ Escalated to data team</div>`
    : `<div class="dp-actions">
        <button class="btn btn-green btn-sm" onclick="resolveFlag('${id}');showToast('✓','Flag resolved','Correction queued for retraining.')">✓ Mark resolved</button>
        <button class="btn btn-red btn-sm" onclick="escalateFlag('${id}');showToast('↑','Escalated','Routed to data team with full context.')">↑ Escalate</button>
        <button class="btn btn-sm" onclick="dismissFlag('${id}');showToast('↩','Dismissed','Flag removed from queue.')">Dismiss</button>
      </div>`;

  document.getElementById('dp-body').innerHTML = `
    <div class="dp-section">
      <div class="dp-section-label">Query</div>
      <div class="dp-query">${f.query}</div>
    </div>
    <div class="dp-section">
      <div class="dp-section-label">Metadata</div>
      <div class="dp-row"><span class="dp-key">Agent</span><span class="dp-val">${f.agent}</span></div>
      <div class="dp-row"><span class="dp-key">Requested by</span><span class="dp-val">${f.user}</span></div>
      <div class="dp-row"><span class="dp-key">Time</span><span class="dp-val">${f.time}</span></div>
      <div class="dp-row"><span class="dp-key">Disposition</span><span class="dp-val" style="color:${confColor}">${f.disposition}</span></div>
    </div>
    <div class="dp-section">
      <div class="dp-section-label">Confidence Score</div>
      <div class="conf-gauge">
        <div class="gauge-track"><div class="gauge-fill" style="width:${f.conf}%;background:${confColor}"></div></div>
        <div class="gauge-labels"><span>0%</span><span style="color:${confColor};font-weight:600">${f.conf}%</span><span>100%</span></div>
      </div>
    </div>
    <div class="dp-section">
      <div class="dp-section-label">Root cause</div>
      <div style="font-size:12px;color:var(--muted2);line-height:1.6;padding:10px 12px;background:var(--s2);border-radius:7px;border-left:3px solid ${confColor}">${f.reason}</div>
    </div>
    <div class="dp-section">
      <div class="dp-section-label">Suggested fix</div>
      <div style="font-size:12px;color:var(--text);line-height:1.6;padding:10px 12px;background:var(--s2);border-radius:7px;border-left:3px solid var(--cyan)">${f.suggestion}</div>
    </div>
    <div class="dp-section">${actionHtml}</div>`;

  document.getElementById('detail-panel').classList.add('open');
  document.getElementById('detail-overlay').classList.add('open');
  document.querySelectorAll('.flag-row').forEach(r => r.classList.remove('selected'));
  const row = document.getElementById('flag-row-' + id);
  if (row) row.classList.add('selected');
}

// ─── FLAG ACTIONS ─────────────────────────────────────────
function resolveFlag(id) {
  state.flagStatuses[id] = 'resolved';
  state.resolvedCount++;
  document.getElementById('sb-resolved-ct').textContent = state.resolvedCount;
  renderFlags();
  updateEscStats(-1);
  if (state.openFlagId === id) openFlag(id);
}

function escalateFlag(id) {
  state.flagStatuses[id] = 'escalated';
  renderFlags();
  if (state.openFlagId === id) openFlag(id);
}

function dismissFlag(id) {
  state.flagStatuses[id] = 'resolved';
  state.resolvedCount++;
  document.getElementById('sb-resolved-ct').textContent = state.resolvedCount;
  renderFlags();
  closeDetail();
}

function updateEscStats(delta) {
  const cur = parseInt(document.getElementById('stat-esc').textContent);
  document.getElementById('stat-esc').textContent = Math.max(0, cur + delta);
}

// ─── CLOSE ALL PANELS ─────────────────────────────────────
function closeDetail() {
  document.getElementById('detail-panel').classList.remove('open');
  document.getElementById('detail-overlay').classList.remove('open');
  document.querySelectorAll('.flag-row').forEach(r => r.classList.remove('selected'));
  state.openFlagId = null;
  if (state.agentChart) { state.agentChart.destroy(); state.agentChart = null; }
  document.getElementById('agent-panel').classList.remove('open');
  state.openAgentId = null;
}
