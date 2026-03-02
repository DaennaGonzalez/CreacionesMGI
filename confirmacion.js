/* =========================================================
   confirmacion.js — Creaciones MGI (COMPLETO)
   - Lee folio desde localStorage (mgi_last_order_id)
   - Lee último pedido draft desde localStorage (mgi_order_last_v1)
   - Renderiza productos y totales
   - Botón: Enviar por WhatsApp con folio incluido
========================================================= */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);

  const LAST_ORDER_ID_KEY = "mgi_last_order_id";
  const LAST_ORDER_KEY = "mgi_order_last_v1";
  const WA_PHONE = "18123439492";

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

  function getOrderId() {
    return (localStorage.getItem(LAST_ORDER_ID_KEY) || "").trim();
  }

  function getLastDraft() {
    const raw = localStorage.getItem(LAST_ORDER_KEY);
    const data = safeJSONParse(raw, null);
    if (!data || typeof data !== "object") return null;

    // Sanitiza estructura mínima
    const buyer = data.buyer && typeof data.buyer === "object" ? data.buyer : {};
    const items = Array.isArray(data.items) ? data.items : [];
    const totals = data.totals && typeof data.totals === "object" ? data.totals : {};

    return {
      buyer: {
        name: String(buyer.name || "").trim(),
        phone: String(buyer.phone || "").trim(),
        email: String(buyer.email || "").trim(),
        address: String(buyer.address || "").trim(),
        note: String(buyer.note || "").trim(),
      },
      items: items
        .filter((x) => x && typeof x === "object")
        .map((x) => ({
          id: String(x.id || "").trim(),
          name: String(x.name || "Producto").trim(),
          category: String(x.category || "").trim(),
          price: round2(x.price),
          qty: Math.max(1, Number(x.qty) || 1),
          img: String(x.img || "").trim()
        }))
        .filter((x) => x.id),
      totals: {
        subtotal: round2(totals.subtotal ?? 0),
        shipping: round2(totals.shipping ?? 0),
        total: round2(totals.total ?? 0)
      }
    };
  }

  function setFolioUI(orderId) {
    const el = $("#orderId");
    if (!el) return;
    el.textContent = orderId || "—";
  }

  function renderTotals(totals) {
    const sub = $("#subtotalTxt");
    const env = $("#envioTxt");
    const tot = $("#totalTxt");

    if (sub) sub.textContent = money(totals.subtotal || 0);
    if (env) env.textContent = money(totals.shipping || 0);
    if (tot) tot.textContent = money(totals.total || 0);
  }

  function renderItems(items) {
    const wrap = $("#orderItems");
    if (!wrap) return;

    if (!items.length) {
      wrap.innerHTML = `
        <div class="conf-item">
          <div class="conf-item__info">
            <h4>No hay productos para mostrar</h4>
            <div class="conf-item__meta">
              <span class="conf-pill">Vuelve a productos para agregar artículos</span>
            </div>
          </div>
        </div>
      `;
      return;
    }

    wrap.innerHTML = items.map((it) => {
      const subtotal = round2(it.price * it.qty);
      const img = it.img || "imgs/masvendido5.webp";

      return `
        <article class="conf-item">
          <div class="conf-item__img">
            <img src="${escapeHtml(img)}" alt="${escapeHtml(it.name)}" loading="lazy">
          </div>
          <div class="conf-item__info">
            <h4>${escapeHtml(it.name)}</h4>
            <div class="conf-item__meta">
              <span class="conf-pill">Cant: <strong>${it.qty}</strong></span>
              <span class="conf-pill">Precio: <strong>${money(it.price)}</strong></span>
              <span class="conf-pill">Sub: <strong>${money(subtotal)}</strong></span>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  function buildWhatsAppMessage({ orderId, draft }) {
    const lines = [];
    lines.push("Hola Creaciones MGI, quiero confirmar mi pedido 🛒✨");
    if (orderId) lines.push(`🧾 Folio: ${orderId}`);
    lines.push("");

    if (draft?.buyer?.name) {
      lines.push("👤 Datos del comprador:");
      lines.push(`• Nombre: ${draft.buyer.name}`);
      if (draft.buyer.phone) lines.push(`• Teléfono: ${draft.buyer.phone}`);
      if (draft.buyer.email) lines.push(`• Correo: ${draft.buyer.email}`);
      if (draft.buyer.address) lines.push(`• Dirección: ${draft.buyer.address}`);
      if (draft.buyer.note) lines.push(`• Notas: ${draft.buyer.note}`);
      lines.push("");
    }

    if (draft?.items?.length) {
      lines.push("📦 Productos:");
      draft.items.forEach((it, i) => {
        lines.push(`${i + 1}) ${it.name} (x${it.qty}) — ${money(it.price)} c/u`);
      });
      lines.push("");
    }

    if (draft?.totals) {
      lines.push("💰 Totales:");
      lines.push(`• Subtotal: ${money(draft.totals.subtotal)}`);
      lines.push(`• Envío: ${money(draft.totals.shipping)}`);
      lines.push(`• Total: ${money(draft.totals.total)}`);
    }

    return lines.join("\n");
  }

  function bindWhatsButton(orderId, draft) {
    const btn = $("#btnWhatsConfirm");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const msg = buildWhatsAppMessage({ orderId, draft });
      const url = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank", "noopener");
    });
  }

  function init() {
    const orderId = getOrderId();
    const draft = getLastDraft();

    setFolioUI(orderId);

    // Si hay draft, renderiza; si no, deja todo en cero y muestra placeholder
    if (draft) {
      renderItems(draft.items);
      renderTotals(draft.totals);
    } else {
      renderItems([]);
      renderTotals({ subtotal: 0, shipping: 0, total: 0 });
    }

    bindWhatsButton(orderId, draft);

    const year = $("#anio");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();