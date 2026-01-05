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
/* =====================================
   LISTINGS FILTERS — FINAL (SINGLE SOURCE)
   - Auto apply on change + input
   - Rent range supported
   - Results count sync
   - More / Less toggle
===================================== */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("filtersForm");
  const listings = Array.from(document.querySelectorAll(".listing"));
  const rentSelect = document.getElementById("fRent");
  const resultsCount = document.getElementById("resultsCount");
  const moreBtn = document.getElementById("moreFiltersBtn");
  const filtersUI = document.querySelector(".filters-ui");

  if (!form || !listings.length) return;

  function inRentRange(rent, range) {
    if (!range) return true;
    if (range.endsWith("+")) {
      return rent >= Number(range.replace("+", ""));
    }
    const [min, max] = range.split("-").map(Number);
    return rent >= min && rent <= max;
  }

  function applyFilters() {
    let visible = 0;
    const rentRange = rentSelect?.value || "";

    listings.forEach((item) => {
      const rent = Number(item.dataset.rent || 0);
      const show = inRentRange(rent, rentRange);

      item.style.display = show ? "" : "none";
      if (show) visible++;
    });

    if (resultsCount) {
      resultsCount.textContent = `Showing ${visible} properties`;
    }
  }

  // Auto apply
  form.addEventListener("change", applyFilters);
  form.addEventListener("input", applyFilters);

  // Initial run
  applyFilters();

  // More / Less toggle (single source)
  if (moreBtn && filtersUI) {
    moreBtn.addEventListener("click", () => {
      const expanded = filtersUI.classList.toggle("show-more");
      moreBtn.textContent = expanded
        ? "− Less Filters"
        : "+ More Filters";
    });
  }
});
/* =========================================================
   ARH — CLEANUP NOTE
   STEP 3 & STEP 4 DUPLICATE LISTINGS BLOCKS REMOVED
   Reason:
   - Duplicate listeners were causing multiple executions
   - Single Source of Truth rule enforced
   - Final Listings logic retained above
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const moreBtn = document.getElementById("moreFiltersBtn");
  const filtersUI = document.querySelector(".filters-ui");

  if (!moreBtn || !filtersUI) return;

  moreBtn.addEventListener("click", () => {
    const expanded = filtersUI.classList.toggle("show-more");

    moreBtn.textContent = expanded
      ? "− Less Filters"
      : "+ More Filters";
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("filtersForm");
  const listings = Array.from(document.querySelectorAll(".listing"));
  const rentSelect = document.getElementById("fRent");
  const resultsCount = document.getElementById("resultsCount");

  if (!form || !listings.length) return;

  function inRentRange(rent, range) {
    if (!range) return true;
    if (range.endsWith("+")) {
      return rent >= Number(range.replace("+", ""));
    }
    const [min, max] = range.split("-").map(Number);
    return rent >= min && rent <= max;
  }

  function applyFilters() {
    let visible = 0;
    const rentRange = rentSelect?.value || "";

    listings.forEach((item) => {
      const rent = Number(item.dataset.rent || 0);
      const show = inRentRange(rent, rentRange);

      item.style.display = show ? "" : "none";
      if (show) visible++;
    });

    if (resultsCount) {
      resultsCount.textContent = `Showing ${visible} properties`;
    }
  }

  // Auto-apply on any change
  form.addEventListener("change", applyFilters);
  form.addEventListener("input", applyFilters);

  // Initial run
  applyFilters();
});
/* =========================================================
   ARH — MOBILE NAV CONTROLLER (SINGLE SOURCE OF TRUTH)
   Applies to ALL pages consistently
   Breakpoint: <= 859px
   Depends on:
   - .nav-toggle
   - #primary-navigation (.menu)
   - body.nav-open
========================================================= */

(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    const MOBILE_MAX = 859;
    const toggle = document.querySelector(".nav-toggle");
    const menu =
      document.getElementById("primary-navigation") ||
      document.querySelector("nav.menu") ||
      document.querySelector(".menu");

    if (!toggle || !menu) return;

    function isMobile() {
      return window.matchMedia(`(max-width:${MOBILE_MAX}px)`).matches;
    }

    function openNav() {
      document.body.classList.add("nav-open");
      menu.classList.add("is-open");
      menu.removeAttribute("hidden");
      toggle.setAttribute("aria-expanded", "true");
    }

    function closeNav() {
      document.body.classList.remove("nav-open");
      menu.classList.remove("is-open");
      if (isMobile()) menu.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
    }

    function syncByViewport() {
      if (isMobile()) {
        closeNav(); // mobile default closed
      } else {
        menu.classList.remove("is-open");
        menu.removeAttribute("hidden");
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    }

    // Toggle click
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!isMobile()) return;

      if (menu.classList.contains("is-open")) closeNav();
      else openNav();
    });

    // Close on menu link click (mobile)
    menu.addEventListener("click", function (e) {
      if (!isMobile()) return;
      if (e.target.closest("a[href]")) closeNav();
    });

    // Close on outside click
    document.addEventListener("click", function (e) {
      if (!isMobile()) return;
      if (toggle.contains(e.target) || menu.contains(e.target)) return;
      closeNav();
    });

    // Close on ESC
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isMobile()) closeNav();
    });

    // Sync on resize
    window.addEventListener("resize", syncByViewport);

    // Init
    syncByViewport();
  });
})();



