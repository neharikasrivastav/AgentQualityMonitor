// ─── OVERVIEW TREND CHART ─────────────────────────────────
function initTrendChart() {
  const ctx = document.getElementById('trend-chart').getContext('2d');
  state.trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: [94.1, 94.8, 95.2, 95.6, 94.9, 95.8, 96.2],
        borderColor: '#10d1e0',
        backgroundColor: 'rgba(16,209,224,0.07)',
        borderWidth: 2,
        pointBackgroundColor: '#10d1e0',
        pointRadius: 3,
        tension: 0.4,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1f2230', titleColor: '#eeeef5', bodyColor: '#9093a8',
          callbacks: { label: ctx => ` ${ctx.raw}% overall accuracy` }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b6e82', font: { size: 10 } } },
        y: { min: 90, max: 100, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b6e82', font: { size: 10 }, callback: v => v + '%' } }
      }
    }
  });
}

// ─── AGENT ACCURACY CHART ─────────────────────────────────
function initAgentChart(agent, col) {
  if (state.agentChart) state.agentChart.destroy();
  const ctx = document.getElementById('agent-chart').getContext('2d');
  state.agentChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['W-7', 'W-6', 'W-5', 'W-4', 'W-3', 'W-2', 'W-1', 'Now'],
      datasets: [{
        data: agent.history,
        borderColor: col,
        backgroundColor: col + '22',
        borderWidth: 2,
        pointBackgroundColor: col,
        pointRadius: 4,
        tension: 0.35,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1f2230', titleColor: '#eeeef5', bodyColor: '#9093a8',
          callbacks: { label: ctx => ` ${ctx.raw}% accuracy` }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b6e82', font: { size: 10 } } },
        y: { min: 60, max: 100, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b6e82', font: { size: 10 }, callback: v => v + '%' } }
      }
    }
  });
}
