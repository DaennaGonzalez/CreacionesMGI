/* =========================================================
   CREACIONES MGI - script.js (Index)
   Funciones:
   1) Modal "Cotiza tu diseño" (abre/cierra)
   2) Rebote al click en burbujas (WhatsApp/Facebook)
   3) Cerrar menú móvil al dar click en un link
   4) Cerrar menú móvil al dar click fuera
   5) Cerrar modal con ESC + click fuera
   6) Año automático en footer
   7) Header compacto al hacer scroll (y cierra menú al compactar)
   ========================================================= */

(() => {
  "use strict";

  /* -----------------------------
     Helpers
  ----------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* -----------------------------
     Año automático (footer)
  ----------------------------- */
  const anio = $("#anio");
  if (anio) anio.textContent = String(new Date().getFullYear());

  /* -----------------------------
     MODAL con <dialog>
  ----------------------------- */
  function setupDialogModal() {
    const openers = $$("[data-modal]");
    if (!openers.length) return;

    openers.forEach((btn) => {
      const id = btn.getAttribute("data-modal");
      const dlg = id ? document.getElementById(id) : null;
      if (!dlg) return;

      // Abrir
      btn.addEventListener("click", () => {
        if (typeof dlg.showModal === "function") {
          dlg.showModal();
        } else {
          dlg.setAttribute("open", "");
        }

        const firstField = $("input, textarea, button", dlg);
        if (firstField) firstField.focus();
      });

      // Cerrar al click fuera del contenido (click en backdrop)
      dlg.addEventListener("click", (e) => {
       if (e.target === dlg) {
  if (typeof dlg.close === "function") dlg.close();
  else dlg.removeAttribute("open");
}

      });

      // Soporte opcional data-close
      $$("[data-close]", dlg).forEach((closeBtn) => {
        closeBtn.addEventListener("click", () => dlg.close());
      });

      // Simular submit (si no hay backend)
      const form = $("form", dlg);
      if (form) {
        form.addEventListener("submit", (ev) => {
          ev.preventDefault();
          btn.classList.add("enviado");
          setTimeout(() => btn.classList.remove("enviado"), 900);
          dlg.close();
        });
      }
    });

    // Cerrar con ESC
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const openDialog = $$("dialog[open]")[0];
      if (openDialog){
  if (typeof openDialog.close === "function") openDialog.close();
  else openDialog.removeAttribute("open");
}

    });
  }

  setupDialogModal();

  /* -----------------------------
     Rebote (burbujas)
  ----------------------------- */
  function setupBubblesBounce() {
    const bubbles = $$(".burbuja");
    if (!bubbles.length) return;

    const bounceClass = "js-bounce";

    const style = document.createElement("style");
    style.textContent = `
      @keyframes bubbleClickBounce {
        0% { transform: translateY(0) scale(1); }
        30% { transform: translateY(-8px) scale(1.02); }
        55% { transform: translateY(0) scale(0.98); }
        100% { transform: translateY(-2px) scale(1); }
      }
      .${bounceClass}{
        animation: bubbleClickBounce 420ms ease !important;
      }
    `;
    document.head.appendChild(style);

    bubbles.forEach((b) => {
      b.addEventListener("click", () => {
        b.classList.remove(bounceClass);
        void b.offsetWidth;
        b.classList.add(bounceClass);
        setTimeout(() => b.classList.remove(bounceClass), 450);
      });
    });
  }

  setupBubblesBounce();

  /* -----------------------------
     Menú móvil (abre/cierra con CSS)
     IMPORTANTE:
     - NO hacemos toggle por JS, porque el <label for="menu-toggle">
       ya lo hace (y si lo duplicas, parpadea/no abre).
  ----------------------------- */
function setupMobileMenuBehaviors() {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.querySelector(".site-nav");
  const icon = document.querySelector(".menu-icon");
  const navLinks = Array.from(document.querySelectorAll(".nav-list a"));

  if (!toggle || !icon) return;

  // 1) Abrir/cerrar al tocar el botón (sin depender del label)
  icon.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle.checked = !toggle.checked;
    console.log("menu-toggle checked =", toggle.checked);
  });

  // 2) Cerrar al navegar
  navLinks.forEach((a) => {
    a.addEventListener("click", () => {
      toggle.checked = false;
    });
  });

  // 3) Cerrar al click fuera (cuando está abierto)
  document.addEventListener("click", (e) => {
    if (!toggle.checked) return;

    const clickedInsideNav = nav && nav.contains(e.target);
    const clickedIcon = icon.contains(e.target);

    if (!clickedInsideNav && !clickedIcon) {
      toggle.checked = false;
    }
  });
}


  setupMobileMenuBehaviors();

  /* -----------------------------
     Scroll suave a anchors (#...)
  ----------------------------- */
  function setupSmoothScrollAnchors() {
    const anchors = $$('a[href^="#"]');
    anchors.forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || href === "#") return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  setupSmoothScrollAnchors();

  /* -----------------------------
     Header compacto al hacer scroll
  ----------------------------- */
  function setupCompactHeader() {
    const header = $(".site-header");
    const menuToggle = $("#menu-toggle");
    if (!header) return;

    const threshold = 200; // ajustable

    const onScroll = () => {
      const compact = window.scrollY > threshold;
      header.classList.toggle("is-compact", compact);

      // Si se compacta, cerramos menú por seguridad
      if (compact && menuToggle) menuToggle.checked = false;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  setupCompactHeader();

  
})();


/* =========================================================
   CREACIONES MGI — mas-vendidos.js (o dentro de script.js)
   Sección: “Los más vendidos” (carrusel infinito)
   - Duplica items si hace falta para loop perfecto
   - Pausa al hover (desktop) y al tocar (móvil)
   - Soporta resize (recalcula el ancho del loop)
   - Accesible: respeta prefers-reduced-motion
   ========================================================= */

(() => {
  "use strict";

  // Cambia esto si lo pones como archivo aparte:
  // <script src="mas-vendidos.js" defer></script>

  const root = document.querySelector(".mv-carrusel");
  if (!root) return;

  const track = root.querySelector(".mv-track");
  if (!track) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Helper: pausar/reanudar animación CSS
  const setPaused = (paused) => {
    track.style.animationPlayState = paused ? "paused" : "running";
  };

  // Si el usuario prefiere menos movimiento, dejamos todo estático
  if (reduceMotion.matches) {
    track.style.animation = "none";
    return;
  }

  // 1) Asegurar duplicado suficiente para que no “se vea el salto”
  // Idea: necesitamos que el ancho total del track sea >= 2x el viewport del carrusel.
  // Si no, duplicamos los items hasta cumplir.
  function ensureEnoughItems() {
    const items = Array.from(track.children);
    if (items.length === 0) return;

    // Evita duplicar en loop infinito si ya lo hicimos antes
    // Marcamos clones con data-clone="1"
    const baseItems = items.filter((el) => el.dataset.clone !== "1");

    // Si por alguna razón no hay base, salimos
    if (baseItems.length === 0) return;

    // Limpiamos clones anteriores para recalcular bien
    Array.from(track.children).forEach((el) => {
      if (el.dataset.clone === "1") el.remove();
    });

    // Medimos ancho actual (solo base)
    const baseWidth = getTrackWidth(baseItems);
    const viewport = root.clientWidth;

    // Queremos mínimo 2x viewport para scroll continuo suave
    const needed = Math.ceil((viewport * 2) / baseWidth);

    // Duplicamos "needed" veces (además de la base)
    // Ej: needed=2 => base + 1 set de clones
    for (let n = 1; n < needed; n++) {
      baseItems.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.dataset.clone = "1";
        track.appendChild(clone);
      });
    }

    // Recalcular y setear variable CSS para el scroll exacto
    setLoopDistance();
  }

  function getTrackWidth(nodes) {
    // Sumamos el ancho real de cada tarjeta + el gap
    const gap = getFlexGap(track);
    let sum = 0;
    nodes.forEach((el, idx) => {
      sum += el.getBoundingClientRect().width;
      if (idx !== nodes.length - 1) sum += gap;
    });
    return sum;
  }

  function getFlexGap(container) {
    const cs = getComputedStyle(container);
    const gap = parseFloat(cs.columnGap || cs.gap || "0");
    return Number.isFinite(gap) ? gap : 0;
  }

  // 2) Ajustar la distancia del loop:
  // Usamos la mitad del contenido total si los items están duplicados en sets.
  // Para esto, medimos el ancho del set “base” y lo usamos como distancia.
  function setLoopDistance() {
    const all = Array.from(track.children);
    const base = all.filter((el) => el.dataset.clone !== "1");
    if (base.length === 0) return;

    const baseWidth = getTrackWidth(base);

    // Creamos/actualizamos un keyframe dinámico para que el "to" sea exacto
    // así no dependes de 50% fijo.
    injectDynamicKeyframes(baseWidth);
  }

  // 3) Keyframes dinámicos:
  // Creamos @keyframes mvScrollDyn que mueve -baseWidth px.
  const STYLE_ID = "mv-dyn-style";
  function injectDynamicKeyframes(baseWidthPx) {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    // Mantén duración definida en CSS; aquí solo cambiamos el "to"
    style.textContent = `
@keyframes mvScrollDyn {
  from { transform: translateX(0); }
  to { transform: translateX(-${Math.round(baseWidthPx)}px); }
}
    `.trim();

    // Aplicamos el keyframe dinámico manteniendo la duración que ya tenías
    const cs = getComputedStyle(track);
    const duration = cs.animationDuration || "22s";
    const timing = cs.animationTimingFunction || "linear";

    track.style.animationName = "mvScrollDyn";
    track.style.animationDuration = duration;
    track.style.animationTimingFunction = timing;
    track.style.animationIterationCount = "infinite";
    track.style.animationPlayState = "running";
  }

  // 4) Pausa en hover (desktop) — ya lo hace CSS, pero lo reforzamos
  root.addEventListener("mouseenter", () => setPaused(true));
  root.addEventListener("mouseleave", () => setPaused(false));

  // 5) Móvil: pausa con touch (tap) y reanuda al soltar o tocar afuera
  let touchPaused = false;

  root.addEventListener(
    "touchstart",
    () => {
      touchPaused = true;
      setPaused(true);
    },
    { passive: true }
  );

  root.addEventListener(
    "touchend",
    () => {
      // pequeña demora para que alcance a dar clic al botón si quiere
      setTimeout(() => {
        if (touchPaused) {
          touchPaused = false;
          setPaused(false);
        }
      }, 350);
    },
    { passive: true }
  );

  // Si el usuario hace scroll o toca fuera, reanuda
  document.addEventListener(
    "touchstart",
    (e) => {
      if (!root.contains(e.target)) {
        touchPaused = false;
        setPaused(false);
      }
    },
    { passive: true }
  );

  // 6) Recalcular al cambiar tamaño (responsive)
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ensureEnoughItems();
    }, 180);
  });

  // 7) Si cambia prefers-reduced-motion en vivo
  reduceMotion.addEventListener?.("change", (ev) => {
    if (ev.matches) {
      track.style.animation = "none";
    } else {
      ensureEnoughItems();
      setPaused(false);
    }
  });

  // INIT
  ensureEnoughItems();
})();


