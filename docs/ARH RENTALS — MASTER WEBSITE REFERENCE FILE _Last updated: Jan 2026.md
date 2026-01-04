# 📁 ARH RENTALS — MASTER WEBSITE REFERENCE FILE
_Last updated: Jan 2026_

---

## 0) PROJECT OVERVIEW (VERY IMPORTANT)

**Project Name:** ARH Rentals  
**Owner Brand:** Anjani Real Heights  
**Type:** Local rental portal (Hisar-focused)

### Core Idea
- Property **post karne ke liye payment** (Owner side)
- Property **dekhna free**, details unlock paid (Tenant side – future)
- **1 payment = 1 property listing** (LOCKED rule)

---

## 1) USER TYPES

### A) OWNER (Property Poster)
- OTP login required
- Har property ke liye **alag plan + payment**
- Same phone number:
  - Property #1 → payment
  - Property #2 → new payment
- Plan **user-level nahi**, **property-level** hota hai

### B) TENANT / SEEKER (Future)
- Listings browse free
- Phone / full details unlock = paid (future scope)

---

## 2) LIVE OWNER PLANS (LOCKED)

| Plan | Price | Visibility |
|----|------|-----------|
| Basic | ₹199 | 15 days |
| Premium | ₹349 | 30 days |
| Pro | ₹599 | 60 days |

**Rules (LOCKED):**
- 1 plan = 1 property only
- No unlimited listings
- No lifetime plans

---

## 3) FRONTEND FILE STRUCTURE

/index.html                → Home  
/pricing/index.html        → Pricing plans (UI)  
/post/index.html           → Post property (PIN + OTP)  
/listings/index.html       → Browse listings (demo)  

/assets/  
- app.js              → OTP + PIN logic  
- styles.css          → All styling  
- arh-logo.png  

---

## 4) OTP LOGIN SYSTEM (ALREADY IMPLEMENTED)

### Backend
- Cloudflare Worker

**Endpoints**
- GET  /check-pincode?pincode=XXXXXX
- POST /send-otp
- POST /verify-otp
- GET  /me (Bearer token)

### OTP RULES (LOCKED)
- 60 sec resend cooldown
- Max **3 OTP in 4 hours**
- OTP valid for **5 minutes**
- OTP stored as hash

### Frontend Storage Keys

**localStorage**
- arh_token
- arh_otp_cooldown_until
- arh_otp_lock_until
- arh_otp_sent_once_<mobile>

**sessionStorage**
- arh_pincode
- arh_mobile

---

## 5) PRICING PAGE (CURRENT WORK AREA)

**File:** /pricing/index.html

### Required DOM Structure
<section id="pricingGrid">
  <article class="card" data-plan="basic"></article>
  <article class="card featured" data-plan="premium"></article>
  <article class="card" data-plan="pro"></article>
</section>

### Intended Behaviour
- Card OR button click:
  - add `.selected` to that card
  - button text → **Selected**
- Other cards:
  - `.selected` removed
  - button text → Select Plan
- Default on load:
  - **Premium selected**

### Current Issue (IMPORTANT)
- JS executes correctly
- DOM elements found
- `.selected` class is applied
- **Visual highlight NOT visible**
- Root cause: **CSS override / selector / cache**
- NOT a JavaScript logic issue

---

## 6) REQUIRED CSS (MUST BE AT END OF styles.css)

#pricingGrid .card.selected {
  border: 3px solid rgba(29,161,242,.95);
  box-shadow: 0 0 0 4px rgba(29,161,242,.22);
}

#pricingGrid .card.selected::before {
  content: "SELECTED";
  position: absolute;
  top: 12px;
  left: 12px;
}

#pricingGrid .card.selected .select-btn {
  background: linear-gradient(180deg,#1da1f2,#0a74b8);
  color: #fff;
  font-weight: 700;
}

---

## 7) PAYMENT + LISTING BACKEND (NOT IMPLEMENTED YET)

### Tables (Already Created)
- payments
- credits
- listings
- users
- sessions
- otps

### Locked Logic
- Payment success → create **1 credit**
- Listing publish → **consume 1 credit**
- Listing expiry → hide → soft delete → hard delete later

---

## 8) STATUS SUMMARY

**DONE**
- OTP login
- PIN check
- Pricing UI
- Database tables
- Business rules locked

**PENDING**
- Razorpay integration
- Credit issuance
- Listing create API
- Listing expiry job
- Tenant unlock flow

---

## 9) DEBUG STATUS (PRICING)

Console results:
- pricingGrid exists ✅
- cards detected (3) ✅
- click events firing ✅
- `.selected` class applied ✅
- highlight NOT visible ❌

**Conclusion:** CSS problem, not JS

---

## 10) NEXT SESSION START POINT

In new ChatGPT chat, start with:

“Use the ARH Rentals Master Reference.  
Problem: pricing page selected card highlight not visible.  
JS works, DOM works, need CSS fix / override cleanup.”

Then share:
- pricing/index.html (final)
- assets/styles.css (last ~100 lines)

---

## 11) OWNER PREFERENCE

- One step at a time
- Clear instruction:
  - KYA change
  - KAHA change
  - Change ke baad code kaise dikhega
- No unnecessary theory

---

END OF MASTER REFERENCE FILE
