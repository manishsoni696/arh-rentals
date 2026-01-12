/* =========================================================
   ARH Rentals - Name Popup Component
   Captures user name after first OTP login
========================================================= */

const NAME_POPUP_HTML = `
<div id="namePopupOverlay" class="name-popup-overlay" style="display:none;">
  <div class="name-popup-dialog">
    <div class="name-popup-header">
      <h3>Welcome! What's your name?</h3>
    </div>
    <div class="name-popup-body">
      <p class="name-popup-subtitle">
        Your name will be displayed in the header and when you post properties.
      </p>
      <div class="name-form-group">
        <label for="namePopupInput">Full Name <span class="required-star">*</span></label>
        <input
          type="text"
          id="namePopupInput"
          class="name-input"
          placeholder="Enter your full name"
          required
          minlength="2"
          maxlength="50"
        />
        <span id="namePopupError" class="name-error-msg"></span>
      </div>
      <button id="namePopupSaveBtn" class="name-btn name-btn-primary">Save & Continue</button>
    </div>
  </div>
</div>
`;

class NamePopupManager {
    constructor() {
        this.overlay = null;
        this.input = null;
        this.saveBtn = null;
        this.errorEl = null;
        this.onSaveCallback = null;
        this.DASHBOARD_API = "https://arh-dashboard.manishsoni696.workers.dev";
    }

    init() {
        // Inject HTML if not already present
        if (!document.getElementById('namePopupOverlay')) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = NAME_POPUP_HTML;
            document.body.appendChild(tempDiv.firstElementChild);
        }

        this.overlay = document.getElementById('namePopupOverlay');
        this.input = document.getElementById('namePopupInput');
        this.saveBtn = document.getElementById('namePopupSaveBtn');
        this.errorEl = document.getElementById('namePopupError');

        // Bind events
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => this.handleSave());
        }

        if (this.input) {
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSave();
                }
            });

            // Clear error on input
            this.input.addEventListener('input', () => {
                this.hideError();
            });
        }

        // Prevent closing popup by clicking outside (force name entry)
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                // Do nothing - user must provide name
                this.showError('Please enter your name to continue');
            }
        });
    }

    show(callback) {
        this.onSaveCallback = callback;
        if (this.overlay) {
            this.overlay.style.display = 'flex';
            setTimeout(() => {
                if (this.input) {
                    this.input.focus();
                    this.input.value = '';
                }
            }, 100);
        }
    }

    hide() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
            if (this.input) this.input.value = '';
            this.hideError();
        }
    }

    showError(message) {
        if (this.errorEl) {
            this.errorEl.textContent = message;
            this.errorEl.style.display = 'block';
        }
    }

    hideError() {
        if (this.errorEl) {
            this.errorEl.textContent = '';
            this.errorEl.style.display = 'none';
        }
    }

    validateName(name) {
        const trimmed = name.trim();

        if (!trimmed || trimmed.length < 2) {
            return { valid: false, error: 'Name must be at least 2 characters' };
        }

        if (trimmed.length > 50) {
            return { valid: false, error: 'Name must be 50 characters or less' };
        }

        // Allow letters, spaces, and dots only
        if (!/^[a-zA-Z.\s]+$/.test(trimmed)) {
            return { valid: false, error: 'Name can only contain letters, spaces, and dots' };
        }

        return { valid: true, name: trimmed };
    }

    async handleSave() {
        const rawName = this.input?.value || '';
        const validation = this.validateName(rawName);

        if (!validation.valid) {
            this.showError(validation.error);
            return;
        }

        const name = validation.name;
        const token = localStorage.getItem('arh_token');

        if (!token) {
            this.showError('Session expired. Please login again.');
            return;
        }

        // Disable button and show loading
        if (this.saveBtn) {
            this.saveBtn.disabled = true;
            this.saveBtn.textContent = 'Saving...';
        }

        try {
            const res = await fetch(`${this.DASHBOARD_API}/api/profile/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name })
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data.ok) {
                this.showError(data.message || 'Failed to save name. Please try again.');
                if (this.saveBtn) {
                    this.saveBtn.disabled = false;
                    this.saveBtn.textContent = 'Save';
                }
                return;
            }

            // Success!
            this.hide();

            // Show toast notification
            this.showToast('Name saved successfully!');

            // Trigger callback
            if (this.onSaveCallback) {
                this.onSaveCallback(name);
            }

        } catch (error) {
            console.error('Name save error:', error);
            this.showError('Network error. Please try again.');
            if (this.saveBtn) {
                this.saveBtn.disabled = false;
                this.saveBtn.textContent = 'Save';
            }
        }
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #27ae60;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transition = 'opacity 0.3s';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Global instance
window.namePopupManager = new NamePopupManager();

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.namePopupManager.init();
    });
} else {
    window.namePopupManager.init();
}
