import { supabase } from './supabaseClient.js';

/* ===== DOM ELEMENTS ===== */
const postScriptBtn = document.getElementById('postScriptBtn');
const postModal = document.getElementById('postModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const submitScriptBtn = document.getElementById('submitScriptBtn');
const scriptsContainer = document.getElementById('scriptsContainer');
const searchInput = document.getElementById('searchInput');

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const profileBtn = document.getElementById('profileBtn');

const authModal = document.getElementById('authModal');
const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const authActionBtn = document.getElementById('authActionBtn');

let authMode = 'login';
let currentUser = null;

/* ===== AUTH MODE TOGGLE ===== */
toggleAuthMode.addEventListener('click', () => {
  authMode = authMode === 'login' ? 'signup' : 'login';
  document.getElementById('authTitle').innerText =
    authMode === 'login' ? 'Login' : 'Sign Up';
  toggleAuthMode.innerText =
    authMode === 'login'
      ? 'Don’t have an account? Sign up'
      : 'Already have an account? Log in';
});

/* ===== MODAL HANDLERS ===== */
loginBtn.addEventListener('click', () => authModal.classList.remove('hidden'));
closeAuthModalBtn.addEventListener('click', () => authModal.classList.add('hidden'));
postScriptBtn.addEventListener('click', () => {
  if (!currentUser) return alert('Please log in to post a script!');
  postModal.classList.remove('hidden');
});
closeModalBtn.addEventListener('click', () => postModal.classList.add('hidden'));

/* ===== SIGNUP / LOGIN ===== */
authActionBtn.addEventListener('click', async () => {
  const email = document.getElementById('authEmail').value;
  const username = document.getElementById('authUsername').value;
  const password = document.getElementById('authPassword').value;

  if (!email || !password || (authMode === 'signup' && !username)) {
    return alert('Please fill all fields!');
  }

  if (authMode === 'signup') {
    // Check if email already exists
    const { data: existing, error: existErr } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existing) return alert('Email already registered!');

    const { error } = await supabase.from('users').insert([
      {
        username,
        email,
        password
      }
    ]);

    if (error) return alert(error.message);
    alert('Signup successful! You can now log in.');
    authMode = 'login';
    document.getElementById('authTitle').innerText = 'Login';
    toggleAuthMode.innerText = 'Don’t have an account? Sign up';
  } else {
    // Login
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !user) return alert('Invalid email or password!');
    currentUser = user;
    alert(`Welcome back, ${currentUser.username}!`);
    authModal.classList.add('hidden');
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    profileBtn.classList.remove('hidden');
  }
});

/* ===== LOGOUT ===== */
logoutBtn.addEventListener('click', () => {
  currentUser = null;
  loginBtn.classList.remove('hidden');
  logoutBtn.classList.add('hidden');
  profileBtn.classList.add('hidden');
});

/* ===== POST SCRIPT ===== */
submitScriptBtn.addEventListener('click', async () => {
  if (!currentUser) return alert('You must be logged in!');

  const title = document.getElementById('scriptName').value;
  const code = document.getElementById('scriptContent').value;

  if (!title || !code) return alert('Please fill all fields!');

  const { error } = await supabase.from('scripts').insert([
    {
      title,
      code,
      user_id: currentUser.id
    }
  ]);

  if (error) return alert(error.message);
  alert('Script posted!');
  postModal.classList.add('hidden');
  loadScripts();
});

/* ===== LOAD SCRIPTS ===== */
async function loadScripts() {
  const { data: scripts, error } = await supabase
    .from('scripts')
    .select('*, users(username)')
    .order('created_at', { ascending: false });

  if (error) return console.error(error);

  scriptsContainer.innerHTML = scripts
    .map(
      (s) => `
    <div class="card">
      <h3>${s.title}</h3>
      <p><b>Author:</b> ${s.users?.username || 'Unknown'}</p>
      <button onclick="navigator.clipboard.writeText(\`${s.code}\`)">📋 Copy Script</button>
    </div>`
    )
    .join('');
}

/* ===== SEARCH FILTER ===== */
searchInput.addEventListener('input', async (e) => {
  const query = e.target.value.toLowerCase();
  const { data: scripts } = await supabase
    .from('scripts')
    .select('*, users(username)')
    .order('created_at', { ascending: false });

  const filtered = scripts.filter((s) => s.title.toLowerCase().includes(query));

  scriptsContainer.innerHTML = filtered
    .map(
      (s) => `
    <div class="card">
      <h3>${s.title}</h3>
      <p><b>Author:</b> ${s.users?.username || 'Unknown'}</p>
      <button onclick="navigator.clipboard.writeText(\`${s.code}\`)">📋 Copy Script</button>
    </div>`
    )
    .join('');
});

/* ===== INITIAL LOAD ===== */
loadScripts();
