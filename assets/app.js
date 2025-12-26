const API_BASE = "https://arh-backend.manishsoni696.workers.dev";

function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

function formatINR(num){
  try {
    return new Intl.NumberFormat("en-IN").format(Number(num || 0));
  } catch {
    return String(num || "");
  }
}

// Dummy listings (MVP)
// Next step में ये backend DB से आएँगी
const DUMMY_LISTINGS = [
  { id: "P1", title: "2BHK House for Rent", area: "Sector 14", pincode: "125001", rent: 12000, size: "1100 sq ft", type: "House", furnish: "Semi-Furnished" },
  { id: "P2", title: "Shop on Main Road", area: "Sector 15", pincode: "125005", rent: 18000, size: "350 sq ft", type: "Shop", furnish: "Unfurnished" },
  { id: "P3", title: "1RK Near Market", area: "Sector 13", pincode: "125001", rent: 6500, size: "450 sq ft", type: "House", furnish: "Furnished" },
  { id: "P4", title: "Office Space (Ready)", area: "Sector 33", pincode: "125005", rent: 25000, size: "700 sq ft", type: "Office", furnish: "Furnished" },
];

function renderListings(list){
  const wrap = qs("#listingWrap");
  if(!wrap) return;

  wrap.innerHTML = list.map(p => `
    <div class="card property-card">
      <div class="thumb"></div>
      <div class="card-body">
        <div class="row">
          <div>
            <div class="badge good">Self-Declared Owner</div>
          </div>
          <div class="small">PIN: ${p.pincode}</div>
        </div>
        <h3 style="margin-top:10px">${p.title}</h3>
        <div class="price">₹ ${formatINR(p.rent)} /mo</div>
        <div class="prop-meta">
          <span class="badge">${p.area}</span>
          <span class="badge">${p.type}</span>
          <span class="badge">${p.size}</span>
          <span class="badge">${p.furnish}</span>
        </div>
        <div class="actions">
          <a class="btn" href="property.html?id=${encodeURIComponent(p.id)}">View Details</a>
          <a class="btn btn-primary" href="pricing.html">Unlock Contact</a>
        </div>
        <div class="small" style="margin-top:10px">
          Preview only. Contact/Address available after paid unlock.
        </div>
      </div>
    </div>
  `).join("");
}

function applyFilters(){
  const pin = (qs("#fPin")?.value || "").trim();
  const type = (qs("#fType")?.value || "").trim();
  const maxRent = Number(qs("#fMax")?.value || 0);

  let list = [...DUMMY_LISTINGS];

  if(pin) list = list.filter(x => x.pincode === pin);
  if(type) list = list.filter(x => x.type === type);
  if(maxRent) list = list.filter(x => x.rent <= maxRent);

  renderListings(list);
}

async function checkPincode(pincode){
  const url = `${API_BASE}/check-pincode?pincode=${encodeURIComponent(pincode)}`;
  const res = await fetch(url);
  return await res.json();
}

function initHome(){
  const btn = qs("#searchBtn");
  if(!btn) return;

  btn.addEventListener("click", async () => {
    const pincode = (qs("#pincode")?.value || "").trim();
    const type = qs("#ptype")?.value || "";
    const max = qs("#maxrent")?.value || "";

    const msg = qs("#pinMsg");
    msg.textContent = "";
    msg.className = "badge";

    if(!pincode){
      msg.textContent = "Please enter PIN code";
      msg.classList.add("warn");
      return;
    }

    try{
      const data = await checkPincode(pincode);
      if(data.allowed){
        // go to listings with prefilled filters
        const params = new URLSearchParams();
        params.set("pin", pincode);
        if(type) params.set("type", type);
        if(max) params.set("max", max);
        window.location.href = `listings.html?${params.toString()}`;
      } else {
        msg.textContent = "Service not available in this PIN (starting phase).";
        msg.classList.add("warn");
      }
    } catch(e){
      msg.textContent = "Backend error. Try again.";
      msg.classList.add("warn");
    }
  });
}

function initListings(){
  const wrap = qs("#listingWrap");
  if(!wrap) return;

  // Prefill from URL
  const url = new URL(window.location.href);
  const pin = url.searchParams.get("pin") || "";
  const type = url.searchParams.get("type") || "";
  const max = url.searchParams.get("max") || "";

  if(qs("#fPin")) qs("#fPin").value = pin;
  if(qs("#fType")) qs("#fType").value = type;
  if(qs("#fMax")) qs("#fMax").value = max;

  renderListings(DUMMY_LISTINGS);
  applyFilters();

  qsa(".filter-input").forEach(el => {
    el.addEventListener("input", applyFilters);
    el.addEventListener("change", applyFilters);
  });
}

function initProperty(){
  const box = qs("#propBox");
  if(!box) return;

  const url = new URL(window.location.href);
  const id = url.searchParams.get("id");
  const p = DUMMY_LISTINGS.find(x => x.id === id) || DUMMY_LISTINGS[0];

  qs("#propTitle").textContent = p.title;
  qs("#propPrice").textContent = `₹ ${formatINR(p.rent)} /mo`;
  qs("#propArea").textContent = p.area;
  qs("#propPin").textContent = p.pincode;
  qs("#propType").textContent = p.type;
  qs("#propSize").textContent = p.size;
  qs("#propFurnish").textContent = p.furnish;
}

function initPost(){
  const btn = qs("#pinCheckBtn");
  if(!btn) return;

  btn.addEventListener("click", async () => {
    const pincode = (qs("#postPin")?.value || "").trim();
    const out = qs("#postPinMsg");
    out.textContent = "";
    out.className = "badge";

    if(!pincode){
      out.textContent = "PIN required";
      out.classList.add("warn");
      return;
    }

    try{
      const data = await checkPincode(pincode);
      if(data.allowed){
        out.textContent = "OK — Service available. Proceed.";
        out.classList.add("good");
        qs("#step2").style.display = "block";
      } else {
        out.textContent = "Not available in this PIN (starting phase).";
        out.classList.add("warn");
        qs("#step2").style.display = "none";
      }
    } catch(e){
      out.textContent = "Backend error. Try again.";
      out.classList.add("warn");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initHome();
  initListings();
  initProperty();
  initPost();
});
