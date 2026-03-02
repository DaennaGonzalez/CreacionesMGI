/* =========================================================
   productos.js — Creaciones MGI
   - Busca + filtra catálogo
   - Agrega al carrito (localStorage)
   - Actualiza badge (#carritoCount)
   - Oculta secciones vacías
========================================================= */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const CART_KEY = "mgi_cart_v1";
  const DEBUG = true; // pon false cuando ya quede listo

  function safeJSONParse(value, fallback) {
    try { return JSON.parse(value); } catch { return fallback; }
  }

  // -----------------------------
  // Cart storage
  // -----------------------------
  function getCart() {
    return safeJSONParse(localStorage.getItem(CART_KEY), []);
  }

  function setCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function cartCount(cart) {
    return cart.reduce((acc, item) => acc + (Number(item.qty) || 0), 0);
  }

  function updateCartBadge() {
    const badge = $("#carritoCount");
    if (!badge) return;

    const cart = getCart();
    badge.textContent = String(cartCount(cart));
  }

  function upsertCartItem(product) {
    const cart = getCart();
    const idx = cart.findIndex((x) => x.id === product.id);

    if (idx >= 0) cart[idx].qty = (Number(cart[idx].qty) || 0) + 1;
    else {
      cart.push({
        id: product.id,
        name: product.name,
        category: product.category,
        price: Number(product.price) || 0,
        img: product.img || "",
        qty: 1
      });
    }

    setCart(cart);
    updateCartBadge();
  }

  // -----------------------------
  // Catalog / Cards
  // -----------------------------
  function readProductFromCard(card) {
    return {
      id: card.dataset.id || "",
      name: card.dataset.name || card.querySelector(".producto-nombre")?.textContent?.trim() || "Producto",
      category: card.dataset.category || "all",
      price: Number(card.dataset.price || 0),
      img: card.dataset.img || card.querySelector(".producto-img img")?.getAttribute("src") || ""
    };
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
  function normalize(str) {
    return (str || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function getCardText(card) {
    const name = card.dataset.name || card.querySelector(".producto-nombre")?.textContent || "";
    const desc = card.querySelector(".producto-desc")?.textContent || "";
    const category = card.dataset.category || "";
    const tags = card.dataset.tags || "";
    return normalize(`${name} ${desc} ${category} ${tags}`);
  }

  function applySearchAndFilter({ query, category }) {
    const q = normalize(query);
    const cat = (category || "all").toLowerCase();

    const sections = $$("section.productos-seccion[data-category-section]");
    const cards = $$(".producto-card");

    cards.forEach((card) => {
      const cardCategory = (card.dataset.category || "").toLowerCase();
      const matchesCategory = cat === "all" || cardCategory === cat;

      const text = getCardText(card);
      const matchesQuery = !q || text.includes(q);

      card.style.display = (matchesCategory && matchesQuery) ? "" : "none";
    });

    sections.forEach((sec) => {
      const visible = $$(".producto-card", sec).some((c) => c.style.display !== "none");
      sec.style.display = visible ? "" : "none";
    });
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

      if (!product.id) {
        if (DEBUG) console.warn("⚠️ Producto sin data-id:", card);
        return;
      }

      upsertCartItem(product);
      markButtonAdded(btn);

      if (DEBUG) console.log("🛒 Agregado:", product.id, product.name);
    });
  }

  function initSearchAndFilter() {
    const input = $("#buscador");
    const select = $("#filtroCategoria");

    if (!input && !select) return;

    const state = {
      query: input?.value || "",
      category: select?.value || "all"
    };

    applySearchAndFilter(state);

    if (input) {
      input.addEventListener("input", () => {
        state.query = input.value;
        applySearchAndFilter(state);
        if (DEBUG) console.log("🔎 Buscando:", state.query);
      });
    }

    if (select) {
      select.addEventListener("change", () => {
        state.category = select.value;
        applySearchAndFilter(state);
        if (DEBUG) console.log("🧩 Filtro:", state.category);
      });
    }
  }

  function initYearFooter() {
    const el = $("#anio");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function init() {
    if (DEBUG) console.log("✅ productos.js cargado");
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