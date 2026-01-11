/* =========================================================
   ARH Rentals - Dashboard logic
========================================================= */

const DASHBOARD_BACKEND = "https://arh-backend.manishsoni696.workers.dev";
const PIN_KEY = "arh_pincode";
const TOKEN_KEY = "arh_token";
const MOBILE_KEY = "arh_mobile";
const OTP_LOCK_KEY = "arh_otp_lock_until";

const loginCard = document.getElementById("dashboardLogin");
const listingsCard = document.getElementById("dashboardListings");
const statusEl = document.getElementById("dashboardStatus");
const listEl = document.getElementById("dashboardList");
const emptyEl = document.getElementById("dashboardEmpty");

const mobileInput = document.getElementById("dashMobileInput");
const sendOtpBtn = document.getElementById("dashSendOtpBtn");
const otpMsgEl = document.getElementById("dashOtpMsg");
const otpVerifyBox = document.getElementById("dashOtpVerifyBox");
const otpInput = document.getElementById("dashOtpInput");
const verifyOtpBtn = document.getElementById("dashVerifyOtpBtn");
const logoutBtn = document.getElementById("dashboardLogout");

function setText(el, txt) {
  if (el) el.textContent = txt;
}

function normalizeMobile(mobile) {
  return String(mobile || "").trim().replace(/\D/g, "").slice(0, 10);
}

function normalizeOtp(otp) {
  return String(otp || "").trim().replace(/\D/g, "").slice(0, 6);
}

function formatDate(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

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
  const value = map[mobile];
  return typeof value === "number" ? value : 0;
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

function startSendBtnCountdown(button, lockUntilMs, baseText = "Send OTP") {
  if (!button) return;
  button.disabled = true;
  const tick = () => {
    const left = lockUntilMs - Date.now();
    if (left <= 0) {
      button.disabled = false;
      button.textContent = baseText;
      return;
    }
    button.textContent = `Try after ${formatHMS(left)}`;
    setTimeout(tick, 1000);
  };
  tick();
}

function otpBtnBaseTextForMobile(mobile) {
  const key = `arh_otp_sent_once_${mobile}`;
  return localStorage.getItem(key) === "1" ? "Resend OTP" : "Send OTP";
}

function markOtpSentOnce(mobile) {
  localStorage.setItem(`arh_otp_sent_once_${mobile}`, "1");
}

function showLogin() {
  if (loginCard) loginCard.style.display = "block";
  if (listingsCard) listingsCard.style.display = "none";
}

function showDashboard() {
  if (loginCard) loginCard.style.display = "none";
  if (listingsCard) listingsCard.style.display = "block";
}

function redirectToPinGate() {
  window.location.href = "/post/";
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(MOBILE_KEY);
  sessionStorage.removeItem(PIN_KEY);
}

function resolveArea(listing) {
  return listing.area || listing.locality || listing.sector || listing.neighborhood || "—";
}

function resolvePlan(listing) {
  return listing.plan || listing.plan_name || listing.planType || "—";
}

function computeStatusLabel(listing) {
  const statusRaw = String(listing.status || listing.visibility || "").toLowerCase();
  if (statusRaw.includes("expired") || statusRaw.includes("hidden")) {
    return "Hidden (expired)";
  }
  if (statusRaw.includes("active")) {
    return "Active";
  }
  if (listing.expires_at) {
    const expiry = new Date(listing.expires_at);
    if (!Number.isNaN(expiry.getTime()) && Date.now() > expiry.getTime()) {
      return "Hidden (expired)";
    }
  }
  return "Active";
}

function renderListings(listings) {
  if (!listEl) return;
  listEl.innerHTML = "";
  if (!Array.isArray(listings) || listings.length === 0) {
    if (emptyEl) emptyEl.style.display = "block";
    return;
  }
  if (emptyEl) emptyEl.style.display = "none";

  listings.forEach((listing) => {
    if (listing.deleted_at) return;
    const card = document.createElement("div");
    card.className = "dashboard-card";

    // Build title from property details
    const propertyType = listing.property_type || "Property";
    const rooms = listing.number_of_rooms || "";
    const title = rooms ? `${rooms} ${propertyType}` : propertyType;

    const area = listing.area || "—";
    const rent = listing.rent ? `₹${listing.rent.toLocaleString('en-IN')}/month` : "—";
    const status = computeStatusLabel(listing);

    // Format dates from unix timestamps
    const createdDate = listing.created_at ? new Date(listing.created_at * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "—";
    const expiryDate = listing.expires_at ? new Date(listing.expires_at * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "—";

    card.innerHTML = `
      <div class="dashboard-card-head">
        <div>
          <h4>${title}</h4>
          <p class="small">📍 ${area} • ${rent}</p>
        </div>
        <span class="status-pill">${status}</span>
      </div>
      <div class="dashboard-card-meta">
        <span>Posted: ${createdDate}</span>
        <span>Expires: ${expiryDate}</span>
      </div>
    `;
    listEl.appendChild(card);
  });
}

async function validateSession(token) {
  try {
    const res = await fetch(`${DASHBOARD_BACKEND}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function loadListings(token) {
  setText(statusEl, "Loading listings...");
  if (emptyEl) emptyEl.style.display = "none";
  try {
    const res = await fetch(`${DASHBOARD_BACKEND}/api/listings/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Listing fetch failed");
    const data = await res.json().catch(() => ({ success: false, listings: [] }));
    setText(statusEl, "");

    // Handle both response formats
    const listings = data.success ? data.listings : (Array.isArray(data) ? data : []);
    renderListings(listings);
  } catch (error) {
    console.error(error);
    setText(statusEl, "Unable to load listings. Please try again.");
  }
}

async function initDashboard() {
  const pin = sessionStorage.getItem(PIN_KEY);
  if (!pin) {
    redirectToPinGate();
    return;
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    showLogin();
    return;
  }

  const valid = await validateSession(token);
  if (!valid) {
    localStorage.removeItem(TOKEN_KEY);
    showLogin();
    return;
  }

  showDashboard();
  await loadListings(token);
}

if (sendOtpBtn) {
  // Check cooldown for current number on page load
  const mNow = normalizeMobile(mobileInput?.value);
  if (mNow) {
    const cooldownKey = `arh_otp_cooldown_${mNow}`;
    const cd = Number(localStorage.getItem(cooldownKey) || 0);
    if (cd > Date.now()) {
      startSendBtnCountdown(sendOtpBtn, cd, otpBtnBaseTextForMobile(mNow));
    } else if (cd > 0) {
      localStorage.removeItem(cooldownKey); // Clear expired timer
    }
  }

  // ✅ Real-time timer update when number changes
  if (mobileInput) {
    mobileInput.addEventListener("input", () => {
      const mobile = normalizeMobile(mobileInput.value);

      if (mobile.length === 10) {
        const cooldownKey = `arh_otp_cooldown_${mobile}`;
        const cd = Number(localStorage.getItem(cooldownKey) || 0);

        if (cd > Date.now()) {
          startSendBtnCountdown(sendOtpBtn, cd, otpBtnBaseTextForMobile(mobile));
        } else {
          if (cd > 0) localStorage.removeItem(cooldownKey);
          sendOtpBtn.disabled = false;
          sendOtpBtn.textContent = otpBtnBaseTextForMobile(mobile);
        }
      } else {
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = "Send OTP";
      }
    });
  }

  sendOtpBtn.addEventListener("click", async () => {
    const mobile = normalizeMobile(mobileInput?.value);
    const pincode = sessionStorage.getItem(PIN_KEY);

    if (mobile.length !== 10) {
      setText(otpMsgEl, "❌ Enter valid 10-digit mobile number");
      return;
    }
    if (!pincode) {
      setText(otpMsgEl, "❌ Please check PIN first");
      redirectToPinGate();
      return;
    }

    const lockUntil = getLockUntil(mobile);
    if (lockUntil && Date.now() < lockUntil) {
      setText(otpMsgEl, `❌ OTP limit reached. Try after ${formatHMS(lockUntil - Date.now())}`);
      startSendBtnCountdown(sendOtpBtn, lockUntil, otpBtnBaseTextForMobile(mobile));
      return;
    }

    setText(otpMsgEl, "⏳ Sending OTP...");

    try {
      const res = await fetch(`${DASHBOARD_BACKEND}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, pincode }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        if (res.status === 429 && (data.message || "").toLowerCase().includes("hour")) {
          const until = Date.now() + 4 * 60 * 60 * 1000;
          setLockUntil(mobile, until);
          startSendBtnCountdown(sendOtpBtn, until, otpBtnBaseTextForMobile(mobile));
        }
        setText(otpMsgEl, `❌ ${data.message || "OTP failed"}`);
        return;
      }

      // Store cooldown specific to this mobile number
      const until = Date.now() + 60 * 1000;
      const cooldownKey = `arh_otp_cooldown_${mobile}`;
      localStorage.setItem(cooldownKey, String(until));
      markOtpSentOnce(mobile);
      sessionStorage.setItem(MOBILE_KEY, mobile);

      startSendBtnCountdown(sendOtpBtn, until, otpBtnBaseTextForMobile(mobile));
      setText(otpMsgEl, "✅ OTP sent. Please enter OTP.");
      if (otpVerifyBox) otpVerifyBox.style.display = "block";
    } catch (error) {
      console.error(error);
      setText(otpMsgEl, "❌ Network error");
    }
  });
}

if (verifyOtpBtn) {
  verifyOtpBtn.addEventListener("click", async () => {
    const mobile = sessionStorage.getItem(MOBILE_KEY) || "";
    const otp = normalizeOtp(otpInput?.value);

    if (!mobile || mobile.length !== 10) {
      setText(otpMsgEl, "❌ Please send OTP first");
      return;
    }
    if (otp.length < 4) {
      setText(otpMsgEl, "❌ Enter OTP");
      return;
    }

    setText(otpMsgEl, "⏳ Checking OTP...");

    try {
      const res = await fetch(`${DASHBOARD_BACKEND}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success || !data.token) {
        setText(otpMsgEl, `❌ ${data.message || "Invalid/Expired OTP"}`);
        return;
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      clearLock(mobile);
      setText(otpMsgEl, "✅ Logged in");
      showDashboard();
      await loadListings(data.token);
    } catch (error) {
      console.error(error);
      setText(otpMsgEl, "❌ Network error");
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    clearSession();

    // Clear OTP cooldown timers and "sent once" flags
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("arh_otp_cooldown_") || key.startsWith("arh_otp_sent_once_")) {
        localStorage.removeItem(key);
      }
    });

    window.location.href = "/post/";
  });
}

// Ensure guard runs on back/forward navigation (BFCache)
window.addEventListener("pageshow", (event) => {
  // If persisted (from cache) or just normal load, re-run init logic
  // "initDashboard" handles the checks safely
  initDashboard();
});

document.addEventListener("DOMContentLoaded", initDashboard);
