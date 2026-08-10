/* ============================================================
   INSTITUTO RMB — galeria.js
   Visor de fotos reutilizable. No necesita configuración: busca
   cualquier .gal-grid de la página y engancha sus imágenes.
   El pie de foto sale del alt de cada imagen.

   Uso:
     <div class="gal-grid">
       <figure class="gal-item"><img src="..." alt="Pie de foto"></figure>
       ...
     </div>
   ============================================================ */

(function () {
  "use strict";

  const rejillas = Array.from(document.querySelectorAll(".gal-grid"));
  if (!rejillas.length) return;

  /* ── Visor, uno solo para toda la página ─────────────────── */
  const visor = document.createElement("div");
  visor.className = "gal-visor";
  visor.setAttribute("role", "dialog");
  visor.setAttribute("aria-modal", "true");
  visor.setAttribute("aria-label", "Foto ampliada");
  visor.innerHTML =
    '<img alt="">' +
    '<button class="gal-visor-btn gal-cerrar" type="button" aria-label="Cerrar">✕</button>' +
    '<button class="gal-visor-btn gal-ant" type="button" aria-label="Foto anterior">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
    '</button>' +
    '<button class="gal-visor-btn gal-sig" type="button" aria-label="Foto siguiente">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>' +
    '</button>' +
    '<div class="gal-pie"><span class="gal-contador"></span><span class="gal-texto"></span></div>';
  document.body.appendChild(visor);

  const imgVisor = visor.querySelector("img");
  const contador = visor.querySelector(".gal-contador");
  const textoPie = visor.querySelector(".gal-texto");

  let fotos = [];      // imágenes de la rejilla que se está viendo
  let indice = 0;
  let scrollPrevio = "";

  function mostrar(i) {
    if (!fotos.length) return;
    indice = (i % fotos.length + fotos.length) % fotos.length;
    const foto = fotos[indice];
    imgVisor.src = foto.currentSrc || foto.src;
    imgVisor.alt = foto.alt || "";
    textoPie.textContent = foto.alt || "";
    contador.textContent = (indice + 1) + " / " + fotos.length;
    // una sola foto: no tiene sentido enseñar las flechas
    const varias = fotos.length > 1;
    visor.querySelector(".gal-ant").style.display = varias ? "" : "none";
    visor.querySelector(".gal-sig").style.display = varias ? "" : "none";
  }

  function abrir(lista, i) {
    fotos = lista;
    scrollPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    visor.classList.add("abierto");
    mostrar(i);
    visor.querySelector(".gal-cerrar").focus();
  }

  function cerrar() {
    visor.classList.remove("abierto");
    document.body.style.overflow = scrollPrevio;
    imgVisor.src = "";
  }

  /* ── Enganchar cada rejilla ──────────────────────────────── */
  rejillas.forEach(rejilla => {
    const imagenes = Array.from(rejilla.querySelectorAll("img"));
    imagenes.forEach((img, i) => {
      const contenedor = img.closest(".gal-item") || img;
      contenedor.setAttribute("tabindex", "0");
      contenedor.setAttribute("role", "button");
      contenedor.setAttribute("aria-label", "Ampliar: " + (img.alt || "foto"));
      contenedor.addEventListener("click", () => abrir(imagenes, i));
      contenedor.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(imagenes, i); }
      });
    });
  });

  /* ── Controles ───────────────────────────────────────────── */
  visor.querySelector(".gal-cerrar").addEventListener("click", cerrar);
  visor.querySelector(".gal-ant").addEventListener("click", e => { e.stopPropagation(); mostrar(indice - 1); });
  visor.querySelector(".gal-sig").addEventListener("click", e => { e.stopPropagation(); mostrar(indice + 1); });

  // Clic en el fondo (no en la foto ni en los botones) cierra
  visor.addEventListener("click", e => { if (e.target === visor) cerrar(); });

  document.addEventListener("keydown", e => {
    if (!visor.classList.contains("abierto")) return;
    if (e.key === "Escape")     { cerrar(); }
    if (e.key === "ArrowLeft")  { mostrar(indice - 1); }
    if (e.key === "ArrowRight") { mostrar(indice + 1); }
  });
})();
