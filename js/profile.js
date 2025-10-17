import { supabase } from "./supabaseClient.js";

const $ = (s) => document.querySelector(s);

async function loadProfile() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return (location.href = "index.html");

  $("#username-title").textContent = data.user.email;

  const { data: scripts } = await supabase
    .from("scripts")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });

  renderMyScripts(scripts);
}

function renderMyScripts(items) {
  const grid = $("#my-scripts");
  grid.innerHTML = "";
  if (!items.length) return (grid.innerHTML = "<p class='muted'>No scripts yet.</p>");

  items.forEach((it) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h4>${it.title}</h4>
      <small class="muted">${it.game} • ${it.is_keyless ? "Keyless" : "Keyed"}</small>
      <p>${it.description}</p>
      <button class="btn ghost delete" data-id="${it.id}">Delete</button>
    `;
    grid.appendChild(card);
  });

  document.querySelectorAll(".delete").forEach((b) =>
    b.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (!confirm("Delete this script?")) return;
      const { error } = await supabase.from("scripts").delete().eq("id", id);
      if (error) alert(error.message);
      else loadProfile();
    })
  );
}

$("#btn-logout").onclick = async () => {
  await supabase.auth.signOut();
  location.href = "index.html";
};

$("#btn-change-pw").onclick = async () => {
  const newPw = $("#new-password").value.trim();
  if (!newPw) return alert("Enter a new password.");
  const { error } = await supabase.auth.updateUser({ password: newPw });
  if (error) alert(error.message);
  else alert("Password changed!");
};

loadProfile();
