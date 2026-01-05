🔐 ARH RENTALS — UPDATED PENDING TASKS & NEXT STEPS MASTER (v6.1)
Last Updated: Jan 2026 (Jan 5, 2026)

OVERALL GOAL (NON-NEGOTIABLE)
✅ Website visually premium ho
✅ Fast load ho (no bloat)
✅ SEO-friendly ho
✅ Mobile + Tablet + Desktop perfect ho
✅ No technical compromise — jo zarurat ho, wo change hoga

OVERALL STATUS (UPDATED THIS SESSION)
🔒 Core Stable
✅ Auth + Pricing + Legal + Post Flow Locked
🟡 Listings UI FINALIZATION IN PROGRESS (ACTIVE)
🟠 styles.css CLEANUP REQUIRED (HIGH PRIORITY)
🟡 Listings “Area/Sector” dropdown + typing suggestions requested (ACTIVE)
🟡 Listings “More Filters” toggle NOT working (ACTIVE BUG)
⏳ SEO & Backend Planning Deferred

✅ COMPLETED & LOCKED (DO NOT TOUCH)
1) Working Rules & Execution Process — 🔒 LOCKED
Rules Master finalized (Manish working style)
✅ Single-chat workflow confirmed (no multi-expert / no master-controller)
✅ One task at a time, sequential fixes only
✅ One step = one file = one paste box
✅ Mobile + Tablet + Desktop mandatory (LOCKED forever)
Owner note:
“Full code nahi chahiye, sirf exact change + exact location”
→ Still follows paste-box rule, but minimal snippet only.

2) Core UI Foundation — 🔒 LOCKED
Dark SaaS-style theme finalized
Header structure locked (Brand | Nav | CTA)
Hero hierarchy refined
Button system standardized
Card system finalized

3) Mobile Menu (NAV) — 🔒 LOGIC LOCKED (STABLE)
Status: Stable & acceptable (session verified)
Working on (verified):
Home ✅ | Pricing ✅ | Listings ✅ | Legal ✅ | Post Property ✅

NAV STRATEGY (LOCKED LOGIC):
- JS toggles only:
  body.nav-open
  .menu.is-open OR #primary-navigation.is-open
- No heavy JS / no framework

IMPORTANT:
❌ Random nav/menu rewrite NOT allowed
❌ Breaking existing nav logic NOT allowed
✅ Minimal targeted CSS/JS allowed

SESSION CHANGE-TRACK (NAV):
File: assets/app.js
✅ “Single source of truth” mobile nav controller kept
Reason: multiple conflicting nav toggles were risky → now fixed.

4) Authentication Philosophy — 🔒 LOCKED
OTP = session confirmation only
PIN login allowed
No “verification / approval” language
Limits & cooldowns finalized

5) Pricing Page — Card Selection — 🔒 LOCKED
Card + button click both work
Only one card selectable
Premium selected by default
Visual highlight stable
Final CSS override locked at END of styles.css
All breakpoints verified
🚫 Revisit only if business model changes

6) Session & OTP Backend Validation — ✅ DONE
60s resend cooldown
Max 3 OTP / 4 hours
OTP validity: 5 minutes
PIN restriction enforced
/me protected with Bearer token
Same-device session supported

7) OTP Security Hardening — ✅ DONE
OTP single-use enforced
Wrong OTP attempt limit
Replay protection
/me endpoint verified
Session expiry strategy deferred (future)

8) Plans / Pricing Page UX — 🔒 LOCKED
Clear rule: 1 Plan = 1 Property
No broker / no deal guarantee copy placed
“Next Step” guidance added
Pricing clarity section finalized:
- Which plan is right for you?
- Important before you select
- Conversion-safe & legal-safe

9) Legal Page — 🔒 LOCKED
Footer links corrected (absolute paths)
Disclaimer aligned with zero-responsibility model
No banned words
Responsive verified

10) Post Property Page — 🔒 LOCKED
File: /post/index.html
Flow locked: PIN → OTP → Property → Plan
No misleading language
Frontend validation safe
Footer + disclaimer aligned
Responsive verified

11) Home Page — 🔒 LOCKED
UI finalized
Hero & CTA hierarchy stable
Responsive verified

────────────────────────────────────────────────────────────
🟡 LISTINGS PAGE — CURRENT ACTIVE WORK AREA (UPDATED THIS SESSION)
12) Listings Filters JS — ✅ CLEANUP DONE (LOCKED)
✅ WHAT WE DID THIS SESSION (IMPORTANT)
- assets/app.js me “STEP 3” + “STEP 4” duplicate blocks were removed
- Final single block kept:
  “LISTINGS FILTERS — FINAL (SINGLE SOURCE)”
  - Auto apply on change + input
  - Rent range supported
  - Results count sync
  - More/Less toggle intent included
✅ Result:
- Duplicate event listeners removed
- JS conflicts reduced
- app.js now stable and ready to commit/lock

✅ CURRENT STATUS:
- app.js JS side = OK
- Remaining issue is NOT “more JS” by default → likely HTML/CSS structure/button behavior

────────────────────────────────────────────────────────────
🟡 ACTIVE BUG (CURRENT) — “More Filters” CLICK DOES NOTHING
STATUS: NOT FIXED YET

Likely root causes (to verify in Listings HTML):
A) Button is inside <form> and behaves like submit by default
   → click triggers form submit / page reload / URL jump, so toggle never “stays”
B) #moreFiltersBtn id mismatch (HTML vs JS)
C) .filters-ui container missing OR .filters-panel not inside it
D) styles.css selector mismatch (e.g. .listings-page wrapper missing)
E) app.js not loaded on listings page or loaded before elements exist (rare, but check)

✅ What we already confirmed:
- CSS show/hide rule exists
- JS toggle logic exists
But still “nothing happens” → so HTML structure verification is next.

────────────────────────────────────────────────────────────
✅ FINAL FILTER ARCHITECTURE — HYBRID MODEL (LOCKED)
🎯 Layout Decision (LOCKED)
✅ Hybrid filters:
Primary Filters = TOP BAR (always visible)
Secondary Filters = Sidebar / “More Filters” panel

PRIMARY FILTERS (TOP BAR — ALWAYS VISIBLE) — LOCKED
🏠 Residential:
City (default Hisar)
Property Category: Residential
Property Type (House / Flat / PG)
Area / Sector (Typing + dropdown suggestions — ACTIVE request)
Size (Sq Yds)
Rent Range

🏢 Commercial:
City
Property Category: Commercial
Property Type (Shop / Office / Warehouse)
Area / Sector (Typing + dropdown suggestions — ACTIVE request)
Size (Sq Ft)
Rent Range

Notes (LOCKED):
Residential = Sq Yds, Commercial = Sq Ft

SECONDARY FILTERS (SIDEBAR / MORE FILTERS) — LOCKED
🏠 Residential Secondary:
Amenities
BHK
Furnishing: Unfurnished / Semi-Furnished / Furnished
Property Age
Floor: Ground / First / Second / Third+
🚫 Basement NOT allowed in residential

🏢 Commercial Secondary:
Amenities
Furnishing: Unfurnished / Furnished
Floor: Basement / Ground / First / Second / Upper / Other

────────────────────────────────────────────────────────────
🟡 NEW OWNER REQUEST (THIS SESSION) — AREA / SECTOR FIELD UPGRADE (ACTIVE)
Owner wants:
✅ Customer type kar sake
✅ Typing ke sath dropdown suggestions show ho (autocomplete)
✅ “Other” option bhi ho
✅ Hisar ke sectors + main areas add karne hain
✅ Focus pincodes: 125001, 125004, 125005

✅ CONFIRMED LIST (OWNER-PROVIDED) — MUST INCLUDE
Sectors:
SECTOR 1-4
SECTOR 3
SECTOR 5
SECTOR 9-11
SECTOR 13
SECTOR 14
SECTOR 15
SECTOR 16-17
SECTOR 24
SECTOR MGA
SECTOR 27-28
SECTOR 33

Areas / Colonies / Markets:
New Grain Market
Housing Board Colony (Sirsa Road)
Sundar Nagar
Vikas Nagar
Parav Chowk
Lahoria Chowk
Sector-PLA
Preeti Nagar
Professor Colony
Aggarwal Colony
Aggarsain Colony
Prem Nagar
Old Mandi Road
Nagori Gate
Must include: “Other”

NOTE:
Owner asked “Hisar ke jitne bhi areas hain sab dal do”
→ exhaustive city-wide list not provided
🟡 Pending: owner-approved full expansion OR incremental expansion.

────────────────────────────────────────────────────────────
🚨 styles.css HEALTH STATUS (VERY IMPORTANT)
13) styles.css — OVERLOADED / NEEDS CLEANUP (NOT OPTIONAL)
Current reality:
- same feature multiple times (duplicate blocks)
- multiple nav alignment patches
- risk of conflicting overrides

✅ WHAT WE KEEP (LOCK)
Core theme + base UI
Mobile nav final CSS support (only final)
Pricing final override at end (must remain at end)
Listings final filters styling (only one)

🧹 CLEANUP STRATEGY (LOCKED PROCESS)
- Remove duplicates (controlled, one file, one paste box)
- Keep only final chosen sections
- Verify pages: Home, Pricing, Listings, Legal, Post
- Then LOCK styles.css

⚠️ Rule:
If deletions needed → announce clearly BEFORE delete → take explicit approval.

────────────────────────────────────────────────────────────
⏳ UPDATED PRIORITY QUEUE (UPDATED NOW)
🟥 PRIORITY 0 — FIX “More Filters” NOT WORKING (BLOCKER)
Goal: button click should reliably open/close secondary panel
Scope: Listings HTML first (likely 1-line fix: button type + structure)
Then quick CSS verify

🟠 PRIORITY 1A — styles.css CLEANUP (CONTROLLED)
Goal: single reliable CSS (no duplicates)
Then LOCK styles.css

🟠 PRIORITY 1B — Area/Sector upgrade (Autocomplete + Other)
Goal: convert Area field to type+suggestions
Add confirmed list
Ensure Mobile/Tablet/Desktop UX is clean
Then FREEZE Listings UI

🟡 PRIORITY 2 — SEO & DISCOVERABILITY (DEFERRED)
GSC review + on-page SEO audit (after Listings freeze + CSS cleanup)

⚪ PRIORITY 3 — FUTURE (DO NOT START YET)
Listings API integration
Contact unlock logic
Customer Dashboard
AI Listing Assistant
Subscription automation
Analytics & event tracking

────────────────────────────────────────────────────────────
▶️ NEXT IMMEDIATE ACTION (FOR NEXT STEP)
STEP 1 (NEXT): Listings HTML audit for More Filters
- Verify #moreFiltersBtn exists and is clickable
- Verify it is NOT submitting form (type="button")
- Verify .filters-ui contains .filters-panel
- Verify .listings-page wrapper exists (for CSS selectors)
- Verify app.js is loaded on listings page

✅ END — MASTER v6.1 (NEW CHAT REFERENCE READY)
