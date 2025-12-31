# ARH Rentals — OTP & Session Reference (Frontend + Backend)

## 1) Overview
ARH Rentals me OTP login ka goal:
- User mobile number enter kare
- OTP SMS jaaye
- OTP verify ho
- Backend se session token mile
- Token browser me store ho (localStorage)
- Future requests me token use karke user identify ho

## 2) Files Map (Kis file me kya hai)

### A) Backend (Cloudflare Worker)
**File/Project:** Cloudflare Worker (separate deployment)
**Responsibility:**
- OTP generate + store (hashed)
- OTP resend rules enforce
- OTP verify
- Session token generate + store
- /me endpoint token validate karke phone return karta

**Endpoints:**
1) GET  /check-pincode?pincode=XXXXXX
2) POST /send-otp  { mobile, pincode }
3) POST /verify-otp { mobile, otp }
4) GET  /me  (Authorization: Bearer <token>)

---

### B) Frontend JS
**File:** /assets/app.js
**Responsibility:**
- PIN check button handler (post page)
- Send OTP click handler (calls backend /send-otp)
- Verify OTP click handler (calls backend /verify-otp)
- UI countdown / cooldown show
- UI lock (4 hours) store
- localStorage/sessionStorage keys manage
- "Send OTP" vs "Resend OTP" label memory

---

### C) Frontend Pages (HTML)
1) **/post/index.html**
   - Step 1 PIN input + button IDs used by app.js
   - Step 3 OTP UI:
     - #mobileInput
     - #sendOtpBtn
     - #otpInput
     - #verifyOtpBtn
     - #otpMsg
   - app.js yahi bind hota hai

2) **/index.html**, **/listings/index.html**, **/pricing/index.html**
   - Shared layout + includes:
     - <script src="/assets/app.js"></script>
   - Abhi listings/pricing me OTP gating fully implemented nahi (future work)

---

## 3) Storage Keys (Browser me kya store hota hai)

### A) sessionStorage (temporary per tab)
1) "arh_pincode"
   - post page me PIN check pass hone pe set hota hai
2) "arh_mobile"
   - OTP send success hone pe set hota hai
   - Verify ke time use hota hai

### B) localStorage (persistent)
1) "arh_token"
   - OTP verify success pe backend se token aata hai, store hota hai
   - Ye token user ki login session identity hai

2) "arh_otp_cooldown_until"
   - 60 sec resend cooldown (timestamp ms)
   - refresh ke baad bhi countdown continue rahe

3) "arh_otp_lock_until"
   - JSON map per mobile 4-hour lock
   - example:
     {
       "9999999999": 1730000000000
     }

4) "arh_otp_sent_once_<mobile>"
   - Send vs Resend label memory
   - first successful OTP ke baad "1" set hota hai
   - same mobile par future me button base text "Resend OTP" ban jaata hai

---

## 4) OTP Flow (Step-by-step)

### Step 0: PIN check (Post page)
**Frontend:** /assets/app.js
- Button: #pinCheckBtn
- Calls:
  GET /check-pincode?pincode=XXXXXX
- If allowed:
  - sessionStorage["arh_pincode"] = pincode
  - #step2 show

### Step 1: Send OTP
**Frontend:** /assets/app.js
- Button: #sendOtpBtn
- Validations:
  - Mobile must be 10 digit, starts 6-9
  - sessionStorage["arh_pincode"] must exist
  - UI Lock check (4h) — getLockUntil(mobile)
- Calls backend:
  POST /send-otp { mobile, pincode }

**Backend:** Worker
- Validations:
  - mobile regex
  - pincode allowed
- Rules enforced:
  RULE A: 60 sec cooldown
  RULE B: max 3 OTP in 4 hours
- OTP generated, SMS sent
- DB me OTP hash store hota hai

**Frontend on success:**
- localStorage["arh_otp_cooldown_until"] = now+60s
- startSendBtnCountdown(sendOtpBtn, until, otpBtnBaseTextForMobile(mobile))
- sessionStorage["arh_mobile"]=mobile
- markOtpSentOnce(mobile) -> "arh_otp_sent_once_<mobile>"="1"

**Frontend on failure:**
- If 429 + message has "hour" => 4 hours lock set
  setLockUntil(mobile, now+4h)
  startSendBtnCountdown(...)  (Try after ...)

---

### Step 2: Verify OTP
**Frontend:**
- Button: #verifyOtpBtn
- Uses:
  mobile = sessionStorage["arh_mobile"]
  otp = #otpInput
- Calls:
  POST /verify-otp { mobile, otp }

**Backend:**
- OTP hash match + 5 min window
- If OK:
  - Ensure user exists
  - Create session token (UUID)
  - Store token_hash in sessions table
  - Return { token }

**Frontend on success:**
- localStorage["arh_token"] = token
- clearLock(mobile)  (optional)
- user is "logged in" for future

---

## 5) Resend / Send Button Behaviour (Important)
Goal:
- First time: button text = "Send OTP"
- Same number par again (after one successful send): base text = "Resend OTP"

Implementation:
- otpBtnBaseTextForMobile(mobile):
  - checks localStorage "arh_otp_sent_once_<mobile>"
  - if "1" => "Resend OTP"
  - else => "Send OTP"

When it updates:
- markOtpSentOnce(mobile) is called ONLY on successful /send-otp response.

Countdown:
- While cooldown active, button shows "Try after 0h 00m XXs"
- Countdown ends => button returns to base text (Send/Resend depending on mobile)

---

## 6) Backend DB Expectations
Worker DB tables expected (based on queries):
- otps(mobile, otp_hash, created_at, expires_at, tries)
- sessions(token_hash, phone, created_at)
- users(phone)

(Ensure schema matches the code: some earlier versions used "phone" column in otps; current code uses "mobile".)

---

## 7) What OTP Does NOT Do Yet (Future)
- Token based authorization for posting multiple properties
- Payment-plan mapping (1 payment => how many listings)
- Listing publish flow with server-side checks

Right now:
- OTP login only generates a session token.
- Payment logic / plan enforcement must be added separately.

---

## 8) Quick Debug Checklist
1) OTP SMS nahi aaya:
   - Worker logs check (SMS gateway response)
   - DLT template id/config
2) Resend button wrong label:
   - check localStorage key "arh_otp_sent_once_<mobile>"
3) Cooldown not persisting:
   - check "arh_otp_cooldown_until"
4) Verify fail:
   - ensure OTP stored in DB with correct column name "mobile"
   - time windows (5 min)
5) /me fails:
   - Authorization header "Bearer <token>" sent
   - token_hash match sessions table
