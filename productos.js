/* =========================================================
   PRODUCTOS.JS — CREACIONES MGI
   Catálogo + carrito + filtros + variantes + extras + cantidad

   Compatible con:
   - productos.html nuevo
   - compras.html usando localStorage key: mgi_cart_v1

   Contempla:
   - Renta / venta
   - Variantes de precio
   - Color / pintado con costo extra
   - Cantidad
   - Precio base
   - Precio extra
   - Precio final unitario
========================================================= */

(() => {
  "use strict";

  /* =========================================================
     1. CONFIGURACIÓN
  ========================================================= */

  const CONFIG = {
    CART_KEY: "mgi_cart_v1",
    WHATSAPP_NUMBER: "5218123439492",
    DEBUG: false
  };

  /* =========================================================
     2. HELPERS
  ========================================================= */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function log(...args) {
    if (CONFIG.DEBUG) console.log("[MGI Productos]", ...args);
  }

  function safeJSONParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function round2(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.round((number + Number.EPSILON) * 100) / 100;
  }

  function money(value) {
    const number = round2(value);

    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: number % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    }).format(number);
  }

  function formatPriceNumber(value) {
    const number = round2(value);

    if (number % 1 === 0) {
      return String(number);
    }

    return number.toFixed(2);
  }

  function normalizeText(value) {
    return (value || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function encodeWhatsApp(text) {
    return encodeURIComponent(text);
  }

  function buildWhatsAppUrl(message) {
    return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeWhatsApp(message)}`;
  }

  function closeMobileMenu() {
    const toggle = $("#menu-toggle");
    if (toggle) toggle.checked = false;
  }

  function getHeaderOffset() {
    const header = $(".site-header");
    return header ? header.offsetHeight : 0;
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* =========================================================
     3. HEADER, MENÚ Y SCROLL
  ========================================================= */

  function setupFooterYear() {
    const year = $("#anio");
    if (!year) return;

    year.textContent = String(new Date().getFullYear());
  }

  function setupCompactHeader() {
    const header = $(".site-header");
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle("is-compact", window.scrollY > 140);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function setupMobileMenu() {
    const toggle = $("#menu-toggle");
    const menuIcon = $(".menu-icon");
    const nav = $(".site-nav");

    if (!toggle || !menuIcon || !nav) return;

    const updateAria = () => {
      menuIcon.setAttribute("aria-expanded", toggle.checked ? "true" : "false");
    };

    toggle.addEventListener("change", updateAria);

    menuIcon.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    nav.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    $$(".nav-list a").forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileMenu();
        updateAria();
      });
    });

    document.addEventListener("click", () => {
      if (!toggle.checked) return;

      closeMobileMenu();
      updateAria();
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

  function setupSmoothAnchors() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        closeMobileMenu();

        const top =
          target.getBoundingClientRect().top +
          window.scrollY -
          getHeaderOffset() -
          14;

        window.scrollTo({
          top: Math.max(top, 0),
          behavior: prefersReducedMotion() ? "auto" : "smooth"
        });
      });
    });
  }

  /* =========================================================
     4. CARRITO LOCALSTORAGE
  ========================================================= */

  function normalizeCartItem(item) {
    if (!item || typeof item !== "object") return null;

    const id = String(item.id || "").trim();
    const baseId = String(item.baseId || id).trim();
    const name = String(item.name || "Producto").trim();
    const category = String(item.category || "all").trim();
    const img = String(item.img || "").trim();

    const price = round2(item.price);
    const qty = Math.max(1, parseInt(item.qty, 10) || 1);

    const optionLabel = String(item.optionLabel || "").trim();
    const extraLabel = String(item.extraLabel || "").trim();

    const unitBasePrice = round2(item.unitBasePrice ?? item.price);
    const unitExtraPrice = round2(item.unitExtraPrice || 0);

    if (!id || !name || price <= 0) return null;

    return {
      id,
      baseId,
      name,
      category,
      price,
      img,
      qty,
      optionLabel,
      extraLabel,
      unitBasePrice,
      unitExtraPrice
    };
  }

  function getCart() {
    const raw = localStorage.getItem(CONFIG.CART_KEY);

    if (raw === null) return [];

    const parsed = safeJSONParse(raw, []);

    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalizeCartItem).filter(Boolean);
  }

  function setCart(cart) {
    const safeCart = Array.isArray(cart)
      ? cart.map(normalizeCartItem).filter(Boolean)
      : [];

    localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(safeCart));
  }

  function getCartCount(cart = getCart()) {
    return cart.reduce((sum, item) => {
      return sum + (parseInt(item.qty, 10) || 0);
    }, 0);
  }

  function updateCartBadge() {
    const badge = $("#carritoCount");
    if (!badge) return;

    const count = getCartCount();
    badge.textContent = String(count);
    badge.setAttribute("aria-label", `${count} productos en carrito`);
  }

  function makeCartItemId(product) {
    const parts = [
      product.baseId,
      product.optionLabel ? `op:${product.optionLabel}` : "",
      product.extraLabel ? `ex:${product.extraLabel}` : ""
    ].filter(Boolean);

    return parts
      .join("__")
      .replace(/\s+/g, "-")
      .replace(/[^\w\-:.áéíóúñÁÉÍÓÚÑ]+/g, "")
      .toLowerCase();
  }

  function upsertCartItem(product) {
    const cart = getCart();
    const finalId = makeCartItemId(product);
    const existingIndex = cart.findIndex((item) => item.id === finalId);

    const cartItem = {
      id: finalId,
      baseId: product.baseId,
      name: product.name,
      category: product.category,
      price: round2(product.price),
      img: product.img,
      qty: Math.max(1, parseInt(product.qty, 10) || 1),
      optionLabel: product.optionLabel || "",
      extraLabel: product.extraLabel || "",
      unitBasePrice: round2(product.unitBasePrice),
      unitExtraPrice: round2(product.unitExtraPrice)
    };

    if (existingIndex >= 0) {
      cart[existingIndex].qty += cartItem.qty;
      cart[existingIndex].price = cartItem.price;
      cart[existingIndex].img = cartItem.img;
      cart[existingIndex].name = cartItem.name;
      cart[existingIndex].category = cartItem.category;
      cart[existingIndex].optionLabel = cartItem.optionLabel;
      cart[existingIndex].extraLabel = cartItem.extraLabel;
      cart[existingIndex].unitBasePrice = cartItem.unitBasePrice;
      cart[existingIndex].unitExtraPrice = cartItem.unitExtraPrice;
    } else {
      cart.push(cartItem);
    }

    setCart(cart);
    updateCartBadge();

    log("Carrito actualizado:", cart);
  }

  /* =========================================================
     5. LECTURA DE PRODUCTOS, VARIANTES, EXTRAS Y CANTIDAD
  ========================================================= */

  function getSelectedVariant(card) {
    const select = $("[data-variant]", card);

    if (!select) {
      return {
        label: "",
        price: null
      };
    }

    const option = select.options[select.selectedIndex];

    if (!option) {
      return {
        label: "",
        price: null
      };
    }

    return {
      label: option.value || option.textContent.trim(),
      price: round2(option.dataset.price)
    };
  }

  function getSelectedExtras(card) {
    const extras = $$("[data-extra]", card).filter((input) => input.checked);

    const labels = [];
    let totalExtra = 0;

    extras.forEach((extra) => {
      const label = extra.dataset.extraLabel || "Extra";
      const price = round2(extra.dataset.extraPrice);

      labels.push(label);
      totalExtra += price;
    });

    return {
      label: labels.join(", "),
      price: round2(totalExtra)
    };
  }

  function getQty(card) {
    const input = $("[data-qty]", card);

    if (!input) return 1;

    const value = parseInt(input.value, 10);

    if (!Number.isFinite(value) || value < 1) {
      input.value = "1";
      return 1;
    }

    return value;
  }

  function getBasePrice(card) {
    const variant = getSelectedVariant(card);

    if (variant.price !== null && variant.price > 0) {
      return variant.price;
    }

    return round2(card.dataset.basePrice || card.dataset.price || 0);
  }

  function getUnitPrice(card) {
    const base = getBasePrice(card);
    const extras = getSelectedExtras(card);

    return round2(base + extras.price);
  }

  function readProductFromCard(card) {
    const baseId = String(card.dataset.id || "").trim();

    const name =
      String(
        card.dataset.name ||
          $(".producto-nombre", card)?.textContent ||
          "Producto"
      ).trim();

    const category = String(card.dataset.category || "all").trim();

    const img =
      String(
        card.dataset.img ||
          $(".producto-img img", card)?.getAttribute("src") ||
          ""
      ).trim();

    const variant = getSelectedVariant(card);
    const extras = getSelectedExtras(card);

    const hasExtraOption = Boolean($("[data-extra]", card));

    const unitBasePrice = getBasePrice(card);
    const unitExtraPrice = extras.price;
    const price = getUnitPrice(card);
    const qty = getQty(card);

    return {
      baseId,
      name,
      category,
      img,
      qty,
      price,
      optionLabel: variant.label || "",
      extraLabel: extras.label || (hasExtraOption ? "Sin color / sin pintado extra" : ""),
      unitBasePrice,
      unitExtraPrice
    };
  }

  function validateProduct(product) {
    if (!product.baseId) {
      return {
        ok: false,
        message: "Este producto no tiene ID configurado."
      };
    }

    if (!product.name) {
      return {
        ok: false,
        message: "Este producto no tiene nombre configurado."
      };
    }

    if (!Number.isFinite(product.price) || product.price <= 0) {
      return {
        ok: false,
        message: "Este producto requiere cotización por WhatsApp."
      };
    }

    if (!Number.isFinite(product.qty) || product.qty < 1) {
      return {
        ok: false,
        message: "Selecciona una cantidad válida."
      };
    }

    return {
      ok: true,
      message: ""
    };
  }

  /* =========================================================
     6. PRECIO EN VIVO EN TARJETAS
  ========================================================= */

  function updateCardPrice(card) {
    const priceEl = $(".price", card);
    if (!priceEl) return;

    const basePrice = getBasePrice(card);
    const extras = getSelectedExtras(card);
    const variant = getSelectedVariant(card);
    const finalPrice = getUnitPrice(card);
    const hasExtraOption = Boolean($("[data-extra]", card));

    priceEl.textContent = formatPriceNumber(finalPrice);

    let detail = $(".producto-precio-detalle", card);
    const bottom = $(".producto-bottom", card);

    if (!detail && bottom) {
      detail = document.createElement("p");
      detail.className = "producto-precio-detalle";
      bottom.insertAdjacentElement("afterend", detail);
    }

    if (!detail) return;

    const lines = [];

    if (variant.label) {
      lines.push(`Opción seleccionada: ${variant.label}`);
    }

    if (hasExtraOption) {
      if (extras.label && extras.price > 0) {
        lines.push(`${extras.label}: +${money(extras.price)}`);
        lines.push(`Base ${money(basePrice)} + extra ${money(extras.price)} = ${money(finalPrice)}`);
      } else {
        lines.push("Sin color / sin pintado extra");
      }
    }

    detail.textContent = lines.join(" · ");
    detail.hidden = lines.length === 0;
  }

  function updateAllCardPrices() {
    $$(".producto-card").forEach(updateCardPrice);
  }

  function setupLivePriceUpdates() {
    document.addEventListener("change", (event) => {
      const control = event.target.closest("[data-variant], [data-extra]");
      if (!control) return;

      const card = control.closest(".producto-card");
      if (!card) return;

      updateCardPrice(card);
    });

    document.addEventListener("input", (event) => {
      const qtyInput = event.target.closest("[data-qty]");
      if (!qtyInput) return;

      const value = parseInt(qtyInput.value, 10);

      if (Number.isFinite(value) && value >= 1) return;

      if (qtyInput.value !== "") {
        qtyInput.value = "1";
      }
    });

    updateAllCardPrices();
  }

  /* =========================================================
     7. UI AGREGAR AL CARRITO
  ========================================================= */

  function markButtonAdded(button, qty) {
    const originalHTML = button.dataset.originalHtml || button.innerHTML;

    if (!button.dataset.originalHtml) {
      button.dataset.originalHtml = originalHTML;
    }

    button.disabled = true;
    button.classList.add("is-added");
    button.innerHTML = `Agregado (${qty})`;

    setTimeout(() => {
      button.disabled = false;
      button.classList.remove("is-added");
      button.innerHTML = originalHTML;
    }, 950);
  }

  function showProductFeedback(card, message, type = "success") {
    let feedback = $(".producto-feedback", card);

    if (!feedback) {
      feedback = document.createElement("p");
      feedback.className = "producto-feedback";
      feedback.setAttribute("aria-live", "polite");

      const bottom = $(".producto-bottom", card);
      if (bottom) {
        bottom.insertAdjacentElement("afterend", feedback);
      } else {
        card.appendChild(feedback);
      }
    }

    feedback.textContent = message;
    feedback.classList.remove("is-success", "is-warning", "is-error");
    feedback.classList.add(`is-${type}`);

    clearTimeout(feedback._timer);

    feedback._timer = setTimeout(() => {
      feedback.textContent = "";
      feedback.classList.remove("is-success", "is-warning", "is-error");
    }, 2200);
  }

  function setupAddToCart() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-add-to-cart]");
      if (!button) return;

      const card = button.closest(".producto-card");
      if (!card) return;

      const product = readProductFromCard(card);
      const validation = validateProduct(product);

      if (!validation.ok) {
        showProductFeedback(card, validation.message, "warning");
        return;
      }

      upsertCartItem(product);
      markButtonAdded(button, product.qty);

      const subtotal = round2(product.price * product.qty);

      const details = [
        product.optionLabel ? `Opción: ${product.optionLabel}` : null,
        product.extraLabel ? `Color/pintado: ${product.extraLabel}` : null,
        `Subtotal ${money(subtotal)}`
      ]
        .filter(Boolean)
        .join(" · ");

      showProductFeedback(
        card,
        `${product.qty} agregado(s) al carrito · ${details}`,
        "success"
      );
    });
  }

  /* =========================================================
     8. BUSCADOR Y FILTRO
  ========================================================= */

  function getCardSearchText(card) {
    const name = card.dataset.name || $(".producto-nombre", card)?.textContent || "";
    const desc = $(".producto-desc", card)?.textContent || "";
    const category = card.dataset.category || "";
    const tags = card.dataset.tags || "";
    const price = card.dataset.price || "";

    return normalizeText(`${name} ${desc} ${category} ${tags} ${price}`);
  }

  function showEmptyState(show) {
    const empty = $("#productosEmpty");
    if (!empty) return;

    if (show) {
      empty.removeAttribute("hidden");
    } else {
      empty.setAttribute("hidden", "hidden");
    }
  }

  function applySearchAndFilter() {
    const input = $("#buscador");
    const select = $("#filtroCategoria");

    const query = normalizeText(input?.value || "");
    const selectedCategory = String(select?.value || "all").toLowerCase();

    const cards = $$(".producto-card");
    const sections = $$("section.productos-seccion[data-category-section]");

    let visibleCount = 0;

    cards.forEach((card) => {
      const cardCategory = String(card.dataset.category || "").toLowerCase();
      const matchesCategory =
        selectedCategory === "all" || cardCategory === selectedCategory;

      const searchText = getCardSearchText(card);
      const matchesQuery = !query || searchText.includes(query);

      const visible = matchesCategory && matchesQuery;

      card.classList.toggle("is-hidden", !visible);

      if (visible) visibleCount++;
    });

    sections.forEach((section) => {
      const sectionCards = $$(".producto-card", section);
      const hasVisibleCard = sectionCards.some(
        (card) => !card.classList.contains("is-hidden")
      );

      section.classList.toggle("is-hidden", !hasVisibleCard);
    });

    showEmptyState(visibleCount === 0);
  }

  function setupSearchAndFilter() {
    const input = $("#buscador");
    const select = $("#filtroCategoria");

    if (input) {
      input.addEventListener("input", applySearchAndFilter);
      input.addEventListener("keyup", applySearchAndFilter);
      input.addEventListener("search", applySearchAndFilter);
    }

    if (select) {
      select.addEventListener("change", applySearchAndFilter);
      select.addEventListener("input", applySearchAndFilter);
    }

    applySearchAndFilter();
  }

  /* =========================================================
     9. PRODUCTOS DE COTIZACIÓN
  ========================================================= */

  function setupQuoteProducts() {
    $$(".producto-card--cotizar").forEach((card) => {
      const link = $(".producto-cotizar", card);
      if (!link) return;

      const productName =
        card.dataset.name || $(".producto-nombre", card)?.textContent || "producto";

      if (link.getAttribute("href") && link.getAttribute("href") !== "#") return;

      const message = [
        "Hola Creaciones MGI 😊",
        `Quiero cotizar: ${productName}.`,
        "",
        "Me gustaría recibir información de precio, tiempo de elaboración y opciones."
      ].join("\n");

      link.href = buildWhatsAppUrl(message);
      link.target = "_blank";
      link.rel = "noopener";
    });
  }

  /* =========================================================
     10. REVEAL ANIMATION
  ========================================================= */

  function setupRevealAnimations() {
    if (prefersReducedMotion()) {
      $$("[data-animate]").forEach((el) => {
        el.classList.add("in-view");
      });
      return;
    }

    const elements = $$("[data-animate]");

    if (!elements.length) return;

    elements.forEach((el) => {
      el.classList.add("reveal");

      const delay = parseInt(el.dataset.delay || "0", 10);
      if (Number.isFinite(delay) && delay > 0) {
        el.style.transitionDelay = `${delay}ms`;
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    elements.forEach((el) => observer.observe(el));
  }

  /* =========================================================
     11. EFECTO EN BURBUJAS
  ========================================================= */

  function setupFloatingBubbles() {
    const bubbles = $$(".burbuja");
    if (!bubbles.length) return;

    const styleId = "mgi-productos-burbujas-style";

    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes mgiBubbleTap {
          0% { transform: translateY(0) scale(1); }
          35% { transform: translateY(-7px) scale(1.05); }
          70% { transform: translateY(0) scale(.98); }
          100% { transform: translateY(-2px) scale(1); }
        }

        .burbuja.is-tapped {
          animation: mgiBubbleTap 420ms ease both;
        }
      `;
      document.head.appendChild(style);
    }

    bubbles.forEach((bubble) => {
      bubble.addEventListener("click", () => {
        bubble.classList.remove("is-tapped");
        void bubble.offsetWidth;
        bubble.classList.add("is-tapped");

        setTimeout(() => {
          bubble.classList.remove("is-tapped");
        }, 450);
      });
    });
  }

  /* =========================================================
     12. REPARACIÓN INICIAL DE CARRITO
  ========================================================= */

  function repairCartStorage() {
    const cart = getCart();
    setCart(cart);
  }

  /* =========================================================
     13. INIT
  ========================================================= */

  function init() {
    log("productos.js cargado");

    setupFooterYear();
    setupCompactHeader();
    setupMobileMenu();
    setupSmoothAnchors();

    repairCartStorage();
    updateCartBadge();

    setupLivePriceUpdates();
    setupAddToCart();
    setupSearchAndFilter();
    setupQuoteProducts();

    setupRevealAnimations();
    setupFloatingBubbles();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();