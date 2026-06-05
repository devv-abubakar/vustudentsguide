async function loadDashboard() {
  const start = document.getElementById('dashStartDate').value || today();
  const end = document.getElementById('dashEndDate').value || today();
  
  document.getElementById('dashDebit').innerHTML = '<i class="fa fa-circle-notch spinner"></i>';
  document.getElementById('dashCredit').innerHTML = '<i class="fa fa-circle-notch spinner"></i>';
  document.getElementById('dashTxList').innerHTML = '<div class="empty-state"><i class="fa fa-circle-notch spinner text-2xl"></i></div>';

  const { data, error } = await sb.from('khuram_ledgers')
      .select('*, khuram_clients(name, type)')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false })
      .order('id', { ascending: false });

  if (error) { toast('Error loading dashboard', 'error'); return; }

  dashboardRawData = data;
  
  // Sent to Payables = Only CPV where debit > 0 and type is payable
  const totalSentToPayables = data.reduce((sum, r) => {
      return (r.khuram_clients?.type === 'payable' && r.type === 'CPV' && r.debit > 0) ? sum + r.debit : sum;
  }, 0);

  // Received Cash = Only CRV where credit > 0 and type is receivable
  const totalReceivedCash = data.reduce((sum, r) => {
      return (r.khuram_clients?.type === 'receivable' && r.type === 'CRV' && r.credit > 0) ? sum + r.credit : sum;
  }, 0);

  document.getElementById('dashDebit').textContent = fmtPKR(totalSentToPayables);
  document.getElementById('dashCredit').textContent = fmtPKR(totalReceivedCash);
  
  filterDashList('all'); 
}

function filterDashList(filterType) {
  const container = document.getElementById('dashTxList');
  let baseList = dashboardRawData.filter(r => r.type === 'CRV' || r.type === 'CPV');
  let list = baseList;

  document.getElementById('dashClearFilter').classList.add('hidden');
  document.getElementById('dashListTitle').innerText = "All Cash Transactions";

  if(filterType === 'debit') {
      list = baseList.filter(r => r.khuram_clients?.type === 'payable' && r.debit > 0);
      document.getElementById('dashListTitle').innerText = "Sent To Payables (Cash Paid)";
      document.getElementById('dashClearFilter').classList.remove('hidden');
  } else if (filterType === 'credit') {
      list = baseList.filter(r => r.khuram_clients?.type === 'receivable' && r.credit > 0);
      document.getElementById('dashListTitle').innerText = "Received Cash (From Receivables)";
      document.getElementById('dashClearFilter').classList.remove('hidden');
  }

  if (!list.length) {
      container.innerHTML = `<div class="empty-state"><i class="fa fa-inbox text-gray-200 text-5xl mb-3 block"></i><p class="text-gray-500 text-sm font-bold">No cash transactions found</p></div>`;
      return;
  }

  container.innerHTML = list.map(r => {
      const isCredit = r.credit > 0;
      return `
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4">
        <div class="p-4 border-b border-gray-100">
          <div class="flex justify-between items-center mb-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full flex items-center justify-center ${r.debit ? 'bg-rose-100 text-rose-600' : 'bg-green-100 text-green-600'}">
                <i class="fa fa-money-bill-wave text-lg"></i>
              </div>
              <div>
                <p class="text-sm font-bold text-gray-800">${r.khuram_clients?.name || 'Unknown'}</p>
                <div class="flex gap-2 mt-1">
                  <span class="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold">${r.type || '-'}</span>
                  ${r.v_no ? `<span class="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded font-bold">V#${r.v_no}</span>` : ''}
                </div>
              </div>
            </div>
            <div class="text-right">
              ${r.debit ? `<p class="text-lg font-black text-rose-500">${fmtPKR(r.debit)}</p>` : ''}
              ${r.credit ? `<p class="text-lg font-black text-green-600">${fmtPKR(r.credit)}</p>` : ''}
              <p class="text-[10px] font-bold text-gray-400 mt-1 uppercase">${fmtDate(r.date)}</p>
            </div>
          </div>
          <div class="bg-gray-50 rounded-xl p-3.5 border border-gray-200/60 mx-1 mb-1">
            <p class="text-[13px] text-gray-700 font-medium leading-relaxed whitespace-pre-line break-words">${escHtml(r.particulars) || 'No details provided.'}</p>
          </div>
        </div>
        <div class="flex bg-white divide-x divide-gray-100">
            <button onclick="deleteTx(${r.id}, 'dashboard')" class="w-full py-3.5 text-xs text-rose-500 font-bold flex items-center justify-center gap-2 active:bg-rose-50"><i class="fa fa-trash"></i> Delete Entry</button>
        </div>
      </div>`;
  }).join('');
}
