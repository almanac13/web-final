requireAuth();

const list = document.getElementById("list");
const msg = document.getElementById("msg");

function show(type, text) {
  msg.innerHTML = text ? `<div class="${type}">${text}</div>` : "";
}
function escapeHtml(s) {
  return String(s || "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}

(async () => {
  const res = await fetch("/my/clubs", { headers: authHeader() });
  const data = await res.json();

  if (!res.ok) return show("err", data.error || "Failed to load");

  if (data.length === 0) {
    list.innerHTML = "<small>You have not joined any clubs yet.</small>";
    return;
  }

  list.innerHTML = data.map(c => `
    <div class="card">
      <b>${escapeHtml(c.name)}</b>
      <div><small>${escapeHtml(c.category)} • Dept: ${escapeHtml(c.department || "-")}</small></div>
      <p>${escapeHtml(c.description || "")}</p>
    </div>
  `).join("");
})();
