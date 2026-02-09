(async () => {
  const navRight = document.getElementById("navRight");
  const navLinks = document.getElementById("navLinks");
  if (!navRight || !navLinks) return;

  const profile = await fetchProfile();

  if (!profile) {
    navLinks.innerHTML = `
      <a href="/index.html"><b>Clubs Hub</b></a>
      <a href="/clubs.html">Clubs</a>
      
    `;
    navRight.innerHTML = `<a href="/login.html">Login</a>`;
    return;
  }

  navRight.innerHTML = `
    <span style="margin-right:12px;">${profile.username} (${profile.role})</span>
    <button class="secondary" onclick="logout()">Logout</button>
  `;

  let links = `
    <a href="/index.html"><b>Clubs Hub</b></a>
    <a href="/clubs.html">Clubs</a>
    <a href="/profile.html">Profile</a>
    <a href="/my-clubs.html">My Clubs</a>
    <a href="/request-key.html">Request Key</a>
  `;

  if (profile.role === "admin") {
    links += `<a href="/admin.html">Admin</a>`;
  }
  if (profile.role === "owner") {
  links += `<a href="/owner-requests.html">Requests</a>`;
}


  navLinks.innerHTML = links;
})();
