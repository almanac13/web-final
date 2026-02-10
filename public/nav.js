// Обновленный nav.js
(async () => {
  // Находим элементы по ID или по классу
  let navLinks = document.getElementById("navLinks");
  let navRight = document.getElementById("navRight");
  
  // Если не найдены по ID, ищем по классу
  if (!navLinks) navLinks = document.querySelector('.nav-left');
  if (!navRight) navRight = document.querySelector('.nav-right');
  
  if (!navLinks || !navRight) return;

  const profile = await fetchProfile();

  // Left navigation
  navLinks.innerHTML = `
    <a href="/index.html" style="display: flex; align-items: center; gap: 10px; font-weight: 700; color: inherit; text-decoration: none;">
      <span style="width: 30px; height: 30px; border-radius: 10px; background: linear-gradient(135deg, #2563eb, #60a5fa);"></span>
      <span>Clubs Hub</span>
    </a>
    <a href="/clubs.html" style="padding: 10px 14px; border-radius: 12px; color: #475569; text-decoration: none;">Clubs</a>
  `;

  if (!profile) {
    navRight.innerHTML = `
      <a href="/login.html" style="padding: 10px 14px; border-radius: 12px; color: #475569; text-decoration: none;">Login</a>
      <a href="/register.html" style="padding: 10px 14px; border-radius: 12px; color: #475569; text-decoration: none;">Register</a>
    `;
    return;
  }

  // Add more links
  navLinks.innerHTML += `
    <a href="/my-clubs.html" style="padding: 10px 14px; border-radius: 12px; color: #475569; text-decoration: none;">My Clubs</a>
    <a href="/profile.html" style="padding: 10px 14px; border-radius: 12px; color: #2563eb; text-decoration: none;">Profile</a>
    <a href="/request-key.html" style="padding: 10px 14px; border-radius: 12px; color: #475569; text-decoration: none;">Request Key</a>
    <a href="/my-events.html" style="padding: 10px 14px; border-radius: 12px; color: #475569; text-decoration: none;">My Events</a>
  `;

  if (profile.role === "owner") {
    navLinks.innerHTML += `<a href="/owner-requests.html" style="padding: 10px 14px; border-radius: 12px; color: #475569; text-decoration: none;">Requests</a>`;
  }
  if (profile.role === "admin") {
    navLinks.innerHTML += `<a href="/admin.html" style="padding: 10px 14px; border-radius: 12px; color: #475569; text-decoration: none;">Admin</a>`;
  }

  // Right side
  navRight.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="text-align: right;">
        <div style="font-weight: 500;">${escapeHtml(profile.username)}</div>
        <div style="font-size: 0.8rem; color: #64748b;">${escapeHtml(profile.role)}</div>
      </div>
      <button onclick="logout()" style="padding: 8px 16px; border-radius: 10px; background: rgba(15,23,42,.06); border: 1px solid rgba(15,23,42,.12); cursor: pointer;">Logout</button>
    </div>
  `;
})();

function escapeHtml(s) {
  return String(s || "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}