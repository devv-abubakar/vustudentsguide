async function openLedger(clientId, clientName, clientPhone, type) {
  currentClientId = clientId; currentClientType = type;
  document.getElementById('ledgerClientName').textContent = clientName;
  document.getElementById('ledgerClientPhone').textContent = clientPhone || 'No phone number';
  document.getElementById('headerTitle').textContent = clientName;
  document.getElementById('ledgerBalance').textContent = '...';
  document.getElementById('ledgerTxList').innerHTML = '<div class="empty-state"><i class="fa fa-circle-notch spinner text-gray-300 text-2xl"></i></div>';
  switchView('ledger');
  await loadLedger();
}

async function loadLedger() {
  const { data, error } = await sb.from('khuram_ledgers').select('*').eq('client_id', currentClientId).order('date').order('id');
  if (error) return;

  let running = 0;
  const rows = data.map(r => { running += (r.debit || 0) - (r.credit || 0); return { ...r, running }; });

  const lastBalance = rows.length ? rows[rows.length - 1].running : 0;
  const balEl = document.getElementById('ledgerBalance');
  balEl.textContent = fmtPKR(Math.abs(lastBalance));
  balEl.className = `font-heading font-black text-xl balance-chip ${lastBalance > 0 ? 'text-rose-600' : lastBalance < 0 ? 'text-green-600' : 'text-gray-800'}`;
  balEl.textContent += lastBalance > 0 ? ' DR' : (lastBalance < 0 ? ' CR' : '');

  const container = document.getElementById('ledgerTxList');
  if (!rows.length) { container.innerHTML = `<div class="empty-state"><i class="fa fa-file-invoice text-gray-200 text-5xl mb-4 block"></i><p class="text-gray-500 text-sm font-bold">No transactions yet</p></div>`; return; }

  container.innerHTML = rows.reverse().map(r => `
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4">
      <div class="p-4 border-b border-gray-100">
          <div class="flex justify-between items-center mb-3">
          <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full flex items-center justify-center ${r.debit ? 'bg-rose-100 text-rose-600' : 'bg-green-100 text-green-600'}">
              <i class="fa ${['CRV','CPV'].includes(r.type) ? 'fa-money-bill-wave' : 'fa-box-open'} text-lg"></i>
              </div>
              <div>
              <p class="text-xs font-bold text-gray-500">${fmtDate(r.date)}</p>
              <div class="flex gap-2 mt-1">
                  <span class="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold">${r.type || '-'}</span>
                  ${r.v_no ? `<span class="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded font-bold">V#${r.v_no}</span>` : ''}
              </div>
              </div>
          </div>
          <div class="text-right">
              ${r.debit ? `<p class="text-lg font-black text-rose-500">${fmtPKR(r.debit)}</p>` : ''}
              ${r.credit ? `<p class="text-lg font-black text-green-600">${fmtPKR(r.credit)}</p>` : ''}
              <p class="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wide">Bal: ${fmtPKR(Math.abs(r.running))}</p>
          </div>
          </div>
          <div class="bg-gray-50 rounded-xl p-3.5 border border-gray-200/60 mx-1 mb-1">
          <p class="text-[13px] text-gray-700 font-medium leading-relaxed whitespace-pre-line break-words">${escHtml(r.particulars) || 'No details provided.'}</p>
          </div>
      </div>
      <div class="flex bg-white divide-x divide-gray-100">
          <button onclick="deleteTx(${r.id}, 'ledger')" class="w-full py-3.5 text-xs text-rose-500 font-bold flex items-center justify-center gap-2 active:bg-rose-50"><i class="fa fa-trash"></i> Delete Entry</button>
      </div>
      </div>
  `).join('');
}

function deleteTx(txId, source) {
  showModal(`
    <div class="text-center p-4">
      <i class="fa fa-trash-alt text-rose-500 text-4xl mb-4"></i>
      <h3 class="font-bold text-xl mb-2">Delete Transaction?</h3>
      <p class="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
      <div class="flex gap-3">
        <button onclick="closeModal()" class="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-bold">Cancel</button>
        <button id="delBtn" class="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold">Delete</button>
      </div>
    </div>
  `);
  document.getElementById('delBtn').onclick = async () => {
    closeModal();
    await sb.from('khuram_ledgers').delete().eq('id', txId);
    toast('Transaction Deleted!', 'success');
    if(source === 'ledger') loadLedger(); else loadDashboard();
  };
}
