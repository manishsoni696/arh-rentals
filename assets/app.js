----------------------------
PASTE THIS CODE:
/* =========================================================
   ARH Rentals - assets/app.js (BACKEND OTP - HISAR SMS) ✅
   - PIN check via backend:  GET /check-pincode?pincode=xxxxxx
   - OTP send via backend:   POST /send-otp  { mobile, pincode }
   - OTP verify via backend: POST /verify-otp { mobile, otp }
   - Session token stored in localStorage as "arh_token"
========================================================= */

/* ===============================
   COMMON
=============================== */
const BACKEND = "https://arh-backend.manishsoni696.workers.dev";

// footer year
(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

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

/* ===============================
   OTP UI LOCK (4 hours) helpers
=============================== */
const OTP_LOCK_KEY = "arh_otp_lock_until"; // stored in localStorage

function getLockMap() {
  try {
    return JSON.parse(localStorage.getItem(OTP_LOCK_KEY) || "{}");
  } catch {
    return {};
  }
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
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}
function startSendBtnCountdown(sendOtpBtn, lockUntilMs, baseText = "Send OTP") {
  if (!sendOtpBtn) return;
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
   OTP UI: "Send" vs "Resend" memory
=============================== */
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
(function initPinCheck() {
  const pinBtn = document.getElementById("pinCheckBtn");
  if (!pinBtn) return;

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
      const res = await fetch(
        `${BACKEND}/check-pincode?pincode=${encodeURIComponent(pincode)}`
      );
      const data = await res.json().catch(() => ({}));

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
})();

/* =========================================================
   SEND OTP (BACKEND - HISAR SMS)
========================================================= */
(function initSendOtp() {
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  if (!sendOtpBtn) return;

  const COOLDOWN_KEY = "arh_otp_cooldown_until";

  // Resume cooldown on load if present
  const cd = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
  if (cd > Date.now()) {
    const mNow = normalizeMobile(document.getElementById("mobileInput")?.value);
    startSendBtnCountdown(sendOtpBtn, cd, otpBtnBaseTextForMobile(mNow));
  } else if (cd) {
    localStorage.removeItem(COOLDOWN_KEY);
  }

  // Optional: if lock running, show countdown
  const mobileElOnLoad = document.getElementById("mobileInput");
  const m0 = normalizeMobile(mobileElOnLoad?.value);
  const l0 = m0 ? getLockUntil(m0) : 0;
  if (m0 && l0 && Date.now() < l0) {
    startSendBtnCountdown(sendOtpBtn, l0, otpBtnBaseTextForMobile(m0));
  }

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

    // 4-hour UI lock check
    const lockUntil = getLockUntil(mobile);
    if (lockUntil && Date.now() < lockUntil) {
      setText(
        msgEl,
        `❌ OTP limit reached. Try after ${formatHMS(lockUntil - Date.now())}`
      );
      startSendBtnCountdown(sendOtpBtn, lockUntil, otpBtnBaseTextForMobile(mobile));
      return;
    }

    setText(msgEl, "⏳ Sending OTP...");

    try {
      const res = await fetch(`${BACKEND}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, pincode })
      });

      const data = await res.json().catch(() => ({}));

      // FAIL / BLOCK
      if (!res.ok || !data.success) {
        // UI lock if backend says limit reached (429 + hour)
        if (res.status === 429 && (data.message || "").toLowerCase().includes("hour")) {
          const until = Date.now() + 4 * 60 * 60 * 1000; // 4 hours
          setLockUntil(mobile, until);
          startSendBtnCountdown(sendOtpBtn, until, otpBtnBaseTextForMobile(mobile));
        }
        setText(msgEl, `❌ ${data.message || "OTP failed"}`);
        return;
      }

      // SUCCESS -> 60s cooldown
      const until = Date.now() + 60 * 1000;
      localStorage.setItem(COOLDOWN_KEY, String(until));

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
})();

/* =========================================================
   VERIFY OTP (BACKEND)
========================================================= */
(function initVerifyOtp() {
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  if (!verifyOtpBtn) return;

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
        body: JSON.stringify({ mobile, otp })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success || !data.token) {
        setText(msgEl, `❌ ${data.message || "Invalid/Expired OTP"}`);
        return;
      }

      // store session token returned by backend (persistent)
      localStorage.setItem("arh_token", data.token);

      // successful login -> clear lock
      clearLock(mobile);

      setText(msgEl, "✅ Verified & Logged in");
      if (afterLoginBox) afterLoginBox.style.display = "block";
    } catch (e) {
      console.error(e);
      setText(msgEl, "❌ Network error");
    }
  });
})();

/* =========================================================
   OPTIONAL: LOGOUT
========================================================= */
(function initLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    const m = sessionStorage.getItem("arh_mobile") || "";

    localStorage.removeItem("arh_token");
    sessionStorage.removeItem("arh_mobile");
    // sessionStorage.removeItem("arh_pincode"); // optional

    if (m) clearLock(m);

    setText(document.getElementById("otpMsg"), "Logged out");
  });
})();

/* =========================================================
   PRICING: Card Select + Default Premium (OVERRIDE-SAFE)
========================================================= */
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
        if (link) e.preventDefault();

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
   LISTINGS FILTERS — FINAL (SINGLE SOURCE)
========================================================= */
(function initListingsFilters() {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(() => {
    const form = document.getElementById("filtersForm");
    const listings = Array.from(document.querySelectorAll(".listing"));
    const rentSelect = document.getElementById("fRent");
    const resultsCount = document.getElementById("resultsCount");
    const moreBtn = document.getElementById("moreFiltersBtn");
    const filtersUI = document.querySelector(".filters-ui");

    if (!form || !listings.length) return;

    function inRentRange(rent, range) {
      if (!range) return true;
      if (range.endsWith("+")) return rent >= Number(range.replace("+", ""));
      const parts = range.split("-");
      const min = Number(parts[0]);
      const max = Number(parts[1]);
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

      if (resultsCount) resultsCount.textContent = `Showing ${visible} properties`;
    }

    form.addEventListener("change", applyFilters);
    form.addEventListener("input", applyFilters);

    applyFilters();

    // More / Less toggle
    if (moreBtn && filtersUI) {
      moreBtn.addEventListener("click", () => {
        const expanded = filtersUI.classList.toggle("show-more");
        moreBtn.textContent = expanded ? "− Less Filters" : "+ More Filters";
      });
    }
  });
})();

/* =========================================================
   ARH — MOBILE NAV CONTROLLER (SINGLE SOURCE OF TRUTH)
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

    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!isMobile()) return;

      if (menu.classList.contains("is-open")) closeNav();
      else openNav();
    });

    menu.addEventListener("click", function (e) {
      if (!isMobile()) return;
      if (e.target.closest("a[href]")) closeNav();
    });

    document.addEventListener("click", function (e) {
      if (!isMobile()) return;
      if (toggle.contains(e.target) || menu.contains(e.target)) return;
      closeNav();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isMobile()) closeNav();
    });

    window.addEventListener("resize", syncByViewport);

    syncByViewport();
  });
})();

/* =========================================================
   LISTINGS : AREA / SECTOR DROPDOWN (SINGLE SOURCE)
   - Uses #fArea, #areaPanel, #areaExpandBtn, #areaAllWrap, #areaAllOptions, #hisarAreas
========================================================= */
(function initListingsAreaDropdown() {
  if (!document.body.classList.contains("listings-page")) return;

  const areaInput = document.getElementById("fArea");
  const areaPanel = document.getElementById("areaPanel");
  const areaExpandBtn = document.getElementById("areaExpandBtn");
  const areaAllWrap = document.getElementById("areaAllWrap");
  const areaAllOptions = document.getElementById("areaAllOptions");
  const hisarAreas = document.getElementById("hisarAreas");

  if (!areaInput || !areaPanel) return;

  let allBuilt = false;

  function openPanel() {
    areaPanel.hidden = false;
    areaInput.setAttribute("aria-expanded", "true");
  }

  function closePanel() {
    areaPanel.hidden = true;
    areaInput.setAttribute("aria-expanded", "false");
    if (areaAllWrap) areaAllWrap.hidden = true;
    if (areaExpandBtn) areaExpandBtn.textContent = "More Areas";
  }

  function setAreaValue(v) {
    areaInput.value = v || "";
    closePanel();
  }

  function buildAllAreas() {
    if (allBuilt || !hisarAreas || !areaAllOptions) return;
    allBuilt = true;

    const opts = Array.from(hisarAreas.querySelectorAll("option"));
    let values = opts
      .map((o) => (o.value || "").trim())
      .filter(Boolean);

    // de-dupe
    const seen = new Set();
    values = values.filter((v) => {
      const k = v.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    const frag = document.createDocumentFragment();
    values.forEach((v) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "area-opt";
      b.setAttribute("data-value", v);
      b.textContent = v;
      b.addEventListener("click", () => setAreaValue(v));
      frag.appendChild(b);
    });

    areaAllOptions.innerHTML = "";
    areaAllOptions.appendChild(frag);
  }

  // open panel on focus / typing
  areaInput.addEventListener("focus", openPanel);
  areaInput.addEventListener("input", openPanel);
  areaInput.addEventListener("click", openPanel);

  // click on any popular button
  areaPanel.addEventListener("click", (e) => {
    const btn = e.target.closest(".area-opt");
    if (!btn) return;
    const v = (btn.getAttribute("data-value") || btn.textContent || "").trim();
    setAreaValue(v);
  });

  // More Areas toggle (THIS fixes your issue: ID is #areaExpandBtn, not #areaMoreBtn)
  if (areaExpandBtn && areaAllWrap) {
    areaExpandBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      openPanel();

      const willOpen = areaAllWrap.hidden === true;
      if (willOpen) buildAllAreas();

      areaAllWrap.hidden = !willOpen;
      areaExpandBtn.textContent = willOpen ? "Less Areas" : "More Areas";
    });
  }

  // close on outside click
  document.addEventListener("click", (e) => {
    if (areaPanel.hidden) return;
    const inside = areaPanel.contains(e.target) || areaInput.contains(e.target);
    if (!inside) closePanel();
  });

  // close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
  });

  // initial state
  closePanel();
})();
----------------------------
