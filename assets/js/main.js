/* Tim Schoster – KI-Automation | main.js */
(function () {
  "use strict";

  // --- Mobile navigation toggle ---
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    });

    // Close menu when a link is clicked (mobile)
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // --- Dynamic footer year ---
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // --- Basic contact form handling (no backend yet) ---
  var form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (form.querySelector('[name="name"]') || {}).value || "";
      var email = (form.querySelector('[name="email"]') || {}).value || "";
      var message = (form.querySelector('[name="message"]') || {}).value || "";
      // Fallback: open the user's mail client with a prefilled mail.
      var subject = encodeURIComponent("Anfrage Erstgespräch – " + name);
      var body = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
      window.location.href = "mailto:kontakt@timschoster.de?subject=" + subject + "&body=" + body;
    });
  }
})();
