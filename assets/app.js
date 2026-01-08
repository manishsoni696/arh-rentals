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
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}
function startSendBtnCountdown(sendOtpBtn, lockUntilMs, baseText = "Send OTP") {
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
const pinForm = document.getElementById("pinCheckForm");
const pinEl = document.getElementById("postPin");
const pinMsgEl = document.getElementById("postPinMsg");
const step2El = document.getElementById("step2");
const otpStepEl = document.getElementById("otpStep");
const afterLoginBox = document.getElementById("afterLoginBox");

function hasActiveSession() {
  return Boolean(localStorage.getItem("arh_token"));
}

function showOtpStep() {
  if (otpStepEl) otpStepEl.style.display = "block";
  if (afterLoginBox) afterLoginBox.style.display = "none";
}

function showPostForm() {
  if (afterLoginBox) afterLoginBox.style.display = "block";
  if (otpStepEl) otpStepEl.style.display = "none";
}

function resetPostGate() {
  if (otpStepEl) otpStepEl.style.display = "none";
  if (afterLoginBox) afterLoginBox.style.display = "none";
}

if (step2El) {
  const savedPincode = sessionStorage.getItem("arh_pincode");
  if (savedPincode && savedPincode.length === 6) {
    if (pinEl) pinEl.value = savedPincode;
    setText(pinMsgEl, `✅ Service available for ${savedPincode}`);
    step2El.style.display = "block";
      if (hasActiveSession()) {
      showPostForm();
    } else {
      showOtpStep();
    }
  }
}

async function handlePinCheck(event) {
  if (event) event.preventDefault();
  const msgEl = pinMsgEl;

    const pincode = normalizePincode(pinEl?.value);
      
    if (pincode.length !== 6) {
    setText(msgEl, "❌ Enter valid 6-digit PIN");
    if (step2El) step2El.style.display = "none";
         resetPostGate();
  return;
  }
   
    setText(msgEl, "⏳ Checking...");
  if (step2El) step2El.style.display = "none";
resetPostGate();
   
      try {
    const res = await fetch(`${BACKEND}/check-pincode?pincode=${encodeURIComponent(pincode)}`);
    const data = await res.json().catch(() => ({}));

    if (data?.success && data?.allowed) {
      setText(msgEl, `✅ Service available for ${pincode}`);
      if (step2El) step2El.style.display = "block";
      sessionStorage.setItem("arh_pincode", pincode);
       if (hasActiveSession()) {
        showPostForm();
      } else {
        showOtpStep();
      }
    } else {
      setText(msgEl, `❌ Service not available for ${pincode}`);
      sessionStorage.removeItem("arh_pincode");
    }
  } catch (e) {
    console.error(e);
    setText(msgEl, "❌ Backend not reachable");
  }
}

if (pinForm) {
  pinForm.addEventListener("submit", handlePinCheck);
}
if (pinBtn) {
  pinBtn.addEventListener("click", handlePinCheck);
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
       setText(msgEl, "❌ Please check PIN first");
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

    setText(msgEl, "⏳ Checking OTP...");

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

       setText(msgEl, "✅ Logged in");
      showPostForm();
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
     if (sessionStorage.getItem("arh_pincode")) {
      showOtpStep();
    } else {
      resetPostGate();
    }
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
      } catch (_) { }
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
    } catch (_) { }
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
  const listingWrap = document.getElementById("listingWrap"); // Needed for demo injection
  const resultsCount = document.getElementById("resultsCount");
  const moreBtn = document.getElementById("moreFiltersBtn");
  const filtersUI = document.querySelector(".filters-ui");
  const clearBtn = document.getElementById("filtersClearBtn");
  const categorySelect = document.getElementById("fCategory");

  // 1. DEMO MODE LOGIC
  const urlParams = new URLSearchParams(window.location.search);
  const isDemoMode = urlParams.get("demo") === "1";

  if (isDemoMode && listingWrap) {
    // 10 Dummy Listings
    const demoListings = [
      {
          id: "demo-1",
        title: "2 BHK Independent House",
        area: "Sector 14",
        type: "House",
        category: "residential",
        bhk: "2 BHK",
        rent: 12000,
        size: "150",
          status: "active",
        expiry: "2025-12-31",
        furnishing: "Semi-Furnished",
        floor: "Ground",
        age: "5-10",
        amenities: ["parking", "powerBackup"],
        images: ["https://picsum.photos/400/300?random=1", "https://picsum.photos/400/300?random=2", "https://picsum.photos/400/300?random=3"]
      },
      {
         id: "demo-2",
        title: "1 BHK Flat",
        area: "Sector 15",
        type: "Flat",
        category: "residential",
        bhk: "1 BHK",
        rent: 8000,
        size: "90",
        status: "active",
        expiry: "2025-12-31",
        furnishing: "Unfurnished",
        floor: "First",
        age: "1-3",
        amenities: ["lift", "security"],
        images: ["https://picsum.photos/400/300?random=4", "https://picsum.photos/400/300?random=5", "https://picsum.photos/400/300?random=6"]
      },
      {
           id: "demo-3",
        title: "3 BHK Builder Floor",
        area: "Sector 9–11",
        type: "House",
        category: "residential",
        bhk: "3 BHK",
        rent: 18000,
        size: "250",
        status: "active",
        expiry: "2025-12-31",
        furnishing: "Furnished",
        floor: "Second",
        age: "3-5",
        amenities: ["parking", "lift", "powerBackup", "ac"],
        images: ["https://picsum.photos/400/300?random=7", "https://picsum.photos/400/300?random=8", "https://picsum.photos/400/300?random=9"]
      },
      {
           id: "demo-3",
        title: "Shop in Market",
        area: "Main Market",
        type: "Shop",
        category: "commercial",
        rent: 15000,
        size: "200", // sq ft for commercial
        status: "active",
        expiry: "2025-12-31",
        furnishing: "Unfurnished",
        floor: "Ground",
        amenities: ["parking", "security"], // commercial use main amenities field structure in data, normalized in usage
        images: ["https://picsum.photos/400/300?random=10", "https://picsum.photos/400/300?random=11", "https://picsum.photos/400/300?random=12"]
      },
      {
          id: "demo-5",
        title: "2 BHK Flat with Parking",
        area: "Sector 33",
        type: "Flat",
        category: "residential",
        bhk: "2 BHK",
        rent: 10500,
        size: "120",
        status: "active",
        expiry: "2025-12-31",
        furnishing: "Semi-Furnished",
        floor: "Third+",
        age: "1-3",
        amenities: ["parking", "lift"],
        images: ["https://picsum.photos/400/300?random=13", "https://picsum.photos/400/300?random=14", "https://picsum.photos/400/300?random=15"]
      },
      {
          id: "demo-6",
        title: "1 RK Budget Room",
        area: "Sector-PLA",
        type: "PG",
        category: "residential",
        bhk: "1 RK",
        rent: 6500,
        size: "40",
        status: "active",
        expiry: "2025-12-31",
        furnishing: "Furnished",
        floor: "Ground",
        age: "10+",
        amenities: ["security"],
        images: ["https://picsum.photos/400/300?random=16", "https://picsum.photos/400/300?random=17", "https://picsum.photos/400/300?random=18"]
      },
      {
          id: "demo-7",
        title: "Office Space",
        area: "Red Square Market",
        type: "Office",
        category: "commercial",
        rent: 22000,
        size: "800",
        status: "active",
        expiry: "2025-12-31",
        furnishing: "Furnished",
        floor: "First",
        amenities: ["powerBackup", "bg", "ac"],
        images: ["https://picsum.photos/400/300?random=19", "https://picsum.photos/400/300?random=20"]
      },
      {
          id: "demo-8",
        title: "3 BHK Independent House",
        area: "Sector 14",
        type: "House",
        category: "residential",
        bhk: "3 BHK",
        rent: 22000,
        size: "300",
        status: "active",
        expiry: "2025-12-31",
        furnishing: "Unfurnished",
        floor: "Ground",
        age: "10+",
        amenities: ["parking", "powerBackup", "security"],
        images: ["https://picsum.photos/400/300?random=21", "https://picsum.photos/400/300?random=22", "https://picsum.photos/400/300?random=23"]
      },
      {
           id: "demo-9",
        title: "2 BHK Modern Apartment",
        area: "Sector 15",
        type: "Flat",
        category: "residential",
        bhk: "2 BHK",
        rent: 14000,
        size: "130",
        status: "active",
        expiry: "2025-12-31",
        furnishing: "Furnished",
        floor: "Second",
        age: "0-1",
        amenities: ["parking", "lift", "ac", "security"],
        images: ["https://picsum.photos/400/300?random=24", "https://picsum.photos/400/300?random=25"]
      },
      {
           id: "demo-10",
        title: "1 BHK Affordable Flat",
        area: "Sector 33",
        type: "Flat",
        category: "residential",
        bhk: "1 BHK",
        rent: 7000,
        size: "85",
        status: "active",
        expiry: "2025-12-31",
        furnishing: "Semi-Furnished",
        floor: "First",
        age: "3-5",
        amenities: ["lift"],
        images: ["https://picsum.photos/400/300?random=26", "https://picsum.photos/400/300?random=27"]
      }
    ];

    // Inject Banner
    const hero = document.querySelector(".hero");
    if (hero) {
      const banner = document.createElement("div");
      banner.style.cssText = "background: #fff3cd; color: #856404; padding: 10px; margin-top: 15px; border-radius: 4px; font-size: 0.9rem; border: 1px solid #ffeeba;";
      banner.innerHTML = "<strong>🧪 Demo Mode Active:</strong> Showing 10 dummy listings for filter testing. <a href='?' style='color:#533f03; text-decoration:underline;'>Exit</a>";
      hero.appendChild(banner);
    }

    // Generate HTML
    listingWrap.innerHTML = demoListings.map(l => {
      const amenitiesLabels = { parking: "Parking", powerBackup: "Power Backup", lift: "Lift", security: "Security", ac: "AC" };
      const amText = (l.amenities || []).map(k => amenitiesLabels[k] || k).join(" • ") || "No amenities";
      return `
        <div class="listing"
        data-listing-id="${l.id}"
             data-city="hisar"
             data-category="${l.category}"
             data-type="${l.type}"
             data-area="${l.area.toLowerCase()}"
             data-size="${l.size}"
             data-rent="${l.rent}"
             data-status="${l.status}"
             data-expiry="${l.expiry}"
             data-bhk="${l.bhk || ''}"
             data-floor="${l.floor}"
             data-furnishing="${l.furnishing}"
             data-age="${l.age || ''}"
             data-amenities="${(l.amenities || []).join(',')}"
        >
          <div>
            <h3>${l.title}</h3>
            <p>${l.area} • Hisar</p>
            <div class="pills">
              <span class="pill">${l.type}</span>
              <span class="pill">₹${l.rent.toLocaleString()}/mo</span>
              <span class="pill">${l.bhk || (l.category === 'commercial' ? l.size + ' sqft' : '')}</span>
              <span class="pill">${l.furnishing}</span>
            </div>
            <p class="small muted" style="margin-top: 8px;">${amText}</p>
          </div>
          <button class="btn">Unlock Details</button>
          <div class="small muted listing-note">🧪 Demo Listing</div>
        </div>
        `;
    }).join("");
  }


  // 2. UNIFIED FILTER LOGIC (Works for static and demo)
  // Re-select listings to ensure we get the CURRENT DOM elements (whether static or newly injected)
  const listings = Array.from(document.querySelectorAll(".listing"));

   const LISTING_STATE_KEY = "arh_listing_state_v1";
  const REPORTER_LOG_KEY = "arh_listing_reporter_log_v1";
  const REPORT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
  const REPORT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

  function loadStateMap() {
    try {
      return JSON.parse(localStorage.getItem(LISTING_STATE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveStateMap(stateMap) {
    localStorage.setItem(LISTING_STATE_KEY, JSON.stringify(stateMap));
  }

  function loadReporterLog() {
    try {
      return JSON.parse(localStorage.getItem(REPORTER_LOG_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveReporterLog(log) {
    localStorage.setItem(REPORTER_LOG_KEY, JSON.stringify(log));
  }

  function getReporterId() {
    const key = "arh_reporter_id";
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = `reporter_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
      sessionStorage.setItem(key, id);
    }
    return id;
  }

  function normalizeReportList(reports) {
    if (!Array.isArray(reports)) return [];
    return reports.map((ts) => Number(ts)).filter((ts) => Number.isFinite(ts) && ts > 0);
  }

  function pruneReports(reports, nowMs) {
    const cutoff = nowMs - REPORT_WINDOW_MS;
    return reports.filter((ts) => ts >= cutoff);
  }

  function findListingCardById(listingId) {
    return listings.find((card) => card.dataset.listingId === listingId);
  }

  function ensureListingState(entry, fallbackStatus) {
    const safeEntry = entry && typeof entry === "object" ? entry : {};
    const reports = normalizeReportList(safeEntry.na_reports);
    return {
      status: safeEntry.status || fallbackStatus || "active",
      na_reports_count: Number.isFinite(safeEntry.na_reports_count)
        ? safeEntry.na_reports_count
        : reports.length,
      na_last_reported_at: safeEntry.na_last_reported_at || null,
      na_reports: reports,
      paused_reason: safeEntry.paused_reason || null,
      owner_reconfirm_required: Boolean(safeEntry.owner_reconfirm_required),
    };
  }

  function applyListingStateToCard(card, state) {
    if (!card || !state) return;
    card.dataset.status = state.status;
    if (state.paused_reason) {
      card.dataset.pausedReason = state.paused_reason;
    } else {
      delete card.dataset.pausedReason;
    }
  }

  function syncListingStatusVisibility() {
    if (typeof applyFilters === "function") {
      applyFilters();
    }
  }

  function updateListingState(listingId, updater) {
    const stateMap = loadStateMap();
    const card = findListingCardById(listingId);
    const baseStatus = card?.dataset.status || "active";
    const current = ensureListingState(stateMap[listingId], baseStatus);
    const updated = updater(current) || current;
    stateMap[listingId] = updated;
    saveStateMap(stateMap);
    if (card) applyListingStateToCard(card, updated);
    syncListingStatusVisibility();
    return updated;
  }

  function reportNotAvailable(listingId) {
    const reporterId = getReporterId();
    const nowMs = Date.now();
    const reporterLog = loadReporterLog();
    const reporterKey = `${listingId}:${reporterId}`;
    const lastReported = Number(reporterLog[reporterKey] || 0);

    if (lastReported && nowMs - lastReported < REPORT_COOLDOWN_MS) {
      return { ignored: true, reason: "cooldown" };
    }

    reporterLog[reporterKey] = nowMs;
    saveReporterLog(reporterLog);

    const updated = updateListingState(listingId, (state) => {
      const reports = pruneReports(normalizeReportList(state.na_reports), nowMs);
      reports.push(nowMs);
      const count = reports.length;
      const shouldPause = count >= 2;
      return {
        ...state,
        na_reports_count: count,
        na_last_reported_at: new Date(nowMs).toISOString(),
        na_reports: reports,
        status: shouldPause ? "paused" : state.status,
        paused_reason: shouldPause ? "not_available_reports" : state.paused_reason,
        owner_reconfirm_required: shouldPause ? true : state.owner_reconfirm_required,
      };
    });

    return { ignored: false, state: updated };
  }

  function ownerReactivateListing(listingId) {
    return updateListingState(listingId, (state) => ({
      ...state,
      status: "active",
      na_reports_count: 0,
      na_last_reported_at: null,
      na_reports: [],
      paused_reason: null,
      owner_reconfirm_required: false,
    }));
  }

  function ownerCloseAsRented(listingId) {
    return updateListingState(listingId, (state) => ({
      ...state,
      status: "rented",
      paused_reason: null,
      owner_reconfirm_required: false,
    }));
  }

  if (typeof window !== "undefined") {
    window.ARHListingStatus = {
      reportNotAvailable,
      ownerReactivateListing,
      ownerCloseAsRented,
    };
  }

  const secondaryGroups = Array.from(document.querySelectorAll(".filters-panel [data-cat]"));

  function resetGroupInputs(group) {
    group.querySelectorAll("select, input").forEach((el) => {
      if (el.tagName === "SELECT") el.selectedIndex = 0;
      else if (el.type === "checkbox" || el.type === "radio") el.checked = false;
      else if ("value" in el) el.value = "";
    });
  }

  function syncCommercialVisibility() {
    if (!secondaryGroups.length) return;
    const v = (categorySelect?.value || "residential").toLowerCase();
    const activeCat = v === "commercial" ? "commercial" : "residential";

    secondaryGroups.forEach((group) => {
      const groupCat = group.getAttribute("data-cat");
      const show = groupCat === activeCat;
      group.style.display = show ? "" : "none";
      if (!show) resetGroupInputs(group);
    });
  }

  if (!form || !listings.length) return;

   const initStateMap = loadStateMap();
  listings.forEach((card, index) => {
    if (!card.dataset.listingId) {
      card.dataset.listingId = `listing-${index + 1}`;
    }
    const listingId = card.dataset.listingId;
    const state = ensureListingState(initStateMap[listingId], card.dataset.status || "active");
    const nowMs = Date.now();
    const prunedReports = pruneReports(state.na_reports, nowMs);
    const refreshedState = {
      ...state,
      na_reports: prunedReports,
      na_reports_count: prunedReports.length,
    };
    if (refreshedState.na_reports_count >= 2) {
      refreshedState.status = "paused";
      refreshedState.paused_reason = "not_available_reports";
      refreshedState.owner_reconfirm_required = true;
    }
    initStateMap[listingId] = refreshedState;
    applyListingStateToCard(card, refreshedState);
  });
  saveStateMap(initStateMap);
   
  function inRentRange(rent, range) {
    if (!range) return true;
    if (range.endsWith("+")) return rent >= Number(range.replace("+", ""));
    const [min, max] = range.split("-").map(Number);
    return rent >= min && rent <= max;
  }

  function inSizeRange(size, range) {
    if (!range) return true;
    if (range.endsWith("+")) return size >= Number(range.replace("+", ""));
    const [min, max] = range.split("-").map(Number);
    return size >= min && size <= max;
  }

   function toDateKey(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function getListingVisibility(card, todayKey) {
    const expiry = (card.dataset.expiry || "").trim();
    const statusRaw = (card.dataset.status || "").trim();
    const status = statusRaw.toLowerCase();

    if (!status || !expiry) {
      return false;
    }

    if (expiry < todayKey) {
      if (status !== "expired") {
        card.dataset.status = "expired";
      }
      return false;
    }

    return status === "active" && todayKey <= expiry;
  }

  function applyFilters() {
    const fd = new FormData(form);
    const city = (fd.get("city") || "").toString().toLowerCase();
    const category = (fd.get("category") || "").toString().toLowerCase();
    const type = (fd.get("type") || "").toString().toLowerCase();
    const area = (fd.get("area") || "").toString().toLowerCase();
    const sizeRange = (fd.get("size") || "").toString();
    const rentRange = (fd.get("rent") || "").toString();

    // Secondary Common
    const floor = (fd.get("floor") || fd.get("floorCommercial") || "").toString().toLowerCase();
    const furnishing = (fd.get("furnishing") || fd.get("furnishingCommercial") || "").toString().toLowerCase();

    // Residential specific
    const bhk = (fd.get("bhk") || "").toString().toLowerCase();
    const age = (fd.get("age") || "").toString().toLowerCase();
    const amenities = fd.getAll("amenities"); // array

    // Commercial specific
    const amenitiesCom = fd.getAll("amenitiesCommercial");

    // Determine active amenities list based on category
    const activeAmenities = category === "commercial" ? amenitiesCom : amenities;

    let shown = 0;
     const todayKey = toDateKey(new Date());

    listings.forEach((card) => {
       const isVisible = getListingVisibility(card, todayKey);
      if (!isVisible) {
        card.style.display = "none";
        return;
      }
      // Basic Fields
      const cCity = (card.dataset.city || "").toLowerCase();
      const cCategory = (card.dataset.category || "").toLowerCase();
      const cType = (card.dataset.type || "").toLowerCase();
      const cArea = (card.dataset.area || "").toLowerCase();
      const cSize = Number(card.dataset.size || 0);
      const cRent = Number(card.dataset.rent || 0);

      // Secondary Fields
      const cBhk = (card.dataset.bhk || "").toLowerCase();
      const cFloor = (card.dataset.floor || "").toLowerCase();
      const cFurnish = (card.dataset.furnishing || "").toLowerCase();
      const cAge = (card.dataset.age || "").toLowerCase(); // New data attribute for demo
      const cAmenities = (card.dataset.amenities || "").split(",").filter(Boolean); // array

      // Filter Logic
      const ok =
        (!city || cCity === city) &&
        (!category || cCategory === category) &&
        (!type || cType === type) &&
        (!area || cArea.includes(area)) &&
        inSizeRange(cSize, sizeRange) &&
        inRentRange(cRent, rentRange) &&
        (!floor || cFloor === floor) &&
        (!furnishing || cFurnish === furnishing) &&
        (!bhk || cBhk === bhk) &&
        (!age || cAge === age) &&
        (activeAmenities.length === 0 || activeAmenities.every(a => cAmenities.includes(a)));

      card.style.display = ok ? "" : "none";
      if (ok) shown++;
    });

    if (resultsCount) resultsCount.textContent = `Showing ${shown} properties`;
  }

  // Bindings
  syncCommercialVisibility();

  const searchBtn = document.getElementById("filtersSearchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      syncCommercialVisibility();
      applyFilters();
    });
  }

  // ✅ AUTO-APPLY FOR SECONDARY FILTERS (More Filters)
  // Listen for changes on any select or input inside the filters-panel
  const secondaryInputs = document.querySelectorAll(".filters-panel select, .filters-panel input");
  secondaryInputs.forEach(el => {
    el.addEventListener("change", () => {
      applyFilters();
    });
    // For text inputs (if any in future) or immediate range response
    el.addEventListener("input", () => {
      applyFilters();
    });
  });
  if (clearBtn) clearBtn.addEventListener("click", (e) => {
    e.preventDefault();
    form.reset();

    const areaInput = document.getElementById("fArea");
    if (areaInput) {
      areaInput.value = "";
      areaInput.dispatchEvent(new Event("input", { bubbles: true })); // Clear custom UI
    }
    const areaPanel = document.getElementById("areaPanel");
    if (areaPanel) areaPanel.hidden = true;

    if (filtersUI) {
      filtersUI.classList.remove("show-more");
      moreBtn.textContent = "+ More Filters";
      moreBtn.setAttribute("aria-expanded", "false");
    }

    syncCommercialVisibility();
    applyFilters();
  });

  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      // Re-sync visibility immediately on change so user sees correct filters
      syncCommercialVisibility();
    });
  }

  if (moreBtn && filtersUI) {
    moreBtn.addEventListener("click", () => {
      const expanded = filtersUI.classList.toggle("show-more");
      moreBtn.textContent = expanded ? "− Less Filters" : "+ More Filters";
      moreBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
      syncCommercialVisibility();
    });
  }

  // Initial Apply
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


(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }


})();
