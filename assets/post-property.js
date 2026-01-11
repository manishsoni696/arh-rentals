(() => {
  const MASTER_PHOTOS_REQUIRED = 2;  // Exactly 2 master photos (public)
  const MAX_ADDITIONAL_INTERIOR = 6;  // Max 6 additional interior photos (locked)
  const MAX_EXTERIOR_PHOTOS = 2;  // Max 2 exterior photos (locked)
  const MAX_TOTAL_PHOTOS = 10;    // Total max: master + additional + exterior
  const MAX_BYTES = 1024 * 1024;
  const VALID_TYPES = ["image/jpeg", "image/png"];
  const DRAFT_KEY = "arh_post_property_draft_v1"; // Local draft
  const CLOUD_DRAFT_KEY = "arh_cloud_draft_prompt_shown"; // Track if cloud draft prompt was shown
  const NOTES_LIMIT = 500;
  const BACKEND_URL = "https://arh-backend.manishsoni696.workers.dev"; // Uploads, Listings, Final Submit
  const DASHBOARD_BACKEND = "https://arh-dashboard.manishsoni696.workers.dev"; // Drafts only

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
    const houseNumberInput = form.querySelector("input[name='house_number']");
    const landmarkInput = form.querySelector("input[name='landmark']");
    const streetInput = form.querySelector("input[name='street_name']");
    const rentInput = form.querySelector("input[name='rent']");
    const securityDepositInput = form.querySelector("input[name='security_deposit']");
    const floorSelect = form.querySelector("select[name='floor_on_rent']");
    const declarationCheckbox = form.querySelector("#declaration");

    // Personal Details
    const ownerNameInput = form.querySelector("input[name='owner_name']");
    const primaryPhoneInput = form.querySelector("#primaryPhone");
    const altPhoneInput = form.querySelector("input[name='alternate_phone']");

    if (primaryPhoneInput) {
      const storedMobile = sessionStorage.getItem("arh_mobile") || "Not Verified";
      primaryPhoneInput.value = storedMobile;
    }
    const amenitiesContainer = form.querySelector("#amenitiesContainer");

    // Master interior photos (2 required, always public)
    const masterPhotoInput = form.querySelector("#masterPhotoInput");
    const masterPhotoErrors = form.querySelector("#masterPhotoErrors");
    const masterPhotoPreview = form.querySelector("#masterPhotoPreview");

    // Additional interior photos (0-6, locked)
    const interiorPhotoInput = form.querySelector("#interiorPhotoInput");
    const interiorPhotoErrors = form.querySelector("#interiorPhotoErrors");
    const interiorPhotoPreview = form.querySelector("#interiorPhotoPreview");

    // Exterior photos (0-2, locked)
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
      // Safety check: if amenities container doesn't exist, skip rendering
      if (!amenitiesContainer) {
        console.warn("Amenities container not found, skipping amenities rendering");
        return;
      }

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

    const showPhotoPreviews = (previewContainer, files, badgeType = "locked") => {
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

          // Add badge based on type
          const badge = document.createElement("div");
          badge.style.position = "absolute";
          badge.style.top = "4px";
          badge.style.right = "4px";
          badge.style.padding = "2px 6px";
          badge.style.borderRadius = "4px";
          badge.style.fontSize = "11px";
          badge.style.fontWeight = "bold";

          if (badgeType === "master") {
            // Master photos - always public (green)
            badge.textContent = "👁️ Public";
            badge.style.background = "#10b981";
            badge.style.color = "white";
          } else if (badgeType === "locked") {
            // Additional interior photos - locked (orange)
            badge.textContent = "🔒 Locked";
            badge.style.background = "#f59e0b";
            badge.style.color = "white";
          } else if (badgeType === "exterior") {
            // Exterior photos - locked (red)
            badge.textContent = "🔒 Locked";
            badge.style.background = "#ef4444";
            badge.style.color = "white";
          }

          wrapper.appendChild(badge);
          previewContainer.appendChild(wrapper);
        };
        reader.readAsDataURL(file);
      });
    };

    const validateMasterPhotos = () => {
      if (!masterPhotoInput) return { errors: [], previews: [] };
      const { errors, previews } = buildPhotoErrors(masterPhotoInput.files || [], MASTER_PHOTOS_REQUIRED, "master");

      // Check exact requirement (must be exactly 2)
      if (previews.length > 0 && previews.length !== MASTER_PHOTOS_REQUIRED) {
        errors.length = 0; // Clear previous errors
        errors.push(`Exactly ${MASTER_PHOTOS_REQUIRED} master photos required (always public).`);
      }

      renderPhotoErrors(masterPhotoErrors, errors);
      if (!errors.length && previews.length > 0) {
        // Show master photo previews with green "Public" badge
        showPhotoPreviews(masterPhotoPreview, previews, "master");
      } else {
        masterPhotoPreview.innerHTML = "";
      }
      return { errors, previews };
    };

    const validateInteriorPhotos = () => {
      if (!interiorPhotoInput) return { errors: [], previews: [] };
      const { errors, previews } = buildPhotoErrors(interiorPhotoInput.files || [], MAX_ADDITIONAL_INTERIOR, "additional interior");

      renderPhotoErrors(interiorPhotoErrors, errors);
      if (!errors.length) {
        // Show interior photo previews with orange "Locked" badge
        showPhotoPreviews(interiorPhotoPreview, previews, "locked");
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
        // Show exterior photo previews with red "Locked" badge
        showPhotoPreviews(exteriorPhotoPreview, previews, "exterior");
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
      // Hard-lock city to Hisar (Phase-1 scope)
      values.city = "Hisar";

      // Explicitly include disabled/readonly fields if needed, or rely on them being in form.entries (disabled inputs are NOT in entries)
      // Since primaryPhone is readonly (but not disabled? just readonly), it should be in entries if name is set.
      // Wait, I didn't give primaryPhone a name in HTML, just id="primaryPhone".
      // Let's add it manually.
      values.primary_phone = document.getElementById("primaryPhone")?.value || "";

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

      assignValue("input[name='owner_name']", draft.owner_name);
      assignValue("input[name='alternate_phone']", draft.alternate_phone);
      assignValue("input[name='house_number']", draft.house_number);
      assignValue("input[name='landmark']", draft.landmark);
      assignValue("input[name='street_name']", draft.street_name);

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
      ensure(ownerNameInput?.value?.trim(), "Enter owner full name.", ownerNameInput);
      ensure(propertyTypeSelect?.value, "Select a property type.", propertyTypeSelect);
      ensure(houseNumberInput?.value?.trim(), "Enter house / flat number.", houseNumberInput);
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


      // Validate master photos (required: exactly 2)
      const masterValidation = validateMasterPhotos();
      if (masterValidation.errors.length) {
        errors.push(...masterValidation.errors);
        if (!firstInvalid && masterPhotoInput) firstInvalid = masterPhotoInput;
      }

      // Check if exactly 2 master photos
      const masterCount = (masterPhotoInput?.files || []).length;
      if (masterCount !== MASTER_PHOTOS_REQUIRED) {
        errors.push(`Exactly ${MASTER_PHOTOS_REQUIRED} master photos required (always public).`);
        if (!firstInvalid && masterPhotoInput) firstInvalid = masterPhotoInput;
      }

      // Validate additional interior photos (optional: 0-6)
      const interiorValidation = validateInteriorPhotos();
      if (interiorValidation.errors.length) {
        errors.push(...interiorValidation.errors);
        if (!firstInvalid && interiorPhotoInput) firstInvalid = interiorPhotoInput;
      }

      // Validate exterior photos (optional: 0-2)
      const exteriorValidation = validateExteriorPhotos();
      if (exteriorValidation.errors.length) {
        errors.push(...exteriorValidation.errors);
        if (!firstInvalid && exteriorPhotoInput) firstInvalid = exteriorPhotoInput;
      }

      // Check total photo count (max 10)
      const interiorCount = (interiorPhotoInput?.files || []).length;
      const exteriorCount = (exteriorPhotoInput?.files || []).length;
      const totalPhotoCount = masterCount + interiorCount + exteriorCount;
      if (totalPhotoCount > MAX_TOTAL_PHOTOS) {
        errors.push(`Total photos cannot exceed ${MAX_TOTAL_PHOTOS}. You have ${totalPhotoCount} photos (${masterCount} master + ${interiorCount} additional + ${exteriorCount} exterior).`);
        if (!firstInvalid && masterPhotoInput) firstInvalid = masterPhotoInput;
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
      formMsg.textContent = "⏳ Uploading photos...";

      try {
        const listingId = generateUUID();
        let masterPhotoKeys = [];
        let additionalInteriorKeys = [];
        let exteriorPhotoKeys = [];

        // Step 1: Upload master photos (required - exactly 2, always public)
        formMsg.textContent = "⏳ Uploading master photos...";
        const masterFiles = masterPhotoInput.files || [];
        if (masterFiles.length > 0) {
          const fileTypes = Array.from(masterFiles).map(f => f.type);
          const fileSizes = Array.from(masterFiles).map(f => f.size);

          const initRes = await fetch(`${BACKEND_URL}/api/uploads/init`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
              listingId,
              category: 'master',
              fileCount: masterFiles.length,
              fileTypes,
              fileSizes
            })
          });

          const initData = await initRes.json();
          if (!initData.success) {
            throw new Error(initData.message || "Master photo upload init failed");
          }

          for (let i = 0; i < masterFiles.length; i++) {
            const file = masterFiles[i];
            const upload = initData.uploads[i];

            const uploadRes = await fetch(upload.uploadUrl, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type }
            });

            if (!uploadRes.ok) {
              throw new Error(`Master photo ${i + 1} upload failed`);
            }

            masterPhotoKeys.push(upload.key);
          }
        }

        // Step 2: Upload additional interior photos (optional - 0-6, locked)
        formMsg.textContent = "⏳ Uploading additional interior photos...";
        const interiorFiles = interiorPhotoInput.files || [];
        if (interiorFiles.length > 0) {
          const fileTypes = Array.from(interiorFiles).map(f => f.type);
          const fileSizes = Array.from(interiorFiles).map(f => f.size);

          const initRes = await fetch(`${BACKEND_URL}/api/uploads/init`, {
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
            throw new Error(initData.message || "Additional interior photo upload init failed");
          }

          for (let i = 0; i < interiorFiles.length; i++) {
            const file = interiorFiles[i];
            const upload = initData.uploads[i];

            const uploadRes = await fetch(upload.uploadUrl, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type }
            });

            if (!uploadRes.ok) {
              throw new Error(`Additional interior photo ${i + 1} upload failed`);
            }

            additionalInteriorKeys.push(upload.key);
          }
        }

        // Step 3: Upload exterior photos (optional - 0-2, locked)
        formMsg.textContent = "⏳ Uploading exterior photos...";
        const exteriorFiles = exteriorPhotoInput.files || [];
        if (exteriorFiles.length > 0) {
          const fileTypes = Array.from(exteriorFiles).map(f => f.type);
          const fileSizes = Array.from(exteriorFiles).map(f => f.size);

          const initRes = await fetch(`${BACKEND_URL}/api/uploads/init`, {
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

        // Step 4: Prepare pending listing data (NOT creating listing yet)
        formMsg.textContent = "⏳ Preparing submission...";

        const formData = getFormData();
        const pendingListingData = {
          ...formData,
          master_interior_photos: masterPhotoKeys,
          additional_interior_photos: additionalInteriorKeys,
          exterior_photos: exteriorPhotoKeys,
          city: "Hisar"
        };

        // Store pending data in sessionStorage
        sessionStorage.setItem("arh_pending_listing", JSON.stringify(pendingListingData));

        // Show confirmation popup
        showConfirmationPopup();

        // Re-enable button
        if (submitBtn) submitBtn.disabled = false;
        formMsg.textContent = "";

      } catch (error) {
        console.error("Submission error:", error);
        formMsg.textContent = `❌ ${error.message}`;
        if (submitBtn) submitBtn.disabled = false;
      }
    };

    // Confirmation Popup - ARH Rentals Theme
    function showConfirmationPopup() {
      // Create overlay with dark blue gradient (matching site theme)
      const overlay = document.createElement("div");
      overlay.id = "confirmationOverlay";
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(180deg, rgba(11, 15, 20, 0.85) 0%, rgba(9, 18, 27, 0.9) 100%);
        backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: overlayFadeIn 0.3s ease-out;
      `;

      // Add keyframes for animations (ARH Theme)
      if (!document.getElementById("popupAnimations")) {
        const style = document.createElement("style");
        style.id = "popupAnimations";
        style.textContent = `
          @keyframes overlayFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes popupSlideIn {
            from { 
              opacity: 0;
              transform: translateY(-20px) scale(0.96);
            }
            to { 
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .popup-btn-primary {
            background: linear-gradient(180deg, rgba(10, 116, 184, 0.95), rgba(10, 116, 184, 0.75));
            border: 1px solid rgba(10, 116, 184, 0.55);
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(10, 116, 184, 0.3);
          }
          .popup-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 0 3px rgba(29, 161, 242, 0.20), 0 6px 20px rgba(10, 116, 184, 0.4);
          }
          .popup-btn-secondary {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.10);
            color: #f5f7fa;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .popup-btn-secondary:hover {
            background: rgba(255, 255, 255, 0.06);
            border-color: rgba(29, 161, 242, 0.28);
            box-shadow: 0 0 0 3px rgba(29, 161, 242, 0.10);
            transform: translateY(-1px);
          }
          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
          }
        `;
        document.head.appendChild(style);
      }

      // Create popup with dark theme design (matching site)
      const popup = document.createElement("div");
      popup.style.cssText = `
        background: linear-gradient(180deg, rgba(15, 19, 24, 0.98) 0%, rgba(11, 15, 20, 0.95) 100%);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.10);
        border-radius: 18px;
        padding: 0;
        max-width: 560px;
        width: 90%;
        box-shadow: 
          0 20px 60px rgba(0, 0, 0, 0.5),
          0 0 0 1px rgba(255, 255, 255, 0.05) inset;
        animation: popupSlideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden;
      `;

      popup.innerHTML = `
        <!-- Header with blue gradient (ARH Theme) -->
        <div style="
          background: 
            radial-gradient(600px 300px at 50% 0%, rgba(29, 161, 242, 0.25), transparent 70%),
            linear-gradient(180deg, rgba(10, 116, 184, 0.15), rgba(9, 18, 27, 0.8));
          padding: 32px 32px 24px;
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        ">
          <!-- Animated background pattern -->
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(circle at 25% 40%, rgba(10, 116, 184, 0.12) 0%, transparent 50%),
              radial-gradient(circle at 75% 60%, rgba(29, 161, 242, 0.08) 0%, transparent 50%);
            opacity: 0.6;
          "></div>
          
          <!-- Icon and Title -->
          <div style="position: relative; z-index: 1;">
            <div style="
              width: 64px;
              height: 64px;
              background: rgba(10, 116, 184, 0.2);
              border: 1px solid rgba(29, 161, 242, 0.3);
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 16px;
              font-size: 32px;
              backdrop-filter: blur(10px);
              box-shadow: 0 8px 20px rgba(10, 116, 184, 0.2);
            ">🚀</div>
            
            <h3 style="
              margin: 0 0 8px 0;
              color: #f5f7fa;
              font-size: 1.75rem;
              font-weight: 700;
              letter-spacing: -0.5px;
            ">Property Submission Started!</h3>
            
            <p style="
              margin: 0;
              color: #b0b6bc;
              font-size: 0.95rem;
              line-height: 1.5;
            ">Your property details have been submitted successfully.</p>
          </div>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <!-- Status Badge (ARH Blue Theme) -->
          <div style="margin-bottom: 20px;">
            <span class="status-badge" style="
              background: rgba(29, 161, 242, 0.12);
              color: #1da1f2;
              border: 1px solid rgba(29, 161, 242, 0.35);
              box-shadow: 0 0 0 3px rgba(29, 161, 242, 0.08);
            ">
              <span style="font-size: 1.1rem;">📋</span>
              <span>Pending Final Submission</span>
            </span>
          </div>

          <!-- Warning Box (ARH Theme) -->
          <div style="
            margin-bottom: 28px;
            padding: 20px;
            background: linear-gradient(135deg, rgba(29, 161, 242, 0.08) 0%, rgba(10, 116, 184, 0.12) 100%);
            border-left: 4px solid #1da1f2;
            border-radius: 12px;
            position: relative;
            overflow: hidden;
          ">
            <div style="
              position: absolute;
              top: 0;
              right: 0;
              width: 100px;
              height: 100px;
              background: radial-gradient(circle, rgba(29, 161, 242, 0.15) 0%, transparent 70%);
            "></div>
            
            <p style="
              margin: 0;
              color: var(--text);
              line-height: 1.7;
              font-size: 0.95rem;
              position: relative;
              z-index: 1;
            ">
              <strong style="
                color: #1da1f2;
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 6px;
              ">
                <span style="font-size: 1.2rem;">ℹ️</span>
                <span>Important Notice:</span>
              </strong>
              Your property has <strong style="color: #66b3ff;">not been listed yet</strong>.
              The listing will be created only after you complete the final submission on the next page.
            </p>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button type="button" id="proceedToListingBtn" class="popup-btn-primary" style="
              flex: 1;
              min-width: 150px;
              padding: 14px 28px;
              font-size: 1rem;
              font-weight: 600;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            ">
              <span>Proceed to Listing</span>
              <span style="font-size: 1.1rem;">→</span>
            </button>
            
            <button type="button" id="editDetailsBtn" class="popup-btn-secondary" style="
              flex: 1;
              min-width: 150px;
              padding: 14px 28px;
              font-size: 1rem;
              font-weight: 600;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            ">
              <span style="font-size: 1.1rem;">✏️</span>
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      `;

      overlay.appendChild(popup);
      document.body.appendChild(overlay);

      // Add click animation feedback
      const addClickFeedback = (button) => {
        button.addEventListener("mousedown", () => {
          button.style.transform = "scale(0.97)";
        });
        button.addEventListener("mouseup", () => {
          button.style.transform = "";
        });
      };

      // Button handlers
      const proceedBtn = document.getElementById("proceedToListingBtn");
      const editBtn = document.getElementById("editDetailsBtn");

      addClickFeedback(proceedBtn);
      addClickFeedback(editBtn);

      proceedBtn.addEventListener("click", () => {
        // Add exit animation
        overlay.style.animation = "overlayFadeIn 0.2s ease-out reverse";
        popup.style.animation = "popupSlideIn 0.2s ease-out reverse";
        setTimeout(() => {
          window.location.href = "/post/checkout.html";
        }, 200);
      });

      editBtn.addEventListener("click", () => {
        // Add exit animation
        overlay.style.animation = "overlayFadeIn 0.2s ease-out reverse";
        popup.style.animation = "popupSlideIn 0.2s ease-out reverse";
        setTimeout(() => {
          overlay.remove();
          formMsg.textContent = "✏️ You can edit your property details.";
          setTimeout(() => {
            formMsg.textContent = "";
          }, 3000);
        }, 200);
      });

      // Close on overlay click (outside popup)
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          editBtn.click();
        }
      });
    }

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

    const handleMasterPhotoChange = (event) => {
      event.stopImmediatePropagation();
      validateMasterPhotos();
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
        formMsg.textContent = `❌ Cloud draft failed: ${error.message}`;
      }
    };

    const handleSaveDraft = async (event) => {
      event?.stopImmediatePropagation();

      const draftData = getFormData();

      // If logged in, only save to cloud (not local)
      if (isLoggedIn()) {
        await handleSaveCloudDraft();
      } else {
        // If not logged in, save locally
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        toggleDraftNotice(true);
        formMsg.textContent = "Draft saved locally (login for cloud backup)";
        setTimeout(() => {
          formMsg.textContent = "";
        }, 3000);
      }
    };

    categorySelect?.addEventListener("change", handleCategoryChange, true);
    propertyTypeSelect?.addEventListener("change", handlePropertyTypeChange, true);
    masterPhotoInput?.addEventListener("change", handleMasterPhotoChange, true);
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

    // Only show local draft banner if user is NOT logged in
    // If logged in, cloud draft banner will handle it
    const existingDraft = localStorage.getItem(DRAFT_KEY);
    if (existingDraft && !isLoggedIn()) {
      toggleDraftNotice(true);
    }

    renderPropertyTypes();
    renderFloorOptions();
    renderAmenities();
    updateNotesCount();
    // Initialize photo error containers
    renderPhotoErrors(masterPhotoErrors, []);
    renderPhotoErrors(interiorPhotoErrors, []);
    renderPhotoErrors(exteriorPhotoErrors, []);

    const checkAndRestoreCloudDraft = async () => {
      console.log("🔍 [Cloud Draft] Check started");

      if (!isLoggedIn()) {
        console.log("❌ [Cloud Draft] User not logged in");
        return;
      }
      console.log("✅ [Cloud Draft] User is logged in");

      // Check if we already showed prompt in this session
      const promptShown = sessionStorage.getItem(CLOUD_DRAFT_KEY);
      if (promptShown) {
        console.log("⏭️ [Cloud Draft] Prompt already shown in this session");
        return;
      }
      console.log("✅ [Cloud Draft] First time checking");

      try {
        console.log("📡 [Cloud Draft] Fetching from backend...");
        const res = await fetch(`${DASHBOARD_BACKEND}/api/drafts/latest`, {
          headers: {
            "Authorization": `Bearer ${getAuthToken()}`
          }
        });

        const data = await res.json();
        console.log("📦 [Cloud Draft] API response:", data);

        if (!data.success || !data.draft) {
          console.log("⚠️ [Cloud Draft] No draft found or API failed");
          return;
        }

        console.log("✅ [Cloud Draft] Draft found! Showing banner...");

        // Mark prompt as shown for this session
        sessionStorage.setItem(CLOUD_DRAFT_KEY, "true");

        // Create and show cloud draft banner
        showCloudDraftBanner(data.draft);
        console.log("🎉 [Cloud Draft] Banner displayed!");
      } catch (error) {
        console.error("❌ [Cloud Draft] Error:", error);
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
