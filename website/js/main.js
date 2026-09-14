(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  /* Footer year */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Mobile nav toggle */
  var navToggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Sticky header shadow */
  var header = document.getElementById("site-header");
  if (header) {
    var onScroll = function () {
      header.style.boxShadow = window.scrollY > 8 ? "0 8px 24px rgba(6,13,24,0.35)" : "none";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* AOS scroll reveals */
  if (window.AOS) {
    window.AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
      disable: prefersReducedMotion
    });
  }

  /* Vanta.js NET background for hero */
  var heroCanvas = document.getElementById("hero-canvas");
  if (heroCanvas && window.VANTA && !prefersReducedMotion) {
    window.VANTA.NET({
      el: heroCanvas,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1.0,
      scaleMobile: 1.0,
      color: 0x2f6fed,
      backgroundColor: 0x060d18,
      points: isCoarsePointer ? 6 : 10,
      maxDistance: 22,
      spacing: 18,
      showDots: true
    });
  }

  /* Vanilla-Tilt on service & team cards */
  if (window.VanillaTilt && !isCoarsePointer && !prefersReducedMotion) {
    var tiltEls = document.querySelectorAll("[data-tilt]");
    if (tiltEls.length) {
      window.VanillaTilt.init(tiltEls, {
        max: 6,
        speed: 400,
        scale: 1.02,
        glare: true,
        "max-glare": 0.12,
        perspective: 1200
      });
    }
  }

  /* Contact form: client-side handling (no backend) */
  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = contactForm.querySelector("#name").value.trim();
      var email = contactForm.querySelector("#email").value.trim();
      var subject = contactForm.querySelector("#subject").value.trim() || "Website enquiry";
      var message = contactForm.querySelector("#message").value.trim();

      var body = "Name: " + name + "\nEmail: " + email + "\n\n" + message;
      var mailto = "mailto:info@wactrack.co.zw" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      var successEl = document.getElementById("form-success");
      if (successEl) successEl.classList.add("is-visible");

      window.location.href = mailto;
      contactForm.reset();
    });
  }
})();
