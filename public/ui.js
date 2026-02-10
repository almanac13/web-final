// public/ui.js
(function () {
  const wrapId = "toastWrap";

  function ensureWrap() {
    let w = document.getElementById(wrapId);
    if (!w) {
      w = document.createElement("div");
      w.id = wrapId;
      w.className = "toast-wrap";
      document.body.appendChild(w);
    }
    return w;
  }

  window.toast = function toast(type, title, message) {
    const w = ensureWrap();
    const el = document.createElement("div");
    el.className = `toast ${type === "ok" ? "ok" : "err"}`;
    el.innerHTML = `<div class="t">${escapeHtml(title)}</div><div>${escapeHtml(message || "")}</div>`;
    w.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  };

  window.escapeHtml = function escapeHtml(s) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  };

  window.setBtnLoading = function setBtnLoading(btn, isLoading, textLoading = "Loading...") {
    if (!btn) return;
    btn.disabled = isLoading;
    if (isLoading) {
      btn.dataset.oldText = btn.textContent;
      btn.textContent = textLoading;
    } else {
      btn.textContent = btn.dataset.oldText || btn.textContent;
    }
  };

  window.validators = {
    required(v) { return (v || "").trim().length > 0; },
    min(v, n) { return (v || "").trim().length >= n; },
    email(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v||"").trim()); },
  };
})();
