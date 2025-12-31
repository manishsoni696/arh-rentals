# ARH Rentals — OTP + Auth + Plans + Payments + Listings
## SINGLE SOURCE OF TRUTH (REFERENCE)
_Last updated: 31-Dec-2025_

---

## 0) Business Model (LOCKED)

ARH Rentals एक rental portal है जिसमें 2 प्रकार के users हैं:

### A) Owner (Property Poster)
- Owner अपनी property post करेगा
- हर property post करने के लिए payment लगेगा
- 1 payment = 1 property listing
- Same phone number से दूसरी property post करने के लिए नई payment + नया plan
- Plan user-level नहीं बल्कि property-level attach होगा

Example:
- Property #1 → Premium
- Property #2 → Basic  
(Same phone number allowed)

---

### B) Tenant / Seeker (Viewer)
- Listings search करेगा
- Owner का phone / full details unlock करने के लिए payment करेगा
- Seeker plans future scope में हैं

---

## 1) Frontend File Structure

### Core JS
- /assets/app.js
  - PIN check logic
  - OTP send / resend / verify
  - UI cooldown + lock handling
  - Session token storage

### Pages
- /index.html → Home
- /post/index.html → Owner flow (PIN + OTP)
- /pricing/index.html → Owner plans UI
- /listings/index.html → Listings (demo)
- /legal/index.html → Legal

### Assets
- /assets/styles.css
- /assets/arh-logo.png

---

## 2) Frontend Storage Keys (IMPORTANT)

### localStorage
- arh_token  
  Backend session token (Bearer)

- arh_otp_cooldown_until  
  60 sec resend cooldown (epoch ms)

- arh_otp_lock_until  
  Per-mobile 4 hour UI lock  
  Example:
  {
    "9999999999": 1730000000000
  }

- arh_otp_sent_once_<mobile>  
  Controls Send OTP / Resend OTP label

### sessionStorage
- arh_pincode → Verified PIN
- arh_mobile → Mobile used in OTP flow

---

## 3) Frontend OTP Behaviour (LOCKED)

- First OTP for a mobile → Send OTP
- Same mobile again → Resend OTP
- Every successful OTP send:
  - 60 sec cooldown (button disabled + countdown)
- If backend blocks (3 OTP / 4 hours):
  - UI locked for 4 hours with message

---

## 4) Backend (Cloudflare Worker)

Worker URL:
https://arh-backend.manishsoni696.workers.dev

### Active Routes
- GET /health
- GET /check-pincode?pincode=125001
- POST /send-otp
- POST /verify-otp
- GET /me

---

## 5) PIN Check (Backend)

Allowed PINs (hardcoded):
- 125001
- 125004
- 125005
- 125033

Flow:
- Frontend calls /check-pincode
- If allowed → next step unlocked
- Else → Service not available

---

## 6) OTP Rules (Backend — LOCKED)

1) 60 seconds resend throttle  
   Same mobile within 60 sec → 429

2) Max 3 OTP in 4 hours  
   4th attempt → blocked for 4 hours

3) OTP validity  
   5 minutes

4) Security  
   OTP stored as hash:
   sha256(mobile:otp)

---

## 7) Backend Tables (Cloudflare D1)

### Existing Tables
- otps
- users
- sessions
- listings
- payments
- credits

---

### otps
- mobile
- otp_hash
- created_at
- expires_at
- tries

---

### users
- phone (unique)

---

### sessions
- token_hash
- phone
- created_at

---

### payments
- One payment attempt
- Fields (intended):
  - phone
  - role (owner / seeker)
  - plan_id
  - amount
  - status (created / paid / failed / refunded)
  - provider_order_id
  - provider_payment_id
  - created_at
  - paid_at

---

### credits
- 1 payment = 1 credit
- Fields:
  - phone
  - plan_id
  - status (unused / used / expired)
  - used_for_listing_id

---

### listings
- One row = one property
- Fields:
  - owner_phone
  - plan_id
  - status (draft / published / expired / deleted)
  - published_at
  - expires_at
  - deleted_at

---

## 8) Owner Plans (LOCKED)

Plans:
- Basic ₹199 → 15 days
- Premium ₹349 → 30 days
- Pro ₹599 → 60 days

Rules:
- Plan is per property
- Same owner can choose different plans for different properties

---

## 9) Expiry & Delete Policy (LOCKED)

1) Plan expires
2) Listing hidden (user visible = NO)
3) deleted_at set (soft delete)
4) After grace period → permanent delete + media cleanup

---

## 10) Posting Rules (LOCKED)

- Owner must be logged in (arh_token required)
- System checks unused credit:
  - YES → allow post + mark credit USED
  - NO → redirect to pricing + payment

---

## 11) Current Status

DONE:
- PIN check
- OTP send / verify
- Session token
- D1 tables created

PENDING:
- Payment gateway integration
- Credit issuance after payment
- Listing create API
- Listing expiry automation
- Seeker unlock flow

---

## 12) Reminder for Next Phase

Owner flow final:
PIN → Plan → Payment → Credit → Property Form → Publish

Payment is ALWAYS per property, never per user.
