import { supabase } from './supabaseClient.js';

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

toggleAuthMode.addEventListener('click', () => {
  authMode = authMode === 'login' ? 'signup' : 'login';
  document.getElementById('authTitle').innerText =
    authMode === 'login' ? 'Login' : 'Sign Up';
  toggleAuthMode.innerText =
    authMode === 'login'
      ? 'Don’t have an account? Sign up'
      : 'Already have an account? Log in';
});

loginBtn.addEventListener('click', () => authModal.classList.remove('hidden'));
closeAuthModalBtn.addEventListener('click', () =>
  authModal.classList.add('hidden')
);

authActionBtn.addEventListener('click', async () => {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const username = document.getElementById('authUsername').value;

  if (authMode === 'signup') {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) alert(error.message);
    else alert('Signup successful! Please verify your email.');
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  }
});

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  alert('Logged out!');
  location.reload();
});

postScriptBtn.addEventListener('click', () => postModal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => postModal.classList.add('hidden'));

submitScriptBtn.addEventListener('click', async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert('Please log in to post!');

  const name = document.getElementById('scriptName').value;
  const game = document.getElementById('gameName').value;
  const icon = document.getElementById('iconUrl').value;
  const keyless = document.getElementById('keyless').value;
  const script = document.getElementById('scriptContent').value;

  const { error } = await supabase.from('scripts').insert([
    {
      user_id: user.id,
      name,
      game,
      icon,
      keyless,
      script,
      username: user.user_metadata.username,
    },
  ]);
  if (error) alert(error.message);
  else {
    alert('Script posted!');
    postModal.classList.add('hidden');
    loadScripts();
  }
});

async function loadScripts() {
  const { data, error } = await supabase.from('scripts').select('*');
  if (error) return console.error(error);

  scriptsContainer.innerHTML = data
    .map(
      (s) => `
    <div class="card">
      <img src="${s.icon || 'https://placehold.co/80'}" alt="${s.name}">
      <h3>${s.name}</h3>
      <p><b>Game:</b> ${s.game}</p>
      <p><b>Keyless:</b> ${s.keyless}</p>
      <button onclick="navigator.clipboard.writeText(\`${s.script}\`)">📋 Copy Script</button>
    </div>`
    )
    .join('');
}

searchInput.addEventListener('input', async (e) => {
  const query = e.target.value.toLowerCase();
  const { data } = await supabase.from('scripts').select('*');
  const filtered = data.filter((s) =>
    s.name.toLowerCase().includes(query) ||
    s.game.toLowerCase().includes(query)
  );

  scriptsContainer.innerHTML = filtered
    .map(
      (s) => `
    <div class="card">
      <img src="${s.icon || 'https://placehold.co/80'}" alt="${s.name}">
      <h3>${s.name}</h3>
      <p><b>Game:</b> ${s.game}</p>
      <p><b>Keyless:</b> ${s.keyless}</p>
      <button onclick="navigator.clipboard.writeText(\`${s.script}\`)">📋 Copy Script</button>
    </div>`
    )
    .join('');
});

loadScripts();
