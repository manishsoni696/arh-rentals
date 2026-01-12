/* =========================================================
   ARH Rentals - Global Login Modal
   Handles OTP login from the header
========================================================= */

const LOGIN_MODAL_HTML = `
<div id="loginModalOverlay" class="login-modal-overlay" style="display:none;">
  <div class="login-modal-dialog">
    <div class="login-modal-header">
      <h3>Login to Your Account</h3>
      <button id="loginModalClose" type="button" class="login-modal-close">&times;</button>
    </div>
    <div class="login-modal-body">
      <p class="login-modal-subtitle">
        Login to manage your listings and post verification.
      </p>

      <!-- STEP 1: MOBILE -->
      <div id="loginStepMobile">
        <div class="login-form-group">
          <label for="loginMobileInput">Mobile Number</label>
          <div class="login-phone-input">
            <span class="login-phone-prefix">+91</span>
            <input
              type="tel"
              id="loginMobileInput"
              class="login-input"
              placeholder="9876543210"
              maxlength="10"
              pattern="[0-9]*"
              inputmode="numeric"
            />
          </div>
          <span id="loginMobileError" class="login-error-msg"></span>
        </div>
        <button id="loginSendOtpBtn" class="login-btn login-btn-primary">Send OTP</button>
      </div>

      <!-- STEP 2: OTP -->
      <div id="loginStepOtp" style="display:none;">
        <div class="login-form-group">
          <label for="loginOtpInput">Enter OTP</label>
          <input
            type="text"
            id="loginOtpInput"
            class="login-input login-otp-input"
            placeholder="XXXXXX"
            maxlength="6"
            pattern="[0-9]*"
            inputmode="numeric"
          />
          <span id="loginOtpError" class="login-error-msg"></span>
        </div>
        <div class="login-otp-actions">
          <button id="loginResendBtn" type="button" class="login-link-btn" disabled>Resend in <span id="loginTimer">30</span>s</button>
          <button id="loginChangeMobileBtn" type="button" class="login-link-btn">Change Number</button>
        </div>
        <button id="loginVerifyBtn" class="login-btn login-btn-primary">Verify & Login</button>
      </div>

    </div>
  </div>
</div>
`;

class LoginModalManager {
    constructor() {
        this.BACKEND = "https://arh-backend.manishsoni696.workers.dev";
        this.overlay = null;
        this.mobileInput = null;
        this.otpInput = null;
        this.timerInterval = null;
    }

    init() {
        // Inject HTML
        if (!document.getElementById('loginModalOverlay')) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = LOGIN_MODAL_HTML;
            document.body.appendChild(tempDiv.firstElementChild);
        }

        this.overlay = document.getElementById('loginModalOverlay');
        this.mobileInput = document.getElementById('loginMobileInput');
        this.otpInput = document.getElementById('loginOtpInput');

        // Bind Events
        document.getElementById('loginModalClose')?.addEventListener('click', () => this.hide());
        document.getElementById('loginSendOtpBtn')?.addEventListener('click', () => this.handleSendOtp());
        document.getElementById('loginVerifyBtn')?.addEventListener('click', () => this.handleVerifyOtp());
        document.getElementById('loginChangeMobileBtn')?.addEventListener('click', () => this.resetToMobileStep());
        document.getElementById('loginResendBtn')?.addEventListener('click', () => this.handleSendOtp());

        // Close on outside click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.hide();
        });

        // Enter key support
        this.mobileInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('loginSendOtpBtn').click();
        });
        this.otpInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('loginVerifyBtn').click();
        });
    }

    show() {
        if (this.overlay) {
            this.resetToMobileStep();
            this.overlay.style.display = 'flex';
            setTimeout(() => this.mobileInput?.focus(), 100);
        }
    }

    hide() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
    }

    resetToMobileStep() {
        document.getElementById('loginStepMobile').style.display = 'block';
        document.getElementById('loginStepOtp').style.display = 'none';
        this.mobileInput.disabled = false;
        this.mobileInput.value = '';
        this.otpInput.value = '';
        this.hideError('loginMobileError');
        this.hideError('loginOtpError');
        clearInterval(this.timerInterval);
    }

    showError(id, msg) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = msg;
            el.style.display = 'block';
        }
    }

    hideError(id) {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    }

    async handleSendOtp() {
        const mobile = this.mobileInput.value.trim();
        if (!/^[6-9]\d{9}$/.test(mobile)) {
            this.showError('loginMobileError', 'Please enter a valid 10-digit mobile number');
            return;
        }

        const btn = document.getElementById('loginSendOtpBtn');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Sending...';
        this.hideError('loginMobileError');

        try {
            const res = await fetch(`${this.BACKEND}/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile, pincode: "125001" }) // Default pincode for global login
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to send OTP");
            }

            // Success
            this.showOtpStep();
            this.startTimer();
            sessionStorage.setItem("arh_mobile", mobile); // For consistency with existing app.js

        } catch (err) {
            this.showError('loginMobileError', err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }

    showOtpStep() {
        document.getElementById('loginStepMobile').style.display = 'none';
        document.getElementById('loginStepOtp').style.display = 'block';
        setTimeout(() => this.otpInput?.focus(), 100);
    }

    startTimer() {
        let timeLeft = 30;
        const timerSpan = document.getElementById('loginTimer');
        const resendBtn = document.getElementById('loginResendBtn');

        resendBtn.disabled = true;
        timerSpan.textContent = timeLeft;

        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            timeLeft--;
            timerSpan.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(this.timerInterval);
                resendBtn.disabled = false;
                resendBtn.textContent = "Resend OTP";
            }
        }, 1000);
    }

    async handleVerifyOtp() {
        const mobile = this.mobileInput.value.trim();
        const otp = this.otpInput.value.trim();

        if (otp.length < 4) {
            this.showError('loginOtpError', 'Please enter valid OTP');
            return;
        }

        const btn = document.getElementById('loginVerifyBtn');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Verifying...';
        this.hideError('loginOtpError');

        try {
            const res = await fetch(`${this.BACKEND}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile, otp })
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data.success || !data.token) {
                throw new Error(data.message || "Invalid OTP");
            }

            // Success Logic (Synced with app.js)
            localStorage.setItem("arh_token", data.token);
            localStorage.setItem("arh_session_mobile", mobile);
            localStorage.setItem("arh_last_activity", String(Date.now()));

            // Update Header
            if (window.initHeaderAuthUI) window.initHeaderAuthUI();
            else if (typeof updateHeaderAccountStatus === 'function') updateHeaderAccountStatus();

            // Check Profile / Name Capture
            if (typeof checkProfileAndPromptName === 'function') {
                await checkProfileAndPromptName(data.token);
            }

            // Trigger global event
            window.dispatchEvent(new Event("arh:login-success"));

            this.hide();
           this.showToast("Logged in successfully.");

        } catch (err) {
            this.showError('loginOtpError', err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }
   showToast(message) {
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

// Initialize
window.loginModalManager = new LoginModalManager();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.loginModalManager.init());
} else {
    window.loginModalManager.init();
}
