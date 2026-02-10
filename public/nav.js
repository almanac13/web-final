(async () => {
  const navLinks = document.getElementById("navLinks");
  const navRight = document.getElementById("navRight");
  if (!navLinks || !navRight) return;

  const profile = await fetchProfile();

  // left
  navLinks.innerHTML = `
    <a class="brand" href="/index.html">
      <span class="logo"></span><span>Clubs Hub</span>
    </a>
    <a class="nav-link" href="/clubs.html">Clubs</a>
  `;

  if (!profile) {
    navRight.innerHTML = `
      <a class="nav-link" href="/login.html">Login</a>
      <a class="nav-link" href="/register.html">Register</a>
    `;
    return;
  }

  // add more links
  navLinks.innerHTML += `
    <a class="nav-link" href="/my-clubs.html">My Clubs</a>
    
    <a class="nav-link" href="/profile.html">Profile</a>
    <a class="nav-link" href="/request-key.html">Request Key</a>
  `;
  navLinks.innerHTML += `<a class="nav-link" href="/my-events.html">My Events</a>`;


  if (profile.role === "owner") {
    navLinks.innerHTML += `<a class="nav-link" href="/owner-requests.html">Requests</a>`;
  }
  if (profile.role === "admin") {
    navLinks.innerHTML += `<a class="nav-link" href="/admin.html">Admin</a>`;
  }

  // right
  navRight.innerHTML = `
    <span class="badge">${escapeHtml(profile.username)} (${escapeHtml(profile.role)})</span>
    <button class="secondary" onclick="logout()">Logout</button>
  `;
})();
