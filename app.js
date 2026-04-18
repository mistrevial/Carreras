(function () {
  const appData = window.RaceArchiveData;

  if (!appData) {
    return;
  }

  const body = document.body;
  const page = body.dataset.page;
  const money = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: appData.currency,
    maximumFractionDigits: 0
  });
  const dateFormat = new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const dateTimeFormat = new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  const SALES_KEY = "finishline:purchases";
  const DEMO_SALES_SEEDED_KEY = "finishline:demo-sales-seeded";
  const ADMIN_SESSION_KEY = "finishline:admin-session";
  const CART_KEY = "finishline:cart";

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function sanitizeBib(value) {
    return String(value || "").replace(/\D/g, "").slice(0, 5);
  }

  function formatDate(value) {
    return dateFormat.format(new Date(value + "T12:00:00"));
  }

  function formatDateTime(value) {
    return dateTimeFormat.format(new Date(value));
  }

  function getRaceById(id) {
    return appData.races.find(function (race) {
      return race.id === id;
    });
  }

  function getRacesSortedByDate() {
    return appData.races.slice().sort(function (left, right) {
      return new Date(right.date) - new Date(left.date);
    });
  }

  function unlockKey(raceId, bib) {
    return "finishline:unlock:" + raceId + ":" + bib;
  }

  function isUnlocked(raceId, bib) {
    return window.localStorage.getItem(unlockKey(raceId, bib)) === "true";
  }

  function setUnlocked(raceId, bib) {
    window.localStorage.setItem(unlockKey(raceId, bib), "true");
  }

  function readSales() {
    try {
      const raw = window.localStorage.getItem(SALES_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeSales(sales) {
    window.localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  }

  function appendSale(sale) {
    const sales = readSales();
    sales.unshift(sale);
    writeSales(sales);
  }

  function clearSales() {
    window.localStorage.removeItem(SALES_KEY);
  }

  function seedDemoSales() {
    const alreadySeeded = window.localStorage.getItem(DEMO_SALES_SEEDED_KEY) === "true";
    const existingSales = readSales();
    const demoSales = Array.isArray(appData.demoSales) ? appData.demoSales : [];

    if (alreadySeeded || existingSales.length || !demoSales.length) {
      if (!alreadySeeded && existingSales.length) {
        window.localStorage.setItem(DEMO_SALES_SEEDED_KEY, "true");
      }
      return;
    }

    const preparedSales = demoSales.map(function (sale, index) {
      const race = getRaceById(sale.raceId);

      if (!race) {
        return null;
      }

      return {
        id: "demo-sale-" + (index + 1),
        createdAt: sale.createdAt,
        buyerName: sale.buyerName,
        buyerEmail: sale.buyerEmail,
        raceId: race.id,
        raceName: race.name,
        bib: sale.bib,
        amount: race.price,
        photosCount: sale.photosCount,
        currency: appData.currency,
        paymentMethod: sale.paymentMethod || "Tarjeta"
      };
    }).filter(Boolean);

    if (!preparedSales.length) {
      return;
    }

    writeSales(preparedSales);
    window.localStorage.setItem(DEMO_SALES_SEEDED_KEY, "true");
  }

  function readCart() {
    try {
      const raw = window.localStorage.getItem(CART_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeCart(cart) {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function removeCartItem(id) {
    writeCart(readCart().filter(function (item) {
      return item.id !== id;
    }));
  }

  function clearCart() {
    window.localStorage.removeItem(CART_KEY);
  }

  function addPackageToCart(race, bib) {
    const normalizedBib = sanitizeBib(bib);
    if (!race || !normalizedBib) {
      return false;
    }

    const existing = readCart();
    const alreadyThere = existing.some(function (item) {
      return item.raceId === race.id && item.bib === normalizedBib;
    });

    if (alreadyThere) {
      return false;
    }

    const photosCount = race.photos.filter(function (photo) {
      return photo.bib === normalizedBib;
    }).length;
    const firstPhoto = race.photos.find(function (photo) {
      return photo.bib === normalizedBib;
    });

    existing.push({
      id: "cart-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      raceId: race.id,
      raceName: race.name,
      raceDate: race.date,
      raceLocation: race.location,
      bib: normalizedBib,
      amount: race.price,
      photosCount: photosCount,
      cover: firstPhoto ? firstPhoto.preview : race.cover
    });

    writeCart(existing);
    return true;
  }

  function getCartCount() {
    return readCart().length;
  }

  function syncCartCount() {
    document.querySelectorAll("[data-cart-count]").forEach(function (node) {
      node.textContent = String(getCartCount());
    });
  }

  function csvEscape(value) {
    const text = String(value == null ? "" : value);
    if (/[",\n]/.test(text)) {
      return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
  }

  function downloadCsv(fileName, rows) {
    const csv = rows.map(function (row) {
      return row.map(csvEscape).join(",");
    }).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function getAdminConfig() {
    return appData.adminAuth || null;
  }

  async function sha256(text) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error("Este navegador no soporta verificacion segura para login.");
    }
    const bytes = new TextEncoder().encode(String(text));
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map(function (byte) {
      return byte.toString(16).padStart(2, "0");
    }).join("");
  }

  function readAdminSession() {
    try {
      const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function isAdminAuthenticated() {
    const session = readAdminSession();
    const config = getAdminConfig();
    return Boolean(session && config && session.username === config.username);
  }

  function setAdminSession(username) {
    window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
      username: username,
      loginAt: new Date().toISOString()
    }));
  }

  function clearAdminSession() {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
  }

  async function verifyAdminCredentials(username, password) {
    const config = getAdminConfig();
    if (!config) {
      return false;
    }
    const normalizedUsername = String(username || "").trim().toLowerCase();
    const expectedUsername = String(config.username || "").trim().toLowerCase();
    if (normalizedUsername !== expectedUsername) {
      return false;
    }
    const passwordHash = await sha256(String(password || ""));
    return passwordHash === config.passwordHash;
  }

  function requireAdminAccess() {
    if (!isAdminAuthenticated()) {
      window.location.href = "admin.html";
      return false;
    }
    document.body.classList.add("is-admin-ready");
    return true;
  }

  function createVisualCard(photo, locked) {
    const card = document.createElement("article");
    card.className = "photo-card" + (locked ? " is-locked" : " is-open");

    const media = document.createElement("div");
    media.className = "photo-media";
    media.style.backgroundImage = 'url("' + (locked ? photo.preview : photo.full) + '")';
    media.style.backgroundPosition = photo.position || "center";
    media.setAttribute("role", "img");
    media.setAttribute("aria-label", photo.title + ", numero " + photo.bib);

    if (locked) {
      const lockOverlay = document.createElement("div");
      lockOverlay.className = "lock-overlay";
      lockOverlay.innerHTML = [
        '<span class="watermark">VISTA PREVIA</span>',
        '<span class="watermark watermark-alt">COMPRA REQUERIDA</span>',
        "<strong>Preview protegido</strong>",
        "<small>Completa la compra para descargar sin marca.</small>"
      ].join("");
      media.appendChild(lockOverlay);
      media.addEventListener("contextmenu", function (event) {
        event.preventDefault();
      });
    }

    const content = document.createElement("div");
    content.className = "photo-content";
    content.innerHTML = [
      '<div class="photo-meta-row">',
      '<span class="tag">#' + photo.bib + "</span>",
      '<span class="tag subtle">' + photo.raceDistance + "</span>",
      "</div>",
      "<h3>" + photo.shot + "</h3>",
      '<p class="muted-copy">' + photo.raceName + " / " + photo.runner + "</p>"
    ].join("");

    const actions = document.createElement("div");
    actions.className = "photo-actions";

    if (locked) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-secondary photo-buy-trigger";
      button.textContent = "Agregar al carrito";
      button.dataset.bib = photo.bib;
      actions.appendChild(button);
    } else {
      const link = document.createElement("a");
      link.className = "btn btn-primary";
      link.href = photo.full;
      link.download = photo.downloadName;
      link.textContent = "Descargar";
      actions.appendChild(link);
    }

    card.appendChild(media);
    card.appendChild(content);
    card.appendChild(actions);

    return card;
  }

  function createRaceCard(race, options) {
    const settings = options || {};
    const card = document.createElement("article");
    card.className = "race-card";

    const media = document.createElement("div");
    media.className = "race-card-media";
    media.style.backgroundImage =
      'linear-gradient(180deg, rgba(12,12,15,0.08), rgba(12,12,15,0.5)), url("' + race.cover + '")';
    media.setAttribute("role", "img");
    media.setAttribute("aria-label", race.name);

    const content = document.createElement("div");
    content.className = "race-card-content";
    content.innerHTML = [
      '<div class="race-meta">',
      '<span class="tag">' + race.distance + "</span>",
      '<span class="tag subtle">' + formatDate(race.date) + "</span>",
      "</div>",
      "<h3>" + race.name + "</h3>",
      '<p class="muted-copy">' + race.location + " / " + race.venue + "</p>"
    ].join("");

    const footer = document.createElement("div");
    footer.className = "race-card-footer";

    const link = document.createElement("a");
    link.className = "btn btn-primary";
    link.href = settings.href || ("carrera.html?race=" + race.id);
    link.textContent = settings.label || "Ver fotos";

    footer.appendChild(link);
    card.appendChild(media);
    card.appendChild(content);
    card.appendChild(footer);

    return card;
  }

  function createGalleryPreviewCard(photo) {
    const card = document.createElement("article");
    card.className = "gallery-preview-card";

    const link = document.createElement("a");
    link.className = "gallery-preview-link";
    link.href = "carrera.html?race=" + photo.raceId + "&bib=" + photo.bib;

    const media = document.createElement("div");
    media.className = "gallery-preview-media";
    media.style.backgroundImage =
      'linear-gradient(180deg, rgba(12,12,15,0.04), rgba(12,12,15,0.48)), url("' + photo.preview + '")';
    media.style.backgroundPosition = photo.position || "center";
    media.setAttribute("role", "img");
    media.setAttribute("aria-label", photo.title);

    const content = document.createElement("div");
    content.className = "gallery-preview-content";
    content.innerHTML = [
      '<span class="tag">#' + photo.bib + "</span>",
      "<h3>" + photo.raceName + "</h3>",
      '<p class="muted-copy">' + photo.runner + " / " + photo.shot + "</p>"
    ].join("");

    link.appendChild(media);
    link.appendChild(content);
    card.appendChild(link);

    return card;
  }

  function renderPricingPage() {
    const grid = $("#pricing-grid");

    if (!grid) {
      return;
    }

    grid.innerHTML = "";
    appData.races.forEach(function (race) {
      const card = document.createElement("article");
      card.className = "pricing-card";
      card.innerHTML = [
        '<span class="eyebrow">' + race.distance + "</span>",
        "<h2>" + race.name + "</h2>",
        '<p class="muted-copy">' + race.location + " / " + formatDate(race.date) + "</p>",
        '<div class="price-box">',
        "<strong>" + money.format(race.price) + "</strong>",
        "<span>Paquete completo por corredor.</span>",
        "</div>",
        '<p class="muted-copy">Incluye todas las fotos encontradas para un mismo numero dentro del evento.</p>',
        '<a class="btn btn-primary" href="carrera.html?race=' + race.id + '">Ver fotos</a>'
      ].join("");
      grid.appendChild(card);
    });
  }

  function renderHome() {
    const showcase = $("#home-showcase");
    const gallery = $("#home-gallery");
    const heroStage = $("#home-hero-stage");
    const featuredRace = getRaceById(appData.featuredRaceId) || appData.races[0];

    if (heroStage && featuredRace) {
      heroStage.style.backgroundImage =
        'linear-gradient(180deg, rgba(11,13,18,0.24), rgba(11,13,18,0.12)), url("' + featuredRace.cover + '")';
    }

    if (showcase) {
      showcase.innerHTML = "";
      getRacesSortedByDate().forEach(function (race) {
        showcase.appendChild(createRaceCard(race));
      });
    }

    if (gallery) {
      gallery.innerHTML = "";
      const recentPhotos = getRacesSortedByDate()
        .flatMap(function (race) {
          return race.photos.slice(0, 2);
        })
        .slice(0, 8);

      recentPhotos.forEach(function (photo) {
        gallery.appendChild(createGalleryPreviewCard(photo));
      });
    }
  }

  function initHomeWorkflow() {
    const eventSelect = $("#workflow-event");
    const searchForm = $("#workflow-search-form");
    const bibInput = $("#workflow-bib");

    if (!eventSelect || !searchForm || !bibInput) {
      return;
    }

    function getSelectedRace() {
      return getRaceById(eventSelect.value) || appData.races[0];
    }

    function syncEventOptions(preferredRaceId) {
      eventSelect.innerHTML = "";
      getRacesSortedByDate().forEach(function (race) {
        const option = document.createElement("option");
        option.value = race.id;
        option.textContent = race.name;
        eventSelect.appendChild(option);
      });

      eventSelect.value = preferredRaceId || appData.featuredRaceId || appData.races[0].id;
    }

    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const race = getSelectedRace();
      const bib = sanitizeBib(bibInput.value);
      const nextUrl = new URL("carrera.html", window.location.href);
      nextUrl.searchParams.set("race", race.id);
      if (bib) {
        nextUrl.searchParams.set("bib", bib);
      }
      window.location.href = nextUrl.toString();
    });

    syncEventOptions(appData.featuredRaceId || appData.races[0].id);
  }

  function createChip(bib, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = "#" + bib;
    button.addEventListener("click", function () {
      onClick(bib);
    });
    return button;
  }

  function initRaceDetail() {
    const params = new URLSearchParams(window.location.search);
    const raceId = params.get("race") || appData.featuredRaceId || appData.races[0].id;
    const race = getRaceById(raceId) || appData.races[0];
    const startingBib = sanitizeBib(params.get("bib"));
    const hero = $("#race-hero");
    const form = $("#bib-search-form");
    const raceSelect = $("#detail-race-select");
    const searchInput = $("#bib-search");
    const feedback = $("#search-feedback");
    const chipList = $("#bib-chip-list");
    const purchasePanel = $("#purchase-panel");
    const resultsGrid = $("#results-grid");
    const resultsSummary = $("#results-summary");
    if (!hero || !form || !raceSelect || !searchInput || !chipList || !purchasePanel || !resultsGrid || !feedback || !resultsSummary) {
      return;
    }

    const exampleGrid = $("#detail-race-examples");

    raceSelect.innerHTML = "";
    getRacesSortedByDate().forEach(function (item) {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name;
      raceSelect.appendChild(option);
    });
    raceSelect.value = race.id;

    if (exampleGrid) {
      exampleGrid.innerHTML = "";
      getRacesSortedByDate().slice(0, 6).forEach(function (item) {
        const exampleHref = new URL("carrera.html", window.location.href);
        exampleHref.searchParams.set("race", item.id);
        exampleHref.searchParams.set("bib", item.featuredBib);
        exampleGrid.appendChild(createRaceCard(item, {
          href: exampleHref.toString(),
          label: "Ver fotos"
        }));
      });
    }

    let selectedBib = startingBib;
    hero.innerHTML = [
      '<div class="event-hero-copy">',
      "<div>",
      '<span class="eyebrow">' + race.distance + "</span>",
      "<h1>" + race.name + "</h1>",
      '<p>' + race.location + " / " + race.venue + "</p>",
      "<small>" + formatDate(race.date) + " / " + race.summary + "</small>",
      "</div>",
      "</div>"
    ].join("");
    hero.style.backgroundImage =
      'linear-gradient(180deg, rgba(12,12,15,0.18), rgba(12,12,15,0.74)), url("' + race.cover + '")';

    chipList.innerHTML = "";
    race.bibs.forEach(function (bib) {
      chipList.appendChild(createChip(bib, applyBib));
    });

    function syncUrl() {
      const next = new URL(window.location.href);
      next.searchParams.set("race", race.id);
      if (selectedBib) {
        next.searchParams.set("bib", selectedBib);
      } else {
        next.searchParams.delete("bib");
      }
      window.history.replaceState({}, "", next);
    }

    function attachBuyTriggers() {
      resultsGrid.querySelectorAll(".photo-buy-trigger").forEach(function (button) {
        button.addEventListener("click", function () {
          addPackageToCart(race, button.dataset.bib);
          syncCartCount();
          window.location.href = "cart.html";
        });
      });
    }

    function renderPurchasePanel(matches) {
      if (!selectedBib) {
        purchasePanel.innerHTML = [
          '<span class="eyebrow">Carrera</span>',
          "<h2>Galeria general</h2>",
          '<p class="muted-copy">Ya estas dentro del evento. Escribe tu numero si quieres filtrar tu paquete.</p>'
        ].join("");
        return;
      }

      if (!matches.length) {
        purchasePanel.innerHTML = [
          '<span class="eyebrow">Sin resultados</span>',
          "<h2>No encontre fotos para #" + selectedBib + "</h2>",
          '<p class="muted-copy">Verifica tu numero o elige otro corredor.</p>'
        ].join("");
        return;
      }

      const unlocked = isUnlocked(race.id, selectedBib);
      const inCart = readCart().some(function (item) {
        return item.raceId === race.id && item.bib === selectedBib;
      });
      purchasePanel.innerHTML = [
        '<span class="eyebrow">' + (unlocked ? "Listo" : "Disponible") + "</span>",
        "<h2>Corredor #" + selectedBib + "</h2>",
        '<p class="muted-copy">' + matches.length + " foto(s) encontradas.</p>",
        '<div class="price-box">',
        "<strong>" + money.format(race.price) + "</strong>",
        "<span>Incluye todas las fotos encontradas para este numero.</span>",
        "</div>"
      ].join("");

      if (unlocked) {
        const note = document.createElement("p");
        note.className = "muted-copy";
        note.textContent = "Este paquete ya esta desbloqueado en este navegador.";
        purchasePanel.appendChild(note);
      } else if (inCart) {
        const note = document.createElement("p");
        note.className = "muted-copy";
        note.textContent = "Este paquete ya esta en tu carrito.";
        purchasePanel.appendChild(note);
        const cartButton = document.createElement("a");
        cartButton.className = "btn btn-primary stretch";
        cartButton.href = "cart.html";
        cartButton.textContent = "Ir al carrito";
        purchasePanel.appendChild(cartButton);
      } else {
        const payButton = document.createElement("button");
        payButton.type = "button";
        payButton.className = "btn btn-primary stretch";
        payButton.textContent = "Agregar paquete #" + selectedBib;
        payButton.addEventListener("click", function () {
          addPackageToCart(race, selectedBib);
          syncCartCount();
          window.location.href = "cart.html";
        });
        purchasePanel.appendChild(payButton);
      }
    }

    function renderResults() {
      const filtered = selectedBib
        ? race.photos.filter(function (photo) {
            return photo.bib === selectedBib;
          })
        : race.photos;

      const unlocked = selectedBib ? isUnlocked(race.id, selectedBib) : false;

      resultsGrid.innerHTML = "";
      filtered.forEach(function (photo) {
        const locked = !selectedBib || photo.bib !== selectedBib || !unlocked;
        resultsGrid.appendChild(createVisualCard(photo, locked));
      });

      if (!filtered.length) {
        resultsGrid.innerHTML = [
          '<article class="empty-card">',
          "<h3>No encontre resultados</h3>",
          "<p>Verifica tu numero o intenta con otro dorsal.</p>",
          "</article>"
        ].join("");
      }

      if (!selectedBib) {
        feedback.textContent = "Estas viendo la galeria del evento completo.";
        resultsSummary.textContent = "Escribe un dorsal si quieres ver solo las fotos de un corredor.";
      } else if (filtered.length) {
        feedback.textContent = "Encontramos " + filtered.length + " foto(s) para #" + selectedBib + ".";
        resultsSummary.textContent = unlocked
          ? "Paquete activo. Ya puedes descargar tus fotos."
          : "La vista previa esta protegida hasta completar la compra.";
      } else {
        feedback.textContent = "No hubo coincidencias para #" + selectedBib + ".";
        resultsSummary.textContent = "Prueba otro numero para revisar otro paquete.";
      }

      renderPurchasePanel(filtered);
      attachBuyTriggers();
    }

    function applyBib(nextBib) {
      selectedBib = sanitizeBib(nextBib);
      searchInput.value = selectedBib;
      syncUrl();
      renderResults();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const nextRaceId = raceSelect.value || race.id;
      const nextBib = sanitizeBib(searchInput.value);

      if (nextRaceId !== race.id) {
        const nextUrl = new URL("carrera.html", window.location.href);
        nextUrl.searchParams.set("race", nextRaceId);
        if (nextBib) {
          nextUrl.searchParams.set("bib", nextBib);
        }
        window.location.href = nextUrl.toString();
        return;
      }

      applyBib(nextBib);
    });

    searchInput.value = selectedBib;
    renderResults();
  }

  function renderCartPage() {
    const list = $("#cart-list");
    const empty = $("#cart-empty");
    const total = $("#cart-total");
    const totalHelper = $("#cart-total-helper");
    const caption = $("#cart-caption");
    const form = $("#cart-checkout-form");
    const nameInput = $("#checkout-name");
    const emailInput = $("#checkout-email");
    const errorBox = $("#cart-error");

    if (!list || !empty || !total || !totalHelper || !caption || !form || !nameInput || !emailInput || !errorBox) {
      return;
    }

    function buildSaleRecord(item, buyerName, buyerEmail) {
      return {
        id: "sale-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        createdAt: new Date().toISOString(),
        buyerName: buyerName,
        buyerEmail: buyerEmail.toLowerCase(),
        raceId: item.raceId,
        raceName: item.raceName,
        bib: item.bib,
        amount: item.amount,
        photosCount: item.photosCount,
        currency: appData.currency,
        paymentMethod: "Tarjeta"
      };
    }

    function draw() {
      const cart = readCart();
      const totalAmount = cart.reduce(function (sum, item) {
        return sum + Number(item.amount || 0);
      }, 0);

      list.innerHTML = "";
      cart.forEach(function (item) {
        const card = document.createElement("article");
        card.className = "cart-item";
        card.innerHTML = [
          '<div class="cart-item-media" style="background-image: url(\'' + item.cover + '\')"></div>',
          '<div class="cart-item-copy">',
          "<h3>" + item.raceName + " / #" + item.bib + "</h3>",
          "<p>" + item.photosCount + " foto(s)</p>",
          "<small>" + item.raceLocation + "</small>",
          "</div>",
          '<div class="cart-item-actions">',
          "<strong>" + money.format(item.amount) + "</strong>",
          '<button class="btn-link" type="button" data-remove-id="' + item.id + '">Quitar</button>',
          "</div>"
        ].join("");
        list.appendChild(card);
      });

      list.querySelectorAll("[data-remove-id]").forEach(function (button) {
        button.addEventListener("click", function () {
          removeCartItem(button.dataset.removeId);
          syncCartCount();
          draw();
        });
      });

      empty.classList.toggle("hidden", cart.length > 0);
      list.classList.toggle("hidden", cart.length === 0);
      total.textContent = money.format(totalAmount);
      totalHelper.textContent = cart.length + (cart.length === 1 ? " paquete" : " paquetes");
      caption.textContent = cart.length
        ? "Revisa tus paquetes antes de completar la compra."
        : "Tu carrito esta listo para recibir paquetes.";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      errorBox.textContent = "";
      errorBox.classList.add("hidden");

      const buyerName = String(nameInput.value || "").trim();
      const buyerEmail = String(emailInput.value || "").trim();
      const cart = readCart();

      if (!cart.length) {
        errorBox.textContent = "Tu carrito esta vacio.";
        errorBox.classList.remove("hidden");
        return;
      }

      if (!buyerName) {
        errorBox.textContent = "Escribe el nombre del comprador.";
        errorBox.classList.remove("hidden");
        return;
      }

      if (!buyerEmail || !buyerEmail.includes("@")) {
        errorBox.textContent = "Escribe un correo valido.";
        errorBox.classList.remove("hidden");
        return;
      }

      cart.forEach(function (item) {
        appendSale(buildSaleRecord(item, buyerName, buyerEmail));
        setUnlocked(item.raceId, item.bib);
      });

      clearCart();
      syncCartCount();
      draw();
      window.alert("Compra completada. Tus paquetes ya quedaron habilitados en este navegador.");
    });

    draw();
  }

  function renderReportsPage() {
    if (!requireAdminAccess()) {
      return;
    }

    const summary = $("#report-summary");
    const tableBody = $("#sales-table-body");
    const empty = $("#sales-empty");
    const caption = $("#report-caption");
    const search = $("#report-search");
    const exportButton = $("#export-sales");
    const clearButton = $("#clear-sales");
    const logoutButton = $("#admin-logout");

    if (!summary || !tableBody || !empty || !caption || !search || !exportButton || !clearButton || !logoutButton) {
      return;
    }

    function createSummaryCard(label, value, helper) {
      const card = document.createElement("article");
      card.className = "report-card";
      card.innerHTML = [
        '<span class="eyebrow">' + label + "</span>",
        "<strong>" + value + "</strong>",
        '<p class="muted-copy">' + helper + "</p>"
      ].join("");
      return card;
    }

    function getFilteredSales() {
      const term = String(search.value || "").trim().toLowerCase();
      const sales = readSales();
      if (!term) {
        return sales;
      }
      return sales.filter(function (sale) {
        const haystack = [
          sale.buyerName,
          sale.buyerEmail,
          sale.raceName,
          sale.raceId,
          sale.bib,
          sale.amount
        ].join(" ").toLowerCase();
        return haystack.includes(term);
      });
    }

    function draw() {
      const sales = getFilteredSales();
      const allSales = readSales();
      const totalIncome = sales.reduce(function (sum, sale) {
        return sum + Number(sale.amount || 0);
      }, 0);
      const uniqueBuyers = new Set(sales.map(function (sale) {
        return sale.buyerEmail || sale.buyerName;
      }).filter(Boolean)).size;
      const latestSale = sales[0];

      summary.innerHTML = "";
      summary.appendChild(
        createSummaryCard("Ventas", String(sales.length), "Compras visibles en el filtro actual.")
      );
      summary.appendChild(
        createSummaryCard("Ingresos", money.format(totalIncome), "Total acumulado visible en esta vista.")
      );
      summary.appendChild(
        createSummaryCard("Compradores", String(uniqueBuyers), "Correos o nombres unicos detectados.")
      );
      summary.appendChild(
        createSummaryCard(
          "Ultima venta",
          latestSale ? formatDateTime(latestSale.createdAt) : "Sin ventas",
          latestSale ? latestSale.raceName + " / #" + latestSale.bib : "Aun no hay operaciones."
        )
      );

      tableBody.innerHTML = "";
      sales.forEach(function (sale) {
        const row = document.createElement("tr");
        row.innerHTML = [
          "<td>" + formatDateTime(sale.createdAt) + "</td>",
          "<td>" + sale.buyerName + "</td>",
          "<td>" + sale.buyerEmail + "</td>",
          "<td>" + sale.raceName + "</td>",
          "<td>#" + sale.bib + "</td>",
          "<td>" + sale.photosCount + "</td>",
          "<td>" + money.format(Number(sale.amount || 0)) + "</td>"
        ].join("");
        tableBody.appendChild(row);
      });

      empty.classList.toggle("hidden", sales.length > 0);
      caption.textContent = allSales.length
        ? "Se registran " + allSales.length + " compra(s) en este navegador."
        : "Aun no hay compras guardadas en este navegador.";
    }

    exportButton.addEventListener("click", function () {
      const sales = getFilteredSales();
      if (!sales.length) {
        caption.textContent = "No hay ventas para exportar con el filtro actual.";
        return;
      }

      const rows = [
        ["Fecha", "Comprador", "Correo", "Carrera", "ID Carrera", "Bib", "Fotos", "Ingreso", "Moneda", "Metodo"]
      ].concat(
        sales.map(function (sale) {
          return [
            formatDateTime(sale.createdAt),
            sale.buyerName,
            sale.buyerEmail,
            sale.raceName,
            sale.raceId,
            sale.bib,
            sale.photosCount,
            sale.amount,
            sale.currency || appData.currency,
            sale.paymentMethod || "Manual"
          ];
        })
      );

      downloadCsv("finishline-reportes.csv", rows);
      caption.textContent = "CSV exportado correctamente.";
    });

    clearButton.addEventListener("click", function () {
      clearSales();
      caption.textContent = "Ventas eliminadas en este navegador.";
      draw();
    });

    logoutButton.addEventListener("click", function () {
      clearAdminSession();
      window.location.href = "admin.html";
    });

    search.addEventListener("input", draw);
    draw();
  }

  function renderAdminLoginPage() {
    const form = $("#admin-login-form");
    const userInput = $("#admin-user");
    const passwordInput = $("#admin-password");
    const errorBox = $("#admin-login-error");

    if (!form || !userInput || !passwordInput || !errorBox) {
      return;
    }

    if (isAdminAuthenticated()) {
      window.location.href = "reportes.html";
      return;
    }

    function showError(message) {
      errorBox.textContent = message;
      errorBox.classList.remove("hidden");
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      errorBox.textContent = "";
      errorBox.classList.add("hidden");

      const username = userInput.value;
      const password = passwordInput.value;

      if (!String(username).trim()) {
        showError("Escribe el usuario de administrador.");
        return;
      }

      if (!String(password).trim()) {
        showError("Escribe la contrasena de administrador.");
        return;
      }

      try {
        const isValid = await verifyAdminCredentials(username, password);
        if (!isValid) {
          showError("Usuario o contrasena incorrectos.");
          return;
        }

        setAdminSession(getAdminConfig().username);
        window.location.href = "reportes.html";
      } catch (error) {
        showError(error.message || "No pude validar el acceso admin.");
      }
    });
  }

  seedDemoSales();

  if (page === "home") {
    renderHome();
    initHomeWorkflow();
  }

  if (page === "race-detail") {
    initRaceDetail();
  }

  if (page === "reports") {
    renderReportsPage();
  }

  if (page === "admin-login") {
    renderAdminLoginPage();
  }

  if (page === "cart") {
    renderCartPage();
  }

  if (page === "pricing") {
    renderPricingPage();
  }

  syncCartCount();
})();
