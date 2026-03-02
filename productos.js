/* =========================================================
   productos.js — Creaciones MGI (VERSIÓN COHERENTE PARA CHECKOUT)
   - Corrige localStorage (si viene null o basura)
   - Busca + filtra en vivo (is-hidden)
   - Agrega al carrito (localStorage)
   - Actualiza badge (#carritoCount)
   - Normaliza precios (2 decimales) para totales consistentes
   - Estructura de item estable para compras.html:
     { id, name, category, price, img, qty }
========================================================= */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Debe coincidir con compras.js
  const CART_KEY = "mgi_cart_v1";

  // Para producción: false
  const DEBUG = false;

  // -----------------------------
  // Utils
  // -----------------------------
  function safeJSONParse(value, fallback) {
    try { return JSON.parse(value); } catch { return fallback; }
  }

  function round2(n) {
    const num = Number(n);
    if (!Number.isFinite(num)) return 0;
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  function normalize(str) {
    return (str || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  // -----------------------------
  // Cart storage
  // -----------------------------
  function getCart() {
    const raw = localStorage.getItem(CART_KEY);

    // no existe
    if (raw === null) return [];

    const parsed = safeJSONParse(raw, []);

    // si era "null" => parsed = null, o si viene corrupto
    if (!Array.isArray(parsed)) return [];

    // sanitiza estructura mínima
    return parsed
      .filter((x) => x && typeof x === "object")
      .map((x) => ({
        id: String(x.id || ""),
        name: String(x.name || "Producto"),
        category: String(x.category || "all"),
        price: round2(x.price),
        img: String(x.img || ""),
        qty: Math.max(1, Number(x.qty) || 1)
      }))
      .filter((x) => x.id);
  }

  function setCart(cart) {
    const safe = Array.isArray(cart) ? cart : [];
    localStorage.setItem(CART_KEY, JSON.stringify(safe));
  }

  function cartCount(cart) {
    const safe = Array.isArray(cart) ? cart : [];
    return safe.reduce((acc, item) => acc + (Number(item.qty) || 0), 0);
  }

  function updateCartBadge() {
    const badge = $("#carritoCount");
    if (!badge) return;

    const cart = getCart();
    badge.textContent = String(cartCount(cart));
  }

  // -----------------------------
  // Product reading + add
  // -----------------------------
  function readProductFromCard(card) {
    const id = (card.dataset.id || "").trim();
    const name =
      (card.dataset.name || card.querySelector(".producto-nombre")?.textContent || "Producto").trim();
    const category = (card.dataset.category || "all").trim();
    const img =
      (card.dataset.img || card.querySelector(".producto-img img")?.getAttribute("src") || "").trim();

    // data-price debe ser numérico: "39.99" "149" etc.
    const price = round2(card.dataset.price);

    return { id, name, category, price, img };
  }

  function upsertCartItem(product) {
    const cart = getCart();
    const idx = cart.findIndex((x) => x.id === product.id);

    if (idx >= 0) {
      cart[idx].qty = Math.max(1, (Number(cart[idx].qty) || 1) + 1);
      // Por coherencia, si cambiaste price/img en HTML, actualiza también:
      cart[idx].price = round2(product.price);
      cart[idx].img = product.img || cart[idx].img;
      cart[idx].name = product.name || cart[idx].name;
      cart[idx].category = product.category || cart[idx].category;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        category: product.category,
        price: round2(product.price),
        img: product.img || "",
        qty: 1
      });
    }

    setCart(cart);
    updateCartBadge();

    if (DEBUG) console.log("🛒 Carrito:", cart);
  }

  function markButtonAdded(btn) {
    btn.classList.add("is-added");
    btn.disabled = true;

    window.setTimeout(() => {
      btn.disabled = false;
      btn.classList.remove("is-added");
    }, 900);
  }

  // -----------------------------
  // Search + Filter
  // -----------------------------
  function getCardText(card) {
    const name = card.dataset.name || card.querySelector(".producto-nombre")?.textContent || "";
    const desc = card.querySelector(".producto-desc")?.textContent || "";
    const category = card.dataset.category || "";
    const tags = card.dataset.tags || "";
    return normalize(`${name} ${desc} ${category} ${tags}`);
  }

  function showEmptyState(show) {
    const empty = $("#productosEmpty");
    if (!empty) return;
    if (show) empty.removeAttribute("hidden");
    else empty.setAttribute("hidden", "hidden");
  }

  function applySearchAndFilter({ query, category }) {
    const q = normalize(query);
    const cat = (category || "all").toLowerCase();

    const sections = $$("section.productos-seccion[data-category-section]");
    const cards = $$(".producto-card");

    let visibleCount = 0;

    cards.forEach((card) => {
      const cardCategory = (card.dataset.category || "").toLowerCase();
      const matchesCategory = (cat === "all") || (cardCategory === cat);

      const text = getCardText(card);
      const matchesQuery = (!q) || text.includes(q);

      const visible = matchesCategory && matchesQuery;

      card.classList.toggle("is-hidden", !visible);
      if (visible) visibleCount++;
    });

    // Oculta secciones vacías
    sections.forEach((sec) => {
      const secCards = $$(".producto-card", sec);
      const anyVisible = secCards.some((c) => !c.classList.contains("is-hidden"));
      sec.classList.toggle("is-hidden", !anyVisible);
    });

    showEmptyState(visibleCount === 0);

    if (DEBUG) console.log("🔎 filtro:", { q, cat, visibleCount });
  }

  // -----------------------------
  // Init
  // -----------------------------
  function initAddToCart() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-add-to-cart]");
      if (!btn) return;

      const card = btn.closest(".producto-card");
      if (!card) return;

      const product = readProductFromCard(card);

      // Validación
      if (!product.id) {
        console.warn("⚠️ Producto sin data-id:", card);
        return;
      }

      // Si el producto es de “cotización” (price = 0), puedes evitar agregar:
      // (lo dejamos permitido SOLO si de verdad quieres; por default lo bloqueamos)
      if (product.price <= 0) {
        if (DEBUG) console.warn("ℹ️ Producto con precio 0 no se agrega:", product);
        // Si quieres permitirlo, comenta el return:
        return;
      }

      upsertCartItem(product);
      markButtonAdded(btn);
    });
  }

  function initSearchAndFilter() {
    const input = $("#buscador");
    const select = $("#filtroCategoria");

    if (!input && !select) {
      if (DEBUG) console.warn("⚠️ No encontré #buscador ni #filtroCategoria");
      return;
    }

    const state = {
      query: input?.value || "",
      category: select?.value || "all"
    };

    // aplica al cargar
    applySearchAndFilter(state);

    const update = () => {
      state.query = input?.value || "";
      state.category = select?.value || "all";
      applySearchAndFilter(state);
    };

    if (input) {
      input.addEventListener("input", update);
      input.addEventListener("keyup", update);
      input.addEventListener("search", update); // cuando limpias con la X del search
    }

    if (select) {
      select.addEventListener("change", update);
      select.addEventListener("input", update);
    }
  }

  function initYearFooter() {
    const el = $("#anio");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function init() {
    if (DEBUG) console.log("✅ productos.js cargado");

    // Repara carrito corrupto / "null"
    const cart = getCart();
    setCart(cart);

    updateCartBadge();
    initAddToCart();
    initSearchAndFilter();
    initYearFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();