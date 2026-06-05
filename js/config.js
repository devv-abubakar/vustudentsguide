const SUPABASE_URL = 'https://ptwgiadzpzawjftfxwwf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Qoy-USZ2VP94_n5x1BcjWQ_HV5deVBB';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global State
let currentView = 'dashboard';
let currentClientId = null;
let currentClientType = null;
let allClients = { payable: [], receivable: [] };
let dashboardRawData = [];
