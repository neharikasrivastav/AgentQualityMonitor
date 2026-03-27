// ─── RENDER AGENTS TABLE (Overview) ───────────────────────
function renderAgents() {
  const tbody = document.getElementById('agent-tbody');
  tbody.innerHTML = agents.map(a => {
    const col = a.status === 'green' ? 'var(--green)' : a.status === 'amber' ? 'var(--amber)' : 'var(--red)';
    const trendColor = a.trendUp ? 'var(--green)' : 'var(--red)';
    const schemaTag = a.schemaAlert ? `<span class="schema-tag">⚡ schema change</span>` : '';
    return `<tr data-agent="${a.id}" onclick="openAgent('${a.id}')">
      <td><div class="agent-name">${a.name}${schemaTag}</div><div class="agent-type">${a.type}</div></td>
      <td><div class="acc-bar-wrap"><div class="acc-bar"><div class="acc-fill" style="width:0%;background:${col}" data-w="${a.acc}%"></div></div><span class="acc-val" style="color:${col}">${a.acc}%</span></div></td>
      <td><span class="status-dot" style="background:${col}"></span></td>
      <td><span class="trend" style="color:${trendColor}">${a.trend}</span></td>
    </tr>`;
  }).join('');
  setTimeout(() => {
    document.querySelectorAll('.acc-fill').forEach(el => { el.style.width = el.dataset.w; });
  }, 80);
}

// ─── RENDER AGENT CARDS (Agents View) ─────────────────────
function renderAgentCards() {
  const search = state.agentSearch.toLowerCase();
  const filter = state.agentFilter;

  const filtered = agents.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search) || a.type.toLowerCase().includes(search);
    const matchFilter = filter === 'all' || a.status === filter ||
      (filter === 'snowflake'  && a.type.toLowerCase().includes('snowflake'))  ||
      (filter === 'salesforce' && a.type.toLowerCase().includes('salesforce')) ||
      (filter === 'postgres'   && a.type.toLowerCase().includes('postgres'))   ||
      (filter === 'bigquery'   && a.type.toLowerCase().includes('bigquery'));
    return matchSearch && matchFilter;
  });

  const sub = document.getElementById('agents-view-sub');
  if (sub) sub.textContent = `${filtered.length} agent${filtered.length !== 1 ? 's' : ''} · health status · performance history`;

  const container = document.getElementById('agent-cards');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;padding:48px;text-align:center;color:var(--muted2);font-size:12px;">No agents match your search or filter.</div>`;
    return;
  }

  container.innerHTML = filtered.map(a => {
    const col = a.status === 'green' ? 'var(--green)' : a.status === 'amber' ? 'var(--amber)' : 'var(--red)';
    const statusLabel = a.status === 'green' ? 'Healthy' : a.status === 'amber' ? 'Warning' : 'Degraded';
    const schemaTag = a.schemaAlert ? `<span class="schema-tag" style="margin-left:0;margin-top:4px;display:inline-flex;">⚡ schema change</span>` : '';
    return `<div class="agent-card" onclick="openAgent('${a.id}')">
      <div class="agent-card-head">
        <div>
          <div class="agent-card-name">${a.name}</div>
          <div class="agent-card-type">${a.type}</div>
          ${schemaTag}
        </div>
        <span class="status-dot" style="background:${col};width:9px;height:9px;margin-top:4px;"></span>
      </div>
      <div class="agent-card-body">
        <div class="acc-bar-wrap" style="margin-bottom:8px;">
          <div class="acc-bar"><div class="acc-fill" style="width:${a.acc}%;background:${col}"></div></div>
          <span class="acc-val" style="color:${col}">${a.acc}%</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--muted2);">
          <span>Status: <span style="color:${col}">${statusLabel}</span></span>
          <span>Trend: <span style="color:${a.trendUp ? 'var(--green)' : 'var(--red)'}">${a.trend}</span></span>
        </div>
        <div style="font-size:10px;color:var(--muted2);margin-top:3px;">Last retrained: ${a.lastRetrained}</div>
      </div>
      <div class="agent-card-footer">
        <button class="btn btn-sm" style="flex:1" onclick="event.stopPropagation();retrainAgent('${a.id}')">Retrain</button>
        <button class="btn btn-sm" style="flex:1" onclick="event.stopPropagation();openAlertModal('${a.name}')">Set alert</button>
      </div>
    </div>`;
  }).join('');
}

// ─── AGENT DETAIL PANEL ───────────────────────────────────
function openAgent(id) {
  const a = agents.find(x => x.id === id);
  state.openAgentId = id;
  const col = a.status === 'green' ? '#1d9e75' : a.status === 'amber' ? '#e8931e' : '#e24b4a';
  const schemaRow = a.schemaAlert
    ? `<div class="dp-row"><span class="dp-key">Schema alert</span><span class="dp-val"><span class="schema-tag">⚡ schema change detected</span></span></div>`
    : '';

  document.getElementById('ap-title').textContent = a.name;
  document.getElementById('ap-body').innerHTML = `
    <div class="dp-section">
      <div class="dp-section-label">Accuracy — last 8 weeks</div>
      <div class="chart-container"><canvas id="agent-chart"></canvas></div>
    </div>
    <div class="dp-section">
      <div class="dp-section-label">Details</div>
      <div class="dp-row"><span class="dp-key">Data source</span><span class="dp-val">${a.type}</span></div>
      <div class="dp-row"><span class="dp-key">Current accuracy</span><span class="dp-val" style="color:${col}">${a.acc}%</span></div>
      <div class="dp-row"><span class="dp-key">Week-on-week</span><span class="dp-val" style="color:${a.trendUp ? 'var(--green)' : 'var(--red)'}">${a.trend}</span></div>
      <div class="dp-row"><span class="dp-key">Last retrained</span><span class="dp-val">${a.lastRetrained}</span></div>
      <div class="dp-row"><span class="dp-key">Status</span><span class="dp-val" style="color:${col}">${a.status.toUpperCase()}</span></div>
      ${schemaRow}
    </div>
    <div class="dp-section">
      <div class="dp-section-label">Actions</div>
      <div class="dp-actions">
        <button class="btn btn-sm" style="flex:1" onclick="retrainAgent('${a.id}')">Retrain context</button>
        <button class="btn btn-sm" style="flex:1" onclick="openAlertModal('${a.name}')">Set alert</button>
      </div>
    </div>`;

  document.getElementById('agent-panel').classList.add('open');
  document.getElementById('detail-overlay').classList.add('open');
  document.querySelectorAll('#agent-tbody tr').forEach(r => r.classList.remove('selected'));
  const row = document.querySelector(`[data-agent="${id}"]`);
  if (row) row.classList.add('selected');

  initAgentChart(a, col);
}

// ─── RETRAIN ──────────────────────────────────────────────
function retrainAgent(id) {
  const a = agents.find(x => x.id === id);
  showToast('🔄', 'Retrain queued', `Context retrain scheduled for ${a.name}.`);
}
