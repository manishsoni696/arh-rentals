/* =========================================================
   ARH Rentals - assets/app.js (COMPLETE)
   - Footer year
   - PINCODE gate (allowed_pincodes.json)
   - Pricing plan select (only runs on pricing page)
   - Image compress to ~500KB (runs on post page if input exists)
========================================================= */

/* ===============================
   Footer year (works on any page if #year exists)
=============================== */
const BACKEND = "https://arh-backend.manishsoni696.workers.dev";
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===============================
   Image Compress (no crop) to ~500KB
=============================== */
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

  while (blob && blob.size > TARGET_BYTES && q > MIN_QUALITY) {
    q = Math.max(MIN_QUALITY, q - 0.06);
    blob = await canvasToBlob(canvas, q);
  }

  URL.revokeObjectURL(img.src);

  return { blob, width: w, height: h, quality: q, size: blob?.size || 0 };
}

/* ===============================
   PINCODE GATE (MUST before payment)
   - uses: /assets/allowed_pincodes.json
=============================== */
let PINCODES = { allowed: [], publicAllowed: [] };

async function loadPincodes() {
  try {
    const res = await fetch("/assets/allowed_pincodes.json", { cache: "no-store" });
    if (!res.ok) throw new Error("pincode json not found");
    PINCODES = await res.json();
  } catch (e) {
    console.warn("Pincode list load failed:", e);
    // fail-safe: block payment if list can't load
    PINCODES = { allowed: [], publicAllowed: [] };
  }
}
loadPincodes();

function normalizePincode(pin) {
  return String(pin || "").trim().replace(/\D/g, "").slice(0, 6);
}

function isPincodeAllowed(pin) {
  const p = normalizePincode(pin);
  return Array.isArray(PINCODES.allowed) && PINCODES.allowed.includes(p);
}

function publicAllowedText() {
  return (Array.isArray(PINCODES.publicAllowed) && PINCODES.publicAllowed.length)
    ? PINCODES.publicAllowed.join(", ")
    : "125001, 125004, 125005";
}

/**
 * Returns {ok:true, pincode:"125001"} or {ok:false}
 * MUST be called BEFORE Razorpay open
 */
async function askAndValidatePincode() {
  if (!PINCODES.allowed || PINCODES.allowed.length === 0) {
    await loadPincodes();
  }

  // If still empty -> block
  if (!PINCODES.allowed || PINCODES.allowed.length === 0) {
    alert("Service is temporarily unavailable (PIN rules not loaded). Please try again later.");
    return { ok: false };
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

/* ===============================
   PRICING PAGE: Plan select + pincode gate
   Runs only if #pricingGrid exists
=============================== */
const pricingGrid = document.getElementById("pricingGrid");
if (pricingGrid) {
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

  // clicking card (no pincode prompt here, only UI select)
  cards.forEach(card => {
    card.addEventListener("click", () => setSelected(card));
  });

  // clicking button -> pincode gate first
  buttons.forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // 1) PINCODE check FIRST
      const gate = await askAndValidatePincode();
      if (!gate.ok) return;

      // 2) Then select plan
      const card = btn.closest(".card");
      if (!card) return;

      // Save for next steps
      sessionStorage.setItem("arh_pincode", gate.pincode);
      sessionStorage.setItem("arh_selected_plan", card.dataset.plan || "");

      setSelected(card);

      // Next step: Razorpay open will be wired here later
      alert(`Pincode verified: ${gate.pincode}\nPlan selected: ${card.dataset.plan}`);
    });
  });
}

/* ===============================
   POST PAGE: Auto compress on photo select
   Runs only if #propertyPhotos exists
=============================== */
const photoInput = document.getElementById("propertyPhotos");
if (photoInput) {
  photoInput.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const compressedFiles = [];

    for (const file of files) {
      const { blob } = await compressImageTo500KB(file);
      compressedFiles.push(new File([blob], file.name, { type: "image/jpeg" }));
    }

    // Replace original files with compressed ones
    const dt = new DataTransfer();
    compressedFiles.forEach(f => dt.items.add(f));
    photoInput.files = dt.files;

    alert("Photos optimized (≈500KB each) ✔");
  });
}
// ===============================
// POST PAGE: PIN check (backend)
// ===============================
const pinBtn = document.getElementById("pinCheckBtn");
if (pinBtn) {
  pinBtn.addEventListener("click", async () => {
    const pinEl = document.getElementById("postPin");
    const msgEl = document.getElementById("postPinMsg");
    const step2El = document.getElementById("step2");

    const pincode = normalizePincode(pinEl?.value);

    if (!pincode || pincode.length !== 6) {
      if (msgEl) msgEl.textContent = "❌ Enter valid 6-digit PIN";
      if (step2El) step2El.style.display = "none";
      return;
    }

    if (msgEl) msgEl.textContent = "⏳ Checking...";
    if (step2El) step2El.style.display = "none";

    try {
      const res = await fetch(`${BACKEND}/check-pincode?pincode=${pincode}`);
      const data = await res.json();

      if (data?.success && data?.allowed) {
        if (msgEl) msgEl.textContent = `✅ Service available for ${pincode}`;
        if (step2El) step2El.style.display = "block";
        sessionStorage.setItem("arh_pincode", pincode);
      } else {
        if (msgEl) msgEl.textContent = `❌ Service not available for ${pincode}`;
      }
    } catch (e) {
      console.error(e);
      if (msgEl) msgEl.textContent = "❌ Backend not reachable";
    }
  });
}
