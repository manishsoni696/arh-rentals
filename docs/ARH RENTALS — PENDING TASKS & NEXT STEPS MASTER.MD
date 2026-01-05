🔐 ARH RENTALS — UPDATED PENDING TASKS & NEXT STEPS MASTER (v6.0)
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
🟡 Listings “Area/Sector” dropdown + typing suggestions requested (NEW)
⏳ SEO & Backend Planning Deferred

✅ COMPLETED & LOCKED (DO NOT TOUCH)
1) Working Rules & Execution Process — 🔒 LOCKED
Rules Master finalized (Manish working style)
✅ Single-chat workflow confirmed (no multi-expert / no master-controller)
✅ One task at a time, sequential fixes only
✅ One step = one file = one paste box
✅ Mobile + Tablet + Desktop mandatory (LOCKED forever)
Important note (updated):
Owner requested: “Full code nahi chahiye, sirf exact change + exact location”
→ Still follows paste-box rule (code only inside paste box), but only minimal snippet is shared.

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
JS toggles only:


body.nav-open


.menu.is-open OR #primary-navigation.is-open
No heavy JS
No framework


IMPORTANT:
❌ Random nav/menu rewrite NOT allowed
❌ Breaking existing nav logic NOT allowed
✅ Minimal targeted CSS/JS allowed
NOTES (WHAT HAPPENED IN THIS SESSION):
Problem observed: Mobile nav different look/behavior across pages; alignment/visibility inconsistent.
Root reason discussed: Some pages had hamburger inside .header-actions and CSS was hiding .header-actions on mobile → hamburger disappears / nav mismatch.
Final fix approach decided (LOCKED):
✅ Keep .header-actions visible on mobile
✅ Hide only .header-cta
✅ Force .nav-toggle visible
📌 SESSION CHANGE-TRACK (NAV):
File involved (logic side): assets/app.js
Approach: “Single source of truth” mobile nav controller strategy (avoid multiple conflicting nav toggles).
Why: Multiple “nav fix” blocks created conflict risk; we locked final logic and restricted future changes to minimal safe adjustments only.

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


Which plan is right for you?


Important before you select


Conversion-safe & legal-safe



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

🟡 LISTINGS PAGE — CURRENT ACTIVE WORK AREA (UPDATED THIS SESSION)
12) Listings Filters UI — IN PROGRESS (NOT FROZEN)
✅ WHAT IS DONE / PRESENT (SESSION TRACKED)
A) “More Filters” toggle behavior exists


Button: #moreFiltersBtn


Behavior: .filters-ui class toggle → .show-more


Button text swap intent: “+ More Filters” ↔ “− Less Filters”


Why: Secondary filters hide/show to keep UI clean (Hybrid model base)


B) Filters auto-apply behavior exists (UI-level)


File: assets/app.js has filter auto-apply logic based on form change/input and demo listings.


Why: Demo stage faster UX; Apply button dependency reduced.


⚠️ NOTE (IMPORTANT):
assets/app.js me earlier attempts ke multiple filter/toggle blocks present rahe.
Final architecture decided hai; cleanup planned after Listings freeze + CSS cleanup OR controlled cleanup step (see priority).

✅ FINAL FILTER ARCHITECTURE — HYBRID MODEL (LOCKED)
🎯 Layout Decision (LOCKED)
✅ Hybrid filters:


Primary Filters = TOP BAR (always visible)


Secondary Filters = Sidebar / “More Filters” panel


Reason:
Filters zyada hain → top-only clutter ho jayega
Sidebar-only mobile UX weak ho sakta hai
Hybrid gives best conversion + speed + clean UI

✅ PRIMARY FILTERS (TOP BAR — ALWAYS VISIBLE) — LOCKED
🏠 Residential (Category: Residential)
Primary:


City (default Hisar)


Property Category: Residential


Property Type (House / Flat / PG)


Area / Sector (NOW REQUESTED: type + dropdown suggestions)


Size (Sq Yds)


Rent Range


🏢 Commercial (Category: Commercial)
Primary:


City


Property Category: Commercial


Property Type (Shop / Office / Warehouse)


Area / Sector (NOW REQUESTED: type + dropdown suggestions)


Size (Sq Ft)


Rent Range


✅ Notes (LOCKED):
Size unit difference locked: Residential = Sq Yds, Commercial = Sq Ft
Matches India real-estate market expectation.

✅ SECONDARY FILTERS (SIDEBAR / MORE FILTERS) — LOCKED
🏠 Residential Secondary


Amenities


BHK


Furnishing: Unfurnished / Semi-Furnished / Furnished


Property Age


Floor (LOCKED): Ground / First / Second / Third+
🚫 Basement NOT allowed in residential (locked)


🏢 Commercial Secondary


Amenities


Furnishing: Unfurnished / Furnished


Floor (LOCKED): Basement / Ground / First / Second / Upper / Other



🟡 NEW OWNER REQUEST (THIS SESSION) — AREA / SECTOR FIELD UPGRADE (ACTIVE)
Owner wants “Area / Sector” field like this:
✅ Customer type kar sake
✅ Typing ke sath dropdown suggestions show ho (autocomplete)
✅ “Other” option bhi ho
✅ Hisar ke sectors + main areas add karne hain
✅ Focus pincodes: 125001, 125004, 125005
✅ CONFIRMED LIST (OWNER-PROVIDED) — MUST INCLUDE
Sectors (Hisar):


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


Areas / Colonies / Markets (owner list):


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
⚠️ NOTE (NO ASSUMPTION)
Owner said: “Sectors ke baad Hisar ke jitne bhi residential & commercial areas hain un sab ko dal do.”
→ Full city-wide exhaustive list is NOT provided in session, so:
🟡 Pending: Complete master list compilation (owner-approved) OR incremental expansion.

❌ WHAT IS STILL PENDING (UPDATED)
🟡 Listings UI structure still not professional enough (reference-style target)
Desktop: filters sidebar left + results right
Mobile: primary top + secondary collapsible/drawer
🟡 Hybrid UI implementation polish pending


Primary filter row spacing & layout final


Secondary panel behavior: mobile-first


Dropdown readability: options visibility + contrast + focus states (must remain permanently fixed)


🟡 Area/Sector upgrade implementation pending


Convert Area field to type+dropdown suggestions


Add confirmed sectors + areas list + Other


Ensure it works for Mobile/Tablet/Desktop



🚨 styles.css HEALTH STATUS (VERY IMPORTANT) — UPDATED THIS SESSION
13) styles.css — OVERLOADED / NEEDS CLEANUP (NOT OPTIONAL)
Current reality (as tracked + file shows):


Same feature solved multiple times with duplicate “add-only” blocks


Multiple mobile header/nav alignment patches exist


Risk: conflicting overrides, unpredictable behavior


✅ WHAT WE WILL KEEP (LOCK)


Core theme + base UI (buttons, cards, header, footer)


Mobile Nav final working logic (ONLY one final set)


Pricing FINAL WINNING OVERRIDE (must remain at end)


Listings FINAL filters UI block (only one)


🧹 CLEANUP STRATEGY (LOCKED PROCESS)
Delete duplicate older blocks that target same selectors repeatedly (controlled):


multiple nav alignment patches


repeated step blocks


repeated listings styling blocks


After cleanup:
styles.css becomes stable + predictable
future work becomes fast + safe
⚠️ Rule: Cleanup will be done as a separate controlled task (one file, one paste box).
If deletions needed → announce FIRST + get approval.

⏳ UPDATED PRIORITY QUEUE (SESSION UPDATED)
🟠 PRIORITY 1A — styles.css CLEANUP (OWNER ASKED “CLEAN FIRST” IN SESSION)
Goal: duplicate blocks remove → single reliable CSS
Steps:


Identify duplicates (nav alignment patches, repeated blocks)


Keep only final chosen nav system


Keep pricing override at very end


Quick verify: Home, Pricing, Listings, Legal, Post
✅ After cleanup → LOCK styles.css


🟠 PRIORITY 1B — FINISH LISTINGS FILTER UI (ACTIVE)
Steps:


Implement Area/Sector type+dropdown suggestions (owner list + Other)


Ensure Residential vs Commercial UI logic remains correct


Verify dropdown readability (options contrast)


Verify Desktop + Tablet + Mobile
✅ After this → FREEZE LISTINGS UI


🟡 PRIORITY 2 — SEO & DISCOVERABILITY (DEFERRED)
Start only after Listings freeze + styles cleanup:


Google Search Console review


On-page SEO audit


⚪ PRIORITY 3 — FUTURE (DO NOT START YET)
Listings API integration
Contact unlock logic
Customer Dashboard
AI Listing Assistant
Subscription automation
Analytics & event tracking

▶️ NEXT IMMEDIATE ACTION (CONFIRMED THIS SESSION)


styles.css cleanup (controlled, one-file task) → then lock


Listings Area/Sector field upgrade (type + dropdown suggestions + Other)


Verify responsive on Mobile/Tablet/Desktop


Freeze Listings UI


Then SEO/backend planning



🧠 FINAL EXECUTION RULES (LOCKED)
✅ HTML changes ALLOWED
✅ CSS changes ALLOWED
✅ JS changes ALLOWED (minimal, performance-safe)
ONE task at a time
ONE file per step
ONE paste-box per step
If deleting:
→ Mention clearly BEFORE delete
→ Take explicit approval
Website quality > artificial restrictions

✅ END — MASTER v6.0 (NEW CHAT REFERENCE READY)
