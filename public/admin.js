requireAuth();

const requestsBox = document.getElementById("requests");
const clubsBox = document.getElementById("clubs");
const reqMsg = document.getElementById("reqMsg");
const clubMsg = document.getElementById("clubMsg");

function show(el, type, text) {
  el.innerHTML = text ? `<div class="${type}">${text}</div>` : "";
}

(async () => {
  const profile = await fetchProfile();
  if (!profile || profile.role !== "admin") {
    alert("Admin access only");
    window.location.href = "/index.html";
    return;
  }
  loadRequests();
  loadClubs();
})();

async function loadRequests() {
  const res = await fetch("/admin/key-requests", { headers: authHeader() });
  const data = await res.json();

  if (!res.ok) {
    requestsBox.innerHTML = "";
    return show(reqMsg, "err", data.error || "Failed to load requests");
  }

  if (data.length === 0) {
    requestsBox.innerHTML = `<small>No requests yet.</small>`;
    return;
  }

  requestsBox.innerHTML = data.map(r => `
    <div class="card">
      <b>${escapeHtml(r.name)}</b> (${escapeHtml(r.email)})<br/>
      Dept: ${escapeHtml(r.department)}<br/>
      Status: <b>${escapeHtml(r.status)}</b><br/>
      <div class="row" style="margin-top:10px;">
        <button onclick="approve('${r._id}')">Approve</button>
        <button class="danger" onclick="decline('${r._id}')">Decline</button>
      </div>
    </div>
  `).join("");
}

async function approve(id) {
  const res = await fetch(`/admin/key-requests/${id}/approve`, {
    method: "POST",
    headers: authHeader()
  });
  const data = await res.json();

  if (!res.ok) return show(reqMsg, "err", data.error || "Approve failed");

  show(reqMsg, "ok", `Approved ✅ Key sent: <b>${data.key}</b> (check email activity)`);
  loadRequests();
}

async function decline(id) {
  const res = await fetch(`/admin/key-requests/${id}/decline`, {
    method: "POST",
    headers: authHeader()
  });
  const data = await res.json();

  if (!res.ok) return show(reqMsg, "err", data.error || "Decline failed");

  show(reqMsg, "ok", "Declined ✅ Email sent");
  loadRequests();
}

async function loadClubs() {
  const res = await fetch("/admin/clubs", { headers: authHeader() });
  const data = await res.json();

  if (!res.ok) {
    clubsBox.innerHTML = "";
    return show(clubMsg, "err", data.error || "Failed to load clubs");
  }

  if (data.length === 0) {
    clubsBox.innerHTML = `<small>No clubs yet.</small>`;
    return;
  }

  clubsBox.innerHTML = data.map(c => `
    <div class="card">
      <b>${escapeHtml(c.name)}</b> — ${escapeHtml(c.category)}<br/>
      Dept: ${escapeHtml(c.department || "-")}<br/>
      Owner: ${escapeHtml(c.owner?.email || "-")}<br/>
      <div class="row" style="margin-top:10px;">
        <button class="danger" onclick="deleteClub('${c._id}')">Delete</button>
      </div>
    </div>
  `).join("");
}

async function deleteClub(id) {
  if (!confirm("Delete this club?")) return;

  const res = await fetch(`/admin/clubs/${id}`, {
    method: "DELETE",
    headers: authHeader()
  });
  const data = await res.json();

  if (!res.ok) return show(clubMsg, "err", data.error || "Delete failed");

  show(clubMsg, "ok", "Club deleted ✅ Owner notified by email");
  loadClubs();
}

function escapeHtml(s) {
  return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
