(() => {
  const MAX_PHOTOS = 10;
  const MAX_BYTES = 1024 * 1024;
  const VALID_TYPES = ["image/jpeg", "image/png"];
  const DRAFT_KEY = "arh_post_property_draft_v1";
  const NOTES_LIMIT = 500;

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
          errors.push(`${file.name}: ${bytesToKb(file.size)}KB (max 1024KB).`);
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

    const handleSubmit = (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const isValid = validateForm();
      if (!isValid) return;
      validatePhotos();
      formMsg.textContent = "Submitted (demo). Backend integration pending.";
      setTimeout(() => {
        formMsg.textContent = "";
      }, 4000);
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

    const handleSaveDraft = (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      saveDraft();
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
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
