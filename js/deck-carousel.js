/* ============================================================
   INSTITUTO RMB — deck-carousel.js
   Motor de la baraja de fotos (.deck-wrap, ya estilizada en
   css/estilos.css). Se auto-inicializa en cualquier .deck-wrap de
   la pagina — no hace falta llamarlo a mano por id como antes.

   Uso:
     <div class="campus-gallery-wrap">
       <div class="deck-wrap" role="region" aria-label="Fotos de...">
         <div class="deck-card"><img src="..." alt="Pie de foto"></div>
         ... (2 a 5 cartas)
       </div>
       <div class="deck-dots"></div>
       <div class="deck-label"></div>
     </div>

   El pie de cada foto sale del alt de su <img>. Avanza sola cada 4s
   con la animacion de "lanzar" la carta de enfrente, en clic avanza
   de inmediato, y se pausa con el mouse encima o si la pestaña no
   esta visible.
   ============================================================ */

(function () {
  "use strict";

  const wraps = Array.from(document.querySelectorAll(".deck-wrap"));
  if (!wraps.length) return;

  wraps.forEach(initDeck);

  function initDeck(wrap) {
    const cards = Array.from(wrap.querySelectorAll(".deck-card"));
    const n = cards.length;
    if (n < 2) return;

    const holder = wrap.parentElement;
    const dots   = holder ? holder.querySelector(".deck-dots") : null;
    const lbl    = holder ? holder.querySelector(".deck-label") : null;

    let current = 0;
    let animating = false;
    let timer;

    const positions = [
      { rotate: "0deg",    ty: "0px",  scale: "1",   z: n },
      { rotate: "3deg",    ty: "4px",  scale: ".97", z: n - 1 },
      { rotate: "-2.5deg", ty: "8px",  scale: ".94", z: n - 2 },
      { rotate: "5deg",    ty: "12px", scale: ".91", z: n - 3 },
      { rotate: "-4deg",   ty: "16px", scale: ".88", z: n - 4 },
    ];

    function captionOf(card) {
      const img = card.querySelector("img");
      return (img && img.alt) ? img.alt : "";
    }

    function setTransform(card, pos) {
      if (!pos) { card.style.opacity = "0"; card.style.pointerEvents = "none"; return; }
      card.style.opacity = "1";
      card.style.pointerEvents = "";
      card.style.zIndex = pos.z;
      card.style.transform = `rotate(${pos.rotate}) translateY(${pos.ty}) scale(${pos.scale})`;
      card.style.transition = "transform .5s cubic-bezier(.34,1.3,.64,1), opacity .3s";
    }

    function render() {
      cards.forEach((card, i) => {
        const offset = ((i - current) % n + n) % n;
        setTransform(card, offset < positions.length ? positions[offset] : null);
      });
      if (dots) Array.from(dots.children).forEach((d, i) => d.classList.toggle("active", i === current));
      if (lbl) lbl.textContent = captionOf(cards[current]);
    }

    function next() {
      if (animating) return;

      // Con la pestaña oculta requestAnimationFrame nunca llega a
      // dispararse (los navegadores lo pausan), lo que dejaria
      // "animating" trabado en true para siempre. Sin pestaña visible
      // tampoco tiene sentido animar: se salta directo al render.
      if (document.hidden) {
        current = (current + 1) % n;
        render();
        return;
      }

      animating = true;
      const topCard = cards[current];
      topCard.style.transition = "none";
      topCard.style.zIndex = n + 10;

      requestAnimationFrame(() => {
        topCard.style.transition = "transform .5s cubic-bezier(.6,0,.4,1), opacity .4s";
        topCard.style.transform  = "rotate(20deg) translateX(110%) translateY(-30px) scale(.88)";
        topCard.style.opacity    = ".5";

        setTimeout(() => {
          current = (current + 1) % n;
          render();
          animating = false;
        }, 500);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(() => { if (!document.hidden) next(); }, 4000);
    }

    if (dots) {
      dots.innerHTML = "";
      cards.forEach((_, i) => {
        const d = document.createElement("div");
        d.className = "deck-dot";
        d.addEventListener("click", (e) => { e.stopPropagation(); current = i; render(); start(); });
        dots.appendChild(d);
      });
    }

    wrap.addEventListener("click", () => { next(); start(); });
    wrap.addEventListener("mouseenter", () => clearInterval(timer));
    wrap.addEventListener("mouseleave", start);

    render();
    start();
  }
})();
