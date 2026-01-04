/* =========================================================
   assets/menu-fix.js  (ADD-ONLY)
   PURPOSE: Stop all conflicting hamburger listeners and force 1 clean toggle.
   Works with:
   - <button class="nav-toggle">
   - <nav class="menu" id="primary-navigation">
========================================================= */

(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    const toggle = document.querySelector(".nav-toggle");
    const menu =
      document.getElementById("primary-navigation") ||
      document.querySelector("nav.menu") ||
      document.querySelector(".menu");

    if (!toggle || !menu) return;

    const MOBILE_MAX = 859;

    function isMobile() {
      return window.matchMedia(`(max-width:${MOBILE_MAX}px)`).matches;
    }

    function setOpen(open) {
      if (!isMobile()) {
        document.body.classList.remove("nav-open");
        menu.classList.remove("is-open");
        menu.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "false");
        return;
      }

      document.body.classList.toggle("nav-open", open);
      menu.classList.toggle("is-open", open);

      if (open) {
        menu.removeAttribute("hidden");
      } else {
        menu.setAttribute("hidden", "");
      }

      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    // initial state
    setOpen(false);

    // hamburger click
    document.addEventListener(
      "click",
      function (e) {
        const btn = e.target.closest(".nav-toggle");
        if (!btn) return;
        if (!isMobile()) return;

        e.preventDefault();
        e.stopPropagation();

        const openNow =
          document.body.classList.contains("nav-open") ||
          menu.classList.contains("is-open");

        setOpen(!openNow);
      },
      true
    );

    // close on link click
    menu.addEventListener(
      "click",
      function (e) {
        if (!isMobile()) return;
        const link = e.target.closest("a[href]");
        if (!link) return;
        setOpen(false);
      },
      true
    );

    // close on outside click
    document.addEventListener(
      "click",
      function (e) {
        if (!isMobile()) return;
        if (toggle.contains(e.target) || menu.contains(e.target)) return;
        setOpen(false);
      },
      true
    );

    // ESC key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    // resize reset
    window.addEventListener("resize", function () {
      setOpen(false);
    });
  });
})();
