/* =========================================================
   ARH Rentals - assets/app.js (FIREBASE OTP ONLY) ✅ COMPLETE
   - Uses Firebase Phone Auth (SMS OTP) ONLY
   - Invisible reCAPTCHA (initialized once, only when needed)
   - PIN check stays on your Cloudflare backend (/check-pincode)
   - OTP send + verify happens via Firebase (NO /send-otp, NO /verify-otp backend)
========================================================= */

// ✅ Firebase imports (v12.7.0 like your snippet)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

/* ===============================
   Firebase config (YOUR PROJECT) ✅
=============================== */
const firebaseConfig = {
  apiKey: "AIzaSyABRPiBVevpmR657iaRWDiLQgOoT9hYTP0",
  authDomain: "chating-ff6e8.firebaseapp.com",
  databaseURL: "https://chating-ff6e8.firebaseio.com",
  projectId: "chating-ff6e8",
  storageBucket: "chating-ff6e8.appspot.com",
  messagingSenderId: "765506721928",
  appId: "1:765506721928:web:21738167baa5d03aef273d",
  measurementId: "G-XXWMDCQ0KL",
};

/* ===============================
   Init Firebase Auth
=============================== */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Optional: auth.languageCode = "en";  // or "hi"

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
   reCAPTCHA (Firebase) - init ONLY when sending OTP
   ✅ HTML REQUIREMENT (on the OTP page):
   <div id="recaptcha-container"></div>
========================================================= */
function ensureRecaptcha() {
  if (window.recaptchaVerifier) return window.recaptchaVerifier;

  const container = document.getElementById("recaptcha-container");
  if (!container) {
    // This must exist on the page where OTP is used
    throw new Error("Missing #recaptcha-container in HTML");
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "invisible",
    callback: () => {
      // solved
    },
    "expired-callback": () => {
      // expired
    },
  });

  return window.recaptchaVerifier;
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
   FIREBASE OTP: SEND OTP
   Requires:
   - input#mobileInput
   - button#sendOtpBtn
   - div/span#otpMsg
   - OTP UI container (optional): #otpVerifyBox to show after send
========================================================= */
const sendOtpBtn = document.getElementById("sendOtpBtn");
if (sendOtpBtn) {
  sendOtpBtn.addEventListener("click", async () => {
    const mobileEl = document.getElementById("mobileInput");
    const msgEl = document.getElementById("otpMsg");
    const verifyBox = document.getElementById("otpVerifyBox"); // optional

    const mobile = normalizeMobile(mobileEl?.value);

    if (mobile.length !== 10) {
      setText(msgEl, "❌ Enter valid 10-digit mobile number");
      return;
    }

    setText(msgEl, "⏳ Sending OTP...");

    try {
      // ✅ init recaptcha
      const verifier = ensureRecaptcha();

      // ✅ E.164 format
      const phoneNumber = `+91${mobile}`;

      // ✅ Send OTP
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);

      // Save confirmationResult globally for verify step
      window.confirmationResult = confirmationResult;

      sessionStorage.setItem("arh_mobile", mobile);

      setText(msgEl, "✅ OTP sent. Please enter OTP.");
      if (verifyBox) verifyBox.style.display = "block";
    } catch (err) {
      console.error(err);

      // reset recaptcha if needed
      try {
        if (window.recaptchaVerifier?.render) {
          // best-effort reset: new verifier next time
          window.recaptchaVerifier = null;
        }
      } catch {}

      // Common Firebase errors you may see:
      // auth/too-many-requests, auth/invalid-phone-number, auth/captcha-check-failed
      setText(msgEl, `❌ OTP failed: ${err?.code || "unknown_error"}`);
    }
  });
}

/* =========================================================
   FIREBASE OTP: VERIFY OTP
   Requires:
   - input#otpInput
   - button#verifyOtpBtn
   - div/span#otpMsg (same)
   - optional: #afterLoginBox
========================================================= */
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
if (verifyOtpBtn) {
  verifyOtpBtn.addEventListener("click", async () => {
    const otpEl = document.getElementById("otpInput");
    const msgEl = document.getElementById("otpMsg");
    const afterLoginBox = document.getElementById("afterLoginBox"); // optional

    const otp = String(otpEl?.value || "").trim().replace(/\D/g, "");

    if (!otp || otp.length < 4) {
      setText(msgEl, "❌ Enter OTP");
      return;
    }

    if (!window.confirmationResult) {
      setText(msgEl, "❌ Please send OTP first");
      return;
    }

    setText(msgEl, "⏳ Verifying OTP...");

    try {
      const result = await window.confirmationResult.confirm(otp);

      // ✅ User signed in
      const user = result.user;

      // ✅ Get Firebase ID token (use this as your auth token if needed)
      const idToken = await user.getIdToken();

      // Store token for API calls (optional)
      sessionStorage.setItem("firebase_id_token", idToken);

      setText(msgEl, "✅ Verified & Logged in");
      if (afterLoginBox) afterLoginBox.style.display = "block";
    } catch (err) {
      console.error(err);
      setText(msgEl, `❌ Invalid OTP: ${err?.code || "invalid_code"}`);
    }
  });
}

/* =========================================================
   OPTIONAL: LOGOUT BUTTON
   Requires: button#logoutBtn (optional)
========================================================= */
import { signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    sessionStorage.removeItem("firebase_id_token");
    sessionStorage.removeItem("arh_mobile");
    setText(document.getElementById("otpMsg"), "Logged out");
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
