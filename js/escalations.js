// ─── RENDER ESCALATIONS VIEW ──────────────────────────────
function renderEscalations() {
  const escalated = flagData.filter(f => state.flagStatuses[f.id] === 'escalated');

  const badge = document.getElementById('esc-count-badge');
  if (badge) badge.textContent = `${escalated.length} open`;

  const list = document.getElementById('esc-list');
  if (!list) return;

  if (escalated.length === 0) {
    list.innerHTML = `
      <div class="esc-empty">
        <div style="font-size:32px;margin-bottom:10px;">📬</div>
        <div style="font-weight:600;color:var(--text);margin-bottom:4px;">Escalation inbox is empty</div>
        <div style="font-size:11px;">No queries are currently escalated to the data team.</div>
      </div>`;
    return;
  }

  list.innerHTML = escalated.map(f => {
    const confColor = f.conf < 65 ? 'var(--red)' : f.conf < 80 ? 'var(--amber)' : 'var(--green)';
    return `<div class="esc-item">
      <div class="esc-icon" style="background:var(--red-dim)">↑</div>
      <div class="esc-body">
        <div class="esc-title">${f.query}</div>
        <div class="esc-meta">${f.agent} · ${f.user} · ${f.time} · <span style="color:${confColor}">${f.conf}% conf</span></div>
        <div style="font-size:11px;color:var(--muted2);margin-bottom:8px;padding:6px 10px;background:var(--s2);border-radius:6px;border-left:2px solid var(--red);">${f.reason}</div>
        <div class="esc-actions">
          <button class="btn btn-green btn-sm" onclick="resolveFlag('${f.id}');showToast('✓','Resolved','Correction queued for retraining.')">✓ Mark resolved</button>
          <button class="btn btn-sm" onclick="dismissFlag('${f.id}');showToast('↩','Dismissed','Flag removed from escalation inbox.')">Dismiss</button>
        </div>
      </div>
    </div>`;
  }).join('');
}
