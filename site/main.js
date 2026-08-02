/* Grimoire Interactive — progressive enhancement only.
   Everything below is optional; the site is fully usable without JS. */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
  var legacyYear = document.getElementById("year");
  if (legacyYear) legacyYear.textContent = String(new Date().getFullYear());

  var siteNav = document.querySelector("[data-site-nav]") || document.querySelector(".site-nav");
  if (siteNav && "IntersectionObserver" in window === false) {
    /* no-op fallback */
  }
  if (siteNav) {
    var onScroll = function () {
      siteNav.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var risers = document.querySelectorAll("[data-rise]");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    risers.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        /* Any visible pixel is enough — tall blocks (galleries) never hit high thresholds. */
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -4% 0px" });
    risers.forEach(function (el) { io.observe(el); });
  }

  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var statusEl = form.querySelector("[data-form-status]");
    var submitBtn = form.querySelector("[data-submit]");

    function setStatus(kind, text) {
      if (!statusEl) return;
      statusEl.hidden = !text;
      statusEl.textContent = text || "";
      statusEl.classList.toggle("is-ok", kind === "ok");
      statusEl.classList.toggle("is-err", kind === "err");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setStatus("", "");

      var privacy = form.elements.namedItem("privacy");
      if (privacy && !privacy.checked) {
        setStatus("err", "Bitte die Hinweise zum Datenschutz bestätigen.");
        return;
      }

      var data = {
        name: (form.elements.namedItem("name") || {}).value || "",
        email: (form.elements.namedItem("email") || {}).value || "",
        subject: (form.elements.namedItem("subject") || {}).value || "",
        message: (form.elements.namedItem("message") || {}).value || "",
        website: (form.elements.namedItem("website") || {}).value || "",
      };

      if (submitBtn) submitBtn.disabled = true;

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          return res.json().then(function (body) {
            return { res: res, body: body };
          });
        })
        .then(function (result) {
          if (result.res.ok && result.body && result.body.ok) {
            form.reset();
            setStatus("ok", "Nachricht gesendet. Ich melde mich, sobald ich kann.");
            return;
          }
          var err =
            (result.body && result.body.error) ||
            "Versand fehlgeschlagen. Bitte später erneut versuchen.";
          setStatus("err", err);
        })
        .catch(function () {
          setStatus(
            "err",
            "Keine Verbindung. Bitte später erneut versuchen oder an kontakt@grimoire-interactive.de schreiben."
          );
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  /* Lightweight lightbox for media gallery */
  var lightboxTriggers = document.querySelectorAll("[data-lightbox]");
  if (lightboxTriggers.length) {
    var dialog = document.createElement("dialog");
    dialog.className = "lightbox";
    dialog.setAttribute("aria-label", "Bildansicht");
    dialog.innerHTML =
      '<figure class="lightbox__frame">' +
      '<button type="button" class="lightbox__close" data-lightbox-close aria-label="Schließen">×</button>' +
      '<img src="" alt="" />' +
      '<figcaption class="lightbox__caption"></figcaption>' +
      "</figure>";
    document.body.appendChild(dialog);

    var imgEl = dialog.querySelector("img");
    var capEl = dialog.querySelector(".lightbox__caption");
    var closeBtn = dialog.querySelector("[data-lightbox-close]");

    var openLightbox = function (src, alt, caption) {
      imgEl.src = src;
      imgEl.alt = alt || "";
      capEl.textContent = caption || "";
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      }
    };

    lightboxTriggers.forEach(function (btn) {
      btn.addEventListener("click", function () {
        openLightbox(
          btn.getAttribute("data-lightbox") || "",
          btn.getAttribute("data-alt") || "",
          btn.getAttribute("data-caption") || ""
        );
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        dialog.close();
      });
    }
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && dialog.open) dialog.close();
    });
  }
})();
