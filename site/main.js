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
    }, { threshold: 0, rootMargin: "0px 0px -2% 0px" });
    risers.forEach(function (el) { io.observe(el); });
    /* Reveal anything already in view (helps short mobile viewports). */
    requestAnimationFrame(function () {
      risers.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("in");
          io.unobserve(el);
        }
      });
    });
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

  /* Ambient dust motes — fixed canvas behind content (z-index 0). */
  if (!prefersReduced) {
    var particleRoot = document.createElement("canvas");
    particleRoot.className = "site-particles";
    particleRoot.setAttribute("aria-hidden", "true");
    document.body.prepend(particleRoot);

    var ctx = particleRoot.getContext("2d", { alpha: true });
    var particles = [];
    var rafId = 0;
    var running = true;
    var dpr = 1;
    var w = 0;
    var h = 0;

    var resize = function () {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      particleRoot.width = Math.floor(w * dpr);
      particleRoot.height = Math.floor(h * dpr);
      particleRoot.style.width = w + "px";
      particleRoot.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var target = Math.round(Math.min(110, Math.max(40, (w * h) / 18000)));
      while (particles.length < target) particles.push(spawn(true));
      if (particles.length > target) particles.length = target;
    };

    /* Bias X toward left/right gutters so the center stays quieter. */
    var edgeX = function () {
      var t = Math.pow(Math.random(), 0.45);
      var band = Math.min(w * 0.28, 320);
      if (Math.random() < 0.82) {
        return Math.random() < 0.5
          ? t * band
          : w - t * band;
      }
      return band + Math.random() * Math.max(1, w - band * 2);
    };

    var spawn = function (randomY) {
      var nearEdge = Math.random() < 0.7;
      return {
        x: edgeX(),
        y: randomY ? Math.random() * h : h + 4 + Math.random() * 40,
        r: 0.45 + Math.random() * (nearEdge ? 2.1 : 1.4),
        vx: (Math.random() - 0.5) * 0.18,
        vy: -(0.08 + Math.random() * 0.22),
        phase: Math.random() * Math.PI * 2,
        sway: 0.15 + Math.random() * 0.45,
        alpha: 0.1 + Math.random() * (nearEdge ? 0.28 : 0.14),
        warm: Math.random() > 0.55,
      };
    };

    var tick = function () {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      var edgeBand = Math.min(w * 0.28, 320);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.phase += 0.008 + p.sway * 0.004;
        p.x += p.vx + Math.sin(p.phase) * p.sway * 0.12;
        p.y += p.vy;

        if (p.y < -8 || p.x < -12 || p.x > w + 12) {
          particles[i] = spawn(false);
          continue;
        }

        var distEdge = Math.min(p.x, w - p.x);
        var edgeBoost = distEdge < edgeBand
          ? 1 + 1.35 * (1 - distEdge / edgeBand)
          : 0.55;
        var pulse = 0.65 + 0.35 * Math.sin(p.phase * 1.4);
        var a = Math.min(0.55, p.alpha * pulse * edgeBoost);
        if (p.warm) {
          ctx.fillStyle = "rgba(197, 160, 89, " + a.toFixed(3) + ")";
        } else {
          ctx.fillStyle = "rgba(233, 226, 208, " + (a * 0.8).toFixed(3) + ")";
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (distEdge < edgeBand ? 1 + 0.25 * edgeBoost : 1), 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        running = false;
        if (rafId) window.cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (!running) {
        running = true;
        rafId = window.requestAnimationFrame(tick);
      }
    });
    rafId = window.requestAnimationFrame(tick);
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
