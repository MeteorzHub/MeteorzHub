import { supabase } from '../supabaseClient.js';

/* ===== DOM ELEMENTS ===== */
const scriptsContainer = document.getElementById('userScriptsContainer');
const usernameEl = document.getElementById('usernameDisplay');
const emailEl = document.getElementById('emailDisplay');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const logoutBtn = document.getElementById('logoutBtn');

/* ===== GET CURRENT USER ===== */
async function loadProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert('Please log in!');
    window.location.href = '/';
    return;
  }

  usernameEl.innerText = user.user_metadata.username || 'Unknown';
  emailEl.innerText = user.email;

  loadUserScripts(user.id);
}

/* ===== LOAD USER SCRIPTS ===== */
async function loadUserScripts(userId) {
  const { data, error } = await supabase.from('scripts').select('*').eq('user_id', userId);
  if (error) return console.error(error);

  scriptsContainer.innerHTML = data
    .map(
      (s) => `
    <div class="card">
      <img src="${s.icon || 'https://placehold.co/80'}" alt="${s.name}">
      <h3>${s.name}</h3>
      <p><b>Game:</b> ${s.game}</p>
      <p><b>Keyless:</b> ${s.keyless}</p>
      <button onclick="copyScript(\`${s.script}\`)">📋 Copy Script</button>
      <button onclick="deleteScript('${s.id}')">❌ Delete Script</button>
    </div>`
    )
    .join('');
}

/* ===== COPY SCRIPT ===== */
window.copyScript = function (script) {
  navigator.clipboard.writeText(script);
  alert('Script copied!');
};

/* ===== DELETE SCRIPT ===== */
window.deleteScript = async function (scriptId) {
  if (!confirm('Are you sure you want to delete this script?')) return;

  const { error } = await supabase.from('scripts').delete().eq('id', scriptId);
  if (error) alert(error.message);
  else loadProfile();
};

/* ===== CHANGE PASSWORD ===== */
changePasswordBtn.addEventListener('click', async () => {
  const newPassword = prompt('Enter your new password:');
  if (!newPassword) return;

  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) alert(error.message);
  else alert('Password updated!');
});

/* ===== LOGOUT ===== */
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = '/';
});

/* ===== INITIAL LOAD ===== */
loadProfile();
