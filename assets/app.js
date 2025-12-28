// ===============================
// Image Compress (no crop) to ~500KB
// ===============================
const TARGET_BYTES = 500 * 1024; // 500KB
const MAX_DIM = 1600;           // keep aspect ratio, no crop
const START_QUALITY = 0.78;
const MIN_QUALITY = 0.55;

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function calcResize(w, h, maxDim) {
  if (w <= maxDim && h <= maxDim) return { w, h };
  const ratio = w / h;
  if (w > h) return { w: maxDim, h: Math.round(maxDim / ratio) };
  return { w: Math.round(maxDim * ratio), h: maxDim };
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
  });
}

/**
 * Compress file to <= 500KB (best-effort), without crop.
 * Returns: { blob, width, height, quality, size }
 */
async function compressImageTo500KB(file) {
  const img = await loadImageFromFile(file);

  const { w, h } = calcResize(img.naturalWidth, img.naturalHeight, MAX_DIM);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);

  let q = START_QUALITY;
  let blob = await canvasToBlob(canvas, q);

  // If still bigger than 500KB, reduce quality step-by-step
  while (blob && blob.size > TARGET_BYTES && q > MIN_QUALITY) {
    q = Math.max(MIN_QUALITY, q - 0.06);
    blob = await canvasToBlob(canvas, q);
  }

  // Cleanup object URL
  URL.revokeObjectURL(img.src);

  return { blob, width: w, height: h, quality: q, size: blob?.size || 0 };
}
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
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 1) pincode check FIRST
    const gate = await askAndValidatePincode();
    if (!gate.ok) return;

    // 2) then select plan
    const card = btn.closest(".card");
    if (!card) return;

    // save pincode for next steps (payment/property form)
    sessionStorage.setItem("arh_pincode", gate.pincode);
    sessionStorage.setItem("arh_selected_plan", card.dataset.plan || "");

    setSelected(card);

    // ✅ next step me yahi se Razorpay open karenge
    alert(`Pincode verified: ${gate.pincode}\nPlan selected: ${card.dataset.plan}`);
  });
});
