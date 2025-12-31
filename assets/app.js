/* =========================================================
   ARH Rentals - assets/app.js (FIREBASE OTP ONLY) ✅ COMPLETE
   - Uses Firebase Phone Auth (SMS OTP) ONLY
   - Invisible reCAPTCHA (initialized once, only when needed)
   - PIN check stays on your Cloudflare backend (/check-pincode)
   - OTP send + verify happens via Firebase (NO /send-otp, NO /verify-otp backend)
========================================================= */


/* =========================================================
   COMMON
========================================================= */
const BACKEND = "https://arh-backend.manishsoni696.workers.dev";

// footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* =========================================================
   HELPERS
========================================================= */
function normalizePincode(pin) {
  return String(pin || "").trim().replace(/\D/g, "").slice(0, 6);
}
function normalizeMobile(m) {
  return String(m || "").trim().replace(/\D/g, "").slice(0, 10);
}
function setText(el, txt) {
  if (el) el.textContent = txt;
}


/* =========================================================
   POST PAGE : PIN CHECK (backend)
========================================================= */
const pinBtn = document.getElementById("pinCheckBtn");
if (pinBtn) {
  pinBtn.addEventListener("click", async () => {
    const pinEl = document.getElementById("postPin");
    const msgEl = document.getElementById("postPinMsg");
    const step2El = document.getElementById("step2");

    const pincode = normalizePincode(pinEl?.value);

    if (pincode.length !== 6) {
      setText(msgEl, "❌ Enter valid 6-digit PIN");
      if (step2El) step2El.style.display = "none";
      return;
    }

    setText(msgEl, "⏳ Checking...");
    if (step2El) step2El.style.display = "none";

    try {
      const res = await fetch(`${BACKEND}/check-pincode?pincode=${pincode}`);
      const data = await res.json();

      if (data?.success && data?.allowed) {
        setText(msgEl, `✅ Service available for ${pincode}`);
        if (step2El) step2El.style.display = "block";
        sessionStorage.setItem("arh_pincode", pincode);
      } else {
        setText(msgEl, `❌ Service not available for ${pincode}`);
      }
    } catch (e) {
      console.error(e);
      setText(msgEl, "❌ Backend not reachable");
    }
  });
}


/* =========================================================
   IMPORTANT (DO NOT MISS)
   1) REMOVE any Firebase <script> block from HTML.
      Only this app.js should initialize Firebase.
   2) OTP page must have:
      <div id="recaptcha-container"></div>
   3) In Firebase Console:
      Authentication > Sign-in method > Phone = ENABLED
      Authorized domains must include your live domain.
========================================================= */
