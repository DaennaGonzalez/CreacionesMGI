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
