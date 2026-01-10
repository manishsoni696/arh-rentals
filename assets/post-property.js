(() => {
  const MIN_INTERIOR_PHOTOS = 2;  // At least 2 master photos required
  const MAX_INTERIOR_PHOTOS = 8;  // Max 8 interior photos
  const MAX_EXTERIOR_PHOTOS = 2;  // Max 2 exterior photos
  const MAX_TOTAL_PHOTOS = 10;    // Total max: interior + exterior
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

    // Interior photos
    const interiorPhotoInput = form.querySelector("#interiorPhotoInput");
    const interiorPhotoErrors = form.querySelector("#interiorPhotoErrors");
    const interiorPhotoPreview = form.querySelector("#interiorPhotoPreview");

    // Exterior photos
    const exteriorPhotoInput = form.querySelector("#exteriorPhotoInput");
    const exteriorPhotoErrors = form.querySelector("#exteriorPhotoErrors");
    const exteriorPhotoPreview = form.querySelector("#exteriorPhotoPreview");

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
    // Keep display:none initially - will be shown only when draft exists AND user is logged in
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

    const buildPhotoErrors = (files, maxPhotos, photoType) => {
      const errors = [];
      const previews = [];

      if (files.length > maxPhotos) {
        errors.push(`You selected ${files.length} ${photoType} files. Max allowed is ${maxPhotos}.`);
      }

      Array.from(files).forEach((file, index) => {
        if (index >= maxPhotos) {
          errors.push(`${file.name}: Exceeds the maximum of ${maxPhotos} files.`);
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

    const renderPhotoErrors = (errorContainer, errors) => {
      errorContainer.innerHTML = "";
      if (!errors.length) {
        errorContainer.style.display = "none";
        return;
      }
      errorContainer.style.display = "block";
      const list = document.createElement("ul");
      list.style.margin = "0";
      list.style.paddingLeft = "18px";
      errors.forEach((message) => {
        const item = document.createElement("li");
        item.textContent = message;
        list.appendChild(item);
      });
      errorContainer.appendChild(list);
    };

    const showPhotoPreviews = (previewContainer, files, showMasterBadges = false) => {
      previewContainer.innerHTML = "";
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const wrapper = document.createElement("div");
          wrapper.style.position = "relative";

          const img = document.createElement("img");
          img.src = event.target.result;
          img.alt = file.name;
          img.style.width = "100%";
          img.style.height = "100px";
          img.style.objectFit = "cover";
          img.style.borderRadius = "8px";
          wrapper.appendChild(img);

          // Add badge for master photos or locked photos
          if (showMasterBadges) {
            const badge = document.createElement("div");
            badge.style.position = "absolute";
            badge.style.top = "4px";
            badge.style.right = "4px";
            badge.style.padding = "2px 6px";
            badge.style.borderRadius = "4px";
            badge.style.fontSize = "11px";
            badge.style.fontWeight = "bold";

            if (index < 2) {
              // First 2 photos = Master (Public)
              badge.textContent = "👁️ Public";
              badge.style.background = "#10b981";
              badge.style.color = "white";
            } else {
              // Photos 3+ = Locked
              badge.textContent = "🔒 Locked";
              badge.style.background = "#f59e0b";
              badge.style.color = "white";
            }
            wrapper.appendChild(badge);
          } else {
            // Exterior photos - always locked
            const badge = document.createElement("div");
            badge.textContent = "🔒 Locked";
            badge.style.position = "absolute";
            badge.style.top = "4px";
            badge.style.right = "4px";
            badge.style.padding = "2px 6px";
            badge.style.borderRadius = "4px";
            badge.style.fontSize = "11px";
            badge.style.fontWeight = "bold";
            badge.style.background = "#ef4444";
            badge.style.color = "white";
            wrapper.appendChild(badge);
          }

          previewContainer.appendChild(wrapper);
        };
        reader.readAsDataURL(file);
      });
    };

    const validateInteriorPhotos = () => {
      if (!interiorPhotoInput) return { errors: [], previews: [] };
      const { errors, previews } = buildPhotoErrors(interiorPhotoInput.files || [], MAX_INTERIOR_PHOTOS, "interior");

      // Check minimum requirement
      if (previews.length > 0 && previews.length < MIN_INTERIOR_PHOTOS) {
        errors.push(`At least ${MIN_INTERIOR_PHOTOS} interior photos required (for master photos).`);
      }

      renderPhotoErrors(interiorPhotoErrors, errors);
      if (!errors.length) {
        showPhotoPreviews(interiorPhotoPreview, previews, true); // true = show master badges
      } else {
        interiorPhotoPreview.innerHTML = "";
      }
      return { errors, previews };
    };

    const validateExteriorPhotos = () => {
      if (!exteriorPhotoInput) return { errors: [], previews: [] };
      const { errors, previews } = buildPhotoErrors(exteriorPhotoInput.files || [], MAX_EXTERIOR_PHOTOS, "exterior");
      renderPhotoErrors(exteriorPhotoErrors, errors);
      if (!errors.length) {
        showPhotoPreviews(exteriorPhotoPreview, previews, false); // false = always show locked badge
      } else {
        exteriorPhotoPreview.innerHTML = "";
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

      // Validate interior photos (required: 2-8)
      const interiorValidation = validateInteriorPhotos();
      if (interiorValidation.errors.length) {
        errors.push(...interiorValidation.errors);
        if (!firstInvalid && interiorPhotoInput) firstInvalid = interiorPhotoInput;
      }

      // Check if at least minimum interior photos
      const interiorCount = (interiorPhotoInput?.files || []).length;
      if (interiorCount < MIN_INTERIOR_PHOTOS) {
        errors.push(`At least ${MIN_INTERIOR_PHOTOS} interior photos required (first 2 = master photos).`);
        if (!firstInvalid && interiorPhotoInput) firstInvalid = interiorPhotoInput;
      }

      // Validate exterior photos (optional: 0-2)
      const exteriorValidation = validateExteriorPhotos();
      if (exteriorValidation.errors.length) {
        errors.push(...exteriorValidation.errors);
        if (!firstInvalid && exteriorPhotoInput) firstInvalid = exteriorPhotoInput;
      }

      // Check total photo count (max 10)
      const exteriorCount = (exteriorPhotoInput?.files || []).length;
      const totalPhotoCount = interiorCount + exteriorCount;
      if (totalPhotoCount > MAX_TOTAL_PHOTOS) {
        errors.push(`Total photos cannot exceed ${MAX_TOTAL_PHOTOS}. You have ${totalPhotoCount} photos (${interiorCount} interior + ${exteriorCount} exterior).`);
        if (!firstInvalid && interiorPhotoInput) firstInvalid = interiorPhotoInput;
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

      // Check if logged in
      if (!isLoggedIn()) {
        formMsg.textContent = "❌ Please login to submit listing";
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      formMsg.textContent = "⏳ Uploading interior photos...";

      try {
        const listingId = generateUUID();
        let interiorPhotoKeys = [];
        let exteriorPhotoKeys = [];

        // Step 1: Upload interior photos (required)
        const interiorFiles = interiorPhotoInput.files || [];
        if (interiorFiles.length > 0) {
          const fileTypes = Array.from(interiorFiles).map(f => f.type);
          const fileSizes = Array.from(interiorFiles).map(f => f.size);

          const initRes = await fetch(`${DASHBOARD_BACKEND}/api/uploads/init`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
              listingId,
              category: 'interior',
              fileCount: interiorFiles.length,
              fileTypes,
              fileSizes
            })
          });

          const initData = await initRes.json();
          if (!initData.success) {
            throw new Error(initData.message || "Interior photo upload init failed");
          }

          // Upload each interior photo to R2
          for (let i = 0; i < interiorFiles.length; i++) {
            const file = interiorFiles[i];
            const upload = initData.uploads[i];

            const uploadRes = await fetch(upload.uploadUrl, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type }
            });

            if (!uploadRes.ok) {
              throw new Error(`Interior photo ${i + 1} upload failed`);
            }

            interiorPhotoKeys.push(upload.key);
          }
        }

        // Step 2: Upload exterior photos (optional)
        formMsg.textContent = "⏳ Uploading exterior photos...";
        const exteriorFiles = exteriorPhotoInput.files || [];
        if (exteriorFiles.length > 0) {
          const fileTypes = Array.from(exteriorFiles).map(f => f.type);
          const fileSizes = Array.from(exteriorFiles).map(f => f.size);

          const initRes = await fetch(`${DASHBOARD_BACKEND}/api/uploads/init`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
              listingId,
              category: 'exterior',
              fileCount: exteriorFiles.length,
              fileTypes,
              fileSizes
            })
          });

          const initData = await initRes.json();
          if (!initData.success) {
            throw new Error(initData.message || "Exterior photo upload init failed");
          }

          // Upload each exterior photo to R2
          for (let i = 0; i < exteriorFiles.length; i++) {
            const file = exteriorFiles[i];
            const upload = initData.uploads[i];

            const uploadRes = await fetch(upload.uploadUrl, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type }
            });

            if (!uploadRes.ok) {
              throw new Error(`Exterior photo ${i + 1} upload failed`);
            }

            exteriorPhotoKeys.push(upload.key);
          }
        }

        // Step 3: Create listing
        formMsg.textContent = "⏳ Creating listing...";

        const formData = getFormData();
        const listingData = {
          ...formData,
          interior_photos: interiorPhotoKeys,
          exterior_photos: exteriorPhotoKeys,
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

    const handleInteriorPhotoChange = (event) => {
      event.stopImmediatePropagation();
      validateInteriorPhotos();
    };

    const handleExteriorPhotoChange = (event) => {
      event.stopImmediatePropagation();
      validateExteriorPhotos();
    };

    const handleNotesInput = (event) => {
      event.stopImmediatePropagation();
      updateNotesCount();
    };

    // =========================================================================
    // CLOUD DRAFT Functions (MUST be defined BEFORE handleSaveDraft)
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
    interiorPhotoInput?.addEventListener("change", handleInteriorPhotoChange, true);
    exteriorPhotoInput?.addEventListener("change", handleExteriorPhotoChange, true);
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
    // Initialize photo error containers
    renderPhotoErrors(interiorPhotoErrors, []);
    renderPhotoErrors(exteriorPhotoErrors, []);

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

        // Create and show cloud draft banner
        showCloudDraftBanner(data.draft);
      } catch (error) {
        console.error("Cloud draft restore error:", error);
      }
    };

    const showCloudDraftBanner = (draftJson) => {
      if (document.getElementById("cloudDraftBanner")) {
        return;
      }
      // Create banner element
      const banner = document.createElement("div");
      banner.id = "cloudDraftBanner";
      banner.className = "card";
      banner.style.cssText = `
        margin-top: 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
      `;

      banner.innerHTML = `
        <div class="card-body" style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 200px;">
            <h3 style="margin: 0 0 4px 0; color: white;">📋 Cloud Draft Found!</h3>
            <p style="margin: 0; opacity: 0.95; font-size: 14px;">
              Aapka pichla draft jo bich mein chod diya tha, wo cloud mein saved hai. Restore karna chahte hain?
            </p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button type="button" class="btn" id="restoreCloudDraftBtn" 
              style="background: white; color: #667eea; border: none;">
              ✅ Restore Draft
            </button>
            <button type="button" class="btn" id="dismissCloudDraftBtn"
              style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3);">
              ❌ Dismiss
            </button>
          </div>
        </div>
      `;

      // Insert banner after PIN check section
      const draftGate = document.getElementById("draftGate");
      if (draftGate) {
        draftGate.appendChild(banner);
        draftGate.style.display = "block";
      } else {
        const pinSection = document.querySelector(".card");
        if (pinSection) {
          pinSection.after(banner);
        }
      }

      // Restore button handler
      document.getElementById("restoreCloudDraftBtn")?.addEventListener("click", () => {
        try {
          const draftData = JSON.parse(draftJson);
          restoreDraft(draftData);
          banner.remove();
          formMsg.textContent = "✅ Cloud draft restored successfully!";
          setTimeout(() => {
            formMsg.textContent = "";
          }, 3000);
        } catch (error) {
          console.error("Restore error:", error);
          formMsg.textContent = "❌ Failed to restore draft";
        }
      });

      // Dismiss button handler - DELETE cloud draft
      document.getElementById("dismissCloudDraftBtn")?.addEventListener("click", async () => {
        banner.remove();
        formMsg.textContent = "⏳ Deleting cloud draft...";

        try {
          // Delete from backend
          await fetch(`${DASHBOARD_BACKEND}/api/drafts/delete`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${getAuthToken()}`
            }
          });

          formMsg.textContent = "✅ Cloud draft deleted";
          setTimeout(() => {
            formMsg.textContent = "";
          }, 2000);
        } catch (error) {
          console.error("Delete draft error:", error);
          formMsg.textContent = "❌ Failed to delete draft";
          setTimeout(() => {
            formMsg.textContent = "";
          }, 3000);
        }
      });
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

    // Check for cloud draft after successful login
    // This event is dispatched from app.js after OTP verification success
    window.addEventListener("arh:login-success", () => {
      // Small delay to ensure form is visible
      setTimeout(() => {
        checkAndRestoreCloudDraft();
      }, 300);
    });


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
