const grid = document.getElementById("grid");
const q = document.getElementById("q");
const cat = document.getElementById("cat");
const countBadge = document.getElementById("countBadge");

let clubs = [];

function card(c) {
  return `
    <div class="card">
      <div class="clubTitle">
        <b>${escapeHtml(c.name)}</b>
        <span class="badge">${escapeHtml(c.category || "club")}</span>
      </div>
      <small>Dept: ${escapeHtml(c.department || "-")}</small>
      <p>${escapeHtml(c.description || "")}</p>

      <div class="row between">
        <a class="nav-link" href="/club.html?id=${c._id}">Open</a>
        <button class="secondary" type="button" onclick="joinClub('${c._id}')">Join</button>
      </div>
    </div>
  `;
}

// ✅ expose for onclick
window.joinClub = async function (clubId) {
  if (!getToken()) {
    toast("err", "Login required", "Please login to join a club.");
    setTimeout(() => (location.href = "/login.html"), 900);
    return;
  }

  const res = await fetch(`/join/${clubId}`, { method: "POST", headers: authHeader() });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) return toast("err", "Join failed", data.error || "Try again");
  toast("ok", "Request sent", "Owner will review your request ✅");
};

function render(list) {
  countBadge.textContent = `${list.length} clubs`;
  if (!list.length) {
    grid.innerHTML = `<div class="card"><small>No clubs found.</small></div>`;
    return;
  }
  grid.innerHTML = list.map(card).join("");
}

function buildCategories(items) {
  const cats = [...new Set(items.map(x => (x.category || "").trim()).filter(Boolean))].sort();
  cat.innerHTML = `<option value="">All categories</option>` + cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
}

function filterNow() {
  const text = (q.value || "").trim().toLowerCase();
  const category = cat.value;

  const filtered = clubs.filter(c => {
    const okText =
      (c.name || "").toLowerCase().includes(text) ||
      (c.category || "").toLowerCase().includes(text);
    const okCat = !category || c.category === category;
    return okText && okCat;
  });

  render(filtered);
}

(async () => {
  try {
    const res = await fetch("/public/clubs");
    const data = await res.json();
    clubs = Array.isArray(data) ? data : [];

    buildCategories(clubs);
    render(clubs);

    q.addEventListener("input", filterNow);
    cat.addEventListener("change", filterNow);
  } catch (e) {
    toast("err", "Load failed", e.message);
  }
})();
