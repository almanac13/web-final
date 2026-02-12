(async () => {
  let navLinks = document.getElementById("navLinks") || document.querySelector(".nav-left");
  let navRight = document.getElementById("navRight") || document.querySelector(".nav-right");
  if (!navLinks || !navRight) return;

  const profile = await fetchProfile();

  // Brand (always)
  navLinks.innerHTML = `
    <a class="brand" href="/index.html">
      <span class="logo"></span>
      <span>Astana IT University Club Hub</span>
    </a>
  `;

  // Not logged in
  if (!profile) {
    navLinks.innerHTML += `
      <a class="nav-link" href="/clubs.html">Clubs Store</a>
    `;
    navRight.innerHTML = `
      <a class="nav-link" href="/login.html">Login</a>
      <a class="nav-link" href="/register.html">Register</a>
    `;
    return;
  }

  // Logged in (base links)
  navLinks.innerHTML += `
    <a class="nav-link" href="/clubs.html">Clubs</a>
    <a class="nav-link" href="/my-clubs.html">My Clubs</a>
    <a class="nav-link" href="/my-events.html">My Events</a>
    <a class="nav-link" href="/profile.html">Profile</a>
  `;

  // Role links
  if (profile.role === "owner") {
    navLinks.innerHTML += `<a class="nav-link" href="/owner-requests.html">Requests</a>`;
  }

  if (profile.role === "admin") {
    navLinks.innerHTML += `<a class="nav-link" href="/admin.html">Admin</a>`;
  }

  // Right side user box
  navRight.innerHTML = `
    <div class="row" style="align-items:center;">
      <div style="text-align:right;">
        <div style="font-weight:900;">${escapeHtml(profile.username)}</div>
        <div style="font-size:12px; color:var(--muted);">${escapeHtml(profile.role)}</div>
      </div>
      <button class="secondary" type="button" onclick="logout()">Logout</button>
    </div>
  `;
})();

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
