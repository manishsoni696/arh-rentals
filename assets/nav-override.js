/* =========================================================
   ARH Rentals — assets/nav-override.js  (ADD-ONLY FILE) ✅
   PURPOSE:
   - Fix mobile menu not opening / opening then instantly closing
   - Works even if app.js already has multiple nav toggle blocks
   - NO deletion needed (hard override using capture + stopImmediatePropagation)
   ========================================================= */

(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var MOBILE_MAX = 859;

    function isMobile() {
      return window.matchMedia("(max-width:" + MOBILE_MAX + "px)").matches;
    }

    function getToggle() {
      return document.querySelector(".nav-toggle");
    }

    function getMenu() {
      return (
        document.getElementById("primary-navigation") ||
        document.querySelector("nav.menu") ||
        document.querySelector(".menu")
      );
    }

    function setOpen(open) {
      var toggle = getToggle();
      var menu = getMenu();
      if (!toggle || !menu) return;

      document.body.classList.toggle("nav-open", !!open);
      menu.classList.toggle("is-open", !!open);

      toggle.setAttribute("aria-expanded", open ? "true" : "false");

      if (isMobile()) {
        if (open) menu.removeAttribute("hidden");
        else menu.setAttribute("hidden", "");
      } else {
        menu.removeAttribute("hidden");
        menu.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    }

    function initState() {
      var toggle = getToggle();
      var menu = getMenu();
      if (!toggle || !menu) return;

      toggle.setAttribute("aria-expanded", "false");

      if (isMobile()) {
        menu.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        menu.setAttribute("hidden", "");
      } else {
        menu.removeAttribute("hidden");
        menu.classList.remove("is-open");
        document.body.classList.remove("nav-open");
      }
    }

    var lastToggleClickAt = 0;

    initState();

    // 1) HARD OVERRIDE: Toggle click (CAPTURE) — prevents other handlers from firing
    document.addEventListener(
      "click",
      function (e) {
        var toggle = getToggle();
        var menu = getMenu();
        if (!toggle || !menu) return;

        var clickedToggle =
          e.target && e.target.closest ? e.target.closest(".nav-toggle") : null;
        if (!clickedToggle) return;

        if (!isMobile()) return;

        lastToggleClickAt = Date.now();

        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();

        var openNow =
          document.body.classList.contains("nav-open") ||
          menu.classList.contains("is-open") ||
          toggle.getAttribute("aria-expanded") === "true";

        setOpen(!openNow);
      },
      true
    );

    // 2) Close when clicking a menu link (CAPTURE)
    document.addEventListener(
      "click",
      function (e) {
        var menu = getMenu();
        if (!menu) return;
        if (!isMobile()) return;

        var link = e.target && e.target.closest ? e.target.closest("a[href]") : null;
        if (!link) return;
        if (!menu.contains(link)) return;

        setOpen(false);
      },
      true
    );

    // 3) Outside click close (CAPTURE) — ignores the toggle click moment
    document.addEventListener(
      "click",
      function (e) {
        var toggle = getToggle();
        var menu = getMenu();
        if (!toggle || !menu) return;
        if (!isMobile()) return;

        if (Date.now() - lastToggleClickAt < 250) return;

        var insideMenu = menu.contains(e.target);
        var insideToggle = toggle.contains(e.target);

        if (!insideMenu && !insideToggle) setOpen(false);
      },
      true
    );

    // 4) ESC closes
    document.addEventListener(
      "keydown",
      function (e) {
        if (e.key === "Escape") setOpen(false);
      },
      true
    );

    // 5) Resize resets state correctly
    window.addEventListener("resize", function () {
      initState();
    });
  });
})();
