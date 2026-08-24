/* ============================================================
   INSTITUTO RMB — main.js v4
   Features: splash intro, nav scroll, mobile menu, scroll progress,
             reveal animations, count-up, card tilt, cursor glow,
             dropdown nav, back-to-top, auto dark/light theme
   ============================================================ */

(function () {
  "use strict";

  /* ── MODO DE NAVEGACIÓN ───────────────────────────────────
     Las páginas cuyo <html> lleva la clase .nav-immersive usan
     el menú a pantalla completa de js/inmersivo.js. Las demás
     siguen con la barra de dropdowns de siempre.
  ─────────────────────────────────────────────────────────── */
  const IMMERSIVE = document.documentElement.classList.contains("nav-immersive");

  /* ── TEMA AUTOMÁTICO POR HORA + TOGGLE MANUAL ─────────── */
  const THEME_KEY = "rmb-theme";

  function getAutoTheme() {
    const h = new Date().getHours();
    return (h >= 6 && h < 18) ? "light" : "dark";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = document.querySelector(".theme-btn");
    if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
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
    btn.textContent = current === "dark" ? "☀️" : "🌙";

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

  /* ══════════════════════════════════════════════════════
     SPLASH SCREEN — solo en index.html
  ══════════════════════════════════════════════════════ */
  const isHomePage =
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname.endsWith("/");

  const SPLASH_KEY = "rmb-splash-shown";
  // Mostrar splash cada vez que se entra a la página de inicio
  // (quitar la condición de !sessionStorage para que siempre aparezca)
  const splashShown = sessionStorage.getItem(SPLASH_KEY);

  if (isHomePage && !splashShown) {
    sessionStorage.setItem(SPLASH_KEY, "1");
    document.body.style.overflow = "hidden";

    // El splash ya hace de intro: anulamos la apertura de la cortina para no
    // encadenar dos animaciones. La cortina sigue viva para las transiciones.
    const curtainAtStart = document.getElementById("pt-curtain");
    if (curtainAtStart) curtainAtStart.classList.add("pt-noreveal");

    // Crear el splash
    const splash = document.createElement("div");
    splash.id = "rmb-splash";
    splash.innerHTML = `
      <canvas id="splash-canvas"></canvas>
      <div class="splash-rings">
        <div class="splash-ring"></div>
        <div class="splash-ring"></div>
        <div class="splash-ring"></div>
        <div class="splash-ring"></div>
      </div>
      <div class="splash-content">
        <div class="splash-logo"><img src="imagenes/irmb/logo_intro.png" alt="Logo Instituto RMB" style="width:100%;height:100%;object-fit:contain;border-radius:28px;"></div>
        <div class="splash-divider"></div>
        <h1 class="splash-title">Instituto <span>Roberto Micheletti Baín</span></h1>
        <p class="splash-sub">Agua Blanca Sur · El Progreso, Yoro</p>
      </div>
      <div class="splash-bar-wrap">
        <div class="splash-bar-track">
          <div class="splash-bar-fill" id="splash-bar-fill"></div>
        </div>
        <div class="splash-bar-label">Cargando...</div>
      </div>
    `;
    document.body.insertBefore(splash, document.body.firstChild);

    // Partículas en el canvas del splash
    const canvas = document.getElementById("splash-canvas");
    const ctx = canvas.getContext("2d");
    let W, H, particles = [], rafSplash;

    function resizeSplash() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    class SplashParticle {
      constructor() { this.reset(true); }
      reset(initial) {
        this.x = Math.random() * W;
        this.y = initial ? Math.random() * H : H + 5;
        this.r = Math.random() * 2.2 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = -(Math.random() * 1.2 + 0.3);
        this.alpha = Math.random() * 0.6 + 0.1;
        const orange = Math.random() > 0.5;
        this.color = orange
          ? `rgba(244,123,32,${this.alpha})`
          : `rgba(80,150,255,${this.alpha})`;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y < -5) this.reset(false);
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    resizeSplash();
    particles = Array.from({ length: 120 }, () => new SplashParticle());

    function loopSplash() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      rafSplash = requestAnimationFrame(loopSplash);
    }
    loopSplash();
    window.addEventListener("resize", resizeSplash);

    // Barra de progreso
    const bar = document.getElementById("splash-bar-fill");
    const DURATION = 2600; // ms
    const startTime = performance.now();

    function animateBar(now) {
      const elapsed = now - startTime;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      bar.style.width = pct + "%";
      if (pct < 100) {
        requestAnimationFrame(animateBar);
      } else {
        exitSplash();
      }
    }
    requestAnimationFrame(animateBar);

    function exitSplash() {
      cancelAnimationFrame(rafSplash);
      splash.classList.add("splash-exit");
      document.body.style.overflow = "";
      setTimeout(() => {
        splash.remove();
      }, 850);
    }

    // Permitir saltarlo con click
    splash.addEventListener("click", () => {
      if (!splash.classList.contains("splash-exit")) exitSplash();
    });
  }

  /* ── DROPDOWN NAV ─────────────────────────────────────── */
  function buildDropdownNav() {
    const navLinks = document.querySelector(".nav-links");
    if (!navLinks) return;

    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    const groups = [
      {
        label: "El Instituto",
        links: [
          { href: "index.html",    icon: "🏫", text: "Inicio" },
          { href: "historia.html", icon: "📜", text: "Historia" },
        ]
      },
      {
        label: "Académico",
        links: [
          { href: "oferta-academica.html", icon: "📚", text: "Oferta académica" },
          { href: "matricula.html",        icon: "📝", text: "Matrícula 2026" },
        ]
      },
      {
        label: "Vida escolar",
        links: [
          { href: "actividades.html",      icon: "🎉", text: "Actividades" },
          { href: "extracurriculares.html",icon: "⚽", text: "Extracurriculares" },
        ]
      },
    ];

    const simpleLinks = [
      { href: "contacto.html",  text: "Contacto" },
      { href: "ubicacion.html", text: "Ubicación" },
    ];

    navLinks.innerHTML = "";

    groups.forEach(group => {
      const item = document.createElement("div");
      item.className = "nav-item";

      const trigger = document.createElement("button");
      trigger.className = "nav-links nav-trigger";
      trigger.style.cssText = "background:none;border:none;padding:8px 14px;border-radius:10px;display:flex;align-items:center;gap:5px;cursor:pointer;";
      trigger.innerHTML = `<span>${group.label}</span><span class="caret"></span>`;
      trigger.style.color = "rgba(255,255,255,.75)";
      trigger.style.fontFamily = "inherit";
      trigger.style.fontSize = ".875rem";
      trigger.style.fontWeight = "700";
      trigger.style.transition = "color .2s, background .2s";

      const isGroupActive = group.links.some(l => l.href === currentPage);
      if (isGroupActive) {
        trigger.style.background = "linear-gradient(135deg, rgba(45,109,228,.45), rgba(244,123,32,.25))";
        trigger.style.border = "1px solid rgba(255,255,255,.15)";
        trigger.style.color = "#fff";
      }

      const dropdown = document.createElement("div");
      dropdown.className = "nav-dropdown";

      group.links.forEach(link => {
        const a = document.createElement("a");
        a.href = link.href;
        a.innerHTML = `<span class="dd-icon">${link.icon}</span>${link.text}`;
        if (link.href === currentPage) a.classList.add("active");
        dropdown.appendChild(a);
      });

      item.appendChild(trigger);
      item.appendChild(dropdown);
      navLinks.appendChild(item);

      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        item.classList.toggle("open");
        navLinks.querySelectorAll(".nav-item.open").forEach(other => {
          if (other !== item) other.classList.remove("open");
        });
      });
    });

    simpleLinks.forEach(link => {
      const a = document.createElement("a");
      a.href = link.href;
      a.textContent = link.text;
      if (link.href === currentPage) a.classList.add("active");
      navLinks.appendChild(a);
    });

    document.addEventListener("click", () => {
      navLinks.querySelectorAll(".nav-item.open").forEach(el => el.classList.remove("open"));
    });
  }

  if (!IMMERSIVE) buildDropdownNav();

  /* ── MOBILE MENU ──────────────────────────────────────── */
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

  /* ── HEADER SCROLL STATE ──────────────────────────────── */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── SCROLL PROGRESS BAR ──────────────────────────────── */
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);

  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progress.style.width = pct + "%";
  };

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* ── BOTÓN VOLVER ARRIBA ──────────────────────────────── */
  const btt = document.createElement("button");
  btt.className = "back-to-top";
  btt.setAttribute("aria-label", "Volver al inicio");
  btt.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;
  document.body.appendChild(btt);

  window.addEventListener("scroll", () => {
    btt.classList.toggle("visible", window.scrollY > 380);
  }, { passive: true });

  btt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ── SCROLL REVEAL ────────────────────────────────────── */
  const revealTargets = document.querySelectorAll(
    ".section-head, .feature-card, .program-card, .activity-card, " +
    ".info-card, .callout, .event-item, .pathway article, " +
    ".identity-grid article, .decision-grid article, .image-frame, " +
    ".timeline-item, .timeline, .hero-stats-row .stat, " +
    ".offer-row, .facts-strip-item, .life-mosaic-item, .contact-strip-item"
  );

  if ("IntersectionObserver" in window) {
    revealTargets.forEach((el) => {
      el.classList.add("reveal");
      const siblings = Array.from(el.parentElement.children);
      el.style.transitionDelay = (siblings.indexOf(el) * 0.08) + "s";
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

  /* ── COUNT-UP ANIMATION ───────────────────────────────── */
  const countEls = document.querySelectorAll(".stat strong");

  function animateCount(el) {
    const text = el.textContent.trim();
    const num = parseFloat(text.replace(/[^\d.]/g, ""));
    const suffix = text.replace(/[\d.]/g, "");
    if (isNaN(num)) return;
    const duration = 1800;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(ease(p) * num) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    const countObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { animateCount(entry.target); countObs.unobserve(entry.target); }
        });
      },
      { threshold: 0.5 }
    );
    countEls.forEach((el) => countObs.observe(el));
  }

  /* ── CARD TILT EFFECT ─────────────────────────────────── */
  const tiltCards = document.querySelectorAll(
    ".feature-card, .program-card, .activity-card, .pathway article"
  );

  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rect = card.getBoundingClientRect();
      const rotY = (((e.clientX - rect.left) / rect.width) - 0.5) * 16;
      const rotX = -(((e.clientY - rect.top) / rect.height) - 0.5) * 16;
      card.style.transform = `translateY(-8px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      card.style.transformStyle = "preserve-3d";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.style.transformStyle = "";
    });
  });

  /* ── CURSOR GLOW (desktop only) ───────────────────────── */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const glow = document.createElement("div");
    glow.style.cssText = `position:fixed;width:440px;height:440px;border-radius:50%;pointer-events:none;z-index:0;background:radial-gradient(circle,rgba(45,109,228,.08) 0%,transparent 70%);transform:translate(-50%,-50%);transition:opacity .4s;top:0;left:0;`;
    document.body.appendChild(glow);
    let glowX = 0, glowY = 0, raf;
    document.addEventListener("mousemove", (e) => {
      glowX = e.clientX; glowY = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => {
        glow.style.left = glowX + "px";
        glow.style.top = glowY + "px";
        raf = null;
      });
    });
    document.addEventListener("mouseleave", () => glow.style.opacity = "0");
    document.addEventListener("mouseenter", () => glow.style.opacity = "1");
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

  /* ── HERO PARTICLE CANVAS ─────────────────────────────── */
  const hero = document.querySelector(".hero");
  if (hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:.55;";
    hero.style.position = "relative";
    hero.insertBefore(canvas, hero.firstChild);
    const ctx = canvas.getContext("2d");
    let W, H, particles = [];

    function resize() { W = canvas.width = hero.offsetWidth; H = canvas.height = hero.offsetHeight; }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W; this.y = Math.random() * H;
        this.r = Math.random() * 1.8 + .4;
        this.vx = (Math.random() - .5) * .3; this.vy = -Math.random() * .5 - .1;
        this.alpha = Math.random() * .5 + .1;
        this.color = Math.random() > .6 ? `rgba(244,123,32,${this.alpha})` : `rgba(100,160,255,${this.alpha})`;
      }
      update() { this.x += this.vx; this.y += this.vy; if (this.y < -5) this.reset(); }
      draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fillStyle = this.color; ctx.fill(); }
    }

    function initParticles() { particles = Array.from({ length: 80 }, () => new Particle()); }
    function loop() { ctx.clearRect(0, 0, W, H); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(loop); }

    resize(); initParticles(); loop();
    window.addEventListener("resize", () => { resize(); initParticles(); });
  }

  /* ── PULSE BADGE ──────────────────────────────────────── */
  const heroCopy = document.querySelector(".hero-copy");
  if (heroCopy && !document.querySelector(".pulse-badge")) {
    const badge = document.createElement("div");
    badge.className = "pulse-badge";
    badge.innerHTML = '<span class="pulse-dot"></span> Matrícula 2026 abierta';
    heroCopy.insertBefore(badge, heroCopy.firstChild);
  }

})();
