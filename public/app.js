function getToken() {
  return localStorage.getItem("token");
}
function setToken(t) {
  localStorage.setItem("token", t);
}
function clearToken() {
  localStorage.removeItem("token");
}

function authHeader() {
  const token = getToken();
  return token ? { Authorization: "Bearer " + token } : {};
}

function requireAuth() {
  if (!getToken()) window.location.href = "/login.html";
}

async function fetchProfile() {
  const res = await fetch("/users/profile", { headers: { ...authHeader() } });
  if (!res.ok) return null;
  return res.json();
}

async function logout() {
  clearToken();
  window.location.href = "/login.html";
}
