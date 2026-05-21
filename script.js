/* =========================================================
   CREACIONES MGI - script.js
   Landing page completa

   Funciones:
   1) Año automático en footer
   2) Header compacto al hacer scroll
   3) Menú móvil: cerrar al navegar / click fuera / ESC
   4) Scroll suave a secciones internas
   5) Modal "Cotiza tu diseño"
   6) Formulario de cotización por WhatsApp
   7) Modal catálogo PDF
   8) Carruseles infinitos: Más vendidos + Reseñas
   9) Calculadora de envío por kilómetros
   10) WhatsApp de envíos y burbujas flotantes
   11) Copiar texto/correo si se agregan botones copy
========================================================= */

(() => {
  "use strict";

  /* =========================================================
     CONFIGURACIÓN GENERAL
  ========================================================= */

  const CONFIG = {
    whatsappNumber: "5218123439492",

    ubicacionTexto: "C. Río Janitzio 1868, Central, 64190 Monterrey, N.L.",

    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=C.+R%C3%ADo+Janitzio+1868,+Central,+64190+Monterrey,+N.L.",

    catalogoPreviewUrl:
      "https://drive.google.com/file/d/1qrMfTDpX4idLxtEInIWqW4DTrWMPYQIW/preview",

    envio: {
      base: 10,
      precioPorKm: 8.5,
      minimo: 20,
      maxKm: 30,
      redondeo: 5
    }
  };

  /* =========================================================
     HELPERS
  ========================================================= */

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) =>
    Array.from(context.querySelectorAll(selector));

  const money = (value) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0
    }).format(value);

  const encodeWhatsAppText = (text) => encodeURIComponent(text);

  const buildWhatsAppUrl = (message) => {
    return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeWhatsAppText(message)}`;
  };

  const openWhatsApp = (message) => {
    window.open(buildWhatsAppUrl(message), "_blank", "noopener");
  };

  const closeMobileMenu = () => {
    const toggle = $("#menu-toggle");
    if (toggle) toggle.checked = false;
  };

  const isReducedMotion = () => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  /* =========================================================
     1) AÑO AUTOMÁTICO
  ========================================================= */

  function setupFooterYear() {
    const anio = $("#anio");
    if (!anio) return;

    anio.textContent = String(new Date().getFullYear());
  }

  /* =========================================================
     2) HEADER COMPACTO
  ========================================================= */

  function setupCompactHeader() {
    const header = $(".site-header");
    if (!header) return;

    const threshold = 180;

    const onScroll = () => {
      const compact = window.scrollY > threshold;
      header.classList.toggle("is-compact", compact);

      if (compact) closeMobileMenu();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* =========================================================
     3) MENÚ MÓVIL
  ========================================================= */

  function setupMobileMenu() {
    const toggle = $("#menu-toggle");
    const nav = $(".site-nav");
    const menuIcon = $(".menu-icon");
    const links = $$(".nav-list a");

    if (!toggle || !menuIcon) return;

    const updateAria = () => {
      menuIcon.setAttribute("aria-expanded", toggle.checked ? "true" : "false");
    };

    toggle.addEventListener("change", updateAria);

    links.forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileMenu();
        updateAria();
      });
    });

    document.addEventListener("click", (event) => {
      if (!toggle.checked) return;

      const clickedInsideNav = nav && nav.contains(event.target);
      const clickedMenuIcon = menuIcon.contains(event.target);
      const clickedToggle = toggle.contains(event.target);

      if (!clickedInsideNav && !clickedMenuIcon && !clickedToggle) {
        closeMobileMenu();
        updateAria();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;

      if (toggle.checked) {
        closeMobileMenu();
        updateAria();
      }
    });

    updateAria();
  }

  /* =========================================================
     4) SCROLL SUAVE A ANCLAS INTERNAS
  ========================================================= */

  function setupSmoothAnchors() {
    const anchors = $$('a[href^="#"]');

    anchors.forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const href = anchor.getAttribute("href");

        if (!href || href === "#") return;

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        closeMobileMenu();

        const header = $(".site-header");
        const headerHeight = header ? header.offsetHeight : 0;
        const targetTop =
          target.getBoundingClientRect().top + window.scrollY - headerHeight - 14;

        window.scrollTo({
          top: Math.max(targetTop, 0),
          behavior: isReducedMotion() ? "auto" : "smooth"
        });
      });
    });
  }

  /* =========================================================
     5) MODAL "COTIZA TU DISEÑO"
  ========================================================= */

  function setupCotizaModal() {
    const openers = $$("[data-modal]");
    if (!openers.length) return;

    openers.forEach((opener) => {
      const modalId = opener.getAttribute("data-modal");
      const dialog = modalId ? document.getElementById(modalId) : null;

      if (!dialog) return;

      opener.addEventListener("click", () => {
        if (typeof dialog.showModal === "function") {
          dialog.showModal();
        } else {
          dialog.setAttribute("open", "");
        }

        document.body.classList.add("no-scroll");

        const firstInput = $("input, textarea, select, button", dialog);
        if (firstInput) firstInput.focus({ preventScroll: true });
      });

      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) {
          closeDialog(dialog);
        }
      });

      $$("[data-close]", dialog).forEach((closeBtn) => {
        closeBtn.addEventListener("click", () => closeDialog(dialog));
      });

      dialog.addEventListener("close", () => {
        document.body.classList.remove("no-scroll");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;

      const openDialog = $("dialog[open]");
      if (openDialog) {
        closeDialog(openDialog);
      }
    });
  }

  function closeDialog(dialog) {
    if (!dialog) return;

    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }

    document.body.classList.remove("no-scroll");
  }

  /* =========================================================
     6) FORMULARIO COTIZACIÓN POR WHATSAPP
  ========================================================= */

  function setupCotizaFormWhatsApp() {
    const form = $("#formCotiza");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const nombre = ($("#cotizaNombre")?.value || "").trim();
      const telefono = ($("#cotizaTelefono")?.value || "").trim();
      const evento = ($("#cotizaEvento")?.value || "").trim();
      const mensaje = ($("#cotizaMensaje")?.value || "").trim();

      if (!nombre || !telefono || !mensaje) {
        alert("Por favor completa tu nombre, WhatsApp y la descripción de tu idea.");
        return;
      }

      const texto = [
        "Hola Creaciones MGI 😊",
        "Quiero cotizar un diseño personalizado.",
        "",
        `Nombre: ${nombre}`,
        `WhatsApp: ${telefono}`,
        evento ? `Evento o producto: ${evento}` : null,
        "",
        "Mi idea es:",
        mensaje,
        "",
        "Vengo desde la página web."
      ]
        .filter(Boolean)
        .join("\n");

      const submitBtn = $("button[type='submit']", form);
      if (submitBtn) {
        submitBtn.classList.add("enviado");
        setTimeout(() => submitBtn.classList.remove("enviado"), 700);
      }

      openWhatsApp(texto);

      const dialog = form.closest("dialog");
      if (dialog) closeDialog(dialog);

      form.reset();
    });
  }

  /* =========================================================
     7) MODAL CATÁLOGO PDF
  ========================================================= */

  function setupCatalogoModal() {
    const openBtn = $("#btnAbrirCatalogo");
    const modal = $("#modalCatalogo");
    const closeBtn = $("#btnCerrarCatalogo");
    const overlay = modal ? $(".modal-catalogo__overlay", modal) : null;
    const panel = modal ? $(".modal-catalogo__panel", modal) : null;
    const iframe = modal ? $(".catalogo-pdf", modal) : null;

    if (!openBtn || !modal || !panel) return;

    const isOpen = () => modal.classList.contains("is-open");

    const openModal = () => {
      if (iframe && !iframe.getAttribute("src")) {
        iframe.setAttribute("src", CONFIG.catalogoPreviewUrl);
      }

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");

      if (closeBtn) closeBtn.focus({ preventScroll: true });
    };

    const closeModal = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");

      openBtn.focus({ preventScroll: true });
    };

    openBtn.addEventListener("click", (event) => {
      event.preventDefault();
      openModal();
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", (event) => {
        event.preventDefault();
        closeModal();
      });
    }

    if (overlay) {
      overlay.addEventListener("click", closeModal);
    }

    panel.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) {
        closeModal();
      }
    });
  }

  /* =========================================================
     8) CARRUSELES INFINITOS
  ========================================================= */

  function setupInfiniteCarousel(options) {
    const {
      rootSelector,
      trackSelector,
      styleId,
      keyframeName,
      defaultDuration = "28s"
    } = options;

    const root = $(rootSelector);
    const track = $(trackSelector);

    if (!root || !track) return;

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const getGap = () => {
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || "0");
      return Number.isFinite(gap) ? gap : 0;
    };

    const clearClones = () => {
      $$("[data-clone='true']", track).forEach((clone) => clone.remove());
    };

    const getBaseItems = () =>
      Array.from(track.children).filter((item) => item.dataset.clone !== "true");

    const duplicateItems = () => {
      clearClones();

      const baseItems = getBaseItems();
      if (!baseItems.length) return;

      baseItems.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.dataset.clone = "true";

        const focusables = $$("a, button, input, textarea, select", clone);
        focusables.forEach((el) => {
          el.setAttribute("tabindex", "-1");
          el.setAttribute("aria-hidden", "true");
        });

        track.appendChild(clone);
      });
    };

    const calculateDistance = () => {
      const baseItems = getBaseItems();
      const gap = getGap();

      if (!baseItems.length) return 0;

      const itemsWidth = baseItems.reduce((sum, item) => {
        return sum + item.getBoundingClientRect().width;
      }, 0);

      return itemsWidth + gap * baseItems.length;
    };

    const injectKeyframes = () => {
      const distance = calculateDistance();
      if (!distance) return;

      let style = document.getElementById(styleId);

      if (!style) {
        style = document.createElement("style");
        style.id = styleId;
        document.head.appendChild(style);
      }

      style.textContent = `
        @keyframes ${keyframeName} {
          from { transform: translateX(0); }
          to { transform: translateX(-${Math.round(distance)}px); }
        }
      `;

      const computed = getComputedStyle(track);
      const duration =
        computed.animationDuration && computed.animationDuration !== "0s"
          ? computed.animationDuration
          : defaultDuration;

      track.style.animationName = keyframeName;
      track.style.animationDuration = duration;
      track.style.animationTimingFunction = "linear";
      track.style.animationIterationCount = "infinite";
    };

    const start = () => {
      duplicateItems();

      if (reduceMotionQuery.matches) {
        track.style.animation = "none";
        return;
      }

      requestAnimationFrame(injectKeyframes);
    };

    let resizeTimer = null;

    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(start, 180);
    });

    reduceMotionQuery.addEventListener?.("change", start);

    root.addEventListener("mouseenter", () => {
      if (!reduceMotionQuery.matches) {
        track.style.animationPlayState = "paused";
      }
    });

    root.addEventListener("mouseleave", () => {
      if (!reduceMotionQuery.matches) {
        track.style.animationPlayState = "running";
      }
    });

    root.addEventListener(
      "touchstart",
      () => {
        if (!reduceMotionQuery.matches) {
          track.style.animationPlayState = "paused";
        }
      },
      { passive: true }
    );

    root.addEventListener(
      "touchend",
      () => {
        if (!reduceMotionQuery.matches) {
          setTimeout(() => {
            track.style.animationPlayState = "running";
          }, 350);
        }
      },
      { passive: true }
    );

    start();
  }

  function setupCarousels() {
    setupInfiniteCarousel({
      rootSelector: ".mv-carousel",
      trackSelector: "#mvTrack",
      styleId: "mgi-mv-carousel-keyframes",
      keyframeName: "mgiMvScrollDynamic",
      defaultDuration: "26s"
    });

    setupInfiniteCarousel({
      rootSelector: ".resenas-carrusel",
      trackSelector: "#resenasTrack",
      styleId: "mgi-resenas-carousel-keyframes",
      keyframeName: "mgiResenasScrollDynamic",
      defaultDuration: "32s"
    });
  }

  /* =========================================================
     9) CALCULADORA DE ENVÍO POR KILÓMETROS
  ========================================================= */

  function calcularEnvioPorKm(km) {
    const { base, precioPorKm, minimo, maxKm, redondeo } = CONFIG.envio;

    if (typeof km !== "number" || Number.isNaN(km)) {
      return {
        ok: false,
        tipo: "error",
        mensaje: "Ingresa una distancia válida en kilómetros."
      };
    }

    if (km < 0) {
      return {
        ok: false,
        tipo: "error",
        mensaje: "La distancia no puede ser negativa."
      };
    }

    if (km > maxKm) {
      return {
        ok: false,
        tipo: "warning",
        mensaje: `Por el momento solo realizamos envíos automáticos dentro de un radio máximo de ${maxKm} km. Puedes escribirnos por WhatsApp para revisar una opción especial.`
      };
    }

    const costoExacto = base + precioPorKm * km;
    const redondeado = Math.ceil(costoExacto / redondeo) * redondeo;
    const total = Math.max(minimo, redondeado);

    return {
      ok: true,
      tipo: "success",
      km,
      costoExacto,
      total,
      mensaje: `Distancia: ${km.toFixed(1)} km. Envío estimado: ${money(total)}.`
    };
  }

  function setupCalculadoraEnvio() {
    const form = $("#formCalculadoraEnvio");
    const tipoEntrega = $("#tipoEntrega");
    const inputKm = $("#kilometrosEnvio");
    const campoKm = $("#campoKilometros");
    const resultado = $("#resultadoEnvio");

    if (!form || !tipoEntrega || !inputKm || !resultado) return;

    const setResultado = (html, tipo = "") => {
      resultado.classList.remove("is-success", "is-warning", "is-error");

      if (tipo) {
        resultado.classList.add(`is-${tipo}`);
      }

      resultado.innerHTML = html;
    };

    const guardarEnvio = (data) => {
      try {
        localStorage.setItem("mgiEnvio", JSON.stringify(data));
      } catch (error) {
        console.warn("[MGI] No se pudo guardar el envío:", error);
      }
    };

    const actualizarVistaEntrega = () => {
      const entrega = tipoEntrega.value;

      if (entrega === "recoger") {
        if (campoKm) campoKm.classList.add("is-hidden");

        setResultado(
          `
          <p>
            Elegiste <strong>recoger en tienda / taller</strong>.<br>
            Costo de envío: <strong>$0 MXN</strong>.
          </p>
          `,
          "success"
        );

        guardarEnvio({
          tipoEntrega: "recoger",
          km: 0,
          envio: 0,
          actualizado: new Date().toISOString()
        });

        return;
      }

      if (campoKm) campoKm.classList.remove("is-hidden");

      setResultado(
        "<p>Ingresa la distancia que te marca Google Maps para ver el costo estimado.</p>"
      );
    };

    tipoEntrega.addEventListener("change", actualizarVistaEntrega);

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const entrega = tipoEntrega.value;

      if (entrega === "recoger") {
        setResultado(
          `
          <p>
            Entrega seleccionada: <strong>recoger en tienda / taller</strong>.<br>
            Envío: <strong>$0 MXN</strong>.
          </p>
          `,
          "success"
        );

        guardarEnvio({
          tipoEntrega: "recoger",
          km: 0,
          envio: 0,
          actualizado: new Date().toISOString()
        });

        return;
      }

      const rawKm = String(inputKm.value || "").replace(",", ".").trim();
      const km = Number.parseFloat(rawKm);

      const calculo = calcularEnvioPorKm(km);

      if (!calculo.ok) {
        setResultado(`<p>${calculo.mensaje}</p>`, calculo.tipo);

        guardarEnvio({
          tipoEntrega: "domicilio",
          km: Number.isNaN(km) ? null : km,
          envio: null,
          disponible: false,
          actualizado: new Date().toISOString()
        });

        return;
      }

      setResultado(
        `
        <p>
          Distancia ingresada: <strong>${calculo.km.toFixed(1)} km</strong><br>
          Envío estimado: <strong>${money(calculo.total)}</strong>
        </p>
        `,
        "success"
      );

      guardarEnvio({
        tipoEntrega: "domicilio",
        km: calculo.km,
        envio: calculo.total,
        disponible: true,
        actualizado: new Date().toISOString()
      });
    });

    inputKm.addEventListener("input", () => {
      if (tipoEntrega.value !== "domicilio") return;

      const rawKm = String(inputKm.value || "").replace(",", ".").trim();

      if (!rawKm) {
        setResultado(
          "<p>Ingresa la distancia para ver el costo estimado de envío.</p>"
        );
        return;
      }

      const km = Number.parseFloat(rawKm);
      const calculo = calcularEnvioPorKm(km);

      if (!calculo.ok) {
        setResultado(`<p>${calculo.mensaje}</p>`, calculo.tipo);
        return;
      }

      setResultado(
        `
        <p>
          Distancia: <strong>${calculo.km.toFixed(1)} km</strong><br>
          Envío estimado: <strong>${money(calculo.total)}</strong>
        </p>
        `,
        "success"
      );
    });

    actualizarVistaEntrega();
  }

  /* =========================================================
     10) WHATSAPP ENVÍOS + BURBUJAS
  ========================================================= */

  function setupEnviosWhatsApp() {
    const btn = $("#btnEnviosWhatsApp");
    if (!btn) return;

    const message = [
      "Hola Creaciones MGI 😊",
      "Vengo desde su página web.",
      "Me interesa información sobre envíos y atención.",
      "",
      "¿Me pueden apoyar?"
    ].join("\n");

    btn.setAttribute("href", buildWhatsAppUrl(message));
    btn.setAttribute("target", "_blank");
    btn.setAttribute("rel", "noopener");
  }

  function setupBubbleBounce() {
    const bubbles = $$(".burbuja");
    if (!bubbles.length) return;

    const className = "js-bounce";

    if (!$("#mgi-bubble-bounce-style")) {
      const style = document.createElement("style");
      style.id = "mgi-bubble-bounce-style";
      style.textContent = `
        @keyframes mgiBubbleBounce {
          0% { transform: translateY(0) scale(1); }
          30% { transform: translateY(-8px) scale(1.03); }
          55% { transform: translateY(0) scale(.98); }
          100% { transform: translateY(-2px) scale(1); }
        }

        .${className}{
          animation: mgiBubbleBounce 420ms ease !important;
        }
      `;
      document.head.appendChild(style);
    }

    bubbles.forEach((bubble) => {
      bubble.addEventListener("click", () => {
        bubble.classList.remove(className);
        void bubble.offsetWidth;
        bubble.classList.add(className);

        setTimeout(() => bubble.classList.remove(className), 450);
      });
    });
  }

  /* =========================================================
     11) REVEAL SUAVE DE SECCIONES
  ========================================================= */

  function setupRevealOnScroll() {
    if (isReducedMotion()) return;

    const items = [
      ...$$(".trabajamos-card"),
      ...$$(".calculadora-card"),
      ...$$(".personaliza-card"),
      ...$$(".envios-card"),
      ...$$(".envios-imagen__img"),
      ...$$(".destacado-cta")
    ];

    if (!items.length) return;

    items.forEach((item) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(14px)";
      item.style.transition = "opacity 520ms ease, transform 520ms ease";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const item = entry.target;
          item.style.opacity = "1";
          item.style.transform = "translateY(0)";

          observer.unobserve(item);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    items.forEach((item) => observer.observe(item));
  }

  /* =========================================================
     12) COPIAR TEXTO / CORREO
  ========================================================= */

  function setupCopyButtons() {
    async function copyText(text) {
      if (!text) return false;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch (error) {
        console.warn("[MGI] Clipboard API falló. Usando fallback.");
      }

      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        const success = document.execCommand("copy");
        document.body.removeChild(textarea);

        return success;
      } catch (error) {
        return false;
      }
    }

    function showFeedback(button, success) {
      const original = button.dataset.textoOriginal || button.innerHTML;

      if (!button.dataset.textoOriginal) {
        button.dataset.textoOriginal = original;
      }

      button.innerHTML = success ? "✔ Copiado" : "✖ Error";
      button.classList.toggle("copiado-exito", success);
      button.classList.toggle("copiado-error", !success);

      setTimeout(() => {
        button.innerHTML = original;
        button.classList.remove("copiado-exito", "copiado-error");
      }, 1500);
    }

    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy-email], [data-copy-text]");
      if (!button) return;

      event.preventDefault();

      const email = button.getAttribute("data-copy-email");
      const text = button.getAttribute("data-copy-text");
      const value = email || text;

      const success = await copyText(value);
      showFeedback(button, success);
    });
  }

  /* =========================================================
     13) INIT
  ========================================================= */

  function init() {
    setupFooterYear();
    setupCompactHeader();
    setupMobileMenu();
    setupSmoothAnchors();

    setupCotizaModal();
    setupCotizaFormWhatsApp();
    setupCatalogoModal();

    setupCarousels();

    setupCalculadoraEnvio();

    setupEnviosWhatsApp();
    setupBubbleBounce();

    setupRevealOnScroll();
    setupCopyButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();