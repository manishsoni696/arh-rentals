(() => {
  const MAX_PHOTOS = 10;
  const MAX_BYTES = 1024 * 1024;
  const VALID_TYPES = ["image/jpeg", "image/png"];
  const DRAFT_KEY = "arh_post_property_draft_v1"; // Local draft
  const CLOUD_DRAFT_KEY = "arh_cloud_draft_prompt_shown"; // Track if cloud draft prompt was shown
  const NOTES_LIMIT = 500;
  const DASHBOARD_BACKEND = "https://arh-dashboard.manishsoni696.workers.dev";

  // Helper: Get auth token
  const getAuthToken = () => localStorage.getItem("arh_token") || "";

  // Helper: Check if user is logged in
  const isLoggedIn = () => Boolean(getAuthToken());

  // Helper: Generate UUID
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };


  const amenitiesLists = {
    residential: [
      { value: "parking", label: "Parking" },
      { value: "powerBackup", label: "Power Backup" },
      { value: "lift", label: "Lift" },
      { value: "security", label: "Security" },
      { value: "ac", label: "AC" }
    ],
    commercial: [
      { value: "parking", label: "Parking" },
      { value: "powerBackup", label: "Power Backup" },
      { value: "lift", label: "Lift" },
      { value: "security", label: "Security" }
    ]
  };

  const propertyTypeGroups = {
    residential: [
      { value: "flat", label: "Apartment" },
      { value: "house", label: "Independent House" },
      { value: "pg", label: "PG" }
    ],
    commercial: [
      { value: "shop", label: "Shop" },
      { value: "office", label: "Office" },
      { value: "showroom", label: "Showroom" },
      { value: "warehouse", label: "Warehouse" }
    ]
  };

  const floorOptions = {
    residential: ["Ground", "First", "Second", "Third+"],
    commercial: ["Basement", "Ground", "First", "Second", "Upper / Other"]
  };

  const bytesToKb = (bytes) => Math.round(bytes / 1024);

  const init = () => {
    const form = document.getElementById("postPropertyForm");
    if (!form) return;

    const categorySelect = form.querySelector("#categorySelect");
    const propertyTypeSelect = form.querySelector("select[name='property_type']");
    const areaInput = form.querySelector("input[name='area']");
    const rentInput = form.querySelector("input[name='rent']");
    const floorSelect = form.querySelector("select[name='floor_on_rent']");
    const declarationCheckbox = form.querySelector("#declaration");
    const amenitiesContainer = form.querySelector("#amenitiesContainer");
    const photoInput = form.querySelector("#photoInput");
    const photoErrors = form.querySelector("#photoErrors");
    const photoPreview = form.querySelector("#photoPreview");
    const extraNotes = form.querySelector("textarea[name='extra_notes']");
    const notesCount = form.querySelector("#notesCount");
    const formMsg = form.querySelector("#formMsg");
    const saveDraftBtn = form.querySelector("#saveDraftBtn");

    const errorSummary = document.createElement("div");
    errorSummary.id = "formErrorSummary";
    errorSummary.className = "small";
    errorSummary.style.color = "#b42318";
    errorSummary.style.display = "none";
    errorSummary.style.marginBottom = "8px";
    errorSummary.setAttribute("role", "alert");
    form.querySelector(".card-body")?.prepend(errorSummary);

    const draftGate = document.getElementById("draftGate");
    const draftNotice = document.createElement("div");
    draftNotice.id = "draftNotice";
    draftNotice.className = "small";
    draftNotice.style.display = "none";
    draftNotice.style.alignItems = "center";
    draftNotice.style.gap = "10px";
    draftNotice.style.marginBottom = "8px";
    draftNotice.style.color = "var(--muted)";
    draftNotice.style.flexWrap = "wrap";
    draftNotice.style.display = "flex";
    draftNotice.innerHTML = `
      <span>Draft found from your last session.</span>
      <button type="button" class="btn" id="restoreDraftBtn">Restore Draft</button>
      <button type="button" class="btn" id="clearDraftBtn">Clear Draft</button>
    `;
    if (draftGate) {
      draftGate.appendChild(draftNotice);
    } else {
      form.querySelector(".card-body")?.prepend(draftNotice);
    }

    const restoreDraftBtn = draftNotice.querySelector("#restoreDraftBtn");
    const clearDraftBtn = draftNotice.querySelector("#clearDraftBtn");

    const renderPropertyTypes = () => {
      if (!propertyTypeSelect || !categorySelect) return;
      const category = categorySelect.value;
      const list = propertyTypeGroups[category] || [];
      propertyTypeSelect.innerHTML = "";

      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.disabled = true;
      placeholder.selected = true;
      placeholder.textContent = "Select type";
      propertyTypeSelect.appendChild(placeholder);

      list.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.value;
        option.textContent = item.label;
        propertyTypeSelect.appendChild(option);
      });
    };

    const renderFloorOptions = () => {
      if (!floorSelect || !categorySelect) return;
      const category = categorySelect.value;
      const list = floorOptions[category] || [];
      floorSelect.innerHTML = "";

      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.disabled = true;
      placeholder.selected = true;
      placeholder.textContent = "Select floor";
      floorSelect.appendChild(placeholder);

      list.forEach((label) => {
        const option = document.createElement("option");
        option.value = label;
        option.textContent = label;
        floorSelect.appendChild(option);
      });
    };

    const renderAmenities = () => {
      const category = categorySelect?.value;
      const propertyType = propertyTypeSelect?.value;
      amenitiesContainer.innerHTML = "";

      if (!category) {
        amenitiesContainer.innerHTML = "<div class=\"small\">Select a category to see amenities.</div>";
        return;
      }
      if (!propertyType) {
        amenitiesContainer.innerHTML = "<div class=\"small\">Select a property type to see amenities.</div>";
        return;
      }
      if (propertyTypeGroups[category] && !propertyTypeGroups[category].some((item) => item.value === propertyType)) {
        amenitiesContainer.innerHTML = "<div class=\"small\">Select a property type that matches the chosen category.</div>";
        return;
      }

      const list = amenitiesLists[category] || [];
      list.forEach((item) => {
        const label = document.createElement("label");
        label.className = "amenity";
        label.innerHTML = `<input type="checkbox" name="amenities" value="${item.value}"> ${item.label}`;
        amenitiesContainer.appendChild(label);
      });
    };

    const updateNotesCount = () => {
      const remaining = Math.max(0, NOTES_LIMIT - (extraNotes?.value || "").length);
      if (notesCount) {
        notesCount.textContent = `Remaining: ${remaining} / ${NOTES_LIMIT}`;
      }
    };

    const buildPhotoErrors = (files) => {
      const errors = [];
      const previews = [];

      if (files.length > MAX_PHOTOS) {
        errors.push(`You selected ${files.length} files. Max allowed is ${MAX_PHOTOS}.`);
      }

      Array.from(files).forEach((file, index) => {
        if (index >= MAX_PHOTOS) {
          errors.push(`${file.name}: Exceeds the maximum of ${MAX_PHOTOS} files.`);
          return;
        }
        if (!VALID_TYPES.includes(file.type)) {
          errors.push(`${file.name}: Only JPG/JPEG/PNG allowed.`);
          return;
        }
        if (file.size > MAX_BYTES) {
          errors.push(`${file.name}: ${bytesToKb(file.size)}KB (max 1 MB).`);
          return;
        }
        previews.push(file);
      });

      return { errors, previews };
    };

    const renderPhotoErrors = (errors) => {
      photoErrors.innerHTML = "";
      if (!errors.length) {
        photoErrors.style.display = "none";
        return;
      }
      photoErrors.style.display = "block";
      const list = document.createElement("ul");
      list.style.margin = "0";
      list.style.paddingLeft = "18px";
      errors.forEach((message) => {
        const item = document.createElement("li");
        item.textContent = message;
        list.appendChild(item);
      });
      photoErrors.appendChild(list);
    };

    const showPhotoPreviews = (files) => {
      photoPreview.innerHTML = "";
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = document.createElement("img");
          img.src = event.target.result;
          img.alt = file.name;
          img.style.width = "100%";
          img.style.height = "100px";
          img.style.objectFit = "cover";
          img.style.borderRadius = "8px";
          photoPreview.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
    };

    const validatePhotos = () => {
      if (!photoInput) return { errors: [], previews: [] };
      const { errors, previews } = buildPhotoErrors(photoInput.files || []);
      renderPhotoErrors(errors);
      if (!errors.length) {
        showPhotoPreviews(previews);
      } else {
        photoPreview.innerHTML = "";
      }
      return { errors, previews };
    };

    const getFormData = () => {
      const data = new FormData(form);
      const values = {};
      for (const [key, value] of data.entries()) {
        if (key === "amenities") {
          if (!values.amenities) values.amenities = [];
          values.amenities.push(value);
        } else {
          values[key] = value;
        }
      }
      values.declaration = declarationCheckbox?.checked || false;
      return values;
    };

    const restoreDraft = (draft) => {
      if (!draft || typeof draft !== "object") return;
      const assignValue = (selector, value) => {
        const field = form.querySelector(selector);
        if (field && value !== undefined && value !== null) {
          field.value = value;
        }
      };

      assignValue("#categorySelect", draft.category);
      renderPropertyTypes();
      assignValue("select[name='property_type']", draft.property_type);
      assignValue("input[name='area']", draft.area);
      assignValue("input[name='rent']", draft.rent);
      assignValue("input[name='security_deposit']", draft.security_deposit);
      renderFloorOptions();
      assignValue("select[name='floor_on_rent']", draft.floor_on_rent);
      assignValue("input[name='size']", draft.size);
      assignValue("select[name='size_unit']", draft.size_unit);
      assignValue("select[name='furnishing']", draft.furnishing);
      assignValue("select[name='property_age']", draft.property_age);
      assignValue("input[name='available_from']", draft.available_from);
      assignValue("textarea[name='extra_notes']", draft.extra_notes);

      if (declarationCheckbox) {
        declarationCheckbox.checked = Boolean(draft.declaration);
      }

      renderAmenities();

      if (Array.isArray(draft.amenities)) {
        const amenityChecks = form.querySelectorAll("input[name='amenities']");
        amenityChecks.forEach((checkbox) => {
          checkbox.checked = draft.amenities.includes(checkbox.value);
        });
      }

      updateNotesCount();
    };

    const toggleDraftNotice = (show) => {
      draftNotice.style.display = show ? "flex" : "none";
      if (draftGate) {
        draftGate.style.display = show ? "block" : "none";
      }
    };

    const saveDraft = () => {
      const payload = getFormData();
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      formMsg.textContent = "Draft saved locally (demo).";
      setTimeout(() => {
        formMsg.textContent = "";
      }, 3000);
      toggleDraftNotice(true);
    };

    const clearDraft = () => {
      localStorage.removeItem(DRAFT_KEY);
      toggleDraftNotice(false);
      formMsg.textContent = "Draft cleared.";
      setTimeout(() => {
        formMsg.textContent = "";
      }, 3000);
    };

    const validateForm = () => {
      const errors = [];
      let firstInvalid = null;

      const ensure = (condition, message, field) => {
        if (!condition) {
          errors.push(message);
          if (!firstInvalid && field) {
            firstInvalid = field;
          }
        }
      };

      ensure(categorySelect?.value, "Select a category.", categorySelect);
      ensure(propertyTypeSelect?.value, "Select a property type.", propertyTypeSelect);
      ensure(areaInput?.value?.trim(), "Enter the area/sector.", areaInput);
      ensure(rentInput?.value?.trim(), "Enter the monthly rent.", rentInput);
      if (rentInput?.value) {
        const rentValue = Number(rentInput.value);
        ensure(!Number.isNaN(rentValue), "Monthly rent must be a number.", rentInput);
      }
      ensure(floorSelect?.value?.trim(), "Select the floor on rent.", floorSelect);
      ensure(declarationCheckbox?.checked, "Please accept the owner declaration.", declarationCheckbox);

      const notesLength = (extraNotes?.value || "").length;
      ensure(notesLength <= NOTES_LIMIT, `Extra notes cannot exceed ${NOTES_LIMIT} characters.`, extraNotes);

      const { errors: photoValidationErrors } = buildPhotoErrors(photoInput?.files || []);
      if (photoValidationErrors.length) {
        errors.push(...photoValidationErrors);
        if (!firstInvalid && photoInput) firstInvalid = photoInput;
      }

      if (errors.length) {
        errorSummary.style.display = "block";
        errorSummary.innerHTML = `<strong>Please fix the following:</strong><ul style="margin:6px 0 0;padding-left:18px">${errors
          .map((err) => `<li>${err}</li>`)
          .join("")}</ul>`;
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return false;
      }

      errorSummary.style.display = "none";
      errorSummary.textContent = "";
      return true;
    };

    const handleSubmit = async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const isValid = validateForm();
      if (!isValid) return;

      const photoValidation = validatePhotos();
      if (photoValidation.errors.length > 0) return;

      // Check if logged in
      if (!isLoggedIn()) {
        formMsg.textContent = "❌ Please login to submit listing";
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      formMsg.textContent = "⏳ Uploading photos...";

      try {
        // Step 1: Upload photos to R2
        const files = photoInput.files || [];
        const listingId = generateUUID();
        let uploadedPhotoKeys = [];

        if (files.length > 0) {
          // Get upload URLs
          const fileTypes = Array.from(files).map(f => f.type);
          const fileSizes = Array.from(files).map(f => f.size);

          const initRes = await fetch(`${DASHBOARD_BACKEND}/api/uploads/init`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
              listingId,
              fileCount: files.length,
              fileTypes,
              fileSizes
            })
          });

          const initData = await initRes.json();
          if (!initData.success) {
            throw new Error(initData.message || "Upload init failed");
          }

          // Upload each photo to R2
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const upload = initData.uploads[i];

            const uploadRes = await fetch(upload.uploadUrl, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type }
            });

            if (!uploadRes.ok) {
              throw new Error(`Photo ${i + 1} upload failed`);
            }

            uploadedPhotoKeys.push(upload.key);
          }
        }

        // Step 2: Create listing
        formMsg.textContent = "⏳ Creating listing...";

        const formData = getFormData();
        const listingData = {
          ...formData,
          photos: uploadedPhotoKeys,
          city: "Hisar"
        };

        const createRes = await fetch(`${DASHBOARD_BACKEND}/api/listings/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify(listingData)
        });

        const createData = await createRes.json();
        if (!createData.success) {
          throw new Error(createData.message || "Listing creation failed");
        }

        // Success!
        formMsg.textContent = "✅ Listing created successfully!";
        localStorage.removeItem(DRAFT_KEY); // Clear local draft

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = "/dashboard/";
        }, 2000);

      } catch (error) {
        console.error("Submission error:", error);
        formMsg.textContent = `❌ ${error.message}`;
        if (submitBtn) submitBtn.disabled = false;
      }
    };

    const handleCategoryChange = (event) => {
      event.stopImmediatePropagation();
      renderPropertyTypes();
      renderFloorOptions();
      renderAmenities();
    };

    const handlePropertyTypeChange = (event) => {
      event.stopImmediatePropagation();
      renderAmenities();
    };

    const handlePhotoChange = (event) => {
      event.stopImmediatePropagation();
      validatePhotos();
    };

    const handleNotesInput = (event) => {
      event.stopImmediatePropagation();
      updateNotesCount();
    };

    const handleSaveDraft = async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      // Always save local draft
      const draftData = getFormData();
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      toggleDraftNotice(true);

      // If logged in, also save to cloud
      if (isLoggedIn()) {
        await handleSaveCloudDraft();
      } else {
        formMsg.textContent = "Draft saved locally (login for cloud backup)";
        setTimeout(() => {
          formMsg.textContent = "";
        }, 3000);
      }
    };

    categorySelect?.addEventListener("change", handleCategoryChange, true);
    propertyTypeSelect?.addEventListener("change", handlePropertyTypeChange, true);
    photoInput?.addEventListener("change", handlePhotoChange, true);
    extraNotes?.addEventListener("input", handleNotesInput, true);
    saveDraftBtn?.addEventListener("click", handleSaveDraft, true);
    form.addEventListener("submit", handleSubmit, true);

    restoreDraftBtn?.addEventListener("click", () => {
      const stored = localStorage.getItem(DRAFT_KEY);
      if (!stored) return;
      try {
        const draft = JSON.parse(stored);
        restoreDraft(draft);
        formMsg.textContent = "Draft restored.";
        setTimeout(() => {
          formMsg.textContent = "";
        }, 3000);
      } catch (error) {
        formMsg.textContent = "Unable to restore draft.";
      }
    });

    clearDraftBtn?.addEventListener("click", clearDraft);

    const existingDraft = localStorage.getItem(DRAFT_KEY);
    if (existingDraft) {
      toggleDraftNotice(true);
    }

    renderPropertyTypes();
    renderFloorOptions();
    renderAmenities();
    updateNotesCount();
    renderPhotoErrors([]);

    // =========================================================================
    // CLOUD DRAFT Functions
    // =========================================================================

    const handleSaveCloudDraft = async () => {
      if (!isLoggedIn()) {
        formMsg.textContent = "❌ Please login (PIN + OTP) to save cloud draft";
        return;
      }

      formMsg.textContent = "⏳ Saving cloud draft...";

      try {
        const draftData = getFormData();
        const draftJson = JSON.stringify(draftData);

        const res = await fetch(`${DASHBOARD_BACKEND}/api/drafts/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({ draft_json: draftJson })
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || "Cloud draft save failed");
        }

        formMsg.textContent = "✅ Cloud draft saved";
        setTimeout(() => {
          formMsg.textContent = "";
        }, 3000);
      } catch (error) {
        console.error("Cloud draft save error:", error);
        formMsg.textContent = `❌ ${error.message}`;
      }
    };

    const checkAndRestoreCloudDraft = async () => {
      if (!isLoggedIn()) return;

      // Check if we already showed prompt in this session
      const promptShown = sessionStorage.getItem(CLOUD_DRAFT_KEY);
      if (promptShown) return;

      try {
        const res = await fetch(`${DASHBOARD_BACKEND}/api/drafts/latest`, {
          headers: {
            "Authorization": `Bearer ${getAuthToken()}`
          }
        });

        const data = await res.json();
        if (!data.success || !data.draft) return;

        // Mark prompt as shown for this session
        sessionStorage.setItem(CLOUD_DRAFT_KEY, "true");

        // Show restore prompt
        const confirmRestore = confirm(
          "Cloud draft found from another device/session. Restore it?\n\n" +
          "Click OK to restore, Cancel to keep current form."
        );

        if (confirmRestore) {
          const draftData = JSON.parse(data.draft);
          setFormData(draftData);
          formMsg.textContent = "✅ Cloud draft restored";
          setTimeout(() => {
            formMsg.textContent = "";
          }, 3000);
        }
      } catch (error) {
        console.error("Cloud draft restore error:", error);
      }
    };

    const deleteCloudDraft = async () => {
      if (!isLoggedIn()) return;

      try {
        await fetch(`${DASHBOARD_BACKEND}/api/drafts/delete`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${getAuthToken()}`
          }
        });
      } catch (error) {
        console.error("Cloud draft delete error:", error);
      }
    };

    // Check for cloud draft after page load (when user is logged in)
    // This runs after PIN + OTP login
    setTimeout(() => {
      checkAndRestoreCloudDraft();
    }, 1000);

    // [New] ISSUE 1: Handle Global Logout (Reset Inputs & Gates)
    window.addEventListener("arh:logout", () => {
      const pinIn = document.getElementById("postPin");
      const mobIn = document.getElementById("mobileInput");
      const otpIn = document.getElementById("otpInput");
      const step2 = document.getElementById("step2"); // "Service available" msg wrapper
      const afterLogin = document.getElementById("afterLoginBox");
      const otpStep = document.getElementById("otpStep"); // Mobile/OTP container
      const pinMsg = document.getElementById("postPinMsg");
      const otpMsg = document.getElementById("otpMsg");

      // 1. Clear field values
      if (pinIn) pinIn.value = "";
      if (mobIn) mobIn.value = "";
      if (otpIn) otpIn.value = "";

      // 2. Clear auth-gate session data
      sessionStorage.removeItem("arh_pincode");
      sessionStorage.removeItem("arh_mobile");

      // 3. Reset UI visibility (redundant safety for app.js resetPostGate)
      if (step2) step2.style.display = "none";
      if (afterLogin) afterLogin.style.display = "none";
      if (otpStep) otpStep.style.display = "none";

      // 4. Clear status messages
      if (pinMsg) pinMsg.textContent = "";
      if (otpMsg) otpMsg.textContent = "";
    });

    // [New] ISSUE 2: OTP Submit on Enter
    const otpInputEl = document.getElementById("otpInput");
    if (otpInputEl) {
      otpInputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const vBtn = document.getElementById("verifyOtpBtn");
          if (vBtn && !vBtn.disabled) {
            vBtn.click();
          }
        }
      });
    }

    // [New] ISSUE 3: PIN Form Submit Prevention (moved from inline script)
    const pinFormEl = document.getElementById("pinCheckForm");
    if (pinFormEl) {
      pinFormEl.addEventListener("submit", (event) => {
        event.preventDefault();
        document.getElementById("pinCheckBtn")?.click();
      });
    }
  };

  // Initialize on DOM ready or immediately if DOM is already loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
