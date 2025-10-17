import { supabase } from './supabaseClient.js';

const logoutBtn = document.getElementById('logoutBtn');
const username = document.getElementById('username');
const email = document.getElementById('email');
const scriptsContainer = document.getElementById('scriptsContainer');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  location.href = 'index.html';
});

async function loadProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return location.href = 'index.html';

  username.textContent = `👤 ${user.user_metadata.username}`;
  email.textContent = `📧 ${user.email}`;

  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('user_id', user.id);
  if (error) console.error(error);

  scriptsContainer.innerHTML = data
    .map(
      (s) => `
      <div class="card">
        <img src="${s.icon || 'https://placehold.co/80'}">
        <h3>${s.name}</h3>
        <p>${s.game}</p>
        <button onclick="deleteScript('${s.id}')">🗑 Delete</button>
      </div>`
    )
    .join('');
}

window.deleteScript = async (id) => {
  if (!confirm('Delete this script?')) return;
  const { error } = await supabase.from('scripts').delete().eq('id', id);
  if (error) alert(error.message);
  else loadProfile();
};

changePasswordBtn.addEventListener('click', async () => {
  const newPassword = document.getElementById('newPassword').value;
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) alert(error.message);
  else alert('Password changed!');
});

deleteAccountBtn.addEventListener('click', async () => {
  alert('Account deletion should be handled by admin (Supabase restriction).');
});

loadProfile();
