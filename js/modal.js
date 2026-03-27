// ─── CONFIGURE ALERT MODAL ────────────────────────────────
function openAlertModal(presetAgent) {
  const modal = document.getElementById('alert-modal');
  modal.classList.add('open');
  if (presetAgent) {
    const sel = document.getElementById('alert-agent');
    for (let i = 0; i < sel.options.length; i++) {
      if (sel.options[i].text === presetAgent) { sel.selectedIndex = i; break; }
    }
  }
  closeDetail();
}

function closeAlertModal() {
  document.getElementById('alert-modal').classList.remove('open');
}
