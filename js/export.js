// ─── EXPORT CSV ───────────────────────────────────────────
function exportCSV() {
  const rows = [['Query', 'Agent', 'User', 'Time', 'Confidence', 'Disposition', 'Status']];
  flagData.forEach(f => {
    rows.push([
      `"${f.query.replace(/"/g, '""')}"`,
      f.agent,
      f.user,
      f.time,
      f.conf + '%',
      f.disposition,
      state.flagStatuses[f.id],
    ]);
  });
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'agentiq_flags_report.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('📥', 'Export ready', 'agentiq_flags_report.csv downloaded.');
}
