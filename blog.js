/* =========================================================
   BLOG.JS — CREACIONES MGI
   Blog principal:
   - Renderiza artículos desde arreglo
   - Filtros por categoría
   - Búsqueda en vivo y por botón
   - Paginación con ellipsis
   - Meta dinámico
   - Empty state
   - Cards compatibles con blog.css
   - Highlights del hero que activan filtros
   - Menú hamburguesa corregido
   - Animaciones reveal
========================================================= */

(() => {
  "use strict";

  /* =========================================================
     1. CONFIGURACIÓN
  ========================================================= */

  const CONFIG = {
    POSTS_PER_PAGE: 12,
    IMG_BASE: "imgs/blog/",
    WHATSAPP_NUMBER: "5218123439492",
    DEBUG: false
  };

  /* =========================================================
     2. DATA DE ARTÍCULOS
     category:
     regalos | eventos | xv | bodas | cumple | cuidados | tips | temporada
  ========================================================= */

  const posts = [
    {
      id: 1,
      slug: "blog-01.html",
      img: "blog-01.webp",
      category: "regalos",
      title: "5 ideas de regalos personalizados que nunca fallan",
      excerpt: "Opciones en MDF y acrílico ideales para cumpleaños, aniversarios y ocasiones especiales."
    },
    {
      id: 2,
      slug: "blog-02.html",
      img: "blog-02.webp",
      category: "eventos",
      title: "Cómo elegir la caja perfecta para sobres: XV vs Boda",
      excerpt: "Medidas, estilos y tips para que tu caja se vea elegante y funcional."
    },
    {
      id: 3,
      slug: "blog-03.html",
      img: "blog-03.webp",
      category: "temporada",
      title: "Tendencias en decoración de cumpleaños 2026",
      excerpt: "Colores, temáticas y detalles que hacen que tu celebración se vea moderna y fotogénica."
    },
    {
      id: 4,
      slug: "blog-04.html",
      img: "blog-04.webp",
      category: "eventos",
      title: "Ideas para mesas de dulces con letreros personalizados",
      excerpt: "Qué piezas sí o sí necesitas para que tu mesa se vea completa e impactante en fotos."
    },
    {
      id: 5,
      slug: "blog-05.html",
      img: "blog-05.webp",
      category: "bodas",
      title: "Cómo lograr que tu boda se vea más elegante con MDF y acrílico",
      excerpt: "Señalética, caja para sobres y letreros con acabado premium que elevan tu evento."
    },
    {
      id: 6,
      slug: "blog-06.html",
      img: "blog-06.webp",
      category: "xv",
      title: "Qué detalles hacen que un XV años se vea inolvidable",
      excerpt: "Caja para sobres, centros de mesa y letreros: el combo que siempre luce increíble."
    },
    {
      id: 7,
      slug: "blog-07.html",
      img: "blog-07.webp",
      category: "eventos",
      title: "Decoración religiosa personalizada: bautizo y primera comunión",
      excerpt: "Ideas delicadas con cruces, palomas, toppers y piezas que se ven súper bonitas."
    },
    {
      id: 8,
      slug: "blog-08.html",
      img: "blog-08.webp",
      category: "tips",
      title: "Ideas económicas para decorar un evento sin perder estilo",
      excerpt: "Cómo armar decoración bonita con pocas piezas clave y buena combinación de colores."
    },
    {
      id: 9,
      slug: "blog-09.html",
      img: "blog-09.webp",
      category: "tips",
      title: "Cómo personalizar un letrero con nombre: guía rápida",
      excerpt: "Qué datos enviar, tipografías, medidas y colores para que quede perfecto."
    },
    {
      id: 10,
      slug: "blog-10.html",
      img: "blog-10.webp",
      category: "tips",
      title: "Errores comunes al pedir decoración personalizada y cómo evitarlos",
      excerpt: "Medidas, fechas, colores… los detalles que hacen la diferencia al cotizar."
    },
    {
      id: 11,
      slug: "blog-11.html",
      img: "blog-11.webp",
      category: "tips",
      title: "MDF vs Acrílico: cuál elegir para tu diseño",
      excerpt: "Comparación clara: estética, precio, durabilidad y uso ideal en cada material."
    },
    {
      id: 12,
      slug: "blog-12.html",
      img: "blog-12.webp",
      category: "cuidados",
      title: "Cuidados de tus piezas: cómo mantener MDF y acrílico como nuevos",
      excerpt: "Tips de limpieza, almacenamiento y qué evitar para que duren más."
    },
    {
      id: 13,
      slug: "blog-13.html",
      img: "blog-13.webp",
      category: "regalos",
      title: "Regalos personalizados que sorprenden aunque digan que no quieren nada",
      excerpt: "Ideas creativas para regalar con nombre, fecha o frase que sí se siente especial."
    },
    {
      id: 14,
      slug: "blog-14.html",
      img: "blog-14.webp",
      category: "tips",
      title: "Cómo elegir colores para un diseño que combine perfecto",
      excerpt: "Guía fácil de combinaciones y tips para que tus piezas se vean armoniosas."
    },
    {
      id: 15,
      slug: "blog-15.html",
      img: "blog-15.webp",
      category: "temporada",
      title: "Ideas de regalos personalizados para Día del Maestro",
      excerpt: "Lapiceras, placas, frases y detalles útiles que se ven bonitos y se usan."
    },
    {
      id: 16,
      slug: "blog-16.html",
      img: "blog-16.webp",
      category: "temporada",
      title: "Regalos para mamá que realmente emocionan",
      excerpt: "Opciones en MDF y acrílico con mensaje y detalle emocional sin caer en lo típico."
    },
    {
      id: 17,
      slug: "blog-17.html",
      img: "blog-17.webp",
      category: "regalos",
      title: "Qué poner dentro de una caja personalizada para que sea inolvidable",
      excerpt: "Ideas para rellenarla, decorarla y hacerla ver premium desde que la abren."
    },
    {
      id: 18,
      slug: "blog-18.html",
      img: "blog-18.webp",
      category: "tips",
      title: "Cómo convertir una idea sencilla en un diseño increíble",
      excerpt: "Consejos para aterrizar tu idea: referencias, colores, texto y estilo."
    },
    {
      id: 19,
      slug: "blog-19.html",
      img: "blog-19.webp",
      category: "cumple",
      title: "Decoración temática infantil: Mario, Minecraft y más",
      excerpt: "Cómo elegir piezas clave para que tu fiesta temática se vea completa."
    },
    {
      id: 20,
      slug: "blog-20.html",
      img: "blog-20.webp",
      category: "temporada",
      title: "Cómo preparar tu altar de Día de Muertos personalizado",
      excerpt: "Elementos esenciales, ideas creativas y cómo incorporar MDF con estilo."
    },
    {
      id: 21,
      slug: "blog-21.html",
      img: "blog-21.webp",
      category: "temporada",
      title: "Ideas creativas para Pascua con MDF",
      excerpt: "Decoraciones y detalles personalizados para canastas, mesas y regalos."
    },
    {
      id: 22,
      slug: "blog-22.html",
      img: "blog-22.webp",
      category: "bodas",
      title: "Decoración elegante para bodas modernas",
      excerpt: "Minimalismo, acrílico, letreros y piezas que se ven súper premium."
    },
    {
      id: 23,
      slug: "blog-23.html",
      img: "blog-23.webp",
      category: "cumple",
      title: "Letreros Happy Birthday grandes: cómo elegir el ideal",
      excerpt: "Tamaños, dónde colocarlos y tips para que luzcan en fotos."
    },
    {
      id: 24,
      slug: "blog-24.html",
      img: "blog-24.webp",
      category: "eventos",
      title: "Cómo elegir el centro de mesa ideal según tu evento",
      excerpt: "Altura, colores, cantidad y estilo para bodas, XV y cumpleaños."
    },
    {
      id: 25,
      slug: "blog-25.html",
      img: "blog-25.webp",
      category: "eventos",
      title: "Personalización geek: haz que tu evento destaque",
      excerpt: "Ideas para temáticas diferentes, colores vibrantes y detalles únicos."
    },
    {
      id: 26,
      slug: "blog-26.html",
      img: "blog-26.webp",
      category: "cuidados",
      title: "Cuidados básicos para que tus piezas duren años",
      excerpt: "MDF y acrílico: cómo limpiar sin maltratar y cómo guardarlas."
    },
    {
      id: 27,
      slug: "blog-27.html",
      img: "blog-27.webp",
      category: "tips",
      title: "Cómo medir correctamente antes de pedir un letrero",
      excerpt: "Guía práctica para medir espacios y evitar que el letrero quede pequeño o enorme."
    },
    {
      id: 28,
      slug: "blog-28.html",
      img: "blog-28.webp",
      category: "tips",
      title: "Con cuánta anticipación debo pedir decoración personalizada",
      excerpt: "Tiempos recomendados según evento y volumen para evitar prisas."
    },
    {
      id: 29,
      slug: "blog-29.html",
      img: "blog-29.webp",
      category: "tips",
      title: "Cómo cotizar rápido y sin errores: checklist",
      excerpt: "Lo que necesitas mandar para cotización: medidas, colores, texto, fecha y referencias."
    },
    {
      id: 30,
      slug: "blog-30.html",
      img: "blog-16.webp",
      category: "tips",
      title: "Qué detalles hacen que una caja se vea premium",
      excerpt: "Acabados, combinaciones MDF + acrílico y trucos visuales que elevan el diseño."
    },
    {
      id: 31,
      slug: "blog-31.html",
      img: "blog-31.webp",
      category: "tips",
      title: "Cómo elegir el tamaño ideal según tu evento",
      excerpt: "Proporciones, espacios y dónde se colocan tus piezas para que luzcan."
    },
    {
      id: 32,
      slug: "blog-32.html",
      img: "blog-32.webp",
      category: "tips",
      title: "Diferencia entre grabado y corte láser sin complicaciones",
      excerpt: "Qué es cada uno, cómo se ve el resultado y cuándo conviene usarlo."
    },
    {
      id: 33,
      slug: "blog-33.html",
      img: "blog-33.webp",
      category: "eventos",
      title: "Señalética para negocios en acrílico: ideas que sí venden",
      excerpt: "Letreros, avisos, nombres y piezas decorativas para elevar tu espacio."
    },
    {
      id: 34,
      slug: "blog-34.html",
      img: "blog-34.webp",
      category: "tips",
      title: "Cómo combinar MDF y acrílico para un efecto moderno",
      excerpt: "Combinaciones de color, capas y estilos que se ven actuales y elegantes."
    },
    {
      id: 35,
      slug: "blog-35.html",
      img: "blog-35.webp",
      category: "eventos",
      title: "Por qué los detalles personalizados hacen que tu evento se recuerde más",
      excerpt: "Impacto visual, fotos, emoción y cómo un detalle puede cambiarlo todo."
    }
  ];

  /* =========================================================
     3. HELPERS
  ========================================================= */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function log(...args) {
    if (CONFIG.DEBUG) console.log("[MGI Blog]", ...args);
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function clamp(number, min, max) {
    return Math.max(min, Math.min(max, number));
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHTML(value).replaceAll("`", "&#096;");
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

  function buildWhatsAppUrl(message) {
    return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function categoryLabel(category) {
    const map = {
      all: "✨ Todo",
      regalos: "🎁 Regalos",
      eventos: "🎉 Eventos",
      xv: "👑 XV",
      bodas: "👰 Bodas",
      cumple: "🎂 Cumpleaños",
      cuidados: "🧼 Cuidados",
      tips: "📌 Tips",
      temporada: "🗓️ Temporada"
    };

    return map[category] || "📌 Blog";
  }

  function getCategoryText(category) {
    const map = {
      all: "Todo",
      regalos: "Regalos",
      eventos: "Eventos",
      xv: "XV años",
      bodas: "Bodas",
      cumple: "Cumpleaños",
      cuidados: "Cuidados",
      tips: "Tips",
      temporada: "Temporada"
    };

    return map[category] || "Blog";
  }

  /* =========================================================
     4. ELEMENTOS
  ========================================================= */

  const elements = {
    grid: $("#blogGrid"),
    meta: $("#blogMeta"),
    empty: $("#blogEmpty"),
    pages: $("#blogPages"),
    prev: $("#blogPrev"),
    next: $("#blogNext"),
    chips: $$(".blog-chip"),
    searchForm: $("#blogSearchForm"),
    searchInput: $("#blogSearch"),
    highlightLinks: $$("[data-blog-jump-filter]"),
    subscribeForm: $("#blogSubscribeForm")
  };

  if (!elements.grid) {
    log("No existe #blogGrid. Blog.js detenido.");
    return;
  }

  /* =========================================================
     5. ESTADO
  ========================================================= */

  const state = {
    filter: "all",
    query: "",
    page: 1
  };

  /* =========================================================
     6. FILTRADO
  ========================================================= */

  function getFilteredPosts() {
    const query = normalize(state.query);

    return posts.filter((post) => {
      const matchesFilter =
        state.filter === "all" || post.category === state.filter;

      const searchable = normalize([
        post.title,
        post.excerpt,
        post.category,
        getCategoryText(post.category),
        categoryLabel(post.category)
      ].join(" "));

      const matchesQuery =
        !query || searchable.includes(query);

      return matchesFilter && matchesQuery;
    });
  }

  function getTotalPages(totalItems) {
    return Math.max(1, Math.ceil(totalItems / CONFIG.POSTS_PER_PAGE));
  }

  /* =========================================================
     7. RENDER PRINCIPAL
  ========================================================= */

  function render() {
    const filtered = getFilteredPosts();
    const total = filtered.length;

    const totalPages = getTotalPages(total);
    state.page = clamp(state.page, 1, totalPages);

    const start = (state.page - 1) * CONFIG.POSTS_PER_PAGE;
    const end = start + CONFIG.POSTS_PER_PAGE;
    const pageItems = filtered.slice(start, end);

    renderMeta(total, start, end);
    renderEmpty(total);
    renderGrid(pageItems);
    renderPagination(totalPages);
    updatePrevNext(totalPages);
    updateUrlState();
    setupRevealAnimations(true);
  }

  function renderMeta(total, start, end) {
    if (!elements.meta) return;

    const category = getCategoryText(state.filter);
    const query = state.query.trim();

    if (total === 0) {
      elements.meta.textContent = query
        ? `No encontramos artículos para "${query}" en ${category}.`
        : `No encontramos artículos en ${category}.`;
      return;
    }

    const from = start + 1;
    const to = Math.min(end, total);

    const queryText = query ? ` con búsqueda "${query}"` : "";
    const categoryText = state.filter === "all" ? "todas las categorías" : category;

    elements.meta.textContent =
      `Mostrando ${from}–${to} de ${total} artículos en ${categoryText}${queryText}.`;
  }

  function renderEmpty(total) {
    if (!elements.empty) return;
    elements.empty.hidden = total !== 0;
  }

  function renderGrid(pageItems) {
    elements.grid.innerHTML = pageItems.map(postCardHTML).join("");
  }

  function postCardHTML(post) {
    const imgSrc = `${CONFIG.IMG_BASE}${post.img}`;
    const catLabel = categoryLabel(post.category);

    return `
      <article class="blog-card" data-category="${escapeAttr(post.category)}" data-animate="up">
        <a
          href="${escapeAttr(post.slug)}"
          class="blog-card__image"
          aria-label="Abrir artículo: ${escapeAttr(post.title)}"
        >
          <img
            src="${escapeAttr(imgSrc)}"
            alt="${escapeAttr(post.title)}"
            loading="lazy"
          />
        </a>

        <div class="blog-card__content">
          <span class="blog-tag">${escapeHTML(catLabel)}</span>

          <h3>${escapeHTML(post.title)}</h3>

          <p>${escapeHTML(post.excerpt)}</p>

          <a href="${escapeAttr(post.slug)}" class="blog-readmore">
            Leer más
          </a>
        </div>
      </article>
    `;
  }

  /* =========================================================
     8. PAGINACIÓN
  ========================================================= */

  function renderPagination(totalPages) {
    if (!elements.pages) return;

    const current = state.page;
    const items = [];

    const pushButton = (page, label = String(page), isActive = false) => {
      items.push(`
        <button
          type="button"
          class="blog-page-btn ${isActive ? "is-active" : ""}"
          data-page="${page}"
          aria-label="Ir a la página ${page}"
          ${isActive ? 'aria-current="page"' : ""}
        >
          ${escapeHTML(label)}
        </button>
      `);
    };

    const pushEllipsis = () => {
      items.push(`<span class="blog-ellipsis" aria-hidden="true">…</span>`);
    };

    if (totalPages <= 7) {
      for (let page = 1; page <= totalPages; page++) {
        pushButton(page, String(page), page === current);
      }
    } else {
      pushButton(1, "1", current === 1);

      if (current > 3) pushEllipsis();

      const start = clamp(current - 1, 2, totalPages - 1);
      const end = clamp(current + 1, 2, totalPages - 1);

      for (let page = start; page <= end; page++) {
        pushButton(page, String(page), page === current);
      }

      if (current < totalPages - 2) pushEllipsis();

      pushButton(totalPages, String(totalPages), current === totalPages);
    }

    elements.pages.innerHTML = items.join("");

    $$(".blog-page-btn", elements.pages).forEach((button) => {
      button.addEventListener("click", () => {
        const page = Number(button.dataset.page);

        if (!Number.isFinite(page)) return;

        state.page = page;
        render();
        scrollToList();
      });
    });
  }

  function updatePrevNext(totalPages) {
    if (elements.prev) {
      elements.prev.disabled = state.page <= 1;
      elements.prev.setAttribute("aria-disabled", state.page <= 1 ? "true" : "false");
    }

    if (elements.next) {
      elements.next.disabled = state.page >= totalPages;
      elements.next.setAttribute("aria-disabled", state.page >= totalPages ? "true" : "false");
    }
  }

  /* =========================================================
     9. URL STATE OPCIONAL
  ========================================================= */

  function readUrlState() {
    const params = new URLSearchParams(window.location.search);

    const filter = params.get("tema");
    const query = params.get("buscar");
    const page = Number(params.get("pagina"));

    if (filter && hasFilter(filter)) {
      state.filter = filter;
    }

    if (query) {
      state.query = query.trim();

      if (elements.searchInput) {
        elements.searchInput.value = state.query;
      }
    }

    if (Number.isFinite(page) && page > 0) {
      state.page = page;
    }

    updateActiveChip();
  }

  function updateUrlState() {
    const params = new URLSearchParams();

    if (state.filter !== "all") {
      params.set("tema", state.filter);
    }

    if (state.query.trim()) {
      params.set("buscar", state.query.trim());
    }

    if (state.page > 1) {
      params.set("pagina", String(state.page));
    }

    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState({}, "", newUrl);
  }

  function hasFilter(filter) {
    return elements.chips.some((chip) => chip.dataset.filter === filter);
  }

  /* =========================================================
     10. EVENTOS DE FILTROS Y BÚSQUEDA
  ========================================================= */

  function setupFilters() {
    elements.chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const filter = chip.dataset.filter || "all";

        setFilter(filter, {
          shouldScroll: true
        });
      });
    });
  }

  function setFilter(filter, options = {}) {
    if (!hasFilter(filter)) return;

    state.filter = filter;
    state.page = 1;

    updateActiveChip();
    render();

    if (options.shouldScroll) {
      scrollToList();
    }
  }

  function updateActiveChip() {
    elements.chips.forEach((chip) => {
      const isActive = chip.dataset.filter === state.filter;

      chip.classList.toggle("is-active", isActive);
      chip.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  function setupSearch() {
    if (!elements.searchForm || !elements.searchInput) return;

    elements.searchForm.addEventListener("submit", (event) => {
      event.preventDefault();

      state.query = elements.searchInput.value.trim();
      state.page = 1;

      render();
      scrollToList();
    });

    elements.searchInput.addEventListener("input", () => {
      state.query = elements.searchInput.value.trim();
      state.page = 1;

      render();
    });

    elements.searchInput.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;

      elements.searchInput.value = "";
      state.query = "";
      state.page = 1;

      render();
    });
  }

  function setupHeroHighlights() {
    elements.highlightLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const filter = link.dataset.blogJumpFilter;

        if (!filter || !hasFilter(filter)) return;

        event.preventDefault();

        setFilter(filter, {
          shouldScroll: true
        });
      });
    });
  }

  /* =========================================================
     11. PREV / NEXT
  ========================================================= */

  function setupPaginationControls() {
    if (elements.prev) {
      elements.prev.addEventListener("click", () => {
        if (state.page <= 1) return;

        state.page -= 1;
        render();
        scrollToList();
      });
    }

    if (elements.next) {
      elements.next.addEventListener("click", () => {
        const totalPages = getTotalPages(getFilteredPosts().length);

        if (state.page >= totalPages) return;

        state.page += 1;
        render();
        scrollToList();
      });
    }
  }

  /* =========================================================
     12. SCROLL
  ========================================================= */

  function scrollToList() {
    const target = $(".blog-list") || $("#articulos") || elements.grid;
    if (!target) return;

    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      getHeaderOffset() -
      18;

    window.scrollTo({
      top: Math.max(top, 0),
      behavior: prefersReducedMotion() ? "auto" : "smooth"
    });
  }

  function setupSmoothAnchors() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;

        const target = document.querySelector(href);
        if (!target) return;

        if (link.hasAttribute("data-blog-jump-filter")) return;

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
     13. HEADER Y MENÚ MÓVIL
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

  /* =========================================================
     14. BURBUJAS
  ========================================================= */

  function setupFloatingBubbles() {
    const bubbles = $$(".burbuja");
    if (!bubbles.length) return;

    const styleId = "mgi-blog-burbujas-style";

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
     15. FORMULARIO OPCIONAL DE SUSCRIPCIÓN
  ========================================================= */

  function setupSubscribeForm() {
    if (!elements.subscribeForm) return;

    elements.subscribeForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(elements.subscribeForm);
      const nombre = String(formData.get("nombre") || "").trim();
      const correo = String(formData.get("correo") || "").trim();

      const message = [
        "Hola Creaciones MGI 😊",
        "Quiero suscribirme a novedades del blog.",
        "",
        nombre ? `Nombre: ${nombre}` : null,
        correo ? `Correo: ${correo}` : null
      ]
        .filter(Boolean)
        .join("\n");

      window.open(buildWhatsAppUrl(message), "_blank", "noopener");
      elements.subscribeForm.reset();
    });
  }

  /* =========================================================
     16. REVEAL ANIMATIONS
  ========================================================= */

  let revealObserver = null;

  function setupRevealAnimations(refresh = false) {
    const elementsToAnimate = $$("[data-animate]");

    if (!elementsToAnimate.length) return;

    if (prefersReducedMotion()) {
      elementsToAnimate.forEach((element) => {
        element.classList.add("in-view");
      });
      return;
    }

    if (!revealObserver || refresh) {
      if (revealObserver) {
        revealObserver.disconnect();
      }

      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -40px 0px"
        }
      );
    }

    elementsToAnimate.forEach((element) => {
      if (!element.classList.contains("reveal")) {
        element.classList.add("reveal");
      }

      const delay = parseInt(element.dataset.delay || "0", 10);

      if (Number.isFinite(delay) && delay > 0) {
        element.style.transitionDelay = `${delay}ms`;
      }

      if (!element.classList.contains("in-view")) {
        revealObserver.observe(element);
      }
    });
  }

  /* =========================================================
     17. INIT
  ========================================================= */

  function init() {
    log("blog.js cargado");

    setupFooterYear();
    setupCompactHeader();
    setupMobileMenu();
    setupSmoothAnchors();

    setupFilters();
    setupSearch();
    setupHeroHighlights();
    setupPaginationControls();

    setupFloatingBubbles();
    setupSubscribeForm();

    readUrlState();
    setupRevealAnimations();

    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();