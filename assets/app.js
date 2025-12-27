// ==============================
// ARH Rentals Frontend JS (Stable Base)
// - Works with current demo UI
// - Adds safe hooks for future OTP + paid unlock
// - Supports multiple pages (index/listings/property/pricing/post)
// ==============================

// Backend base URL (Cloudflare Worker)
const API_BASE = "https://arh-backend.manishsoni696.workers.dev";

// Phase-1 allowed pincodes (frontend fallback; backend is source of truth)
const ALLOWED_PINCODES = ["125001", "125005"];

// ------------------------------
// Utilities
// ------------------------------
function $(id) {
  return document.getElementById(id);
}

function setText(el, text, color = "") {
  if (!el) return;
  el.innerText = text;
  if (color) el.style.color = color;
}

function isValidIndianMobile(mobile) {
  return /^[6-9]\d{9}$/.test((mobile || "").trim());
}

// ------------------------------
// PINCODE CHECK (used on home)
// ------------------------------
async function checkPincode() {
  const pin = $("pincode")?.value?.trim();
  const result = $("pin-result");

  if (!pin) {
    setText(result, "Please enter pincode", "red");
    return;
  }

  // Quick frontend check (optional)
  if (pin.length !== 6) {
    setText(result, "Enter a valid 6-digit pincode", "red");
    return;
  }

  // Backend check (source of truth)
  try {
    setText(result, "Checking...", "#999");

    const res = await fetch(`${API_BASE}/check-pincode?pincode=${encodeURIComponent(pin)}`);
    const data = await res.json();

    if (data?.success && data?.allowed) {
      setText(result, "✅ Service available in your area", "green");
      // Save selection for future pages
      localStorage.setItem("arh_pincode", pin);
    } else {
      setText(result, "❌ Service not available in this area", "red");
    }
  } catch (e) {
    // Fallback if backend unreachable
    if (ALLOWED_PINCODES.includes(pin)) {
      setText(result, "✅ Service available (offline fallback)", "green");
      localStorage.setItem("arh_pincode", pin);
    } else {
      setText(result, "❌ Network error. Please try again.", "red");
    }
  }
}

// Expose to inline HTML buttons (if used)
window.checkPincode = checkPincode;

// ------------------------------
// UNLOCK DEMO (works on all pages)
// ------------------------------
function attachUnlockHandlers() {
  // Buttons with text "Unlock" OR explicit data-action="unlock"
  const buttons = Array.from(document.querySelectorAll("button, a"))
    .filter((el) => {
      const t = (el.textContent || "").toLowerCase();
      const action = (el.getAttribute("data-action") || "").toLowerCase();
      return t.includes("unlock") || action === "unlock";
    });

  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // If it's an <a>, prevent navigation for demo
      if (btn.tagName.toLowerCase() === "a") e.preventDefault();

      alert(
        "Unlock coming soon ✅\n\n" +
          "Next we will add:\n" +
          "• OTP verification\n" +
          "• Paid plans (Unlock 5 / 10 listings)\n" +
          "• Owner post + manage listings\n\n" +
          "For now, this is a demo button."
      );
    });
  });
}

// ------------------------------
// FUTURE HOOKS (no UI change now)
// These are placeholders so later we can connect real OTP + plans
// ------------------------------

// Future: open OTP modal/page (placeholder)
function startOtpFlow() {
  alert("OTP login will be added next (UI + backend integration).");
}
window.startOtpFlow = startOtpFlow;

// Future: check if user has an active unlock plan (placeholder)
function hasActiveUnlock() {
  // Later we will store unlock state in KV/D1 and a token in localStorage
  // For now, always false
  return false;
}

// Future: mark listing as rented/sold (placeholder)
function markAsRented(listingId) {
  // Later: call API to update listing status
  console.log("Mark as rented (future):", listingId);
}

// ------------------------------
// Boot
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  attachUnlockHandlers();

  // Optional: show saved pincode in input (if exists)
  const savedPin = localStorage.getItem("arh_pincode");
  const pinInput = $("pincode");
  if (pinInput && savedPin && !pinInput.value) pinInput.value = savedPin;
});
