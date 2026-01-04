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
// ✅ STEP 1 helper: per-mobile "Send" vs "Resend" memory
function otpBtnBaseTextForMobile(mobile) {
  const k = `arh_otp_sent_once_${mobile}`;
  return localStorage.getItem(k) === "1" ? "Resend OTP" : "Send OTP";
}
function markOtpSentOnce(mobile) {
  localStorage.setItem(`arh_otp_sent_once_${mobile}`, "1");
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
const cd = Number(localStorage.getItem("arh_otp_cooldown_until") || 0);
if (sendOtpBtn && cd > Date.now()) {
  const mNow = normalizeMobile(document.getElementById("mobileInput")?.value);
  startSendBtnCountdown(sendOtpBtn, cd, otpBtnBaseTextForMobile(mNow));
}
if (sendOtpBtn && cd && cd <= Date.now()) {
  localStorage.removeItem("arh_otp_cooldown_until");
}
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
       // ✅ save 60s cooldown (survives refresh)
const until = Date.now() + 60 * 1000; // 60 seconds
localStorage.setItem("arh_otp_cooldown_until", String(until));
       // ✅ mark: this mobile has received OTP at least once
markOtpSentOnce(mobile);
       
startSendBtnCountdown(sendOtpBtn, until, otpBtnBaseTextForMobile(mobile));
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
/* === PRICING (ARH Rentals): Card Select + Default Premium (OVERRIDE-SAFE) === */
(function () {
  function initPricingSelect() {
    const grid = document.querySelector("#pricingGrid");
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll(".card[data-plan]"));
    if (!cards.length) return;

    function getBtn(card) {
      return (
        card.querySelector(".select-btn") ||
        card.querySelector("button") ||
        card.querySelector(".btn")
      );
    }

    function applySelected(plan) {
      cards.forEach((card) => {
        const isSelected = card.dataset.plan === plan;
        card.classList.toggle("selected", isSelected);

        const btn = getBtn(card);
        if (btn) {
          btn.textContent = isSelected ? "Selected" : "Select Plan";
          btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
        }
      });

      try {
        sessionStorage.setItem("arh_selected_plan", plan);
      } catch (_) {}
    }

    function resolvePlanFromTarget(target) {
      const card = target.closest(".card[data-plan]");
      return card ? card.dataset.plan : null;
    }

    // Default selection (Premium), but respect saved plan
    let startPlan = "premium";
    try {
      const saved = sessionStorage.getItem("arh_selected_plan");
      if (saved && cards.some((c) => c.dataset.plan === saved)) startPlan = saved;
    } catch (_) {}
    applySelected(startPlan);

    // Event delegation (works for card + button clicks)
    grid.addEventListener(
      "click",
      (e) => {
        const plan = resolvePlanFromTarget(e.target);
        if (!plan) return;

        // Stop accidental navigation if any nested <a> exists
        const link = e.target.closest("a[href]");
        if (link) {
          e.preventDefault();
        }

        applySelected(plan);
      },
      true
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPricingSelect);
  } else {
    initPricingSelect();
  }
})();
/* =========================================================
   MOBILE NAV TOGGLE — FINAL (SINGLE SOURCE OF TRUTH) ✅
   - Works only on mobile
   - Uses: .nav-toggle + #primary-navigation
   - Toggles: body.nav-open + .menu.is-open
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("primary-navigation");

  if (!toggle || !menu) return;

  const MOBILE_MAX = 859;
  const isMobile = () =>
    window.matchMedia(`(max-width:${MOBILE_MAX}px)`).matches;

  function setOpen(open) {
    document.body.classList.toggle("nav-open", open);
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  // Toggle on hamburger click
  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isMobile()) return;

    const open = document.body.classList.contains("nav-open");
    setOpen(!open);
  });

  // Close when clicking a menu link (mobile only)
  menu.addEventListener("click", (e) => {
    if (!isMobile()) return;
    const link = e.target.closest("a[href]");
    if (!link) return;
    setOpen(false);
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!isMobile()) return;
    if (toggle.contains(e.target) || menu.contains(e.target)) return;
    setOpen(false);
  });

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  // Reset on desktop resize
  window.addEventListener("resize", () => {
    if (!isMobile()) setOpen(false);
  });
});
/* ================================
   MOBILE NAV TOGGLE (FIX) — ADD-ONLY
   ================================ */
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".nav-toggle");
  const menu =
    document.getElementById("primary-navigation") ||
    document.querySelector(".menu");

  if (!toggleBtn || !menu) return;

  // Ensure correct initial state (mobile)
  toggleBtn.setAttribute("aria-expanded", "false");
  menu.classList.remove("is-open");

  const closeMenu = () => {
    toggleBtn.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
  };

  const openMenu = () => {
    toggleBtn.setAttribute("aria-expanded", "true");
    menu.classList.add("is-open");
  };

  toggleBtn.addEventListener("click", () => {
    const isOpen = menu.classList.contains("is-open");
    if (isOpen) closeMenu();
    else openMenu();
  });

  // Close when any menu link is clicked (mobile UX)
  menu.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a && window.innerWidth <= 859) closeMenu();
  });

  // On desktop resize, force menu visible via desktop CSS (and remove mobile open state)
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 860) closeMenu();
  });
});
/* =========================================================
   FIX: MOBILE HAMBURGER MENU TOGGLE (ARH Rentals)
   ========================================================= */
(function () {
  function ready(fn){ if(document.readyState !== "loading"){ fn(); } else { document.addEventListener("DOMContentLoaded", fn); } }

  ready(function () {
    var btn = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primary-navigation");

    if (!btn || !nav) return;

    // Ensure initial state (mobile)
    if (window.matchMedia("(max-width: 859px)").matches) {
      nav.classList.remove("is-open");
      nav.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", "false");
    }

    function openNav() {
      nav.classList.add("is-open");
      nav.removeAttribute("hidden");
      btn.setAttribute("aria-expanded", "true");
    }

    function closeNav() {
      nav.classList.remove("is-open");
      nav.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", "false");
    }

    function toggleNav() {
      var isOpen = btn.getAttribute("aria-expanded") === "true";
      if (isOpen) closeNav();
      else openNav();
    }

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      toggleNav();
    });

    // Close when clicking any nav link (mobile)
    nav.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!a) return;
      if (window.matchMedia("(max-width: 859px)").matches) closeNav();
    });

    // Close on outside click (mobile)
    document.addEventListener("click", function (e) {
      if (!window.matchMedia("(max-width: 859px)").matches) return;
      if (e.target.closest("#primary-navigation") || e.target.closest(".nav-toggle")) return;
      closeNav();
    });

    // On resize: keep desktop open, mobile closed by default
    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 860px)").matches) {
        nav.classList.remove("is-open");
        nav.removeAttribute("hidden");
        btn.setAttribute("aria-expanded", "false");
      } else {
        nav.classList.remove("is-open");
        nav.setAttribute("hidden", "");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  });
})();

  
