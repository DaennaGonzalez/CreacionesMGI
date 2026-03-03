/* =========================================================
   CREACIONES MGI — blog.js (CORREGIDO + ALINEADO CON HTML/CSS NUEVOS)
   Blog principal (blog.html):
   - Renderiza tarjetas desde un arreglo (35 artículos)
   - Filtros por categoría (chips)
   - Búsqueda por texto (submit + live)
   - Paginación con ellipsis
   - Meta dinámico (#blogMeta)
   - Scroll suave al listado
   - Prev/Next recalculan páginas sin errores
   - Empty state (#blogEmpty) ahora sí se muestra/oculta
   - Clases alineadas con blog.css:
       ✅ paginación usa .blog-page-btn (CSS ya la estiliza)
       ✅ tag usa .blog-tag (CSS ya la estiliza)
========================================================= */

(() => {
  "use strict";

  /* -------------------------
     CONFIG
  ------------------------- */
  const POSTS_PER_PAGE = 12;
  const IMG_BASE = "imgs/blog/"; // carpeta de imágenes

  /* -------------------------
     DATA (35 artículos)
  ------------------------- */
  // category: regalos | eventos | xv | bodas | cumple | cuidados | tips | temporada
  const posts = [
    { id: 1,  slug: "blog-01.html", img: "blog-01.webp", category: "regalos",
      title: "5 ideas de regalos personalizados que nunca fallan",
      excerpt: "Opciones en MDF y acrílico ideales para cumpleaños, aniversarios y ocasiones especiales." },

    { id: 2,  slug: "blog-02.html", img: "blog-02.webp", category: "eventos",
      title: "Cómo elegir la caja perfecta para sobres: XV vs Boda",
      excerpt: "Medidas, estilos y tips para que tu caja se vea elegante y funcional." },

    { id: 3,  slug: "blog-03.html", img: "blog-03.webp", category: "temporada",
      title: "Tendencias en decoración de cumpleaños 2026",
      excerpt: "Colores, temáticas y detalles que hacen que tu celebración se vea moderna y fotogénica." },

    { id: 4,  slug: "blog-04.html", img: "blog-04.webp", category: "eventos",
      title: "Ideas para mesas de dulces con letreros personalizados",
      excerpt: "Qué piezas sí o sí necesitas para que tu mesa se vea completa e impactante en fotos." },

    { id: 5,  slug: "blog-05.html", img: "blog-05.webp", category: "bodas",
      title: "Cómo lograr que tu boda se vea más elegante con MDF y acrílico",
      excerpt: "Señalética, caja para sobres y letreros con acabado premium que elevan tu evento." },

    { id: 6,  slug: "blog-06.html", img: "blog-06.webp", category: "xv",
      title: "Qué detalles hacen que un XV años se vea inolvidable",
      excerpt: "Caja para sobres, centros de mesa y letreros: el combo que siempre luce increíble." },

    { id: 7,  slug: "blog-07.html", img: "blog-07.webp", category: "eventos",
      title: "Decoración religiosa personalizada: bautizo y primera comunión",
      excerpt: "Ideas delicadas con cruces, palomas, toppers y piezas que se ven súper bonitas." },

    { id: 8,  slug: "blog-08.html", img: "blog-08.webp", category: "tips",
      title: "Ideas económicas para decorar un evento sin perder estilo",
      excerpt: "Cómo armar decoración bonita con pocas piezas clave y buena combinación de colores." },

    { id: 9,  slug: "blog-09.html", img: "blog-09.webp", category: "tips",
      title: "Cómo personalizar un letrero con nombre: guía rápida",
      excerpt: "Qué datos enviar, tipografías, medidas y colores para que quede perfecto." },

    { id: 10, slug: "blog-10.html", img: "blog-10.webp", category: "tips",
      title: "Errores comunes al pedir decoración personalizada (y cómo evitarlos)",
      excerpt: "Medidas, fechas, colores… los detalles que hacen la diferencia al cotizar." },

    { id: 11, slug: "blog-11.html", img: "blog-11.webp", category: "tips",
      title: "MDF vs Acrílico: ¿cuál elegir para tu diseño?",
      excerpt: "Comparación clara: estética, precio, durabilidad y uso ideal en cada material." },

    { id: 12, slug: "blog-12.html", img: "blog-12.webp", category: "cuidados",
      title: "Cuidados de tus piezas: cómo mantener MDF y acrílico como nuevos",
      excerpt: "Tips de limpieza, almacenamiento y qué evitar para que duren más." },

    { id: 13, slug: "blog-13.html", img: "blog-13.webp", category: "regalos",
      title: "Regalos personalizados que sorprenden (aunque digan que “no quieren nada”)",
      excerpt: "Ideas creativas para regalar con nombre, fecha o frase que sí se siente especial." },

    { id: 14, slug: "blog-14.html", img: "blog-14.webp", category: "tips",
      title: "Cómo elegir colores para un diseño que combine perfecto",
      excerpt: "Guía fácil de combinaciones y tips para que tus piezas se vean armoniosas." },

    { id: 15, slug: "blog-15.html", img: "blog-15.webp", category: "temporada",
      title: "Ideas de regalos personalizados para Día del Maestro",
      excerpt: "Lapiceras, placas, frases y detalles útiles que se ven bonitos y se usan." },

    { id: 16, slug: "blog-16.html", img: "blog-16.webp", category: "temporada",
      title: "Regalos para mamá que realmente emocionan",
      excerpt: "Opciones en MDF y acrílico con mensaje y detalle emocional (sin lo típico)." },

    { id: 17, slug: "blog-17.html", img: "blog-17.webp", category: "regalos",
      title: "Qué poner dentro de una caja personalizada para que sea inolvidable",
      excerpt: "Ideas para rellenarla, decorarla y hacerla ver premium desde que la abren." },

    { id: 18, slug: "blog-18.html", img: "blog-18.webp", category: "tips",
      title: "Cómo convertir una idea sencilla en un diseño increíble",
      excerpt: "Consejos para aterrizar tu idea: referencias, colores, texto y estilo." },

    { id: 19, slug: "blog-19.html", img: "blog-19.webp", category: "cumple",
      title: "Decoración temática infantil: Mario, Minecraft y más",
      excerpt: "Cómo elegir piezas clave para que tu fiesta temática se vea completa." },

    { id: 20, slug: "blog-20.html", img: "blog-20.webp", category: "temporada",
      title: "Cómo preparar tu altar de Día de Muertos personalizado",
      excerpt: "Elementos esenciales, ideas creativas y cómo incorporar MDF con estilo." },

    { id: 21, slug: "blog-21.html", img: "blog-21.webp", category: "temporada",
      title: "Ideas creativas para Pascua con MDF",
      excerpt: "Decoraciones y detalles personalizados para canastas, mesas y regalos." },

    { id: 22, slug: "blog-22.html", img: "blog-22.webp", category: "bodas",
      title: "Decoración elegante para bodas modernas",
      excerpt: "Minimalismo, acrílico, letreros y piezas que se ven súper premium." },

    { id: 23, slug: "blog-23.html", img: "blog-23.webp", category: "cumple",
      title: "Letreros Happy Birthday grandes: cómo elegir el ideal",
      excerpt: "Tamaños, dónde colocarlos y tips para que luzcan en fotos." },

    { id: 24, slug: "blog-24.html", img: "blog-24.webp", category: "eventos",
      title: "Cómo elegir el centro de mesa ideal según tu evento",
      excerpt: "Altura, colores, cantidad y estilo para bodas, XV y cumpleaños." },

    { id: 25, slug: "blog-25.html", img: "blog-25.webp", category: "eventos",
      title: "Personalización geek: haz que tu evento destaque",
      excerpt: "Ideas para temáticas diferentes, colores vibrantes y detalles únicos." },

    { id: 26, slug: "blog-26.html", img: "blog-26.webp", category: "cuidados",
      title: "Cuidados básicos para que tus piezas duren años",
      excerpt: "MDF y acrílico: cómo limpiar sin maltratar y cómo guardarlas." },

    { id: 27, slug: "blog-27.html", img: "blog-27.webp", category: "tips",
      title: "Cómo medir correctamente antes de pedir un letrero",
      excerpt: "Guía práctica para medir espacios y evitar que el letrero quede pequeño o enorme." },

    { id: 28, slug: "blog-28.html", img: "blog-28.webp", category: "tips",
      title: "¿Con cuánta anticipación debo pedir decoración personalizada?",
      excerpt: "Tiempos recomendados según evento y volumen para evitar prisas." },

    { id: 29, slug: "blog-29.html", img: "blog-29.webp", category: "tips",
      title: "Cómo cotizar rápido y sin errores (checklist)",
      excerpt: "Lo que necesitas mandar para cotización: medidas, colores, texto, fecha y referencias." },

    { id: 30, slug: "blog-30.html", img: "blog-30.webp", category: "tips",
      title: "Qué detalles hacen que una caja se vea premium",
      excerpt: "Acabados, combinaciones MDF + acrílico y trucos visuales que elevan el diseño." },

    { id: 31, slug: "blog-31.html", img: "blog-31.webp", category: "tips",
      title: "Cómo elegir el tamaño ideal según tu evento",
      excerpt: "Proporciones, espacios y dónde se colocan tus piezas para que luzcan." },

    { id: 32, slug: "blog-32.html", img: "blog-32.webp", category: "tips",
      title: "Diferencia entre grabado y corte láser (sin complicaciones)",
      excerpt: "Qué es cada uno, cómo se ve el resultado y cuándo conviene usarlo." },

    { id: 33, slug: "blog-33.html", img: "blog-33.webp", category: "eventos",
      title: "Señalética para negocios en acrílico: ideas que sí venden",
      excerpt: "Letreros, avisos, nombres y piezas decorativas para elevar tu espacio." },

    { id: 34, slug: "blog-34.html", img: "blog-34.webp", category: "tips",
      title: "Cómo combinar MDF y acrílico para un efecto moderno",
      excerpt: "Combinaciones de color, capas y estilos que se ven actuales y elegantes." },

    { id: 35, slug: "blog-35.html", img: "blog-35.webp", category: "eventos",
      title: "Por qué los detalles personalizados hacen que tu evento se recuerde más",
      excerpt: "Impacto visual, fotos, emoción y cómo un detalle puede cambiarlo todo." },
  ];

  /* -------------------------
     HELPERS
  ------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const normalize = (str) =>
    (str || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function escapeHTML(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(str) {
    return escapeHTML(str).replaceAll("`", "&#096;");
  }

  /* -------------------------
     CATEGORY LABELS
  ------------------------- */
  function categoryLabel(cat) {
    const map = {
      all: "✨ Todo",
      regalos: "🎁 Regalos",
      eventos: "🎉 Eventos",
      xv: "👑 XV",
      bodas: "👰 Bodas",
      cumple: "🎂 Cumpleaños",
      cuidados: "🧼 Cuidados",
      tips: "📌 Tips",
      temporada: "🗓️ Temporada",
    };
    return map[cat] || "📌 Blog";
  }

  /* -------------------------
     ELEMENTS
  ------------------------- */
  const gridEl = $("#blogGrid");
  const metaEl = $("#blogMeta");
  const emptyEl = $("#blogEmpty");

  const pagesEl = $("#blogPages");
  const prevBtn = $("#blogPrev");
  const nextBtn = $("#blogNext");

  const chips = $$(".blog-chip");
  const searchForm = $("#blogSearchForm");
  const searchInput = $("#blogSearch");

  const subscribeForm = $("#blogSubscribeForm"); // opcional

  // Si falta el grid, no hacemos nada
  if (!gridEl) return;

  /* -------------------------
     STATE
  ------------------------- */
  const state = {
    filter: "all",
    query: "",
    page: 1,
  };

  /* -------------------------
     FILTER + SEARCH
  ------------------------- */
  function getFilteredPosts() {
    const q = normalize(state.query);

    return posts.filter((p) => {
      const matchesFilter =
        state.filter === "all" ? true : p.category === state.filter;

      const matchesQuery = !q
        ? true
        : normalize(p.title).includes(q) || normalize(p.excerpt).includes(q);

      return matchesFilter && matchesQuery;
    });
  }

  function getTotalPages(totalItems) {
    return Math.max(1, Math.ceil(totalItems / POSTS_PER_PAGE));
  }

  /* -------------------------
     RENDER
  ------------------------- */
  function render() {
    const filtered = getFilteredPosts();
    const total = filtered.length;

    const totalPages = getTotalPages(total);
    state.page = clamp(state.page, 1, totalPages);

    const start = (state.page - 1) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    const pageItems = filtered.slice(start, end);

    // Meta
    if (metaEl) {
      const from = total === 0 ? 0 : start + 1;
      const to = total === 0 ? 0 : Math.min(end, total);
      metaEl.textContent =
        total === 0
          ? "No encontramos artículos con esos filtros."
          : `Mostrando ${from}–${to} de ${total} artículos.`;
    }

    // Empty
    if (emptyEl) {
      emptyEl.hidden = total !== 0;
    }

    // Grid
    gridEl.innerHTML = pageItems.map(postCardHTML).join("");

    // Pagination
    renderPagination(totalPages);

    // Prev/Next disabled
    if (prevBtn) prevBtn.disabled = state.page <= 1;
    if (nextBtn) nextBtn.disabled = state.page >= totalPages;
  }

  function postCardHTML(p) {
    const imgSrc = `${IMG_BASE}${p.img}`;
    const catLabel = categoryLabel(p.category);

    return `
      <article class="blog-card" data-category="${escapeAttr(p.category)}">
        <a href="${escapeAttr(p.slug)}" class="blog-card__image" aria-label="Abrir: ${escapeAttr(p.title)}">
          <img src="${escapeAttr(imgSrc)}" alt="${escapeAttr(p.title)}" loading="lazy">
        </a>

        <div class="blog-card__content">
          <span class="blog-tag">${escapeHTML(catLabel)}</span>
          <h3>${escapeHTML(p.title)}</h3>
          <p>${escapeHTML(p.excerpt)}</p>

          <a href="${escapeAttr(p.slug)}" class="blog-readmore">Leer más</a>
        </div>
      </article>
    `;
  }

  function renderPagination(totalPages) {
    if (!pagesEl) return;

    const p = state.page;
    const items = [];

    const pushBtn = (page, label = String(page), isActive = false) => {
      items.push(`
        <button type="button"
          class="blog-page-btn ${isActive ? "is-active" : ""}"
          data-page="${page}">
          ${escapeHTML(label)}
        </button>
      `);
    };

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pushBtn(i, String(i), i === p);
    } else {
      pushBtn(1, "1", p === 1);

      if (p > 3) items.push(`<span class="blog-ellipsis" aria-hidden="true">…</span>`);

      const start = clamp(p - 1, 2, totalPages - 1);
      const end = clamp(p + 1, 2, totalPages - 1);

      for (let i = start; i <= end; i++) pushBtn(i, String(i), i === p);

      if (p < totalPages - 2) items.push(`<span class="blog-ellipsis" aria-hidden="true">…</span>`);

      pushBtn(totalPages, String(totalPages), p === totalPages);
    }

    pagesEl.innerHTML = items.join("");

    // Listeners de botones de página
    $$(".blog-page-btn", pagesEl).forEach((btn) => {
      btn.addEventListener("click", () => {
        const page = Number(btn.dataset.page);
        if (!Number.isFinite(page)) return;
        state.page = page;
        render();
        scrollToList();
      });
    });
  }

  function scrollToList() {
    const anchor = $(".blog-list") || $("#articulos") || gridEl;
    if (!anchor) return;
    anchor.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* -------------------------
     EVENTS
  ------------------------- */
  // Chips (filtro)
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter || "all";
      state.filter = filter;
      state.page = 1;

      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");

      render();
      scrollToList();
    });
  });

  // Search (submit + live input)
  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      state.query = searchInput.value || "";
      state.page = 1;
      render();
      scrollToList();
    });

    searchInput.addEventListener("input", () => {
      state.query = searchInput.value || "";
      state.page = 1;
      render();
    });
  }

  // Prev / Next
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      state.page = Math.max(1, state.page - 1);
      render();
      scrollToList();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const totalPages = getTotalPages(getFilteredPosts().length);
      state.page = Math.min(totalPages, state.page + 1);
      render();
      scrollToList();
    });
  }

  // Suscripción (demo opcional)
  if (subscribeForm) {
    subscribeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(subscribeForm);

      const nombre = (fd.get("nombre") || "").toString().trim();
      const correo = (fd.get("correo") || "").toString().trim();

      alert(`¡Listo! Gracias${nombre ? `, ${nombre}` : ""}. Te suscribiste con: ${correo || "tu correo"}.`);
      subscribeForm.reset();
    });
  }

  /* -------------------------
     INIT
  ------------------------- */
  render();
})();