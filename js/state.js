// ─── STATE ────────────────────────────────────────────────
const state = {
  flagStatuses: {},        // { flagId: 'open' | 'resolved' | 'escalated' }
  openFlagId: null,        // currently open flag detail panel
  openAgentId: null,       // currently open agent detail panel
  threshold: 80,           // confidence threshold (%)
  agentChart: null,        // active Chart.js instance (agent panel)
  trendChart: null,        // active Chart.js instance (overview)
  refreshSeconds: 0,       // live counter for "last refreshed" timestamp
  agentFilter: 'all',      // current sidebar / chip filter
  agentSearch: '',         // current search query
  resolvedCount: 41,       // running total of resolved flags (sidebar)
};

// Initialise all flags as 'open'
flagData.forEach(f => state.flagStatuses[f.id] = 'open');

// ─── TOAST ────────────────────────────────────────────────
function showToast(icon, title, sub, duration = 3200) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${sub ? `<div class="toast-sub">${sub}</div>` : ''}
    </div>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}
