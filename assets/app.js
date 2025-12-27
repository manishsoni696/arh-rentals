// ARH Rentals Frontend JS
// Backend base URL (your Cloudflare Worker)
const API_BASE = "https://arh-backend.manishsoni696.workers.dev";

// ===== PINCODE CHECK (already used on home) =====
async function checkPincode() {
  const pin = document.getElementById("pincode")?.value?.trim();
  const result = document.getElementById("pin-result");

  if (!pin) {
    if (result) {
      result.innerText = "Please enter pincode";
      result.style.color = "red";
    }
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/check-pincode?pincode=${encodeURIComponent(pin)}`);
    const data = await res.json();

    if (data.allowed) {
      if (result) {
        result.innerText = "✅ Service available in your area";
        result.style.color = "green";
      }
    } else {
      if (result) {
        result.innerText = "❌ Service not available in this area";
        result.style.color = "red";
      }
    }
  } catch (e) {
    if (result) {
      result.innerText = "❌ Network error. Please try again.";
      result.style.color = "red";
    }
  }
}

// ===== UNLOCK BUTTON DEMO (single-step improvement) =====
// This will make ALL "Unlock Details" buttons show a friendly message.
function attachUnlockHandlers() {
  const buttons = Array.from(document.querySelectorAll("button"))
    .filter((b) => (b.textContent || "").toLowerCase().includes("unlock"));

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      alert(
        "Unlock coming soon ✅\n\n" +
        "Next we will add OTP verification + paid plans.\n" +
        "For now, this is a demo button."
      );
    });
  });
}

// Attach on load
document.addEventListener("DOMContentLoaded", () => {
  attachUnlockHandlers();
});
