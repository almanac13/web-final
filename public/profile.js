requireAuth();

const msgEl = document.getElementById("msg");

function show(type, text) {
  msgEl.innerHTML = text ? `<div class="${type}">${text}</div>` : "";
}

(async () => {
  const navRight = document.getElementById("navRight");
  const profile = await fetchProfile();
  if (!profile) return (window.location.href = "/login.html");

  navRight.innerHTML = `<span style="margin-right:12px;">${profile.username}</span>
    <button class="secondary" onclick="logout()">Logout</button>`;

  document.getElementById("username").value = profile.username || "";
  document.getElementById("email").value = profile.email || "";
})();

async function saveProfile() {
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();

  if (username.length < 3) return show("err", "Username must be at least 3 characters.");
  if (!email.includes("@")) return show("err", "Email looks invalid.");

  const res = await fetch("/users/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ username, email })
  });

  const data = await res.json();

  if (!res.ok) {
    return show("err", data.error || "Update failed");
  }

  show("ok", "Profile updated!");
}
