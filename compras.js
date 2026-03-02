/* =========================================================
   compras.js — Creaciones MGI (SUPABASE INTEGRADO)
   - Lee carrito desde localStorage (mgi_cart_v1)
   - Renderiza lista (carritoLista)
   - Edita cantidades (+ / -), eliminar, vaciar
   - Calcula totales (subtotal/envío/total)
   - Guarda datos comprador (localStorage)
   - Genera mensaje WhatsApp con resumen
   - ✅ Guarda pedido en Supabase (Edge Function create-order)
   - ✅ Guarda folio (order_id) y vacía carrito al guardar exitosamente
========================================================= */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const CART_KEY = "mgi_cart_v1";
  const BUYER_KEY = "mgi_buyer_v1";
  const LAST_ORDER_KEY = "mgi_order_last_v1";
  const LAST_ORDER_ID_KEY = "mgi_last_order_id";

  // ✅ Supabase (Front-end)
  const SUPABASE_URL = "https://dlphlmvbearftlpjgapu.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_X7ZP-WMmAsufAILWs4Ce_Q_CC-C21Ht";
  const CREATE_ORDER_ENDPOINT = `${SUPABASE_URL}/functions/v1/create-order`;

  const DEBUG = false;

  // ---------------------------------
  // Utils
  // ---------------------------------
  function safeJSONParse(value, fallback) {
    try { return JSON.parse(value); } catch { return fallback; }
  }

  function round2(n) {
    const num = Number(n);
    if (!Number.isFinite(num)) return 0;
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  function money(n) {
    const v = round2(n);
    return v.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setLoading(btn, isLoading, textLoading = "Guardando...") {
    if (!btn) return;
    if (isLoading) {
      btn.dataset.prevText = btn.textContent || "";
      btn.disabled = true;
      btn.textContent = textLoading;
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.prevText || btn.textContent || "Guardar y finalizar pedido";
      delete btn.dataset.prevText;
    }
  }

  // ---------------------------------
  // Cart storage
  // ---------------------------------
  function getCart() {
    const raw = localStorage.getItem(CART_KEY);
    if (raw === null) return [];

    const parsed = safeJSONParse(raw, []);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((x) => x && typeof x === "object")
      .map((x) => ({
        id: String(x.id || "").trim(),
        name: String(x.name || "Producto").trim(),
        category: String(x.category || "all").trim(),
        price: round2(x.price),
        img: String(x.img || "").trim(),
        qty: Math.max(1, Number(x.qty) || 1)
      }))
      .filter((x) => x.id);
  }

  function setCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(Array.isArray(cart) ? cart : []));
  }

  function cartCount(cart) {
    return cart.reduce((acc, it) => acc + (Number(it.qty) || 0), 0);
  }

  function cartSubtotal(cart) {
    return round2(cart.reduce((acc, it) => acc + (round2(it.price) * (Number(it.qty) || 0)), 0));
  }

  function updateBadgeFromCart(cart) {
    const badge = $("#carritoCount");
    if (!badge) return;
    badge.textContent = String(cartCount(cart));
  }

  // ---------------------------------
  // Buyer storage
  // ---------------------------------
  function getBuyer() {
    const raw = localStorage.getItem(BUYER_KEY);
    const data = safeJSONParse(raw, {});
    return (data && typeof data === "object") ? data : {};
  }

  function setBuyer(buyer) {
    const safe = buyer && typeof buyer === "object" ? buyer : {};
    localStorage.setItem(BUYER_KEY, JSON.stringify(safe));
  }

  function fillBuyerForm() {
    const buyer = getBuyer();
    const map = {
      buyerName: buyer.name,
      buyerPhone: buyer.phone,
      buyerEmail: buyer.email,
      buyerAddress: buyer.address,
      buyerNote: buyer.note
    };

    Object.entries(map).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el && typeof value === "string") el.value = value;
    });
  }

  function readBuyerForm() {
    const name = ($("#buyerName")?.value || "").trim();
    const phone = ($("#buyerPhone")?.value || "").trim();
    const email = ($("#buyerEmail")?.value || "").trim();
    const address = ($("#buyerAddress")?.value || "").trim();
    const note = ($("#buyerNote")?.value || "").trim();

    return { name, phone, email, address, note };
  }

  function validateBuyer(buyer) {
    if (!buyer.name) return { ok: false, field: "buyerName", msg: "Escribe tu nombre completo." };
    if (!buyer.phone) return { ok: false, field: "buyerPhone", msg: "Escribe tu teléfono/WhatsApp." };
    if (!buyer.address) return { ok: false, field: "buyerAddress", msg: "Escribe tu dirección/domicilio." };
    return { ok: true };
  }

  // ---------------------------------
  // Rendering
  // ---------------------------------
  function renderCart(cart) {
    const list = $("#carritoLista");
    const empty = $("#carritoEmpty");
    if (!list || !empty) return;

    if (cart.length === 0) {
      empty.removeAttribute("hidden");
      list.innerHTML = "";
      updateTotals(cart);
      return;
    }

    empty.setAttribute("hidden", "hidden");

    const html = cart.map((it) => {
      const subtotal = round2(it.price * it.qty);

      return `
        <article class="carrito-item" data-id="${escapeHtml(it.id)}">
          <div class="carrito-item__img">
            <img src="${escapeHtml(it.img || "imgs/masvendido5.webp")}" alt="${escapeHtml(it.name)}" loading="lazy">
          </div>

          <div class="carrito-item__info">
            <h4>${escapeHtml(it.name)}</h4>
            <div class="carrito-item__meta">
              <span class="carrito-pill">Precio: <strong>${money(it.price)}</strong></span>
              <span class="carrito-pill">Categoría: <strong>${escapeHtml(it.category)}</strong></span>
            </div>
          </div>

          <div class="carrito-item__actions">
            <div class="qty" aria-label="Cantidad">
              <button type="button" data-qty="dec" aria-label="Disminuir cantidad">−</button>
              <span aria-label="Cantidad actual">${it.qty}</span>
              <button type="button" data-qty="inc" aria-label="Aumentar cantidad">+</button>
            </div>

            <div class="carrito-item__subtotal" aria-label="Subtotal del producto">
              ${money(subtotal)}
            </div>

            <button type="button" class="btn-remove" data-remove aria-label="Eliminar producto">
              Eliminar
            </button>
          </div>
        </article>
      `;
    }).join("");

    list.innerHTML = html;

    updateTotals(cart);
    updateBadgeFromCart(cart);
  }

  // ---------------------------------
  // Totals
  // ---------------------------------
  function computeShipping(cart) {
    // Por ahora: 0
    return 0;
  }

  function updateTotals(cart) {
    const subtotal = cartSubtotal(cart);
    const shipping = round2(computeShipping(cart));
    const total = round2(subtotal + shipping);

    const subtotalEl = $("#subtotalTxt");
    const envioEl = $("#envioTxt");
    const totalEl = $("#totalTxt");

    if (subtotalEl) subtotalEl.textContent = money(subtotal);
    if (envioEl) envioEl.textContent = money(shipping);
    if (totalEl) totalEl.textContent = money(total);

    if (DEBUG) console.log({ subtotal, shipping, total });
  }

  // ---------------------------------
  // Mutations: qty / remove / clear
  // ---------------------------------
  function changeQty(id, delta) {
    const cart = getCart();
    const idx = cart.findIndex((x) => x.id === id);
    if (idx < 0) return;

    const next = Math.max(1, (Number(cart[idx].qty) || 1) + delta);
    cart[idx].qty = next;

    setCart(cart);
    renderCart(cart);
  }

  function removeItem(id) {
    const cart = getCart().filter((x) => x.id !== id);
    setCart(cart);
    renderCart(cart);
  }

  function clearCart() {
    setCart([]);
    renderCart([]);
  }

  // ---------------------------------
  // WhatsApp message
  // ---------------------------------
  function buildWhatsAppMessage({ cart, buyer, totals, orderId }) {
    const lines = [];

    lines.push("Hola Creaciones MGI, quiero finalizar mi pedido 🛒✨");
    if (orderId) lines.push(`🧾 Folio: ${orderId}`);
    lines.push("");
    lines.push("👤 Datos del comprador:");
    lines.push(`• Nombre: ${buyer.name}`);
    lines.push(`• Teléfono: ${buyer.phone}`);
    if (buyer.email) lines.push(`• Correo: ${buyer.email}`);
    lines.push(`• Dirección: ${buyer.address}`);
    if (buyer.note) lines.push(`• Notas: ${buyer.note}`);
    lines.push("");

    lines.push("📦 Productos:");
    cart.forEach((it, i) => {
      lines.push(`${i + 1}) ${it.name}`);
      lines.push(`   • Cantidad: ${it.qty}`);
      lines.push(`   • Precio: ${money(it.price)}`);
      lines.push(`   • Subtotal: ${money(round2(it.price * it.qty))}`);
    });

    lines.push("");
    lines.push("💰 Totales:");
    lines.push(`• Subtotal: ${money(totals.subtotal)}`);
    lines.push(`• Envío: ${money(totals.shipping)}`);
    lines.push(`• Total: ${money(totals.total)}`);

    return lines.join("\n");
  }

  function openWhatsAppWithOrder() {
    const cart = getCart();
    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    const buyer = readBuyerForm();
    const v = validateBuyer(buyer);
    if (!v.ok) {
      alert(v.msg);
      const el = document.getElementById(v.field);
      if (el) el.focus();
      return;
    }

    setBuyer(buyer);

    const subtotal = cartSubtotal(cart);
    const shipping = round2(computeShipping(cart));
    const total = round2(subtotal + shipping);

    const orderId = localStorage.getItem(LAST_ORDER_ID_KEY) || "";

    const msg = buildWhatsAppMessage({
      cart,
      buyer,
      totals: { subtotal, shipping, total },
      orderId: orderId || null
    });

    const url = `https://wa.me/18123439492?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener");
  }

  // ---------------------------------
  // Supabase (Edge Function)
  // ---------------------------------
async function sendOrderToSupabase(orderDraft) {
  const res = await fetch(CREATE_ORDER_ENDPOINT, {
    method: "POST",
   headers: {
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON_KEY
},
    body: JSON.stringify({
      buyer: orderDraft.buyer,
      items: orderDraft.items,
      totals: orderDraft.totals
    })
  });

  // Lee respuesta aunque sea error (para ver mensaje real)
  const text = await res.text();
  let data = {};
  try { data = JSON.parse(text); } catch { /* ignore */ }

  if (!res.ok || !data?.ok) {
    const msg = data?.error || text || `Error HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

  // ---------------------------------
  // Guardar y finalizar pedido (ya guarda en Supabase)
  // ---------------------------------
  async function handleCheckoutSubmit(e) {
    e.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    const buyer = readBuyerForm();
    const v = validateBuyer(buyer);
    if (!v.ok) {
      alert(v.msg);
      const el = document.getElementById(v.field);
      if (el) el.focus();
      return;
    }

    setBuyer(buyer);

    const subtotal = cartSubtotal(cart);
    const shipping = round2(computeShipping(cart));
    const total = round2(subtotal + shipping);

    const draft = {
      created_at: new Date().toISOString(),
      buyer,
      items: cart,
      totals: { subtotal, shipping, total },
      status: "draft"
    };
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(draft));

    const submitBtn = $("#btnGuardarPedido");
    setLoading(submitBtn, true, "Guardando en sistema...");

    try {
      const saved = await sendOrderToSupabase(draft);

      // guarda folio
      localStorage.setItem(LAST_ORDER_ID_KEY, saved.order_id);

      // ✅ recomendado: vaciar carrito para evitar pedidos duplicados
      clearCart();

      openPedidoModal(saved.order_id);
      if (DEBUG) console.log("Pedido guardado:", saved);
    } catch (err) {
      console.error(err);
      alert("⚠️ No se pudo guardar el pedido en el sistema. Intenta de nuevo.");
    } finally {
      setLoading(submitBtn, false, "Guardar y finalizar pedido");
    }
  }

  function openPedidoModal(orderId){
  const modal = document.getElementById("modalPedido");
  const folioEl = document.getElementById("modalFolio");
  if (!modal || !folioEl) return;

  folioEl.textContent = orderId;
  modal.removeAttribute("hidden");
  document.body.style.overflow = "hidden";

  // Guardamos por si confirmacion.html lo necesita
  localStorage.setItem("mgi_last_order_id", orderId);
}

function closePedidoModal(){
  const modal = document.getElementById("modalPedido");
  if (!modal) return;
  modal.setAttribute("hidden","hidden");
  document.body.style.overflow = "";
}

function bindPedidoModal(){
  const modal = document.getElementById("modalPedido");
  if (!modal) return;

  modal.addEventListener("click", (e) => {
    const close = e.target.closest("[data-close-modal]");
    if (close) closePedidoModal();
  });

  const btnCopy = document.getElementById("btnCopiarFolio");
  const folioEl = document.getElementById("modalFolio");
  if (btnCopy && folioEl) {
    btnCopy.addEventListener("click", async () => {
      try{
        await navigator.clipboard.writeText(folioEl.textContent.trim());
        btnCopy.textContent = "¡Copiado!";
        setTimeout(() => (btnCopy.textContent = "Copiar"), 900);
      }catch{
        // fallback
        const txt = folioEl.textContent.trim();
        prompt("Copia tu folio:", txt);
      }
    });
  }
}
  // ---------------------------------
  // Init / Events
  // ---------------------------------
  function bindCartEvents() {
    const list = $("#carritoLista");
    if (!list) return;

    list.addEventListener("click", (e) => {
      const itemEl = e.target.closest(".carrito-item");
      if (!itemEl) return;

      const id = itemEl.getAttribute("data-id");
      if (!id) return;

      const qtyBtn = e.target.closest("[data-qty]");
      if (qtyBtn) {
        const dir = qtyBtn.getAttribute("data-qty");
        if (dir === "inc") changeQty(id, +1);
        if (dir === "dec") changeQty(id, -1);
        return;
      }

      const removeBtn = e.target.closest("[data-remove]");
      if (removeBtn) {
        removeItem(id);
        return;
      }
    });
  }

  function bindTopButtons() {
    const btnClear = $("#btnVaciarCarrito");
    if (btnClear) {
      btnClear.addEventListener("click", () => {
        const cart = getCart();
        if (cart.length === 0) return;
        const ok = confirm("¿Seguro que quieres vaciar el carrito?");
        if (!ok) return;
        clearCart();
      });
    }

    const btnWhats = $("#btnEnviarWhats");
    if (btnWhats) btnWhats.addEventListener("click", openWhatsAppWithOrder);

    const form = $("#checkoutForm");
    if (form) form.addEventListener("submit", handleCheckoutSubmit);
  }

  function initYearFooter() {
    const el = $("#anio");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function init() {
    const cart = getCart();
    setCart(cart);

    renderCart(cart);
    bindCartEvents();
    bindTopButtons();
    fillBuyerForm();
    initYearFooter();
    bindPedidoModal();

    if (DEBUG) console.log("✅ compras.js listo (Supabase integrado)");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();