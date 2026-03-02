/* =========================================================
   contacto.js — Creaciones MGI (COMPLETO)
   - Copiar correo / teléfono / links (data-copy-email, data-copy-text)
   - Armar y actualizar links de WhatsApp y Mail desde el formulario
   - Toast premium (sin alert)
   - Compat con Safari (fallback copy)
========================================================= */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);

  const WHATS_NUMBER = "528123439492"; // +52 81 2343 9492
  const BUSINESS_EMAIL = "creacionesmgi24@gmail.com";

  // ---------------------------
  // Utils
  // ---------------------------
  function escapeNL(str) {
    return String(str ?? "").trim();
  }

  function safeText(str) {
    return String(str ?? "").replace(/\s+/g, " ").trim();
  }

  function buildMessageFromForm() {
    const nombre = safeText($("#cNombre")?.value);
    const tel = safeText($("#cTelefono")?.value);
    const correo = safeText($("#cCorreo")?.value);
    const msg = escapeNL($("#cMensaje")?.value);

    const lines = [];
    lines.push("Hola Creaciones MGI, quiero información / cotizar:");
    lines.push("");
    lines.push(`Nombre: ${nombre || "(no proporcionado)"}`);
    lines.push(`Teléfono/WhatsApp: ${tel || "(no proporcionado)"}`);
    if (correo) lines.push(`Correo: ${correo}`);
    lines.push("");
    lines.push("Mensaje:");
    lines.push(msg || "(sin mensaje)");
    return lines.join("\n");
  }

  function buildWhatsUrl(text) {
    return `https://wa.me/${WHATS_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  function buildMailUrl(subject, body) {
    return `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  // ---------------------------
  // Toast
  // ---------------------------
  function ensureToast() {
    let t = document.querySelector(".mgi-toast");
    if (t) return t;

    t = document.createElement("div");
    t.className = "mgi-toast";
    t.setAttribute("role", "status");
    t.setAttribute("aria-live", "polite");
    document.body.appendChild(t);

    // Estilo inline mínimo (por si no lo tienes en CSS)
    t.style.position = "fixed";
    t.style.left = "50%";
    t.style.bottom = "18px";
    t.style.transform = "translateX(-50%)";
    t.style.zIndex = "99999";
    t.style.maxWidth = "min(520px, calc(100% - 24px))";
    t.style.padding = "12px 14px";
    t.style.borderRadius = "16px";
    t.style.background = "rgba(243,237,229,.96)";
    t.style.border = "1px solid rgba(0,0,0,.10)";
    t.style.boxShadow = "0 18px 34px rgba(0,0,0,.16)";
    t.style.fontWeight = "800";
    t.style.color = "rgba(0,0,0,.78)";
    t.style.opacity = "0";
    t.style.pointerEvents = "none";
    t.style.transition = "opacity 260ms ease, transform 260ms ease";
    return t;
  }

  let toastTimer = null;

  function toast(msg) {
    const t = ensureToast();
    t.textContent = msg;
    t.style.opacity = "1";
    t.style.transform = "translateX(-50%) translateY(0)";

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateX(-50%) translateY(6px)";
    }, 2200);
  }

  // ---------------------------
  // Clipboard
  // ---------------------------
  async function copyToClipboard(text) {
    const value = String(text ?? "").trim();
    if (!value) return false;

    // Intento moderno
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fallback
      try {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }
  }

  function setCopiedState(el) {
    if (!el) return;
    el.classList.add("is-copied");
    const prev = el.textContent;
    el.textContent = "¡Copiado!";
    setTimeout(() => {
      el.textContent = prev;
      el.classList.remove("is-copied");
    }, 900);
  }

  // ---------------------------
  // Handlers: copiar correo/teléfono/link y link-copy
  // ---------------------------
  function bindCopyButtons() {
    document.addEventListener("click", async (e) => {
      const btnEmail = e.target.closest("[data-copy-email]");
      const btnText = e.target.closest("[data-copy-text]");
      const linkCopy = e.target.closest(".link-copy");

      let value = "";

      if (btnEmail) value = btnEmail.getAttribute("data-copy-email") || BUSINESS_EMAIL;
      else if (btnText) value = btnText.getAttribute("data-copy-text") || "";
      else if (linkCopy) value = linkCopy.getAttribute("data-copy-email") || linkCopy.textContent || "";

      if (!value) return;

      const ok = await copyToClipboard(value);
      if (ok) {
        toast(`Copiado: ${value}`);
        setCopiedState(btnEmail || btnText || linkCopy);
      } else {
        // último recurso
        window.prompt("Copia esto:", value);
      }
    });
  }

  // ---------------------------
  // Form: actualizar links Whats/Mail
  // ---------------------------
  function bindContactForm() {
    const form = $("#contactoForm");
    const btnWhats = $("#cEnviarWhats");
    const btnMail = $("#cEnviarMail");

    if (!form || !btnWhats || !btnMail) return;

    const subject = "Contacto / Cotización - Creaciones MGI";

    const updateLinks = () => {
      const msg = buildMessageFromForm();
      btnWhats.href = buildWhatsUrl(msg);
      btnMail.href = buildMailUrl(subject, msg);
    };

    form.addEventListener("input", updateLinks);
    form.addEventListener("change", updateLinks);
    form.addEventListener("submit", (ev) => ev.preventDefault());

    updateLinks();
  }

  // ---------------------------
  // Init
  // ---------------------------
  function init() {
    bindCopyButtons();
    bindContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();