/* ============================================================
   Random Website — app.js
   Simple version: loads URL arrays from DB/, random selection,
   history navigation, and iframe error handling.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. DATABASE
     URL arrays loaded from DB/*.js files
     ---------------------------------------------------------- */
  const DB_DATA = {
    general: { urls: DB_GENERAL, label: 'General' },
    tools: { urls: DB_TOOLS, label: 'Tools' },
    games: { urls: DB_GAMES, label: 'Games' },
    art: { urls: DB_ART, label: 'Art' }
  };

  
  /* ----------------------------------------------------------
     3. STATE
     ---------------------------------------------------------- */
  let dbCache = {};        // { categoryKey: [url1, url2, ...] }
  let history = [];        // ordered list of visited { url, source }
  let historyIndex = -1;
  let loadTimeoutId = null;
  let currentSource = null;
  let favorites = [];      // array of { url, name, addedAt }

  const LOAD_TIMEOUT_MS = 6000;
  const LOADING_MESSAGES = [
    'loading…', 'finding…', 'searching…'
  ];

  /* ----------------------------------------------------------
     4. DOM REFS
     ---------------------------------------------------------- */
  const $ = (id) => document.getElementById(id);
  const iframe         = $('siteFrame');
  const emptyState      = $('emptyState');
  const loadingOverlay  = $('loadingOverlay');
  const loadingLabel    = $('loadingLabel');
  const errorOverlay    = $('errorOverlay');
  const errorOpenBtn    = $('errorOpenBtn');
  const urlReadout      = $('urlReadout');
  const backBtn         = $('backBtn');
  const nextBtn         = $('nextBtn');
  const categorySelect  = $('categorySelect');
  const randomDbBtn     = $('randomDbBtn');
  const randomDbIcon    = $('randomDbIcon');
  const openNewTabBtn   = $('openNewTabBtn');
  const dbStatus        = $('dbStatus');
  const addFavBtn       = $('addFavBtn');
  const favBtn          = $('favBtn');
  const favoritesDrawer = $('favoritesDrawer');
  const drawerOverlay   = $('drawerOverlay');
  const closeDrawerBtn  = $('closeDrawerBtn');
  const favoritesList   = $('favoritesList');

  /* ----------------------------------------------------------
     5. DATABASE INITIALIZATION
     ---------------------------------------------------------- */
  function initDatabase() {
    categorySelect.innerHTML = '';

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All categories';
    categorySelect.appendChild(allOption);

    let totalSites = 0;

    for (const [key, data] of Object.entries(DB_DATA)) {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = `${data.label} (${data.urls.length})`;
      categorySelect.appendChild(opt);
      totalSites += data.urls.length;
    }

    categorySelect.value = 'all';
    dbStatus.textContent = `${Object.keys(DB_DATA).length} categories · ${totalSites} sites loaded`;
  }

  /* ----------------------------------------------------------
     6. CORE NAVIGATION
     ---------------------------------------------------------- */
  function currentSite() {
    return historyIndex >= 0 ? history[historyIndex] : null;
  }

  function loadSite(site, pushToHistory) {
    clearTimeout(loadTimeoutId);
    emptyState.classList.add('hidden');
    errorOverlay.classList.add('hidden');
    currentSource = site.source || 'db';
    showLoading();

    if (pushToHistory) {
      history = history.slice(0, historyIndex + 1);
      history.push(site);
      historyIndex = history.length - 1;
    }

    iframe.src = site.url;
    updateReadout(site);
    updateNavButtons();
    updateFavButtonState();
    openNewTabBtn.disabled = false;

    loadTimeoutId = setTimeout(handleLoadTimeout, LOAD_TIMEOUT_MS);
  }

  function updateReadout(site) {
    const text = site.url;
    urlReadout.textContent = text;
  }

  
  function updateNavButtons() {
    backBtn.disabled = historyIndex <= 0;
    nextBtn.disabled = historyIndex >= history.length - 1;
  }

  function showLoading() {
    loadingLabel.textContent = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
    loadingOverlay.classList.remove('hidden');
  }
  function hideLoading() {
    loadingOverlay.classList.add('hidden');
    randomDbIcon.classList.remove('animate-spin');
  }
  function showError() {
    hideLoading();
    errorOverlay.classList.remove('hidden');
  }
  function handleLoadTimeout() {
    hideLoading();
    showError();
  }

  iframe.addEventListener('load', () => {
    if (iframe.src === 'about:blank') return;
    clearTimeout(loadTimeoutId);
    hideLoading();
  });

  /* ----------------------------------------------------------
     7. FAVORITES
     ---------------------------------------------------------- */
  function loadFavorites() {
    const stored = localStorage.getItem('wayfinder_favorites');
    if (stored) {
      try {
        favorites = JSON.parse(stored);
      } catch (e) {
        favorites = [];
      }
    }
  }

  function saveFavorites() {
    localStorage.setItem('wayfinder_favorites', JSON.stringify(favorites));
  }

  function isFavorite(url) {
    return favorites.some(fav => fav.url === url);
  }

  function addFavorite(url) {
    if (!url || isFavorite(url)) return;
    const name = url.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0];
    favorites.unshift({
      url: url,
      name: name,
      addedAt: Date.now()
    });
    saveFavorites();
    renderFavorites();
    updateFavButtonState();
  }

  function removeFavorite(url) {
    favorites = favorites.filter(fav => fav.url !== url);
    saveFavorites();
    renderFavorites();
    updateFavButtonState();
  }

  function toggleDrawer() {
    favoritesDrawer.classList.toggle('open');
    drawerOverlay.classList.toggle('hidden');
  }

  function closeDrawer() {
    favoritesDrawer.classList.remove('open');
    drawerOverlay.classList.add('hidden');
  }

  function renderFavorites() {
    if (favorites.length === 0) {
      favoritesList.innerHTML = `
        <div class="empty-favorites">
          <p>No favorites yet</p>
          <p>Click the heart icon to save sites</p>
        </div>
      `;
      return;
    }

    favoritesList.innerHTML = favorites.map((fav, index) => `
      <div class="favorite-item">
        <div class="favorite-item-content">
          <div class="favorite-item-name" data-url="${fav.url}">${fav.name}</div>
          <div class="favorite-item-url">${fav.url}</div>
        </div>
        <div class="favorite-item-actions">
          <button class="favorite-delete-btn" data-index="${index}" title="Remove">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    `).join('');

    // Add event listeners for favorite item names (load in iframe)
    document.querySelectorAll('.favorite-item-name').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.dataset.url;
        loadSite({ url: url, source: 'db' }, true);
        closeDrawer();
      });
    });

    // Add event listeners for delete buttons
    document.querySelectorAll('.favorite-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        removeFavorite(favorites[index].url);
      });
    });
  }

  function updateFavButtonState() {
    const site = currentSite();
    if (site && isFavorite(site.url)) {
      addFavBtn.classList.add('ctl-btn--favorited');
    } else {
      addFavBtn.classList.remove('ctl-btn--favorited');
    }
  }

  /* ----------------------------------------------------------
     8. RANDOM DB — from curated URL arrays
     ---------------------------------------------------------- */
  function randomFromDb() {
    const selected = categorySelect.value || 'all';
    randomDbBtn.disabled = true;
    randomDbIcon.classList.add('animate-spin');

    let pool = [];
    if (selected === 'all') {
      for (const data of Object.values(DB_DATA)) {
        pool = pool.concat(data.urls);
      }
    } else {
      pool = DB_DATA[selected]?.urls || [];
    }

    if (pool.length === 0) {
      randomDbBtn.disabled = false;
      return;
    }

    let pick;
    const current = currentSite();
    do {
      pick = pool[Math.floor(Math.random() * pool.length)];
    } while (pool.length > 1 && current && pick === current.url);

    loadSite({ url: pick, source: 'db' }, true);
    randomDbBtn.disabled = false;
  }

  /* ----------------------------------------------------------
     8. EVENT WIRING
     ---------------------------------------------------------- */
  randomDbBtn.addEventListener('click', randomFromDb);

  backBtn.addEventListener('click', () => {
    if (historyIndex > 0) {
      historyIndex--;
      loadSite(history[historyIndex], false);
    }
  });
  nextBtn.addEventListener('click', () => {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      loadSite(history[historyIndex], false);
    }
  });

  openNewTabBtn.addEventListener('click', () => {
    const site = currentSite();
    if (site) window.open(site.url, '_blank', 'noopener,noreferrer');
  });

  errorOpenBtn.addEventListener('click', () => {
    const site = currentSite();
    if (site) window.open(site.url, '_blank', 'noopener,noreferrer');
  });

  addFavBtn.addEventListener('click', () => {
    const site = currentSite();
    if (site) {
      addFavorite(site.url);
    }
  });

  favBtn.addEventListener('click', toggleDrawer);

  closeDrawerBtn.addEventListener('click', closeDrawer);
  drawerOverlay.addEventListener('click', closeDrawer);

  /* ----------------------------------------------------------
     9. INIT
     ---------------------------------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('[DB] DOM loaded, initializing database...');
      initDatabase();
      loadFavorites();
      renderFavorites();
    });
  } else {
    console.log('[DB] DOM already loaded, initializing database...');
    initDatabase();
    loadFavorites();
    renderFavorites();
  }
})();