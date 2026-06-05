async function loadAllClients() {
  const { data } = await sb.from('khuram_clients').select('*').order('name');
  if (!data) return;
  allClients.payable = data.filter(c => c.type === 'payable');
  allClients.receivable = data.filter(c => c.type === 'receivable');
  
  window.clientTypeMap = {};
  data.forEach(c => { window.clientTypeMap[c.id] = c.type; });
}

function renderClientList(type) {
  const query = document.getElementById(type === 'payable' ? 'searchPayable' : 'searchReceivable').value.toLowerCase();
  const filtered = allClients[type].filter(c => c.name.toLowerCase().includes(query));
  const container = document.getElementById(type === 'payable' ? 'listPayable' : 'listReceivable');

  if (!filtered.length) {
      container.innerHTML = `<div class="empty-state"><i class="fa fa-user-slash text-gray-200 text-5xl mb-3 block"></i><p class="text-gray-500 text-sm font-bold">No clients found</p></div>`;
      return;
  }

  container.innerHTML = filtered.map(c => `
      <div class="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-200 tap-card mb-3" onclick="openLedger(${c.id}, '${escHtml(c.name)}', '${escHtml(c.phone || '')}', '${type}')">
      <div class="w-12 h-12 rounded-full ${type === 'payable' ? 'bg-rose-100 text-rose-500' : 'bg-blue-100 text-blue-500'} flex items-center justify-center flex-shrink-0 text-xl font-bold">
          ${c.name.charAt(0).toUpperCase()}
      </div>
      <div class="flex-1 min-w-0">
          <p class="font-bold text-gray-800 text-base truncate">${c.name}</p>
          <p class="text-[11px] font-bold text-gray-400 mt-1 tracking-wide uppercase">${c.phone || 'No phone number'}</p>
      </div>
      <div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-200">
          <i class="fa fa-chevron-right text-xs"></i>
      </div>
      </div>
  `).join('');
}

function filterClients(type) { renderClientList(type); }
