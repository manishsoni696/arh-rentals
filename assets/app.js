// ARH Rentals Frontend JS (Single file for all pages)
const API_BASE = "https://arh-backend.manishsoni696.workers.dev";

// Helper
function $(id){ return document.getElementById(id); }

// ===== PINCODE CHECK =====
async function checkPincode() {
  const pin = $("pincode")?.value?.trim();
  const result = $("pin-result");

  if (!pin) {
    if (result) {
      result.textContent = "Please enter pincode";
      result.style.color = "#ff6b6b";
    }
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/check-pincode?pincode=${encodeURIComponent(pin)}`, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });
    const data = await res.json();

    if (result) {
      if (data.allowed) {
        result.textContent = "✅ Service available in your area";
        result.style.color = "#6ee7a8";
      } else {
        result.textContent = "❌ Service not available in this area";
        result.style.color = "#ff6b6b";
      }
    }
  } catch (e) {
    if (result) {
      result.textContent = "❌ Network error. Please try again.";
      result.style.color = "#ff6b6b";
    }
  }
}

// Compatibility: if any page uses onclick="unlock()"
function unlock() {
  alert(
    "Unlock coming soon ✅\n\n" +
    "Next we will add OTP verification + paid plans.\n" +
    "For now, this is a demo button."
  );
}

// Attach unlock handlers for any button having "Unlock"
function attachUnlockHandlers() {
  const buttons = Array.from(document.querySelectorAll("button"))
    .filter((b) => (b.textContent || "").toLowerCase().includes("unlock"));

  buttons.forEach((btn) => {
    // Prevent double binding
    if (btn.dataset.unlockBound === "1") return;
    btn.dataset.unlockBound = "1";
    btn.addEventListener("click", (e) => {
      // If page uses inline unlock(), this is fine too.
      unlock();
    });
  });
}

// Simple sorting demo (if listings page has sort select)
function attachSortDemo() {
  const sort = $("sortBy");
  const wrap = $("listingWrap");
  if (!sort || !wrap) return;

  sort.addEventListener("change", () => {
    // Demo sort: only rearrange DOM blocks by data attributes
    const items = Array.from(wrap.querySelectorAll(".listing"));
    const val = sort.value;

    items.sort((a,b) => {
      const ra = Number(a.dataset.rent || "0");
      const rb = Number(b.dataset.rent || "0");
      if (val === "rent-asc") return ra - rb;
      if (val === "rent-desc") return rb - ra;
      return 0;
    });

    items.forEach(i => wrap.appendChild(i));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  attachUnlockHandlers();
  attachSortDemo();
});

// Expose globally for inline onclick
window.checkPincode = checkPincode;
window.unlock = unlock;
