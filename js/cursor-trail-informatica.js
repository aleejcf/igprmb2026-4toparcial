/* ============================================================
   INSTITUTO RMB — cursor-trail-informatica.js
   Rastro sutil de puntos en los colores institucionales que sigue
   al cursor. Exclusivo de carrera-informatica.html (refuerza la
   identidad "tech" de esa pagina sin saturar el resto del sitio).

   Se apaga solo con prefers-reduced-motion, con mouse ausente
   (pantallas tactiles) y si la pestaña esta oculta.
   ============================================================ */

(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(hover: none)").matches) return;

  const COLORES = ["#2F2D7F", "#A42630", "#3D3B99"];
  let ultimo = 0;
  const INTERVALO_MS = 55; // no crear un punto en cada pixel de movimiento

  document.addEventListener("mousemove", (e) => {
    if (document.hidden) return;
    const ahora = performance.now();
    if (ahora - ultimo < INTERVALO_MS) return;
    ultimo = ahora;

    const punto = document.createElement("span");
    punto.className = "cursor-trail-dot";
    punto.style.left = e.clientX + "px";
    punto.style.top = e.clientY + "px";
    punto.style.background = COLORES[Math.floor(Math.random() * COLORES.length)];
    document.body.appendChild(punto);

    punto.addEventListener("animationend", () => punto.remove(), { once: true });
    // Respaldo por si "animationend" no llega a dispararse
    setTimeout(() => { if (punto.isConnected) punto.remove(); }, 900);
  }, { passive: true });
})();
