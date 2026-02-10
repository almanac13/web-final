console.log("home.js loaded ✅");

const carousel = document.getElementById("carousel");
const allClubsBox = document.getElementById("allClubs");
const statClubs = document.getElementById("statClubs");
const search = document.getElementById("search");
const filterBadge = document.getElementById("filterBadge");

let clubs = [];

window.joinClub = async function joinClub(clubId) {
  if (!getToken()) {
    toast("err", "Login required", "Please login to request to join.");
    setTimeout(() => (window.location.href = "/login.html"), 900);
    return;
  }

  try {
    const res = await fetch(`/join/${clubId}`, {
      method: "POST",
      headers: authHeader(),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      toast("err", "Join failed", data.error || "Try again");
      return;
    }

    toast("ok", "Request sent", "Owner will review your request ✅");
  } catch (e) {
    toast("err", "Network error", e.message);
  }
};

async function loadPublicClubs() {
  try {
    const res = await fetch("/public/clubs");
    const data = await res.json();
    clubs = Array.isArray(data) ? data : [];
    statClubs.textContent = String(clubs.length);

    renderCarousel(clubs.slice(0, Math.min(10, clubs.length)));
    renderAll(clubs);
  } catch (e) {
    toast("err", "Load failed", e.message);
  }
}

function clubCard(c) {
  return `
    <div class="card">
      <div class="clubTitle">
        <b>${escapeHtml(c.name)}</b>
        <span class="badge">${escapeHtml(c.category)}</span>
      </div>
      <small>Dept: ${escapeHtml(c.department || "-")}</small>
      <p>${escapeHtml(c.description || "")}</p>
      <div class="row between">
        <button class="secondary" type="button" onclick="joinClub('${c._id}')">Request to join</button>
        <a class="nav-link" href="/club.html?id=${c._id}">Open</a>
      </div>
    </div>
  `;
}

function renderCarousel(items) {
  if (items.length === 0) {
    carousel.innerHTML = "<small>No clubs yet.</small>";
    return;
  }
  carousel.innerHTML = items.map(c => `
    <div class="card clubCard">
      <div class="badge ok">${escapeHtml(c.category)}</div>
      <h3 style="margin:10px 0 6px 0;">${escapeHtml(c.name)}</h3>
      <small>Dept: ${escapeHtml(c.department || "-")}</small>
      <p>${escapeHtml(c.description || "")}</p>
      <div class="row between">
        <button class="secondary" type="button" onclick="joinClub('${c._id}')">Join</button>
        <a class="nav-link" href="/club.html?id=${c._id}">Open</a>
      </div>
    </div>
  `).join("");

  document.getElementById("prevBtn").onclick = () => carousel.scrollBy({ left: -320, behavior: "smooth" });
  document.getElementById("nextBtn").onclick = () => carousel.scrollBy({ left: 320, behavior: "smooth" });
}

function renderAll(items) {
  if (items.length === 0) {
    allClubsBox.innerHTML = "<small>No clubs yet.</small>";
    return;
  }
  allClubsBox.innerHTML = items.map(clubCard).join("");
}

search?.addEventListener("input", () => {
  const q = (search.value || "").trim().toLowerCase();
  const filtered = clubs.filter(c =>
    (c.name || "").toLowerCase().includes(q) ||
    (c.category || "").toLowerCase().includes(q)
  );
  filterBadge.textContent = q ? `Filtered: ${filtered.length}` : "Showing all";
  renderAll(filtered);
});

loadPublicClubs();
