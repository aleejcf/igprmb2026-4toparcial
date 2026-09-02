/* ============================================================
   INSTITUTO RMB — main.js v5
   Features: nav scroll, mobile menu, scroll progress,
             reveal animations, back-to-top, auto dark/light theme

   FASE 1 (auditoría): se retiró el splash de 2.6s con canvas de
   partículas — su barra de progreso no medía nada real y bloqueaba
   el LCP en cada primera visita —, y cinco rutinas que ya no se
   ejecutaban en ninguna página (el home usa .hero-editorial, no
   .hero; .hero-copy no existe en ningún archivo; el nav-links
   dropdown solo corría sin la clase nav-immersive, que hoy llevan
   las 22 páginas). El tilt 3D de tarjetas también se retiró: las
   tarjetas afectadas (.program-card, .activity-card) conservan su
   elevación al hover porque esa parte vive en CSS, no aquí.
   ============================================================ */

(function () {
  "use strict";

  /* ── MODO DE NAVEGACIÓN ───────────────────────────────────
     Las páginas cuyo <html> lleva la clase .nav-immersive usan
     el menú a pantalla completa de js/inmersivo.js. Las demás
     seguirían con la barra de dropdowns clásica (hoy ninguna).
  ─────────────────────────────────────────────────────────── */
  const IMMERSIVE = document.documentElement.classList.contains("nav-immersive");

  /* ── TEMA AUTOMÁTICO POR HORA + TOGGLE MANUAL ─────────── */
  const THEME_KEY = "rmb-theme";

  function getAutoTheme() {
    const h = new Date().getHours();
    return (h >= 6 && h < 18) ? "light" : "dark";
  }

  const ICON_SOL  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>';
  const ICON_LUNA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = document.querySelector(".theme-btn");
    if (btn) btn.innerHTML = theme === "dark" ? ICON_SOL : ICON_LUNA;
  }

  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme || getAutoTheme());

  function insertThemeButton() {
    const nav = document.querySelector(".nav");
    if (!nav) return;
    const btn = document.createElement("button");
    btn.className = "theme-btn";
    btn.setAttribute("aria-label", "Cambiar tema");
    const current = document.documentElement.getAttribute("data-theme") || getAutoTheme();
    btn.innerHTML = current === "dark" ? ICON_SOL : ICON_LUNA;

    btn.addEventListener("click", () => {
      const now = document.documentElement.getAttribute("data-theme");
      const next = now === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });

    const toggle = nav.querySelector(".menu-toggle");
    nav.insertBefore(btn, toggle);
  }

  insertThemeButton();

  /* ── MOBILE MENU (clásico, sin nav-immersive) ─────────── */
  const menuButton = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");

  if (!IMMERSIVE && menuButton && menu) {
    menuButton.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      const spans = menuButton.querySelectorAll("span");
      if (isOpen) {
        spans[0].style.transform = "translateY(7px) rotate(45deg)";
        spans[1].style.opacity = "0";
        spans[2].style.transform = "translateY(-7px) rotate(-45deg)";
      } else {
        spans[0].style.transform = "";
        spans[1].style.opacity = "";
        spans[2].style.transform = "";
      }
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        const spans = menuButton.querySelectorAll("span");
        spans.forEach(s => { s.style.transform = ""; s.style.opacity = ""; });
      });
    });
  }

  /* ── ELEMENTOS FIJOS QUE REACCIONAN AL SCROLL ─────────────
     FASE 5 (auditoría §08): header, barra de progreso (fallback),
     botón "volver arriba" y barra de acción móvil vivían cada uno
     con su propio addEventListener("scroll", ...) — cuatro listeners
     leyendo window.scrollY por separado en cada evento. Se crean
     todos los elementos primero y un solo listener con rAF los
     actualiza juntos. */
  const header = document.querySelector(".site-header");

  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);

  // En navegadores con animation-timeline: scroll() (ver css/tokens.css
  // y estilos.css) el compositor mueve la barra solo — sin JS. Este
  // fallback solo hace algo donde ese soporte no existe.
  const supportsScrollTimeline =
    typeof CSS !== "undefined" && CSS.supports && CSS.supports("animation-timeline: scroll()");
  if (!supportsScrollTimeline) progress.classList.add("js-driven");

  const btt = document.createElement("button");
  btt.className = "back-to-top";
  btt.setAttribute("aria-label", "Volver al inicio");
  btt.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;
  document.body.appendChild(btt);
  btt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* Barra de acción fija (móvil). FASE 2 (auditoría): antes no había
     ninguna forma de contactar al instituto desde el sitio. En móvil,
     que es como la mayoría de familias de Agua Blanca Sur va a entrar,
     WhatsApp y Matrícula quedan siempre a un toque, sin tener que
     bajar hasta el pie de página. Aparece después del hero, no
     compite con sus CTA. */
  const ctaBar = document.createElement("div");
  ctaBar.className = "mobile-cta-bar";
  ctaBar.innerHTML = `
    <a class="mobile-cta-link mobile-cta-whatsapp" href="https://wa.me/50488162265" target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="18" height="18"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.48 1.32 4.99L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.16c-.24.68-1.4 1.33-1.93 1.4-.5.08-1.11.11-1.79-.11a16.6 16.6 0 0 1-1.62-.6c-2.86-1.24-4.72-4.13-4.87-4.32-.14-.2-1.16-1.55-1.16-2.96 0-1.4.73-2.09.99-2.38.26-.28.57-.35.76-.35l.55.01c.18.01.41-.07.64.49.24.57.81 1.98.88 2.12.07.15.12.32.02.51-.09.2-.14.32-.28.49-.14.17-.29.38-.42.51-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.61-.07.16-.19.7-.82.89-1.1.19-.28.38-.23.63-.14.26.1 1.65.78 1.94.92.28.14.47.21.54.33.07.12.07.68-.17 1.36z"/></svg>
      WhatsApp
    </a>
    <a class="mobile-cta-link mobile-cta-primary" href="matricula.html">Matrícula 2027</a>
  `;
  document.body.appendChild(ctaBar);

  function updateScrollState() {
    const y = window.scrollY;

    if (header) header.classList.toggle("scrolled", y > 30);
    btt.classList.toggle("visible", y > 380);
    ctaBar.classList.toggle("visible", y > 320);

    if (!supportsScrollTimeline) {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollHeight > 0 ? y / scrollHeight : 0;
      progress.style.transform = "scaleX(" + pct + ")";
    }
  }

  let scrollTicking = false;
  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(() => { updateScrollState(); scrollTicking = false; });
    }
  }, { passive: true });
  window.addEventListener("resize", updateScrollState);
  updateScrollState();

  /* ── SCROLL REVEAL ────────────────────────────────────── */
  const revealTargets = document.querySelectorAll(
    ".section-head, .feature-card, .program-card, .activity-card, " +
    ".info-card, .callout, .event-item, .pathway article, " +
    ".identity-grid article, .decision-grid article, .image-frame, " +
    ".timeline-item, .timeline, .hero-stats-row .stat, " +
    ".offer-row, .facts-strip-item, .life-mosaic-item, .contact-strip-item, " +
    ".matricula-climax"
  );

  if ("IntersectionObserver" in window) {
    revealTargets.forEach((el) => {
      el.classList.add("reveal");
      // FASE 3 (auditoría §06): 0.08s -> 0.05s (var(--mo-stagger) en
      // tokens.css) y tope de 6 — en una fila de muchos elementos, el
      // último ya no tardaba casi medio segundo extra en aparecer.
      const siblings = Array.from(el.parentElement.children);
      const index = Math.min(siblings.indexOf(el), 6);
      el.style.transitionDelay = (index * 0.05) + "s";
    });

    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" }
    );

    revealTargets.forEach((el) => revealObs.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  /* ── SMOOTH ANCHOR SCROLL ─────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    });
  });

})();
