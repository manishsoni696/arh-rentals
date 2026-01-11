// Checkout Page JavaScript
// Handles listing review, eligibility check, and final submission

(() => {
    const BACKEND_URL = "https://arh-backend.manishsoni696.workers.dev";
    const PENDING_LISTING_KEY = "arh_pending_listing";

    // Helper: Get auth token
    function getAuthToken() {
        return localStorage.getItem("arh_token") || "";
    }

    // Helper: Check if user is logged in
    function isLoggedIn() {
        return !!getAuthToken();
    }

    function init() {
        // Update year in footer
        const yearEl = document.getElementById("year");
        if (yearEl) yearEl.textContent = new Date().getFullYear();

        // Check if user is logged in
        if (!isLoggedIn()) {
            alert("You must be logged in to access this page.");
            window.location.href = "/post/";
            return;
        }

        // Retrieve pending listing data from sessionStorage
        const pendingDataStr = sessionStorage.getItem(PENDING_LISTING_KEY);
        if (!pendingDataStr) {
            alert("No pending listing found. Please submit the property form first.");
            window.location.href = "/post/";
            return;
        }

        let pendingData;
        try {
            pendingData = JSON.parse(pendingDataStr);
        } catch (e) {
            alert("Invalid pending listing data.");
            window.location.href = "/post/";
            return;
        }

        // Fetch eligibility
        checkEligibility();

        // Handle final submit
        const finalSubmitBtn = document.getElementById("finalSubmitBtn");
        if (finalSubmitBtn) {
            finalSubmitBtn.addEventListener("click", handleFinalSubmit);
        }
    }

    async function checkEligibility() {
        const token = getAuthToken();
        const eligibilitySection = document.getElementById("eligibilitySection");
        const eligibilityMessage = document.getElementById("eligibilityMessage");
        const eligibilityDetails = document.getElementById("eligibilityDetails");
        const remainingMessage = document.getElementById("remainingMessage");

        try {
            const res = await fetch(`${BACKEND_URL}/api/check-eligibility`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();

            if (!data.success) {
                console.error("Eligibility check failed:", data.message);
                return;
            }

            // Display eligibility information
            if (data.hasFreeListing) {
                eligibilitySection.style.display = "block";
                eligibilityMessage.innerHTML = `
          ✅ <strong>You are eligible for a FREE listing under our ${data.isLaunchPhase ? 'startup launch offer' : 'free listing program'}.</strong><br/>
          This listing will be active for 30 days.
        `;
                eligibilityDetails.style.display = "block";

                const remaining = data.remainingFreeListings;
                const used = data.usedFreeListings;
                const max = data.maxFreeListings;

                remainingMessage.textContent = `After this submission, you will have ${remaining - 1} free listing${remaining - 1 !== 1 ? 's' : ''} remaining (${used + 1}/${max} used).`;
            } else {
                eligibilitySection.style.display = "block";
                eligibilityMessage.innerHTML = `
          ⚠️ <strong>You have exhausted your free listing quota.</strong><br/>
          You have used all ${data.maxFreeListings} free listing(s) available to you.
        `;
                eligibilityDetails.style.display = "none";

                // Show payment/plan selection notice (future enhancement)
                const transparencySection = document.getElementById("transparencySection");
                if (transparencySection) {
                    transparencySection.querySelector(".card-body").innerHTML = `
            <p style="margin:0">
              <strong>💳 Payment Required:</strong><br />
              <span style="color:var(--muted)">You'll need to select a paid plan to continue listing properties. Payment integration coming soon.</span>
            </p>
          `;
                }
            }

        } catch (error) {
            console.error("Error checking eligibility:", error);
            eligibilitySection.style.display = "none";
        }
    }

    async function handleFinalSubmit() {
        const finalSubmitBtn = document.getElementById("finalSubmitBtn");
        const submitMessage = document.getElementById("submitMessage");
        const token = getAuthToken();

        // Retrieve pending data
        const pendingDataStr = sessionStorage.getItem(PENDING_LISTING_KEY);
        if (!pendingDataStr) {
            submitMessage.textContent = "❌ No pending listing found.";
            submitMessage.style.color = "var(--error)";
            return;
        }

        let pendingData;
        try {
            pendingData = JSON.parse(pendingDataStr);
        } catch (e) {
            submitMessage.textContent = "❌ Invalid pending listing data.";
            submitMessage.style.color = "var(--error)";
            return;
        }

        // Disable button
        finalSubmitBtn.disabled = true;
        finalSubmitBtn.textContent = "Submitting...";
        submitMessage.textContent = "⏳ Creating your listing...";
        submitMessage.style.color = "var(--muted)";

        try {
            const res = await fetch(`${BACKEND_URL}/api/final-submit`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(pendingData)
            });

            const data = await res.json();

            if (!data.success) {
                submitMessage.textContent = `❌ ${data.message}`;
                submitMessage.style.color = "var(--error)";
                finalSubmitBtn.disabled = false;
                finalSubmitBtn.textContent = "Final Submit & List Property";
                return;
            }

            // Success!
            submitMessage.textContent = "✅ Property listed successfully!";
            submitMessage.style.color = "var(--success)";

            // Clear pending listing from storage
            sessionStorage.removeItem(PENDING_LISTING_KEY);

            // Show success message and redirect
            setTimeout(() => {
                alert(`🎉 Your property has been listed successfully on ARH Rentals!\n\nListing ID: ${data.listingId}\nPlan: ${data.plan}\nValid for: ${data.validity_days} days`);
                window.location.href = "/dashboard/";
            }, 1000);

        } catch (error) {
            console.error("Final submit error:", error);
            submitMessage.textContent = "❌ Network error. Please try again.";
            submitMessage.style.color = "var(--error)";
            finalSubmitBtn.disabled = false;
            finalSubmitBtn.textContent = "Final Submit & List Property";
        }
    }

    // Initialize on DOM ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
