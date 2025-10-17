import { supabase } from "./supabaseClient.js";

const $ = (s) => document.querySelector(s);
const authModal = $("#auth-modal");
const postModal = $("#post-modal");

let isSignup = false;

// 🔑 Auth
async function checkAuth() {
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  const authArea = document.getElementById("auth-area");

  if (user) {
    authArea.innerHTML = `<span class="muted">${user.email}</span> <button id="btn-logout" class="btn ghost">Logout</button>`;
    $("#btn-logout").onclick = async () => {
      await supabase.auth.signOut();
      location.reload();
    };
  } else {
    authArea.innerHTML = `<button id="btn-login" class="btn">Log in</button>`;
    $("#btn-login").onclick = openAuth;
  }
}

function openAuth() {
  isSignup = false;
  $("#auth-title").textContent = "Log in";
  authModal.showModal();
}

$("#auth-switch").onclick = () => {
  isSignup = !isSignup;
  $("#auth-title").textContent = isSignup ? "Sign up" : "Log in";
  $("#auth-switch").textContent = isSignup ? "Switch to Log in" : "Switch to Sign up";
};

$("#auth-cancel").onclick = () => authModal.close();

$("#auth-form").onsubmit = async (e) => {
  e.preventDefault();
  const email = $("#auth-email").value.trim();
  const pw = $("#auth-password").value;

  if (isSignup) {
    const { error } = await supabase.auth.signUp({ email, password: pw });
    if (error) return alert(error.message);
    alert("Account created successfully!");
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) return alert(error.message);
  }
  authModal.close();
  checkAuth();
};

// 📝 Post Script
$("#btn-post").onclick = async () => {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return openAuth();
  postModal.showModal();
};

$("#cancel-post").onclick = () => postModal.close();

$("#post-form").onsubmit = async (e) => {
  e.preventDefault();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return alert("You must be logged in!");

  const title = $("#post-title").value.trim();
  const game = $("#post-game").value.trim();
  const is_keyless = $("#post-keyless").value === "true";
  const icon_url = $("#post-icon").value.trim() || null;
  const description = $("#post-desc").value.trim();

  const { error } = await supabase.from("scripts").insert([
    {
      user_id: data.user.id,
      username: data.user.email.split("@")[0],
      title,
      game,
      description,
      is_keyless,
      icon_url,
    },
  ]);

  if (error) return alert(error.message);
  postModal.close();
  loadScripts();
};

// 📚 Load Scripts
async function loadScripts() {
  const search = $("#search").value.trim();
  const keyFilter = $("#filter-keyless").value;

  let { data, error } = await supabase.from("scripts").select("*").order("created_at", { ascending: false });
  if (error) return console.error(error);

  if (search)
    data = data.filter(
      (d) =>
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.game.toLowerCase().includes(search.toLowerCase())
    );
  if (keyFilter !== "all")
    data = data.filter((d) => d.is_keyless === (keyFilter === "true"));

  renderCards(data);
}

function renderCards(items) {
  const grid = $("#scripts-grid");
  grid.innerHTML = "";
  if (!items.length) return (grid.innerHTML = "<p class='muted'>No scripts found.</p>");

  items.forEach((it) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="meta">
        <div class="icon">${it.icon_url ? `<img src="${it.icon_url}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:8px">` : it.title.charAt(0)}</div>
        <div style="flex:1">
          <h4>${it.title}</h4>
          <small class="muted">${it.username} • ${it.game} • ${it.is_keyless ? "Keyless" : "Keyed"}</small>
        </div>
      </div>
      <p>${it.description}</p>
      <div class="foot">
        <small class="muted">${new Date(it.created_at).toLocaleString()}</small>
      </div>`;
    grid.appendChild(card);
  });
}

$("#search").oninput = loadScripts;
$("#filter-keyless").onchange = loadScripts;

checkAuth();
loadScripts();