// ─── LIVE TIMESTAMP ───────────────────────────────────────
setInterval(() => {
  state.refreshSeconds++;
  const el = document.getElementById('refresh-time');
  if (el) el.textContent = state.refreshSeconds;
}, 1000);

// ─── VIEW SWITCHING ───────────────────────────────────────
function switchView(viewName) {
  document.querySelectorAll('.pill').forEach(x => x.classList.remove('on'));
  const pill = document.querySelector(`.pill[data-view="${viewName}"]`);
  if (pill) pill.classList.add('on');
  document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + viewName).classList.add('active');
  closeDetail();
  if (viewName === 'agents') renderAgentCards();
  if (viewName === 'escalations') renderEscalations();
}

// ─── NAV PILLS ────────────────────────────────────────────
document.querySelectorAll('.pill[data-view]').forEach(p => {
  p.addEventListener('click', function () { switchView(this.dataset.view); });
});

// ─── SIDEBAR FILTERS ──────────────────────────────────────
document.querySelectorAll('.sb-item[data-filter]').forEach(item => {
  item.addEventListener('click', function () {
    document.querySelectorAll('.sb-item').forEach(x => x.classList.remove('on'));
    this.classList.add('on');
    state.agentFilter = this.dataset.filter;
    switchView('agents');
  });
});

// ─── AGENT SEARCH ─────────────────────────────────────────
document.getElementById('agent-search').addEventListener('input', function () {
  state.agentSearch = this.value;
  renderAgentCards();
});

// ─── FILTER CHIPS ─────────────────────────────────────────
document.querySelectorAll('.filter-chip[data-chip]').forEach(chip => {
  chip.addEventListener('click', function () {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('on'));
    this.classList.add('on');
    state.agentFilter = this.dataset.chip;
    renderAgentCards();
  });
});

// ─── CONFIDENCE THRESHOLD (Overview) ─────────────────────
document.getElementById('threshold-slider').addEventListener('input', function () {
  state.threshold = parseInt(this.value);
  document.getElementById('thresh-label').textContent = this.value + '%';
  renderFlags();
});

// ─── CONFIDENCE THRESHOLD (Settings) — synced ────────────
document.getElementById('settings-threshold').addEventListener('input', function () {
  state.threshold = parseInt(this.value);
  document.getElementById('settings-thresh-val').textContent = this.value + '%';
  document.getElementById('thresh-label').textContent = this.value + '%';
  document.getElementById('threshold-slider').value = this.value;
  renderFlags();
});

// ─── CLOSE PANELS ─────────────────────────────────────────
document.getElementById('dp-close').addEventListener('click', closeDetail);
document.getElementById('ap-close').addEventListener('click', closeDetail);
document.getElementById('detail-overlay').addEventListener('click', closeDetail);

// ─── ACTIVE FLAGS ITEMS → FLAG DETAIL ────────────────────
document.querySelectorAll('.alert-item[data-flag]').forEach(item => {
  item.addEventListener('click', function () {
    const flagId = this.dataset.flag;
    if (flagId === 'info') {
      showToast('ℹ️', 'Semantic context updated', '4 new terms indexed for Revenue Analyst.');
      return;
    }
    openFlag(flagId);
  });
});

// ─── VIEW ALL → AGENTS VIEW ───────────────────────────────
document.getElementById('view-all-agents').addEventListener('click', () => switchView('agents'));

// ─── CLEAR RESOLVED ───────────────────────────────────────
document.getElementById('clear-all-action').addEventListener('click', () => {
  const resolvedIds = flagData.filter(f => state.flagStatuses[f.id] === 'resolved').map(f => f.id);
  if (resolvedIds.length === 0) {
    showToast('ℹ️', 'Nothing to clear', 'No resolved flags in the list.');
    return;
  }
  renderFlags();
  showToast('🧹', 'Cleared', `${resolvedIds.length} resolved flag${resolvedIds.length > 1 ? 's' : ''} hidden from view.`);
});

// ─── CONFIGURE WORKFLOW → SETTINGS ────────────────────────
document.getElementById('configure-workflow-btn').addEventListener('click', () => switchView('settings'));

// ─── CONFIGURE ALERT MODAL ────────────────────────────────
document.getElementById('configure-alert-btn').addEventListener('click', () => openAlertModal());
document.getElementById('agents-configure-alert-btn').addEventListener('click', () => openAlertModal());
document.getElementById('alert-modal-close').addEventListener('click', closeAlertModal);
document.getElementById('alert-modal-cancel').addEventListener('click', closeAlertModal);
document.getElementById('alert-modal').addEventListener('click', function (e) {
  if (e.target === this) closeAlertModal();
});
document.getElementById('alert-modal-save').addEventListener('click', () => {
  const agent = document.getElementById('alert-agent').value;
  const notify = document.getElementById('alert-notify').value;
  closeAlertModal();
  showToast('🔔', 'Alert configured', `Alert saved for ${agent} · notify via ${notify}.`);
});

// ─── EXPORT ───────────────────────────────────────────────
document.getElementById('export-btn').addEventListener('click', exportCSV);
document.getElementById('flags-export-btn').addEventListener('click', exportCSV);

// ─── SETTINGS SAVE ────────────────────────────────────────
document.getElementById('settings-save-btn').addEventListener('click', () => {
  showToast('✅', 'Settings saved', 'All workspace settings updated successfully.');
});

// ─── INIT ─────────────────────────────────────────────────
renderAgents();
renderFlags();
initTrendChart();
