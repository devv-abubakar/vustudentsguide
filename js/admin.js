// Rate Management
async function fetchRates() {
  const { data } = await sb.from('khuram_rates').select('*').order('product_name');
  allRates = data || [];
}

async function submitNewRate() {
  const name = document.getElementById('adminBoraName').value.trim();
  const packets = document.getElementById('adminPackets').value.trim();
  const rate = parseFloat(document.getElementById('adminRate').value);

  if (!name || isNaN(rate)) { toast('Name & Rate are required!', 'error'); return; }
  
  const fullName = packets ? `${name} (${packets} Packets)` : name;
  
  const { error } = await sb.from('khuram_rates').insert({ product_name: fullName, rate_per_bundle: rate });
  if (error) { toast('Error saving rate', 'error'); return; }
  
  toast('Rate Saved!', 'success');
  document.getElementById('adminBoraName').value = '';
  document.getElementById('adminPackets').value = '';
  document.getElementById('adminRate').value = '';
  await fetchRates();
}

// Transaction Logic
function handleAdminLedgerType() {
  const type = document.getElementById('adminLedgerType').value;
  const actionSel = document.getElementById('adminActionType');
  
  if (type === 'receivable') {
      actionSel.innerHTML = `
          <option value="add_bundle">📦 Add Bundle</option>
          <option value="receive_payment">💰 Receive Payments</option>
      `;
  } else {
      actionSel.innerHTML = `
          <option value="material_purchase">📦 Material Purchase</option>
          <option value="amount_paid">💰 Amount Paid</option>
      `;
  }
  populateAdminClients();
}

function populateAdminClients() {
  const type = document.getElementById('adminLedgerType').value;
  const clientSel = document.getElementById('adminClientSelect');
  const list = type === 'receivable' ? allClients.receivable : allClients.payable;
  
  clientSel.innerHTML = `<option value="">-- Select Client --</option>` + 
      list.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function handleAdminActionType() {
  // Can be used for UI changes if needed
}

async function submitAdminTransaction() {
  const type = document.getElementById('adminLedgerType').value;
  const action = document.getElementById('adminActionType').value;
  const cid = document.getElementById('adminClientSelect').value;
  const date = document.getElementById('adminDate').value;
  const remarks = document.getElementById('adminRemarks').value.trim();
  const amount = parseFloat(document.getElementById('adminTotalAmount').value);

  if (!cid) { toast('Please Select a Client!', 'error'); return; }
  if (!date) { toast('Date is required!', 'error'); return; }
  if (!remarks) { toast('Remarks are required!', 'error'); return; }
  if (isNaN(amount) || amount <= 0) { toast('Enter Valid Amount!', 'error'); return; }

  let txType = '';
  let isDebit = true;

  if (type === 'receivable') {
      if (action === 'add_bundle') { txType = 'GSV'; isDebit = true; } // Bundle diya
      else if (action === 'receive_payment') { txType = 'CRV'; isDebit = false; } // Cash aya
  } else if (type === 'payable') {
      if (action === 'material_purchase') { txType = 'FPV'; isDebit = false; } // Samaan aya
      else if (action === 'amount_paid') { txType = 'CPV'; isDebit = true; } // Payment di
  }

  const entry = {
      client_id: cid, date, type: txType, particulars: remarks, v_no: null,
      debit: isDebit ? amount : 0, credit: !isDebit ? amount : 0, balance: 0
  };

  const { error } = await sb.from('khuram_ledgers').insert(entry);
  if (error) { toast('Error saving transaction', 'error'); return; }

  toast('Transaction Saved Successfully!', 'success');
  document.getElementById('adminRemarks').value = '';
  document.getElementById('adminTotalAmount').value = '';
  
  loadDashboard();
}

// Clients Logic
function openAddClientModal(defaultType = 'receivable') {
  showModal(`
      <div class="space-y-4">
      <h3 class="font-bold text-lg border-b pb-2">Add New Client</h3>
      <div><label class="text-[11px] font-bold text-gray-500 uppercase mb-1">Name</label><input type="text" id="mClientName" class="w-full border-2 border-gray-200 rounded-xl py-3 px-3 text-sm bg-gray-50 font-bold" /></div>
      <div><label class="text-[11px] font-bold text-gray-500 uppercase mb-1">Type</label>
        <select id="mClientType" class="w-full border-2 border-gray-200 rounded-xl py-3 px-3 text-sm bg-gray-50 font-bold">
          <option value="receivable" ${defaultType==='receivable'?'selected':''}>Receivable</option>
          <option value="payable" ${defaultType==='payable'?'selected':''}>Payable</option>
        </select>
      </div>
      <div><label class="text-[11px] font-bold text-gray-500 uppercase mb-1">Phone</label><input type="tel" id="mClientPhone" class="w-full border-2 border-gray-200 rounded-xl py-3 px-3 text-sm bg-gray-50 font-bold" /></div>
      <button onclick="saveClient()" class="w-full mt-4 bg-rose-500 text-white py-3 rounded-xl font-bold">Save</button>
      </div>
  `);
}

window.saveClient = async function() {
  const name = document.getElementById('mClientName').value.trim(), type = document.getElementById('mClientType').value, phone = document.getElementById('mClientPhone').value.trim();
  if (!name) return toast('Name required', 'error');
  await sb.from('khuram_clients').insert({ name, type, phone: phone || null });
  closeModal(); await loadAllClients(); handleAdminLedgerType(); toast('Added!', 'success');
  if(currentView === 'payables') renderClientList('payable');
  if(currentView === 'receivables') renderClientList('receivable');
}
