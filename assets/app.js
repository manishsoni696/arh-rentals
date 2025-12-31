/* =========================================================
   ARH Rentals - assets/app.js (BACKEND OTP - HISAR SMS) ✅
   - PIN check via backend:  GET /check-pincode?pincode=xxxxxx
   - OTP send via backend:   POST /send-otp  { mobile, pincode }
   - OTP verify via backend: POST /verify-otp { mobile, otp }
   - Session token stored in localStorage as "arh_token"
========================================================= */

// === OTP UI LOCK (4 hours) helpers ===
const OTP_LOCK_KEY = "arh_otp_lock_until"; // stored in localStorage

function getLockMap() {
  try { return JSON.parse(localStorage.getItem(OTP_LOCK_KEY) || "{}"); }
  catch { return {}; }
}
function setLockUntil(mobile, untilMs) {
  const map = getLockMap();
  map[mobile] = untilMs;
  localStorage.setItem(OTP_LOCK_KEY, JSON.stringify(map));
}
function getLockUntil(mobile) {
  const map = getLockMap();
  const v = map[mobile];
  return typeof v === "number" ? v : 0;
}
function clearLock(mobile) {
  const map = getLockMap();
  delete map[mobile];
  localStorage.setItem(OTP_LOCK_KEY, JSON.stringify(map));
}
function formatHMS(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`;
}
function startSendBtnCountdown(sendOtpBtn, lockUntilMs, baseText="Send OTP") {
  sendOtpBtn.disabled = true;
  const tick = () => {
    const left = lockUntilMs - Date.now();
    if (left <= 0) {
      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = baseText;
      return;
    }
    sendOtpBtn.textContent = `Try after ${formatHMS(left)}`;
    setTimeout(tick, 1000);
  };
  tick();
}

/* ===============================
   COMMON
=============================== */
const BACKEND = "https://arh-backend.manishsoni696.workers.dev";

// footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===============================
   HELPERS
=============================== */
function normalizePincode(pin) {
  return String(pin || "").trim().replace(/\D/g, "").slice(0, 6);
}
function normalizeMobile(m) {
  return String(m || "").trim().replace(/\D/g, "").slice(0, 10);
}
function normalizeOtp(o) {
  return String(o || "").trim().replace(/\D/g, "").slice(0, 6);
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
      const res = await fetch(`${BACKEND}/check-pincode?pincode=${encodeURIComponent(pincode)}`);
      const data = await res.json();

      if (data?.success && data?.allowed) {
        setText(msgEl, `✅ Service available for ${pincode}`);
        if (step2El) step2El.style.display = "block";
        sessionStorage.setItem("arh_pincode", pincode);
      } else {
        setText(msgEl, `❌ Service not available for ${pincode}`);
        sessionStorage.removeItem("arh_pincode");
      }
    } catch (e) {
      console.error(e);
      setText(msgEl, "❌ Backend not reachable");
    }
  });
}

/* =========================================================
   SEND OTP (BACKEND - HISAR SMS)
========================================================= */
const sendOtpBtn = document.getElementById("sendOtpBtn");
if (sendOtpBtn) {
  // ✅ page load पर अगर lock चल रहा है तो button को lock mode में दिखाओ (optional but useful)
  const mobileElOnLoad = document.getElementById("mobileInput");
  const m0 = normalizeMobile(mobileElOnLoad?.value);
  const l0 = m0 ? getLockUntil(m0) : 0;
  if (m0 && l0 && Date.now() < l0) startSendBtnCountdown(sendOtpBtn, l0, "Send OTP");

  sendOtpBtn.addEventListener("click", async () => {
    const mobileEl = document.getElementById("mobileInput");
    const msgEl = document.getElementById("otpMsg");
    const verifyBox = document.getElementById("otpVerifyBox"); // optional

    const mobile = normalizeMobile(mobileEl?.value);
    const pincode = sessionStorage.getItem("arh_pincode"); // pin already verified

    if (mobile.length !== 10) {
      setText(msgEl, "❌ Enter valid 10-digit mobile number");
      return;
    }
    if (!pincode) {
      setText(msgEl, "❌ Please verify PIN first");
      return;
    }

    // ✅ 4-hour UI lock check
    const lockUntil = getLockUntil(mobile);
    if (lockUntil && Date.now() < lockUntil) {
      setText(msgEl, `❌ OTP limit reached. Try after ${formatHMS(lockUntil - Date.now())}`);
      startSendBtnCountdown(sendOtpBtn, lockUntil, "Send OTP");
      return;
    }

    setText(msgEl, "⏳ Sending OTP...");

    try {
      const res = await fetch(`${BACKEND}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, pincode }),
      });

      const data = await res.json().catch(() => ({}));

      // ❌ FAIL / BLOCK
      if (!res.ok || !data.success) {
        // ✅ 4-hour UI lock jab backend 429 de aur message me hour/4 hour ho
        if (res.status === 429 && (data.message || "").toLowerCase().includes("hour")) {
          const until = Date.now() + 4 * 60 * 60 * 1000; // 4 hours
          setLockUntil(mobile, until);
          startSendBtnCountdown(sendOtpBtn, until, "Send OTP");
        }
        setText(msgEl, `❌ ${data.message || "OTP failed"}`);
        return;
      }

      // ✅ SUCCESS → ab 60 sec cooldown start karo (FIX 1)
      sendOtpBtn.disabled = true;
      let s = 60;
      const originalText = sendOtpBtn.textContent || "Send OTP";
      sendOtpBtn.textContent = `Resend in ${s}s`;

      const timer = setInterval(() => {
        s--;
        sendOtpBtn.textContent = `Resend in ${s}s`;
        if (s <= 0) {
          clearInterval(timer);
          sendOtpBtn.disabled = false;
          sendOtpBtn.textContent = originalText;
        }
      }, 1000);

      // store mobile for verify step
      sessionStorage.setItem("arh_mobile", mobile);

      setText(msgEl, "✅ OTP sent. Please enter OTP.");
      if (verifyBox) verifyBox.style.display = "block";
    } catch (e) {
      console.error(e);
      setText(msgEl, "❌ Network error");
    }
  });
}

/* =========================================================
   VERIFY OTP (BACKEND)
========================================================= */
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
if (verifyOtpBtn) {
  verifyOtpBtn.addEventListener("click", async () => {
    const otpEl = document.getElementById("otpInput");
    const msgEl = document.getElementById("otpMsg");
    const afterLoginBox = document.getElementById("afterLoginBox"); // optional

    const mobile = sessionStorage.getItem("arh_mobile") || "";
    const otp = normalizeOtp(otpEl?.value);

    if (!mobile || mobile.length !== 10) {
      setText(msgEl, "❌ Please send OTP first");
      return;
    }
    if (otp.length < 4) {
      setText(msgEl, "❌ Enter OTP");
      return;
    }

    setText(msgEl, "⏳ Verifying OTP...");

    try {
      const res = await fetch(`${BACKEND}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success || !data.token) {
        setText(msgEl, `❌ ${data.message || "Invalid/Expired OTP"}`);
        return;
      }

      // ✅ store session token returned by backend (persistent)
      localStorage.setItem("arh_token", data.token);

      // ✅ optional: successful login पर OTP lock clear कर दो
      clearLock(mobile);

      setText(msgEl, "✅ Verified & Logged in");
      if (afterLoginBox) afterLoginBox.style.display = "block";
    } catch (e) {
      console.error(e);
      setText(msgEl, "❌ Network error");
    }
  });
}

/* =========================================================
   OPTIONAL: LOGOUT (FIX 2)
========================================================= */
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    const m = sessionStorage.getItem("arh_mobile") || ""; // ✅ पहले mobile ले लो

    localStorage.removeItem("arh_token");
    sessionStorage.removeItem("arh_mobile");
    // sessionStorage.removeItem("arh_pincode"); // optional

    if (m) clearLock(m); // ✅ lock clear

    setText(document.getElementById("otpMsg"), "Logged out");
  });
}
