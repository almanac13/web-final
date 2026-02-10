const params = new URLSearchParams(location.search);
const clubId = params.get("id");

const clubName = document.getElementById("clubName");
const clubCategory = document.getElementById("clubCategory");
const clubDept = document.getElementById("clubDept");
const clubDesc = document.getElementById("clubDesc");

const joinBtn = document.getElementById("joinBtn");
const createEventBtn = document.getElementById("createEventBtn");

const evCount = document.getElementById("evCount");
const eventsList = document.getElementById("eventsList");

// modal
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const saveEventBtn = document.getElementById("saveEventBtn");

function fmtDate(d) {
  try { return new Date(d).toLocaleString(); } catch { return "-"; }
}

async function loadClub() {
  const res = await fetch(`/public/clubs/${clubId}`);
  const data = await res.json();
  if (!res.ok) {
    toast("err", "Not found", data.error || "Club not found");
    return;
  }

  clubName.textContent = data.name;
  clubCategory.textContent = data.category;
  clubDept.textContent = `Dept: ${data.department || "-"}`;
  clubDesc.textContent = data.description || "";

  // show create event if owner
  const prof = await fetchProfile();
  if (prof?.role === "owner") {
    createEventBtn.style.display = "inline-block";
  }
}

async function loadEvents() {
  const res = await fetch(`/public/clubs/${clubId}/events`);
  const data = await res.json();
  if (!res.ok) {
    toast("err", "Load failed", data.error || "Cannot load events");
    return;
  }

  evCount.textContent = String(data.length);

  if (data.length === 0) {
    eventsList.innerHTML = `<small>No events yet.</small>`;
    return;
  }

  eventsList.innerHTML = data.map(ev => `
    <div class="card">
      <div class="row between">
        <div class="row" style="align-items:center;">
          <span class="badge ${ev.type === "tournament" ? "warn" : "ok"}">${escapeHtml(ev.type)}</span>
          <b>${escapeHtml(ev.title)}</b>
        </div>
        <span class="badge">${fmtDate(ev.date)}</span>
      </div>
      <p>${escapeHtml(ev.description || "")}</p>
      <div class="row between">
        <small>Location: ${escapeHtml(ev.location || "-")} • Capacity: ${ev.capacity || 0}</small>
        <button class="secondary" type="button" onclick="registerEvent('${ev._id}')">Register</button>
      </div>
    </div>
  `).join("");
}

window.registerEvent = async function registerEvent(eventId) {
  if (!getToken()) {
    toast("err", "Login required", "Please login to register.");
    setTimeout(() => location.href = "/login.html", 900);
    return;
  }

  try {
    const res = await fetch(`/events/${eventId}/register`, {
      method: "POST",
      headers: authHeader(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast("err", "Register failed", data.error || "Try again");

    toast("ok", "Registered", "Check your email ✅");
  } catch (e) {
    toast("err", "Network error", e.message);
  }
};

joinBtn.addEventListener("click", async () => {
  if (!getToken()) {
    toast("err", "Login required", "Please login first.");
    setTimeout(() => location.href = "/login.html", 900);
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
});

// modal actions
createEventBtn.addEventListener("click", () => { modal.style.display = "block"; });
closeModal.addEventListener("click", () => { modal.style.display = "none"; });

saveEventBtn.addEventListener("click", async () => {
  const title = document.getElementById("evTitle").value.trim();
  const type = document.getElementById("evType").value;
  const date = document.getElementById("evDate").value;
  const locationV = document.getElementById("evLocation").value.trim();
  const cap = document.getElementById("evCap").value;
  const desc = document.getElementById("evDesc").value.trim();

  if (!validators.min(title, 2)) return toast("err", "Validation", "Title must be at least 2 chars");
  if (!date) return toast("err", "Validation", "Date is required");

  setBtnLoading(saveEventBtn, true, "Creating...");

  try {
    const res = await fetch(`/clubs/${clubId}/events`, {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({
        title, type, date, location: locationV, capacity: Number(cap || 0), description: desc,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBtnLoading(saveEventBtn, false);
      return toast("err", "Create failed", data.error || "Try again");
    }

    toast("ok", "Created", "Event created and members notified ✅");
    modal.style.display = "none";
    document.getElementById("evTitle").value = "";
    document.getElementById("evDate").value = "";
    document.getElementById("evLocation").value = "";
    document.getElementById("evCap").value = "0";
    document.getElementById("evDesc").value = "";
    await loadEvents();
  } catch (e) {
    toast("err", "Network error", e.message);
  } finally {
    setBtnLoading(saveEventBtn, false);
  }
});

(async () => {
  if (!clubId) {
    toast("err", "Missing id", "Open club page with ?id=...");
    return;
  }
  await loadClub();
  await loadEvents();
})();
