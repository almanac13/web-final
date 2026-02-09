console.log("home.js loaded ✅");

const carousel = document.getElementById("carousel");
const allClubsBox = document.getElementById("allClubs");
const statClubs = document.getElementById("statClubs");
const search = document.getElementById("search");

let clubs = [];

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// ✅ IMPORTANT: expose joinClub to window so onclick works
window.joinClub = async function joinClub(clubId) {
  console.log("joinClub clicked:", clubId);

  if (!getToken()) {
    alert("Please login first");
    window.location.href = "/login.html";
    return;
  }

  const res = await fetch(`/join/${clubId}`, {
    method: "POST",
    headers: authHeader()
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Failed to send join request");
    return;
  }

  alert("Join request sent ✅");
};

async function loadPublicClubs() {
  const res = await fetch("/public/clubs");
  const data = await res.json();

  clubs = Array.isArray(data) ? data : [];
  statClubs.innerText = String(clubs.length);

  renderCarousel(clubs.slice(0, Math.min(10, clubs.length)));
  renderAll(clubs);
}

function renderCarousel(items) {
  if (items.length === 0) {
    carousel.innerHTML = "<small>No clubs yet.</small>";
    return;
  }

  carousel.innerHTML = items.map(c => `
    <div class="card clubCard">
      <div class="tag">${escapeHtml(c.category)}</div>
      <h3 style="margin:10px 0 6px 0;">${escapeHtml(c.name)}</h3>
      <small>Dept: ${escapeHtml(c.department || "-")}</small>
      <p>${escapeHtml(c.description || "")}</p>
      <button type="button" class="secondary" onclick="joinClub('${c._id}')">Request to join</button>
    </div>
  `).join("");
}

function renderAll(items) {
  if (items.length === 0) {
    allClubsBox.innerHTML = "<small>No clubs yet.</small>";
    return;
  }

  allClubsBox.innerHTML = items.map(c => `
    <div class="card">
      <div class="row" style="align-items:center; justify-content:space-between;">
        <div>
          <b>${escapeHtml(c.name)}</b>
          <div><small>${escapeHtml(c.category)} • Dept: ${escapeHtml(c.department || "-")}</small></div>
        </div>
        <button type="button" class="secondary" onclick="joinClub('${c._id}')">Join</button>
      </div>
      <p style="margin-top:10px;">${escapeHtml(c.description || "")}</p>
    </div>
  `).join("");
}

// buttons for carousel
document.getElementById("prevBtn").addEventListener("click", () => {
  carousel.scrollBy({ left: -320, behavior: "smooth" });
});
document.getElementById("nextBtn").addEventListener("click", () => {
  carousel.scrollBy({ left: 320, behavior: "smooth" });
});

// search filter
search.addEventListener("input", () => {
  const q = search.value.trim().toLowerCase();
  const filtered = clubs.filter(c =>
    (c.name || "").toLowerCase().includes(q) ||
    (c.category || "").toLowerCase().includes(q)
  );
  renderAll(filtered);
});

loadPublicClubs();
