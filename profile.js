import { supabase } from '../supabaseClient.js';

/* ===== DOM ELEMENTS ===== */
const scriptsContainer = document.getElementById('userScriptsContainer');
const usernameEl = document.getElementById('usernameDisplay');
const emailEl = document.getElementById('emailDisplay');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const logoutBtn = document.getElementById('logoutBtn');

let currentUser = null;

/* ===== LOAD PROFILE ===== */
async function loadProfile() {
  // Check logged-in user from local session (simple example)
  const email = localStorage.getItem('currentUserEmail');
  const password = localStorage.getItem('currentUserPassword');

  if (!email || !password) {
    alert('Please log in!');
    window.location.href = '../index.html';
    return;
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single();

  if (error || !user) {
    alert('User not found. Please log in again.');
    window.location.href = '../index.html';
    return;
  }

  currentUser = user;
  usernameEl.innerText = currentUser.username;
  emailEl.innerText = currentUser.email;

  loadUserScripts();
}

/* ===== LOAD USER SCRIPTS ===== */
async function loadUserScripts() {
  if (!currentUser) return;

  const { data: scripts, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });

  if (error) return console.error(error);

  scriptsContainer.innerHTML = scripts
    .map(
      (s) => `
    <div class="card">
      <h3>${s.title}</h3>
      <button onclick="copyScript(\`${s.code}\`)">📋 Copy Script</button>
      <button onclick="deleteScript('${s.id}')">❌ Delete Script</button>
    </div>`
    )
    .join('');
}

/* ===== COPY SCRIPT ===== */
window.copyScript = function (code) {
  navigator.clipboard.writeText(code);
  alert('Script copied!');
};

/* ===== DELETE SCRIPT ===== */
window.deleteScript = async function (scriptId) {
  if (!confirm('Are you sure you want to delete this script?')) return;

  const { error } = await supabase.from('scripts').delete().eq('id', scriptId);
  if (error) alert(error.message);
  else loadUserScripts();
};

/* ===== CHANGE PASSWORD ===== */
changePasswordBtn.addEventListener('click', async () => {
  const newPassword = prompt('Enter your new password:');
  if (!newPassword) return;

  const { error } = await supabase
    .from('users')
    .update({ password: newPassword })
    .eq('id', currentUser.id);

  if (error) alert(error.message);
  else {
    alert('Password updated!');
    localStorage.setItem('currentUserPassword', newPassword);
  }
});

/* ===== LOGOUT ===== */
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('currentUserEmail');
  localStorage.removeItem('currentUserPassword');
  window.location.href = '../index.html';
});

/* ===== INITIAL LOAD ===== */
loadProfile();
