// ===============================
// PINCODE GATE (MUST before payment)
// ===============================

let PINCODES = { allowed: [], publicAllowed: [] };

async function loadPincodes() {
  try {
    // pricing/ page se ../assets/app.js load hota hai, isliye json ka path relative same folder:
    const res = await fetch("../assets/allowed_pincodes.json", { cache: "no-store" });
    if (!res.ok) throw new Error("pincode json not found");
    PINCODES = await res.json();
  } catch (e) {
    console.warn("Pincode list load failed:", e);
    // fail-safe: agar file load na ho, payment block rakho
    PINCODES = { allowed: [], publicAllowed: [] };
  }
}

// Call once on load
loadPincodes();

function normalizePincode(pin) {
  return String(pin || "").trim().replace(/\D/g, "").slice(0, 6);
}

function isPincodeAllowed(pin) {
  const p = normalizePincode(pin);
  return PINCODES.allowed.includes(p);
}

// UI me sirf publicAllowed दिखाना (125033 kabhi show nahi hoga)
function publicAllowedText() {
  return (PINCODES.publicAllowed && PINCODES.publicAllowed.length)
    ? PINCODES.publicAllowed.join(", ")
    : "125001, 125004, 125005";
}

/**
 * Returns {ok:true, pincode:"125001"} or {ok:false}
 * This must be called BEFORE Razorpay open
 */
async function askAndValidatePincode() {
  // ensure loaded (in case slow)
  if (!PINCODES.allowed || PINCODES.allowed.length === 0) {
    await loadPincodes();
  }

  const input = prompt(`Enter property PIN code (Allowed: ${publicAllowedText()}):`);
  const pincode = normalizePincode(input);

  if (pincode.length !== 6) {
    alert("Please enter a valid 6-digit PIN code.");
    return { ok: false };
  }

  if (!isPincodeAllowed(pincode)) {
    alert(`Sorry, service is currently available only in: ${publicAllowedText()}`);
    return { ok: false };
  }

  return { ok: true, pincode };
}
// footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// pricing selection
const cards = document.querySelectorAll(".card");
const buttons = document.querySelectorAll(".select-btn");

function setSelected(card) {
  cards.forEach(c => c.classList.remove("selected"));
  card.classList.add("selected");

  cards.forEach(c => {
    const btn = c.querySelector(".select-btn");
    if (!btn) return;
    btn.textContent = c.classList.contains("selected") ? "Selected" : "Select Plan";
  });
}

cards.forEach(card => {
  card.addEventListener("click", () => setSelected(card));
});

buttons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const card = btn.closest(".card");
    if (card) setSelected(card);
  });
});
