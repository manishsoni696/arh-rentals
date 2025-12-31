# ARH Rentals – Pricing Page Session Reference (2026-01-01)

## 1) Aaj ka Goal
Pricing page par:
- kisi bhi plan card / “Select Plan” button par click karte hi
  - us card par **highlight border + selected badge** aaye
  - us card ka button text **“Selected”** ho
  - baaki cards ka button text **“Select Plan”** rahe
- default load par **Premium** selected rahe

## 2) Final HTML (Pricing) – Current State
File: `pricing/index.html`

### A) Cards structure
- Grid container: `<section class="grid-3" id="pricingGrid">`
- Each card: `<article class="card" data-plan="basic|premium|pro">`
- Button: `<button class="btn btn-primary select-btn" type="button">Select Plan</button>`

### B) Note
- Premium card ke `<article>` par “selected” class hardcode NAHI karni (JS default select karega).
- `<script src="../assets/app.js"></script>` **sirf 1 baar** include karna hai.

### C) Selection Script (Sirf 1 baar)
(Ye script `</body>` se just pehle होना चाहिए, aur `app.js` ke baad.)
- Script logic:
  - all cards se `.selected` remove
  - clicked card par `.selected` add
  - selected card ka button text "Selected"
  - others "Select Plan"
  - default selected = premium

> IMPORTANT: Is script ki multiple copies / duplicate DOMContentLoaded scripts nahi hone chahiye.
> Aaj duplicates aa gaye the, unko remove karna zaroori hai.

## 3) Final CSS (Selected Highlight) – Current State
File: `assets/styles.css`

Selected highlight ke liye CSS hona chahiye:

- `.card.selected { ... border/box-shadow/background ... }`
- `.card.selected::before { content:"SELECTED"; ... }`
- `.card.selected .select-btn { ... selected button styling ... }`

Aaj CSS me duplicate/override hone ka risk tha.
Final recommended block (saaf version) ko CSS ke bilkul END me rakhna best hai:

#pricingGrid .card.selected {
  border: 3px solid rgba(29,161,242,.95) !important;
  box-shadow: 0 0 0 4px rgba(29,161,242,.22), 0 22px 60px rgba(0,0,0,.55) !important;
  transform: translateY(-2px);
  background: linear-gradient(180deg, rgba(29,161,242,.16), rgba(15,23,32,.90)) !important;
}
#pricingGrid .card.selected::before{
  content:"SELECTED";
  position:absolute;
  top:12px;
  left:12px;
  z-index:11;
  padding:6px 10px;
  border-radius:999px;
  font-size:11px;
  letter-spacing:.8px;
  text-transform:uppercase;
  border:1px solid rgba(29,161,242,.55);
  background: rgba(29,161,242,.30);
  color:#fff;
}
#pricingGrid .card.selected .select-btn{
  background: linear-gradient(180deg,#1da1f2,#0a74b8) !important;
  border-color: transparent !important;
  color:#fff !important;
  font-weight:700;
}

## 4) Problem Jo Abhi Tak Aa Rahi Hai
User report: “Abhi bhi kuch nahi hua” i.e.
- click karne par selected button text + highlight apply nahi ho raha.

Iska most-likely reason:
1) **JS script run nahi ho raha** (script tag galat jagah / broken HTML / duplicate </body> / syntax issue)
2) **CSS override ho raha hai** ya `.card.selected` styles missing
3) **Cached old CSS/JS** (hard refresh required)
4) `app.js` me koi code error hai jo page ke JS ko break kar raha hai (console error)

## 5) Kal ka Start Point (Exact Steps)
### Step 1: HTML Cleanup (must)
- `pricing/index.html` me ensure:
  - **only one** `<script src="../assets/app.js"></script>`
  - **only one** selection `<script>...</script>`
  - file ke end me **sirf ek** `</body>` aur **sirf ek** `</html>`

### Step 2: Browser Console Check
- DevTools → Console:
  - koi red error? (especially from `app.js`)
  - agar error hai, error text copy karo.

### Step 3: CSS Confirm
- `assets/styles.css` ke END me `#pricingGrid .card.selected ...` block present ho.
- Hard refresh: Ctrl+Shift+R

### Step 4: Quick Test
- Basic card par click → Basic becomes highlighted + button shows Selected
- Premium click → highlight moves
- Pro click → highlight moves

## 6) Business Plans Discussion (Reference)
### Startup Plans (Tenant / Rent-seeker)
- Residential startup plan: minimum price **₹29** (1 property unlock / single property)
- Commercial startup plan: residential se **thoda higher** (single property)
- Logic: user ko “pure Hisar” nahi chahiye; **pincode + micro-area** (e.g., 125001 → Sector 14) based unlock.

### Future Plans (Reference only)
- Minimum price future me **₹29+**
- Plan duration options: 5 days / 1 week etc
- Unlock logic:
  - ek micro-area me limited properties unlock: **1 / 5 / 10**
  - residential/commercial plans separate
- Startup offer note: “abhi startup offer, future me plans increase honge”

## 7) Notes / Reminders
- User preference: “1 baar me 1 step, clearly, kaha change karna hai aur change ke baad code kaise dikhega.”
- Current pending: selection feature working karwana (JS+CSS+HTML cleanup + console errors)

--- 
END
