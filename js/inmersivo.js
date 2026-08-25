/* ============================================================
   INSTITUTO RMB — inmersivo.js
   Navegación inmersiva. Solo se ejecuta si <html> lleva la clase
   .nav-immersive (por ahora, únicamente index.html).

     1) Menú a pantalla completa con foto de fondo por sección
     2) Índice lateral de secciones con scroll spy
     3) Cortina de transición entre páginas

   Debe cargarse DESPUÉS de main.js: main.js detecta la misma
   clase y se abstiene de construir la barra de dropdowns.
   ============================================================ */

(function () {
  "use strict";

  if (!document.documentElement.classList.contains("nav-immersive")) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ══════════════════════════════════════════════════════
     1. MENÚ A PANTALLA COMPLETA
  ══════════════════════════════════════════════════════ */

  const MENU = [
    { href: "index.html",             text: "Inicio",            desc: "Portada del instituto",             photo: "imagenes/otros/cole.jpg" },
    { href: "historia.html",          text: "Historia",          desc: "Cuatro décadas de compromiso",      photo: "imagenes/acto_civico/acto_inaugural/estudiantes-formacion-cancha-techada.jpg", group: "Institución" },
    { href: "infraestructura.html",   text: "Infraestructura",   desc: "Talleres, laboratorio y auditorio", photo: "imagenes/otros/auditorio.jpg", group: "Institución" },
    { href: "oferta-academica.html",  text: "Oferta académica",  desc: "Niveles, talleres y bachilleratos", photo: "imagenes/acto_civico/honor_excelencia/honor-excelencia-01.jpg", group: "Oferta académica" },
    { href: "actividades.html",       text: "Actividades",       desc: "Académicas, cívicas y técnicas",    photo: "imagenes/otros/acto_civico.jpg", group: "Vida estudiantil" },
    { href: "extracurriculares.html", text: "Extracurriculares", desc: "Danza, banda y deportes",           photo: "imagenes/otros/grupo_danza.jpg", group: "Vida estudiantil" },
    { href: "galeria.html",           text: "Galería",           desc: "Graduaciones, aniversarios y más",  photo: "imagenes/acto_civico/42_aniversario/42-aniversario-51.jpg", group: "Recursos" },
    { href: "docentes.html",          text: "Cuerpo Docente",    desc: "Quiénes forman a los estudiantes",  photo: "imagenes/acto_civico/acto_inaugural/docentes-presentacion-tarima.jpg", group: "Recursos" },
    { href: "matricula.html",         text: "Matrícula 2026",    desc: "Requisitos, fechas y horarios",     photo: "imagenes/otros/matricula.jpg", group: "Matrícula", highlight: true },
    { href: "contacto.html",          text: "Contacto",          desc: "Escríbenos o visítanos",            photo: "imagenes/acto_civico/acto_inaugural/reunion-personal-administrativo.jpg", group: "Matrícula" },
    { href: "ubicacion.html",         text: "Ubicación",         desc: "Agua Blanca Sur, El Progreso",      photo: "imagenes/otros/ubicacion.jpg", group: "Matrícula" }
  ];

  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  const toggleBtn = document.querySelector("[data-menu-toggle]");
  if (!toggleBtn) return;

  /* ── Construcción del overlay ─────────────────────────── */
  const menu = document.createElement("div");
  menu.className = "fs-menu";
  menu.id = "fs-menu";
  menu.setAttribute("role", "dialog");
  menu.setAttribute("aria-modal", "true");
  menu.setAttribute("aria-label", "Menú principal");
  menu.setAttribute("aria-hidden", "true");

  // Capa de fondo: una foto por sección + degradado encima
  const bg = document.createElement("div");
  bg.className = "fs-menu-bg";

  const photos = MENU.map(item => {
    const ph = document.createElement("div");
    ph.className = "fs-menu-photo";
    ph.style.backgroundImage = 'url("' + item.photo + '")';
    bg.appendChild(ph);
    return ph;
  });

  const scrim = document.createElement("div");
  scrim.className = "fs-menu-scrim";
  bg.appendChild(scrim);
  menu.appendChild(bg);

  // Contenido
  const inner = document.createElement("div");
  inner.className = "fs-menu-inner container";

  const list = document.createElement("nav");
  list.className = "fs-menu-list";
  list.setAttribute("aria-label", "Páginas del sitio");

  let lastGroup = null;
  const links = MENU.map((item, i) => {
    if (item.group && item.group !== lastGroup) {
      lastGroup = item.group;
      const label = document.createElement("span");
      label.className = "fs-group-label";
      label.textContent = item.group;
      list.appendChild(label);
    }

    const a = document.createElement("a");
    a.className = "fs-link";
    if (item.highlight) a.classList.add("fs-link-highlight");
    a.href = item.href;
    if (item.href === currentPage) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }

    const num = document.createElement("span");
    num.className = "fs-num";
    num.textContent = String(i + 1).padStart(2, "0");

    const text = document.createElement("span");
    text.className = "fs-text";
    text.textContent = item.text;

    const desc = document.createElement("span");
    desc.className = "fs-desc";
    desc.textContent = item.desc;

    a.append(num, text, desc);

    // La foto de fondo sigue al enlace señalado (mouse o teclado)
    const showPhoto = () => {
      photos.forEach((p, pi) => p.classList.toggle("show", pi === i));
    };
    a.addEventListener("mouseenter", showPhoto);
    a.addEventListener("focus", showPhoto);

    list.appendChild(a);
    return a;
  });

  // Columna lateral: datos de contacto y acceso directo
  const aside = document.createElement("aside");
  aside.className = "fs-menu-aside";
  aside.innerHTML =
    '<div class="fs-aside-block">' +
      '<strong>Dónde estamos</strong>' +
      '<p>Agua Blanca Sur, El Progreso, Yoro, Honduras.</p>' +
    '</div>' +
    '<div class="fs-aside-block">' +
      '<strong>Horario de atención</strong>' +
      '<p>Lunes a viernes, 8:00 AM &ndash; 12:00 PM</p>' +
    '</div>' +
    '<a class="fs-aside-cta" href="matricula.html">Matrícula 2026 &rarr;</a>' +
    '<a class="fs-aside-social" href="https://www.facebook.com/profile.php?id=100063787262594" target="_blank" rel="noopener noreferrer">' +
      '<img src="imagenes/irmb/facebook.png" alt="">Síguenos en Facebook' +
    '</a>';

  inner.append(list, aside);
  menu.appendChild(inner);
  document.body.appendChild(menu);

  /* ── Apertura y cierre ────────────────────────────────── */
  let isOpen = false;
  let scrollLock = "";

  function openMenu() {
    if (isOpen) return;
    isOpen = true;

    // Entrada escalonada de los enlaces
    links.forEach((a, i) => {
      a.style.transitionDelay = reduceMotion ? "0s" : (0.22 + i * 0.05) + "s";
    });

    scrollLock = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    menu.classList.add("open");
    menu.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("menu-open");
    toggleBtn.setAttribute("aria-expanded", "true");
    toggleBtn.setAttribute("aria-label", "Cerrar menú");

    // Foto inicial: la de la página actual, o la primera
    const startIdx = Math.max(0, MENU.findIndex(m => m.href === currentPage));
    photos.forEach((p, pi) => p.classList.toggle("show", pi === startIdx));

    // El foco entra al menú para que se pueda navegar con el teclado
    window.setTimeout(() => { links[0].focus(); }, reduceMotion ? 0 : 420);
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;

    // Al cerrar, los enlaces salen juntos (sin escalonar)
    links.forEach(a => { a.style.transitionDelay = "0s"; });

    document.body.style.overflow = scrollLock;

    menu.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("menu-open");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-label", "Abrir menú");
    toggleBtn.focus();
  }

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    isOpen ? closeMenu() : openMenu();
  });

  // Clic en el área vacía del overlay
  menu.addEventListener("click", (e) => {
    if (e.target === menu || e.target === inner) closeMenu();
  });

  // Escape cierra el menú (sin pisar el Escape del lightbox)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) closeMenu();
  });

  // El foco no debe escaparse del menú mientras está abierto
  menu.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || !isOpen) return;
    const focusables = menu.querySelectorAll('a[href], button');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* ══════════════════════════════════════════════════════
     1b. AGRUPAR LAS ACCIONES DEL HEADER
     El .nav usa space-between. Con tres hijos (marca, botón de tema
     y botón de menú) el de tema queda flotando solo en el centro.
     Metiéndolo en un grupo con el de menú, los dos quedan juntos a la
     derecha y el header se lee como una sola unidad.
  ══════════════════════════════════════════════════════ */

  (function agruparAcciones() {
    const nav = document.querySelector(".nav");
    if (!nav) return;
    const temaBtn = nav.querySelector(".theme-btn");
    if (!temaBtn) return;

    const grupo = document.createElement("div");
    grupo.className = "nav-actions";
    nav.insertBefore(grupo, temaBtn);
    grupo.appendChild(temaBtn);
    grupo.appendChild(toggleBtn);
  })();

  /* ══════════════════════════════════════════════════════
     2. ÍNDICE LATERAL DE SECCIONES
  ══════════════════════════════════════════════════════ */

  (function buildSectionNav() {
    // La etiqueta sale de data-sec si existe (index.html las trae escritas a
    // mano) y si no, del primer titulo de la seccion. Asi cualquier pagina
    // tiene indice lateral sin necesidad de anotar el HTML.
    function etiquetaDe(sec) {
      if (sec.dataset.sec) return sec.dataset.sec;
      const titulo = sec.querySelector("h1, h2");
      if (!titulo) return null;
      const texto = titulo.textContent.trim().replace(/\s+/g, " ");
      return texto.length > 30 ? texto.slice(0, 29).trimEnd() + "…" : texto;
    }

    const sections = Array.from(document.querySelectorAll("main > section"))
      .map(el => ({ el: el, label: etiquetaDe(el) }))
      .filter(s => s.label);

    if (sections.length < 2) return;

    const nav = document.createElement("nav");
    nav.className = "sec-nav";
    nav.setAttribute("aria-label", "Secciones de esta página");

    const buttons = sections.map(item => {
      const sec = item.el;
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.label = item.label;
      b.setAttribute("aria-label", "Ir a " + item.label);
      b.addEventListener("click", () => {
        // El header ahora es fijo: hay que descontar su alto real o la
        // sección quedaría medio tapada al saltar.
        const header = document.querySelector(".site-header");
        const offset = (header ? header.offsetHeight : 80) + 10;
        const top = sec.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
      });
      nav.appendChild(b);
      return b;
    });

    document.body.appendChild(nav);
    requestAnimationFrame(() => nav.classList.add("ready"));

    // Scroll spy: marca la sección que ocupa el tercio superior de la pantalla
    let ticking = false;
    function spy() {
      const line = window.scrollY + window.innerHeight * 0.35;
      let idx = 0;
      sections.forEach((s, i) => {
        if (s.el.getBoundingClientRect().top + window.scrollY <= line) idx = i;
      });
      buttons.forEach((b, i) => b.classList.toggle("active", i === idx));
      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(spy); }
    }, { passive: true });
    window.addEventListener("resize", spy);
    spy();
  })();

  /* ══════════════════════════════════════════════════════
     3. CORTINA DE TRANSICIÓN ENTRE PÁGINAS
  ══════════════════════════════════════════════════════ */

  (function initPageTransitions() {
    const curtain = document.getElementById("pt-curtain");
    if (!curtain) return;

    if (reduceMotion) { curtain.remove(); return; }

    // Al volver con el botón "atrás" el navegador puede restaurar la página
    // desde caché con la cortina todavía cubriendo: hay que descubrirla.
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) {
        curtain.classList.remove("pt-cover");
        curtain.classList.add("pt-noreveal");
      }
    });

    document.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!e.target || !e.target.closest) return;

      const a = e.target.closest("a[href]");
      if (!a || a.hasAttribute("download")) return;
      if (a.target && a.target !== "_self") return;

      let url;
      try { url = new URL(a.href, window.location.href); }
      catch (err) { return; }

      // Solo enlaces internos a otra página .html del sitio
      if (url.origin !== window.location.origin) return;
      if (!/\.html$/i.test(url.pathname)) return;
      if (url.pathname === window.location.pathname && url.hash) return;

      e.preventDefault();
      curtain.classList.remove("pt-noreveal");
      curtain.classList.add("pt-cover");
      window.setTimeout(() => { window.location.href = url.href; }, 520);
    });
  })();

})();
