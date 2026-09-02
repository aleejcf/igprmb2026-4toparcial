/* ============================================================
   INSTITUTO RMB — easter-egg.js
   Codigo Konami (↑ ↑ ↓ ↓ ← → ← → B A) en cualquier pagina del
   sitio revela una tarjeta de creditos. Detalle pensado para quien
   revise el codigo del sitio (estudiantes, docentes evaluando el
   proyecto) — nada que un visitante normal encuentre por accidente.
   ============================================================ */

(function () {
  "use strict";

  const SECUENCIA = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a"
  ];
  let progreso = 0;

  document.addEventListener("keydown", (e) => {
    const tecla = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    progreso = (tecla === SECUENCIA[progreso]) ? progreso + 1 : (tecla === SECUENCIA[0] ? 1 : 0);
    if (progreso === SECUENCIA.length) {
      progreso = 0;
      mostrarCreditos();
    }
  });

  function mostrarCreditos() {
    if (document.getElementById("rmb-creditos")) return;

    const overlay = document.createElement("div");
    overlay.id = "rmb-creditos";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Creditos del sitio");
    overlay.innerHTML =
      '<div class="rmb-creditos-tarjeta">' +
        '<button type="button" class="rmb-creditos-cerrar" aria-label="Cerrar">&times;</button>' +
        '<div class="rmb-creditos-antorcha" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M12 2c1.8 2 2.6 4 2.6 6.2 0 1.6-1 2.3-1 3.6 0 1 .7 1.7 1.7 1.7A2.7 2.7 0 0 0 18 10.8C19.6 13 20 15 18.5 17.5 17 20 14.5 21 12 21s-5-1-6.5-3.5S4.4 13 6 10.8a2.7 2.7 0 0 0 2.7 2.7c1 0 1.7-.7 1.7-1.7 0-1.3-1-2-1-3.6C9.4 6 10.2 4 12 2Z"/>' +
          '</svg>' +
        '</div>' +
        '<p class="rmb-creditos-eyebrow">Instituto Roberto Micheletti Baín</p>' +
        '<h2>Hecho por un estudiante, para su instituto</h2>' +
        '<p>Este sitio es un proyecto académico de Diseño Web construido en HTML, CSS y JavaScript. Cada foto, cada dato y cada historia son reales — de Agua Blanca Sur, El Progreso, Yoro.</p>' +
        '<p class="rmb-creditos-lema">Dignidad · Trabajo · Cultura</p>' +
      '</div>';
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => overlay.classList.add("mostrar"));

    function cerrar() {
      overlay.classList.remove("mostrar");
      document.body.style.overflow = "";
      setTimeout(() => overlay.remove(), 300);
    }

    overlay.querySelector(".rmb-creditos-cerrar").addEventListener("click", cerrar);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) cerrar(); });
    document.addEventListener("keydown", function onEsc(e) {
      if (e.key === "Escape") { cerrar(); document.removeEventListener("keydown", onEsc); }
    });
  }
})();
