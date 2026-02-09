requireAuth();

const box = document.getElementById("list");

(async () => {
  const profile = await fetchProfile();
  if (!profile || profile.role !== "owner") {
    alert("Owner only");
    location.href = "/index.html";
    return;
  }
  load();
})();

async function load() {
  const res = await fetch("/join/owner/all", { headers: authHeader() });
  const data = await res.json();

  if (!res.ok) {
    box.innerHTML = "<div class='err'>Failed</div>";
    return;
  }

  if (data.length === 0) {
    box.innerHTML = "<small>No requests</small>";
    return;
  }

  box.innerHTML = data.map(r => `
    <div class="card">
      <b>${r.user.username}</b> (${r.user.email})<br/>
      Club: ${r.club.name}<br/>
      Status: ${r.status}<br/>
      ${r.status === "pending" ? `
        <button onclick="approve('${r._id}')">Approve</button>
        <button class="danger" onclick="decline('${r._id}')">Decline</button>
      ` : ""}
    </div>
  `).join("");
}

async function approve(id) {
  await fetch(`/join/${id}/approve`, {
    method: "POST",
    headers: authHeader()
  });
  load();
}

async function decline(id) {
  await fetch(`/join/${id}/decline`, {
    method: "POST",
    headers: authHeader()
  });
  load();
}
