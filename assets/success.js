// Post Success Page Logic
(() => {
    function init() {
        // Update year
        const yearEl = document.getElementById("year");
        if (yearEl) yearEl.textContent = new Date().getFullYear();

        // Get URL params
        const params = new URLSearchParams(window.location.search);
        const listingId = params.get("id");
        const validityDays = parseInt(params.get("validity") || "30");

        // Populate Listing ID
        const idDisplay = document.getElementById("listingIdDisplay");
        if (idDisplay) idDisplay.textContent = listingId || "Pending...";

        // Calculate and populate expiry
        const expiryDisplay = document.getElementById("expiryDateDisplay");
        if (expiryDisplay) {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + validityDays);
            expiryDisplay.textContent = expiryDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }

        // Handle "View My Listing" button
        const viewBtn = document.getElementById("viewListingBtn");
        if (viewBtn) {
            viewBtn.addEventListener("click", () => {
                // In a real app, you might redirect to /property.html?id=...
                // For now, redirect to dashboard as individual listing view might not be ready
                window.location.href = "/dashboard/";
            });
        }

        // Fetch and display remaining quota (optional enhancement)
        fetchQuota();
    }

    async function fetchQuota() {
        const quotaMsg = document.getElementById("quotaMessage");
        if (!quotaMsg) return;

        try {
            const token = localStorage.getItem("arh_token");
            if (!token) {
                quotaMsg.textContent = "➡️ Login to check";
                return;
            }

            // Re-use the existing check-eligibility endpoint
            // Note: BACKEND_URL needs to be defined or hardcoded here if not shared
            const BACKEND_URL = "https://arh-backend.manishsoni696.workers.dev";

            const res = await fetch(`${BACKEND_URL}/api/check-eligibility`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                const remaining = data.remainingFreeListings;
                if (remaining > 0) {
                    quotaMsg.textContent = `➡️ ${remaining} Free Listing${remaining !== 1 ? 's' : ''} remaining`;
                } else {
                    quotaMsg.textContent = `➡️ 0 Free Listings remaining`;
                }
            } else {
                quotaMsg.textContent = "➡️ Check Dashboard";
            }
        } catch (e) {
            console.error("Quota fetch error", e);
            quotaMsg.textContent = "➡️ Check Dashboard";
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
