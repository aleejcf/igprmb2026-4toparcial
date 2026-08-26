/* ============================================================
   INSTITUTO RMB — sello-oficial.js
   Crea y estampa un "sello" oficial (ver css/sello-oficial.css)
   sobre cualquier contenedor con position:relative.

   Uso:
     RmbSello.estampar(contenedorEl, { top:"auto", bottom:"14px", right:"14px" });

   El contenedor debe tener position:relative para que el sello
   (position:absolute) se ubique dentro de el.
   ============================================================ */

window.RmbSello = (function () {
  "use strict";

  function crear() {
    const el = document.createElement("div");
    el.className = "sello-oficial";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
      '<span class="sello-linea1">INSTITUTO</span>' +
      '<span class="sello-linea2">R. MICHELETTI BAÍN</span>' +
      '<span class="sello-linea3">AGUA BLANCA SUR · 1984</span>';
    return el;
  }

  function estampar(contenedor, pos) {
    if (!contenedor) return null;
    let sello = contenedor.querySelector(".sello-oficial");
    if (!sello) {
      sello = crear();
      contenedor.appendChild(sello);
    }
    const p = pos || {};
    sello.style.top    = p.top    !== undefined ? p.top    : "";
    sello.style.bottom = p.bottom !== undefined ? p.bottom : "14px";
    sello.style.left   = p.left   !== undefined ? p.left   : "";
    sello.style.right  = p.right  !== undefined ? p.right  : "14px";

    sello.classList.remove("mostrar");
    // Forzar reflow para poder re-disparar la animacion si se llama otra vez
    void sello.offsetWidth;
    sello.classList.add("mostrar");
    return sello;
  }

  return { estampar: estampar };
})();
