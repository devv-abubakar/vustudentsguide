window.onload = () => {
  if (sessionStorage.getItem('kf_user')) showApp();
  else showLogin();
};

async function doLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value.trim();
  if (!u || !p) { showLoginErr('Required fields missing.'); return; }
  
  document.getElementById('loginBtn').innerHTML = 'Signing in...';
  const { data, error } = await sb.from('khuram_users').select('*').eq('username', u).eq('password', p).single();
  document.getElementById('loginBtn').innerHTML = 'Access Portal';

  if (error || !data) { showLoginErr('Invalid details.'); return; }
  sessionStorage.setItem('kf_user', JSON.stringify(data));
  showApp();
}

function showLoginErr(m) { const e = document.getElementById('loginError'); e.textContent = m; e.classList.remove('hidden'); }
function logout() { sessionStorage.removeItem('kf_user'); window.location.reload(); }
function showLogin() { document.getElementById('loginScreen').style.display = 'flex'; document.getElementById('app').style.display = 'none'; }
function showApp() { document.getElementById('loginScreen').style.display = 'none'; document.getElementById('app').style.removeProperty('display'); initApp(); }

async function initApp() {
  document.getElementById('dashStartDate').value = today();
  document.getElementById('dashEndDate').value = today();
  document.getElementById('adminDate').value = today();
  await loadAllClients();
  loadDashboard();
  initAdminTab(); // Setup default Admin dropdowns
}

function switchView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.add('active');
  currentView = view;

  if (view !== 'ledger') {
    const btn = document.querySelector(`.nav-btn[data-view="${view}"]`);
    if (btn) btn.classList.add('active');
  }

  const isLedger = view === 'ledger';
  document.getElementById('backBtn').classList.toggle('hidden', !isLedger);
  document.getElementById('headerLogo').classList.toggle('hidden', isLedger);
  document.getElementById('headerTitle').classList.toggle('hidden', !isLedger);

  if (view === 'dashboard') loadDashboard();
  if (view === 'payables') renderClientList('payable');
  if (view === 'receivables') renderClientList('receivable');
  if (view === 'admin') initAdminTab();
}

function goBack() { switchView('dashboard'); }
function today() { return new Date().toISOString().split('T')[0]; }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'; }
function fmtPKR(n) { return n != null ? 'Rs ' + Number(n).toLocaleString('en-PK') : '–'; }
function escHtml(str) { return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function toast(msg, type='success') {
  const el = document.getElementById('toast');
  el.className = `fixed bottom-28 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-full text-white text-sm font-bold shadow-2xl flex items-center gap-2.5 whitespace-nowrap border border-white/20 ${type==='success'?'bg-gray-800':'bg-rose-600'}`;
  el.innerHTML = `<i class="fa ${type==='success'?'fa-check-circle text-green-400':'fa-exclamation-circle text-white'} text-lg"></i> ${msg}`;
  el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2500);
}

function showModal(html) {
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modalBackdrop').classList.remove('hidden'); document.getElementById('modalBackdrop').classList.add('flex');
}
function closeModal() { document.getElementById('modalBackdrop').classList.add('hidden'); }
