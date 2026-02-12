const grid = document.getElementById("grid");
const q = document.getElementById("q");
const cat = document.getElementById("cat");
const countBadge = document.getElementById("countBadge");

// create section
const openCreateClub = document.getElementById("openCreateClub");
const createHint = document.getElementById("createHint");

// modal
const clubModal = document.getElementById("clubModal");
const closeClubModal = document.getElementById("closeClubModal");
const createClubBtn = document.getElementById("createClubBtn");

const clubName = document.getElementById("clubName");
const clubCategory = document.getElementById("clubCategory");
const clubDept = document.getElementById("clubDept");
const clubDesc = document.getElementById("clubDesc");

let clubs = [];
let profile = null;

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

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

// ✅ expose joinClub for onclick
window.joinClub = async function (clubId) {
  if (!getToken()) {
    toast("err", "Login required", "Please login to join a club.");
    setTimeout(() => (location.href = "/login.html"), 900);
    return;
  }

  try {
    const res = await fetch(`/join/${clubId}`, { method: "POST", headers: authHeader() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast("err", "Join failed", data.error || "Try again");

    toast("ok", "Request sent", "Owner will review your request ✅");
  } catch (e) {
    toast("err", "Network error", e.message);
  }
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
  cat.innerHTML =
    `<option value="">All categories</option>` +
    cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
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

function openModal() {
  clubModal.style.display = "block";
}
function closeModal() {
  clubModal.style.display = "none";
}

openCreateClub.addEventListener("click", async () => {
  if (!getToken()) {
    toast("err", "Login required", "Login first to create a club.");
    setTimeout(() => (location.href = "/login.html"), 900);
    return;
  }

  if (!profile) profile = await fetchProfile().catch(() => null);

  // ✅ info text
  createHint.textContent = "Enter department key to create a club (role becomes owner).";

  openModal();
});

closeClubModal.addEventListener("click", closeModal);

// close modal when click outside
clubModal.addEventListener("click", (e) => {
  if (e.target === clubModal) closeModal();
});

createClubBtn.addEventListener("click", async () => {
  if (!profile && getToken()) profile = await fetchProfile().catch(() => null);

  const name = clubName.value.trim();
  const category = clubCategory.value.trim();
  const department = clubDept.value.trim();
  const description = clubDesc.value.trim();

  const deptKeyEl = document.getElementById("deptKey");
  const departmentKey = (deptKeyEl ? deptKeyEl.value : "").trim();

  if (name.length < 2) return toast("err", "Validation", "Club name must be at least 2 chars");
  if (category.length < 2) return toast("err", "Validation", "Category must be at least 2 chars");
  if (description.length < 5) return toast("err", "Validation", "Description must be at least 5 chars");
  if (departmentKey.length < 4) return toast("err", "Validation", "Department key is required");

  setBtnLoading(createClubBtn, true, "Creating...");

  try {
    const res = await fetch("/clubs", {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, department, description, departmentKey }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return toast("err", "Create failed", data.error || "Try again");
    }

    // ✅ save new token with updated role
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    toast("ok", "Created", "Club created ✅ Your role is now owner.");

    // reset
    clubName.value = "";
    clubCategory.value = "";
    clubDept.value = "";
    clubDesc.value = "";
    if (deptKeyEl) deptKeyEl.value = "";

    closeModal();

    // reload clubs + refresh navbar role
    setTimeout(() => location.reload(), 350);
  } catch (e) {
    toast("err", "Network error", e.message);
  } finally {
    setBtnLoading(createClubBtn, false);
  }
});

async function loadClubs() {
  const res = await fetch("/public/clubs");
  const data = await res.json().catch(() => []);
  clubs = Array.isArray(data) ? data : [];
  buildCategories(clubs);
  render(clubs);
}

(async () => {
  // profile optional
  if (getToken()) profile = await fetchProfile().catch(() => null);

  createHint.textContent = getToken()
    ? "Enter department key to create a club (role becomes owner)."
    : "Login to create a club.";

  await loadClubs();

  q.addEventListener("input", filterNow);
  cat.addEventListener("change", filterNow);
})();
