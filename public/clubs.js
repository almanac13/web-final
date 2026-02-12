requireAuth();

const msgEl = document.getElementById("msg");
const listEl = document.getElementById("list");

function show(type, text) {
  msgEl.innerHTML = text ? `<div class="${type}">${text}</div>` : "";
}

(async () => {
  const navRight = document.getElementById("navRight");
  const profile = await fetchProfile();
  navRight.innerHTML = profile
    ? `<span style="margin-right:12px;">${profile.username}</span>
       <button class="secondary" onclick="logout()">Logout</button>`
    : `<a href="/login.html">Login</a>`;
})();

async function loadClubs() {
  show("", "");
  const res = await fetch("/clubs", { headers: { ...authHeader() } });
  const data = await res.json();

  if (!res.ok) {
    show("err", data.error || "Failed to load clubs");
    return;
  }

  if (data.length === 0) {
    listEl.innerHTML = "<p><small>No clubs yet.</small></p>";
    return;
  }

  listEl.innerHTML = data.map(c => `
    <div class="card">
      <b>${escapeHtml(c.name)}</b> <small>(${escapeHtml(c.category)})</small>
      <p>${escapeHtml(c.description || "")}</p>
      ${c.department ? `<p><small>Department: ${escapeHtml(c.department)}</small></p>` : ""}

      <details>
        <summary>Edit</summary>
        <div class="row">
          <input class="half" id="n-${c._id}" value="${escapeAttr(c.name)}" />
          <input class="half" id="cat-${c._id}" value="${escapeAttr(c.category)}" />
        </div>
        <textarea id="d-${c._id}">${escapeHtml(c.description || "")}</textarea>
        <button onclick="updateClub('${c._id}')">Save</button>
      </details>

      <div class="row" style="margin-top:10px;">
        <button class="danger" onclick="deleteClub('${c._id}')">Delete</button>
      </div>
    </div>
  `).join("");
}

async function createClub() {
  const name = document.getElementById("name").value.trim();
  const category = document.getElementById("category").value.trim();
  const description = document.getElementById("description").value.trim();
  const departmentKey = document.getElementById("deptKey").value.trim(); // ✅

  // client validation
  if (name.length < 2) return show("err", "Name must be at least 2 characters.");
  if (category.length < 2) return show("err", "Category must be at least 2 characters.");
  if (!departmentKey) return show("err", "Department Key is required to create a club.");

  const res = await fetch("/clubs", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ name, category, description, departmentKey })
  });

  const data = await res.json();

  // ✅ show 403 nicely
  if (res.status === 403) {
    return show("err", data.error || "Invalid/required department key.");
  }
  if (!res.ok) {
    return show("err", data.error || "Create failed");
  }

  // clear inputs (keep deptKey optional to keep)
  document.getElementById("name").value = "";
  document.getElementById("category").value = "";
  document.getElementById("description").value = "";
  // document.getElementById("deptKey").value = ""; // можно оставить ключ, чтобы не вводить заново

  show("ok", "Club created!");
  loadClubs();
}

async function updateClub(id) {
  const name = document.getElementById(`n-${id}`).value.trim();
  const category = document.getElementById(`cat-${id}`).value.trim();
  const description = document.getElementById(`d-${id}`).value.trim();

  if (name.length < 2) return show("err", "Name must be at least 2 characters.");
  if (category.length < 2) return show("err", "Category must be at least 2 characters.");

  const res = await fetch("/clubs/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ name, category, description })
  });

  const data = await res.json();
  if (!res.ok) return show("err", data.error || "Update failed");

  show("ok", "Updated!");
  loadClubs();
}

async function deleteClub(id) {
  const res = await fetch("/clubs/" + id, {
    method: "DELETE",
    headers: { ...authHeader() }
  });

  const data = await res.json();
  if (!res.ok) return show("err", data.error || "Delete failed");

  show("ok", "Deleted!");
  loadClubs();
}

// helpers
function escapeHtml(s) {
  return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
function escapeAttr(s) {
  return escapeHtml(s).replaceAll('"',"&quot;");
}

loadClubs();
