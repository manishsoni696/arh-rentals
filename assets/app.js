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
   LISTINGS FILTERS — FINAL (SINGLE SOURCE)
   + Commercial-only filters visibility fix
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("filtersForm");
  const listings = Array.from(document.querySelectorAll(".listing"));
  const rentSelect = document.getElementById("fRent");
  const resultsCount = document.getElementById("resultsCount");
  const moreBtn = document.getElementById("moreFiltersBtn");
  const filtersUI = document.querySelector(".filters-ui");
  const clearBtn = document.getElementById("filtersClearBtn");

  /* ✅ NEW: Category-based visibility (Commercial filters only when Commercial selected) */
  const categorySelect = document.getElementById("fCategory");

  function findCommercialGroup() {
    const panel = document.querySelector(".filters-panel");
    if (!panel) return null;

    const fieldsets = panel.querySelectorAll("fieldset");
    for (const fs of fieldsets) {
      const leg = fs.querySelector("legend");
      if (leg && leg.textContent.trim().toLowerCase() === "commercial") return fs;
    }

    // Fallback (in case legend changes)
    const comEl =
      document.getElementById("fFloorCom") ||
      document.getElementById("fFurnishCom");
    return comEl ? comEl.closest("fieldset") : null;
  }

  const commercialGroup = findCommercialGroup();

  function syncCommercialVisibility() {
    const v = (categorySelect?.value || "").toLowerCase();
    const isCommercial = v === "commercial";

    if (commercialGroup) {
      commercialGroup.style.display = isCommercial ? "" : "none";
    }

    // When not commercial, reset commercial fields (so filters don't silently apply)
    if (!isCommercial && commercialGroup) {
      commercialGroup.querySelectorAll("select, input").forEach((el) => {
        if (el.tagName === "SELECT") {
          el.selectedIndex = 0;
        } else if (el.type === "checkbox" || el.type === "radio") {
          el.checked = false;
        } else if ("value" in el) {
          el.value = "";
        }
      });
    }
  }

  if (!form || !listings.length) return;
   function collapseMoreFiltersUI() {
    if (!filtersUI || !moreBtn) return;
    filtersUI.classList.remove("show-more");
    moreBtn.textContent = "+ More Filters";
    moreBtn.setAttribute("aria-expanded", "false");
  }


  function inRentRange(rent, range) {
    if (!range) return true;
    if (range.endsWith("+")) {
      return rent >= Number(range.replace("+", ""));
    }
    const [min, max] = range.split("-").map(Number);
    return rent >= min && rent <= max;
  }

  function applyFilters() {
    const fd = new FormData(form);
    const city = (fd.get("city") || "").toString().toLowerCase();
    const category = (fd.get("category") || "").toString().toLowerCase();
    const type = (fd.get("type") || "").toString().toLowerCase();
    const area = (fd.get("area") || "").toString().toLowerCase();
    const size = (fd.get("size") || "").toString().toLowerCase();
    const rentRange = (fd.get("rent") || "").toString();

    let shown = 0;

    listings.forEach((card) => {
      const cCity = (card.dataset.city || "").toLowerCase();
      const cCategory = (card.dataset.category || "").toLowerCase();
      const cType = (card.dataset.type || "").toLowerCase();
      const cArea = (card.dataset.area || "").toLowerCase();
      const cSize = (card.dataset.size || "").toLowerCase();
      const cRent = Number(card.dataset.rent || 0);

      const ok =
        (!city || cCity === city) &&
        (!category || cCategory === category) &&
        (!type || cType === type) &&
        (!area || cArea.includes(area)) &&
        (!size || cSize === size) &&
        inRentRange(cRent, rentRange);

      card.style.display = ok ? "" : "none";
      if (ok) shown++;
    });

    if (resultsCount) resultsCount.textContent = `${shown}`;
  }

  // ✅ NEW: run once on load (before first filter apply)
  syncCommercialVisibility();

  // Auto apply on change/input
  form.addEventListener("change", () => {
    syncCommercialVisibility();
    applyFilters();
  });
  form.addEventListener("input", applyFilters);

  // Initial run
  applyFilters();

  // More / Less toggle (single source)
  if (moreBtn && filtersUI) {
    moreBtn.addEventListener("click", () => {
      const expanded = filtersUI.classList.toggle("show-more");
      moreBtn.textContent = expanded ? "− Less Filters" : "+ More Filters";
        moreBtn.setAttribute("aria-expanded", expanded ? "true" : "false");

      // ✅ NEW: if panel opened/closed, ensure correct visibility
      syncCommercialVisibility();
    });
  }

  // ✅ Clear button (reset everything)
  if (clearBtn) {
    clearBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // Reset native form fields
      form.reset();

      // Reset custom Area field UI safely
      const areaInput = document.getElementById("fArea");
      if (areaInput) {
        areaInput.value = "";
        areaInput.dispatchEvent(new Event("input", { bubbles: true }));
        areaInput.dispatchEvent(new Event("change", { bubbles: true }));
      }

      // Close area panel if open
      const areaPanel = document.getElementById("areaPanel");
      if (areaPanel) areaPanel.hidden = true;

      // Collapse "More Filters" panel
      collapseMoreFiltersUI();
       syncCommercialVisibility();

      // Re-apply
      applyFilters();
    });
  }
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
/* ============ LISTINGS : AREA / SECTOR (SOLUTION 1) — SEARCH-FILTER ============
   REQUIRED BEHAVIOR (OWNER):
   - When user types, dropdown must show ONLY matching areas
   - All non-matching areas must NOT be shown
   - Uses #hisarAreas datalist as the single approved source list
   - Scoped to listings page only
============================================================================= */
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    if (!document.body.classList.contains("listings-page")) return;

    const areaInput = document.getElementById("fArea");
    const areaPanel = document.getElementById("areaPanel");
    const popularList = areaPanel ? areaPanel.querySelector(".area-options") : null;
    const head = areaPanel ? areaPanel.querySelector(".area-panel-head") : null;
    const headSpans = head ? head.querySelectorAll("span") : null;
    const dataList = document.getElementById("hisarAreas");

    if (!areaInput || !areaPanel || !popularList || !dataList) return;

    const defaultHeadLeft = headSpans && headSpans[0] ? headSpans[0].textContent : "";
    const defaultHeadRight = headSpans && headSpans[1] ? headSpans[1].textContent : "";

    const approvedValues = Array.from(dataList.querySelectorAll("option"))
      .map((o) => (o.value || "").trim())
      .filter(Boolean);

    const seen = new Set();
    const approvedUnique = approvedValues.filter((v) => {
      const key = v.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Build / get Suggest UI
    let suggestWrap = document.getElementById("areaSuggestWrap");
    let suggestList = document.getElementById("areaSuggestOptions");

    if (!suggestWrap || !suggestList) {
      suggestWrap = document.createElement("div");
      suggestWrap.id = "areaSuggestWrap";
      suggestWrap.style.marginTop = "10px";

      const title = document.createElement("div");
      title.className = "small muted";
      title.textContent = "Matching areas";

      suggestList = document.createElement("div");
      suggestList.id = "areaSuggestOptions";
      suggestList.className = "area-options";
      suggestList.setAttribute("role", "listbox");
      suggestList.setAttribute("aria-label", "Matching areas");

      suggestWrap.appendChild(title);
      suggestWrap.appendChild(suggestList);
      areaPanel.appendChild(suggestWrap);
    }

    let isOpen = false;

    function openPanel() {
      if (isOpen) return;
      isOpen = true;
      areaPanel.hidden = false;
      areaInput.setAttribute("aria-expanded", "true");
    }

    function closePanel() {
      if (!isOpen) return;
      isOpen = false;
      areaPanel.hidden = true;
      areaInput.setAttribute("aria-expanded", "false");
    }

    function setValue(val) {
      areaInput.value = val;
      areaInput.dispatchEvent(new Event("change", { bubbles: true }));
      closePanel();
    }

    function norm(s) {
      return String(s || "")
        .toLowerCase()
        .replace(/[\s\-_–—]+/g, ""); // remove spaces, hyphen, en-dash, em-dash
    }

    function matchesQuery(area, query) {
      const a = norm(area);
      const q = norm(query);
      if (!q) return true;
      return a.includes(q);
    }

    function showPopularMode() {
      // Restore header
      if (headSpans && headSpans[0]) headSpans[0].textContent = defaultHeadLeft || "Popular areas";
      if (headSpans && headSpans[1]) headSpans[1].textContent = defaultHeadRight || "Type to search";

      // Show all popular
      popularList.hidden = false;
      Array.from(popularList.querySelectorAll(".area-opt")).forEach((b) => (b.hidden = false));

      // Hide suggestions
      suggestList.innerHTML = "";
      suggestWrap.hidden = true;
    }

    function showSearchMode(query) {
      // Header for search mode
      if (headSpans && headSpans[0]) headSpans[0].textContent = "Matching areas";
      if (headSpans && headSpans[1]) headSpans[1].textContent = "Select one";

      // Hide popular completely (as owner asked: only matches should show)
      popularList.hidden = true;

      const q = (query || "").trim();
      const filtered = approvedUnique.filter((v) => matchesQuery(v, q));

      // If nothing matches, show only "Other"
      const finalList = filtered.length ? filtered : ["Other"];

      suggestList.innerHTML = "";
      const frag = document.createDocumentFragment();

      finalList.forEach((val) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "area-opt";
        b.dataset.value = val;
        b.textContent = val;
        frag.appendChild(b);
      });

      suggestList.appendChild(frag);
      suggestWrap.hidden = false;
    }

    function syncUI() {
      const q = (areaInput.value || "").trim();
      if (!q) showPopularMode();
      else showSearchMode(q);
    }

    // Events
    areaInput.addEventListener("focus", function () {
      openPanel();
      syncUI();
    });

    areaInput.addEventListener("click", function () {
      openPanel();
      syncUI();
    });

    areaInput.addEventListener("input", function () {
      openPanel();
      syncUI();
    });

    areaPanel.addEventListener("click", function (e) {
      const btn = e.target.closest(".area-opt");
      if (!btn) return;
      const val = (btn.dataset.value || btn.textContent || "").trim();
      if (!val) return;
      setValue(val);
    });

    document.addEventListener("click", function (e) {
      if (areaPanel.contains(e.target) || areaInput.contains(e.target)) return;
      closePanel();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePanel();
    });

    // Init
    showPopularMode();
    closePanel();
  });
})();
