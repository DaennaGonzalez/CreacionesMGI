/* =========================================================
   COMPRAS.JS — CREACIONES MGI
   Flujo:
   - Sin Mercado Pago
   - Sin Supabase
   - Sin venta en línea
   - Pedido final por WhatsApp

   Corrige:
   - Carritos antiguos guardados en localStorage
   - Imagen incorrecta del Centro de mesa Castillo Disney
   - Precio base / extra / precio final
   - Color / pintado
   - Renta / venta
========================================================= */

(() => {
  "use strict";

  /* =========================================================
     1. CONFIGURACIÓN
  ========================================================= */

  const CONFIG = {
    CART_KEY: "mgi_cart_v1",
    LAST_ORDER_KEY: "mgi_last_order_v1",
    WHATSAPP_NUMBER: "5218123439492",

    ubicacionBase: "C. Río Janitzio 1868, Central, 64190 Monterrey, N.L.",

    envio: {
      base: 10,
      precioPorKm: 8.5,
      minimo: 20,
      maxKm: 30,
      redondeo: 5
    }
  };

  /* =========================================================
     2. HELPERS
  ========================================================= */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function safeParseJSON(value, fallback) {
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

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeText(value) {
    return String(value || "")
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

  function getHeaderOffset() {
    const header = $(".site-header");
    return header ? header.offsetHeight : 0;
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function closeMobileMenu() {
    const toggle = $("#menu-toggle");
    if (toggle) toggle.checked = false;
  }

  function getTodayFolio() {
    const now = new Date();

    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0")
    ].join("");

    const time = [
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0"),
      String(now.getSeconds()).padStart(2, "0")
    ].join("");

    return `MGI-${date}-${time}`;
  }

  function makeCartItemId(baseId, optionLabel = "", extraLabel = "") {
    const parts = [
      baseId,
      optionLabel ? `op:${optionLabel}` : "",
      extraLabel ? `ex:${extraLabel}` : ""
    ].filter(Boolean);

    return parts
      .join("__")
      .replace(/\s+/g, "-")
      .replace(/[^\w\-:.áéíóúñÁÉÍÓÚÑ]+/g, "")
      .toLowerCase();
  }

  /* =========================================================
     3. REPARACIÓN DE CARRITOS ANTIGUOS
  ========================================================= */

  function repairKnownCartItem(item) {
    const text = normalizeText(`${item.id} ${item.baseId} ${item.name} ${item.img}`);

    const isCentroCastillo =
      text.includes("centro de mesa castillo disney") ||
      text.includes("centro mesa castillo disney") ||
      text.includes("castillo disney");

    if (!isCentroCastillo) return item;

    const extraText = normalizeText(item.extraLabel);
    const hasColor =
      extraText.includes("con color") ||
      extraText.includes("pintado");

    const extraLabel = hasColor ? "Con color" : "Sin color / sin pintado extra";
    const unitBasePrice = 84.99;
    const unitExtraPrice = hasColor ? round2(item.unitExtraPrice || 49) : 0;
    const price = round2(unitBasePrice + unitExtraPrice);

    return {
      ...item,
      id: makeCartItemId("mdf-3", item.optionLabel, extraLabel),
      baseId: "mdf-3",
      name: "Centro de mesa Castillo Disney",
      category: "mdf-detalles",
      img: "imgs/CENTROCASTILLO.webp",
      price,
      unitBasePrice,
      unitExtraPrice,
      extraLabel
    };
  }

  function dedupeCart(cart) {
    const map = new Map();

    cart.forEach((item) => {
      if (!item || !item.id) return;

      if (!map.has(item.id)) {
        map.set(item.id, { ...item });
        return;
      }

      const existing = map.get(item.id);

      map.set(item.id, {
        ...existing,
        ...item,
        qty: Math.max(1, existing.qty + item.qty)
      });
    });

    return Array.from(map.values());
  }

  /* =========================================================
     4. HEADER / MENÚ / SCROLL
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
     5. CARRITO LOCALSTORAGE
  ========================================================= */

  function normalizeCartItem(item) {
    if (!item || typeof item !== "object") return null;

    const id = String(item.id || "").trim();
    const baseId = String(item.baseId || id).trim();
    const name = String(item.name || "Producto").trim();
    const category = String(item.category || "Producto").trim();
    const img = String(item.img || "").trim();

    const qty = Math.max(1, parseInt(item.qty, 10) || 1);

    const price = round2(item.price);
    const unitBasePrice = round2(item.unitBasePrice ?? item.price);
    const unitExtraPrice = round2(item.unitExtraPrice || 0);

    const optionLabel = String(item.optionLabel || "").trim();
    const extraLabel = String(item.extraLabel || "").trim();

    if (!id || !name || price <= 0) return null;

    const normalized = {
      id,
      baseId,
      name,
      category,
      img,
      qty,
      price,
      optionLabel,
      extraLabel,
      unitBasePrice,
      unitExtraPrice
    };

    return repairKnownCartItem(normalized);
  }

  function getCart() {
    const raw = localStorage.getItem(CONFIG.CART_KEY);
    const parsed = safeParseJSON(raw, []);

    if (!Array.isArray(parsed)) return [];

    return dedupeCart(
      parsed
        .map(normalizeCartItem)
        .filter(Boolean)
    );
  }

  function setCart(cart) {
    const safeCart = Array.isArray(cart)
      ? dedupeCart(cart.map(normalizeCartItem).filter(Boolean))
      : [];

    localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(safeCart));
  }

  function repairCartStorage() {
    setCart(getCart());
  }

  function getSubtotal(cart = getCart()) {
    return round2(
      cart.reduce((sum, item) => {
        return sum + round2(item.price * item.qty);
      }, 0)
    );
  }

  function updateQty(productId, change) {
    const cart = getCart();

    const nextCart = cart
      .map((item) => {
        if (item.id !== productId) return item;

        return {
          ...item,
          qty: Math.max(1, item.qty + change)
        };
      })
      .filter(Boolean);

    setCart(nextCart);
    renderCart();
  }

  function removeItem(productId) {
    const cart = getCart().filter((item) => item.id !== productId);
    setCart(cart);
    renderCart();
  }

  function clearCart() {
    setCart([]);
    renderCart();
  }

  /* =========================================================
     6. ENVÍO
  ========================================================= */

  function getDeliveryType() {
    const select = $("#deliveryType");
    return select ? select.value : "recoger";
  }

  function getKmValue() {
    const input = $("#shippingKm");
    if (!input) return null;

    const raw = String(input.value || "").replace(",", ".").trim();
    if (!raw) return null;

    const km = Number.parseFloat(raw);
    return Number.isFinite(km) ? km : null;
  }

  function calcularEnvio() {
    const deliveryType = getDeliveryType();

    if (deliveryType === "recoger") {
      return {
        ok: true,
        type: "recoger",
        km: 0,
        shipping: 0,
        message: "Recoger en taller / punto acordado"
      };
    }

    const km = getKmValue();

    if (km === null) {
      return {
        ok: false,
        type: "domicilio",
        km: null,
        shipping: 0,
        message: "Ingresa los kilómetros para calcular el envío."
      };
    }

    if (km < 0) {
      return {
        ok: false,
        type: "domicilio",
        km,
        shipping: 0,
        message: "La distancia no puede ser negativa."
      };
    }

    if (km > CONFIG.envio.maxKm) {
      return {
        ok: false,
        type: "domicilio",
        km,
        shipping: 0,
        message: `Por el momento solo realizamos envíos automáticos hasta ${CONFIG.envio.maxKm} km.`
      };
    }

    const exacto = CONFIG.envio.base + CONFIG.envio.precioPorKm * km;
    const redondeado = Math.ceil(exacto / CONFIG.envio.redondeo) * CONFIG.envio.redondeo;
    const shipping = Math.max(CONFIG.envio.minimo, redondeado);

    return {
      ok: true,
      type: "domicilio",
      km,
      shipping: round2(shipping),
      message: `Envío a domicilio · ${km.toFixed(1)} km`
    };
  }

  function setupDeliveryFields() {
    const deliveryType = $("#deliveryType");
    const campoDireccion = $("#campoDireccion");
    const campoKilometros = $("#campoKilometros");
    const shippingKm = $("#shippingKm");

    if (!deliveryType) return;

    const updateFields = () => {
      const isDomicilio = deliveryType.value === "domicilio";

      if (campoDireccion) {
        campoDireccion.classList.toggle("is-hidden", !isDomicilio);
      }

      if (campoKilometros) {
        campoKilometros.classList.toggle("is-hidden", !isDomicilio);
      }

      const addressInput = $("#buyerAddress");

      if (addressInput) {
        if (isDomicilio) {
          addressInput.setAttribute("required", "required");
        } else {
          addressInput.removeAttribute("required");
        }
      }

      if (shippingKm) {
        if (isDomicilio) {
          shippingKm.setAttribute("required", "required");
        } else {
          shippingKm.removeAttribute("required");
          shippingKm.value = "";
        }
      }

      updateTotals();
    };

    deliveryType.addEventListener("change", updateFields);

    if (shippingKm) {
      shippingKm.addEventListener("input", updateTotals);
      shippingKm.addEventListener("change", updateTotals);
    }

    updateFields();
  }

  /* =========================================================
     7. RENDER CARRITO
  ========================================================= */

  function renderCart() {
    const cart = getCart();

    const list = $("#carritoLista");
    const empty = $("#carritoEmpty");
    const layout = $(".compras-layout");

    if (!list) return;

    if (!cart.length) {
      list.innerHTML = "";

      if (empty) empty.removeAttribute("hidden");
      if (layout) layout.classList.add("is-hidden");

      updateTotals();
      return;
    }

    if (empty) empty.setAttribute("hidden", "hidden");
    if (layout) layout.classList.remove("is-hidden");

    list.innerHTML = cart.map(renderCartItem).join("");

    updateTotals();
  }

  function renderCartItem(item) {
    const subtotal = round2(item.price * item.qty);

    const option = item.optionLabel
      ? `<span class="carrito-pill"><strong>Opción / tipo:</strong> ${escapeHTML(item.optionLabel)}</span>`
      : "";

    const extra = item.extraLabel
      ? `<span class="carrito-pill"><strong>Color / pintado:</strong> ${escapeHTML(item.extraLabel)}${
          item.unitExtraPrice > 0 ? ` (+${money(item.unitExtraPrice)})` : ""
        }</span>`
      : "";

    const basePrice = item.unitBasePrice
      ? `<span class="carrito-pill"><strong>Precio base:</strong> ${money(item.unitBasePrice)}</span>`
      : "";

    const finalUnitPrice = `
      <span class="carrito-pill carrito-pill--precio-final">
        <strong>Precio final unitario:</strong> ${money(item.price)}
      </span>
    `;

    const image = item.img
      ? `<img src="${escapeHTML(item.img)}" alt="${escapeHTML(item.name)}" loading="lazy" />`
      : `<img src="imgs/icono-carrito3d.webp" alt="" loading="lazy" />`;

    return `
      <article class="carrito-item" data-cart-id="${escapeHTML(item.id)}">
        <div class="carrito-item__img">
          ${image}
        </div>

        <div class="carrito-item__info">
          <h4>${escapeHTML(item.name)}</h4>

          <div class="carrito-item__meta">
            ${option}
            ${extra}
            ${basePrice}
            ${finalUnitPrice}
          </div>
        </div>

        <div class="carrito-item__actions">
          <div class="qty" aria-label="Cantidad">
            <button type="button" data-qty-minus="${escapeHTML(item.id)}" aria-label="Restar cantidad">−</button>
            <span>${item.qty}</span>
            <button type="button" data-qty-plus="${escapeHTML(item.id)}" aria-label="Sumar cantidad">+</button>
          </div>

          <strong class="carrito-item__subtotal">
            ${money(subtotal)}
          </strong>

          <button type="button" class="btn-remove" data-remove="${escapeHTML(item.id)}">
            Quitar
          </button>
        </div>
      </article>
    `;
  }

  function setupCartActions() {
    document.addEventListener("click", (event) => {
      const plus = event.target.closest("[data-qty-plus]");
      const minus = event.target.closest("[data-qty-minus]");
      const remove = event.target.closest("[data-remove]");

      if (plus) {
        updateQty(plus.dataset.qtyPlus, 1);
        return;
      }

      if (minus) {
        updateQty(minus.dataset.qtyMinus, -1);
        return;
      }

      if (remove) {
        removeItem(remove.dataset.remove);
      }
    });

    const clearBtn = $("#btnVaciarCarrito");

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        const cart = getCart();

        if (!cart.length) return;

        const confirmClear = window.confirm("¿Seguro que quieres vaciar el carrito?");
        if (!confirmClear) return;

        clearCart();
      });
    }
  }

  /* =========================================================
     8. TOTALES
  ========================================================= */

  function updateTotals() {
    const cart = getCart();

    const subtotal = getSubtotal(cart);
    const envio = calcularEnvio();

    const shipping = envio.ok ? envio.shipping : 0;
    const total = round2(subtotal + shipping);

    const subtotalTxt = $("#subtotalTxt");
    const envioTxt = $("#envioTxt");
    const totalTxt = $("#totalTxt");

    if (subtotalTxt) subtotalTxt.textContent = money(subtotal);

    if (envioTxt) {
      if (getDeliveryType() === "domicilio" && !envio.ok) {
        envioTxt.textContent = "Pendiente";
      } else {
        envioTxt.textContent = money(shipping);
      }
    }

    if (totalTxt) {
      if (getDeliveryType() === "domicilio" && !envio.ok) {
        totalTxt.textContent = `${money(subtotal)} + envío`;
      } else {
        totalTxt.textContent = money(total);
      }
    }

    return {
      subtotal,
      shipping,
      total,
      envio
    };
  }

  /* =========================================================
     9. FEEDBACK
  ========================================================= */

  function showFeedback(message, type = "warning") {
    const form = $("#checkoutForm");
    if (!form) return;

    let feedback = $(".compras-feedback", form);

    if (!feedback) {
      feedback = document.createElement("p");
      feedback.className = "compras-feedback";
      feedback.setAttribute("aria-live", "polite");
      form.appendChild(feedback);
    }

    feedback.classList.remove("is-success", "is-warning", "is-error");
    feedback.classList.add(`is-${type}`);
    feedback.textContent = message;

    clearTimeout(feedback._timer);

    feedback._timer = setTimeout(() => {
      feedback.textContent = "";
      feedback.classList.remove("is-success", "is-warning", "is-error");
    }, 3500);
  }

  function scrollToForm() {
    const form = $("#checkoutForm");
    if (!form) return;

    const top =
      form.getBoundingClientRect().top +
      window.scrollY -
      getHeaderOffset() -
      18;

    window.scrollTo({
      top: Math.max(top, 0),
      behavior: prefersReducedMotion() ? "auto" : "smooth"
    });
  }

  /* =========================================================
     10. WHATSAPP
  ========================================================= */

  function getBuyerData() {
    return {
      name: ($("#buyerName")?.value || "").trim(),
      phone: ($("#buyerPhone")?.value || "").trim(),
      email: ($("#buyerEmail")?.value || "").trim(),
      deliveryType: ($("#deliveryType")?.value || "recoger").trim(),
      address: ($("#buyerAddress")?.value || "").trim(),
      km: getKmValue(),
      note: ($("#buyerNote")?.value || "").trim()
    };
  }

  function validateBeforeWhatsApp() {
    const cart = getCart();

    if (!cart.length) {
      return {
        ok: false,
        message: "Tu carrito está vacío. Agrega productos antes de enviar el pedido."
      };
    }

    const buyer = getBuyerData();

    if (!buyer.name) {
      return {
        ok: false,
        message: "Escribe tu nombre completo."
      };
    }

    if (!buyer.phone) {
      return {
        ok: false,
        message: "Escribe tu WhatsApp o teléfono."
      };
    }

    if (buyer.deliveryType === "domicilio") {
      if (!buyer.address) {
        return {
          ok: false,
          message: "Escribe tu dirección o referencia de entrega."
        };
      }

      const envio = calcularEnvio();

      if (!envio.ok) {
        return {
          ok: false,
          message: envio.message
        };
      }
    }

    return {
      ok: true,
      message: ""
    };
  }

  function buildWhatsAppMessage(order) {
    const { folio, buyer, cart, subtotal, shipping, total, envio } = order;

    const productsText = cart
      .map((item, index) => {
        const subtotalItem = round2(item.price * item.qty);

        const lines = [
          `${index + 1}. ${item.name}`,
          item.optionLabel ? `   Opción / tipo: ${item.optionLabel}` : null,
          item.extraLabel
            ? `   Color / pintado: ${item.extraLabel}${
                item.unitExtraPrice > 0 ? ` (+${money(item.unitExtraPrice)})` : ""
              }`
            : null,
          item.unitBasePrice ? `   Precio base: ${money(item.unitBasePrice)}` : null,
          `   Precio final unitario: ${money(item.price)}`,
          `   Cantidad: ${item.qty}`,
          `   Subtotal: ${money(subtotalItem)}`
        ].filter(Boolean);

        return lines.join("\n");
      })
      .join("\n\n");

    const deliveryText =
      buyer.deliveryType === "domicilio"
        ? [
            "Envío a domicilio",
            `Dirección/referencia: ${buyer.address}`,
            `Distancia: ${envio.km.toFixed(1)} km`,
            `Costo de envío estimado: ${money(shipping)}`
          ].join("\n")
        : "Recoger en taller / punto acordado";

    const message = [
      "Hola Creaciones MGI 😊",
      "Quiero enviar mi pedido desde la página web.",
      "",
      `Folio local: ${folio}`,
      "",
      "DATOS DEL CLIENTE",
      `Nombre: ${buyer.name}`,
      `WhatsApp/Teléfono: ${buyer.phone}`,
      buyer.email ? `Correo: ${buyer.email}` : null,
      "",
      "FORMA DE ENTREGA",
      deliveryText,
      "",
      "PRODUCTOS",
      productsText,
      "",
      "TOTALES ESTIMADOS",
      `Subtotal: ${money(subtotal)}`,
      `Envío: ${money(shipping)}`,
      `Total estimado: ${money(total)}`,
      "",
      buyer.note ? "NOTAS DEL PEDIDO" : null,
      buyer.note || null,
      buyer.note ? "" : null,
      "Por favor confirmen disponibilidad, detalles personalizados, tiempo de elaboración y costo final."
    ]
      .filter((line) => line !== null && line !== undefined)
      .join("\n");

    return message;
  }

  function saveLastOrder(order) {
    try {
      localStorage.setItem(CONFIG.LAST_ORDER_KEY, JSON.stringify(order));
    } catch (error) {
      console.warn("[MGI] No se pudo guardar el último pedido.", error);
    }
  }

  function setupCheckoutForm() {
    const form = $("#checkoutForm");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const validation = validateBeforeWhatsApp();

      if (!validation.ok) {
        showFeedback(validation.message, "warning");
        scrollToForm();
        return;
      }

      const cart = getCart();
      const buyer = getBuyerData();
      const totals = updateTotals();

      const order = {
        folio: getTodayFolio(),
        createdAt: new Date().toISOString(),
        buyer,
        cart,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        total: totals.total,
        envio: totals.envio
      };

      saveLastOrder(order);

      const message = buildWhatsAppMessage(order);
      const url = buildWhatsAppUrl(message);

      showFeedback("Abriendo WhatsApp para enviar tu pedido...", "success");

      window.open(url, "_blank", "noopener");
    });
  }

  /* =========================================================
     11. BURBUJAS
  ========================================================= */

  function setupFloatingBubbles() {
    const bubbles = $$(".burbuja");
    if (!bubbles.length) return;

    const styleId = "mgi-compras-burbujas-style";

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
     12. INIT
  ========================================================= */

  function init() {
    setupFooterYear();
    setupCompactHeader();
    setupMobileMenu();
    setupSmoothAnchors();

    repairCartStorage();

    setupDeliveryFields();
    setupCartActions();
    setupCheckoutForm();
    setupFloatingBubbles();

    renderCart();
    updateTotals();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();