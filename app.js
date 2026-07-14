/* ============================================================
   Random Website — app.js
   Core logic: category loading, "Random DB" (flat-file JSON),
   "Random Any" (open web pool), history navigation, and iframe
   error handling.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. DATABASE MANIFEST
     Static hosts (GitHub Pages / Netlify) cannot list a folder's
     contents via fetch() — there is no directory-listing API for
     plain file hosting. So this manifest is the single source of
     truth for which JSON files live in DB/. To add a category,
     add a new "DB/yourfile.json" here AND drop the file in DB/.
     The dropdown below is still built dynamically FROM this
     manifest, by fetching each file and reading its real content
     (rather than hardcoding labels/counts), which is as close to
     "scanning DB/" as a static site can get.
     ---------------------------------------------------------- */
  const DB_MANIFEST = [
    { key: 'general', file: 'DB/general.json', label: 'General' },
    { key: 'tools',   file: 'DB/tools.json',   label: 'Tools' },
    { key: 'games',   file: 'DB/games.json',   label: 'Games' },
    { key: 'art',     file: 'DB/art.json',     label: 'Art' },
  ];

  /* ----------------------------------------------------------
     2. "RANDOM ANY" POOL
     Note on honesty: there is no reliable public API that returns
     an arbitrary, guaranteed-iframe-safe URL from the whole open
     web — most such directories either don't exist, are unmaintained,
     or point at sites that block embedding outright. To keep the
     "Random Any" button meaningfully different from "Random DB"
     (wider net, less curated) while still opening reliably, it
     draws from Wikimedia's own random-page endpoints (a real,
     public, open API surface: MediaWiki's Special:Random) across
     several independent projects, plus a couple of other public,
     no-key-required open endpoints. Every entry here is still
     iframe-safe — "unpredictable content", not "unpredictable
     safety". If you wire up a true random-URL API later, this
     array is the only place that needs to change.
     ---------------------------------------------------------- */
  const RANDOM_ANY_POOL = [
    { name: 'Wikipedia — Random',        url: 'https://en.wikipedia.org/wiki/Special:Random' },
    { name: 'Wikimedia Commons — Random',url: 'https://commons.wikimedia.org/wiki/Special:Random/File' },
    { name: 'Wiktionary — Random',       url: 'https://en.wiktionary.org/wiki/Special:Random' },
    { name: 'Wikiquote — Random',        url: 'https://en.wikiquote.org/wiki/Special:Random' },
    { name: 'Wikisource — Random',       url: 'https://en.wikisource.org/wiki/Special:Random' },
    { name: 'Wikivoyage — Random',       url: 'https://en.wikivoyage.org/wiki/Special:Random' },
    { name: 'Wikinews — Random',         url: 'https://en.wikinews.org/wiki/Special:Random' },
    { name: 'Simple English Wikipedia — Random', url: 'https://simple.wikipedia.org/wiki/Special:Random' },
  ];

  /* ----------------------------------------------------------
     3. STATE
     ---------------------------------------------------------- */
  let dbCache = {};        // { categoryKey: [ {name,url,description}, ... ] }
  let history = [];        // ordered list of visited { name, url, source }
  let historyIndex = -1;
  let loadTimeoutId = null;

  const LOAD_TIMEOUT_MS = 6000;
  const LOADING_MESSAGES = [
    'locking coordinates…', 'dialing in a signal…', 'unfolding a new tab of reality…',
    'spinning the globe…', 'triangulating something interesting…'
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
  const randomAnyBtn    = $('randomAnyBtn');
  const openNewTabBtn   = $('openNewTabBtn');
  const dbStatus        = $('dbStatus');

  /* ----------------------------------------------------------
     5. DATABASE LOADING (dynamic "scan" of DB/ via manifest)
     ---------------------------------------------------------- */
  async function loadCategory(entry) {
    if (dbCache[entry.key]) return dbCache[entry.key];
    const res = await fetch(entry.file, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load ${entry.file}: HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error(`${entry.file} did not contain a JSON array`);
    dbCache[entry.key] = data;
    return data;
  }

  async function initDatabase() {
    categorySelect.innerHTML = '';

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All categories';
    categorySelect.appendChild(allOption);

    let loadedCount = 0;
    let totalSites = 0;

    for (const entry of DB_MANIFEST) {
      try {
        const items = await loadCategory(entry);
        const opt = document.createElement('option');
        opt.value = entry.key;
        opt.textContent = `${entry.label} (${items.length})`;
        categorySelect.appendChild(opt);
        loadedCount++;
        totalSites += items.length;
      } catch (err) {
        console.warn(`[DB] Skipping category "${entry.key}":`, err.message);
      }
    }

    categorySelect.value = 'all';
    dbStatus.textContent = loadedCount > 0
      ? `${loadedCount} categories · ${totalSites} sites loaded`
      : 'database unavailable';
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
    showLoading();

    if (pushToHistory) {
      history = history.slice(0, historyIndex + 1);
      history.push(site);
      historyIndex = history.length - 1;
    }

    iframe.src = site.url;
    updateReadout(site);
    updateNavButtons();
    openNewTabBtn.disabled = false;

    // Best-effort fallback: a blocked X-Frame-Options / CSP embed
    // does not reliably fire a JS 'error' event, so we race the
    // real 'load' event against a timer.
    loadTimeoutId = setTimeout(showError, LOAD_TIMEOUT_MS);
  }

  function updateReadout(site) {
    const tag = site.source === 'db' ? '[DB]' : site.source === 'any' ? '[ANY]' : '';
    urlReadout.textContent = `${tag} ${site.name} — ${site.url}`.trim();
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
  }
  function showError() {
    hideLoading();
    errorOverlay.classList.remove('hidden');
  }

  iframe.addEventListener('load', () => {
    if (iframe.src === 'about:blank') return;
    clearTimeout(loadTimeoutId);
    hideLoading();
  });

  /* ----------------------------------------------------------
     7. "RANDOM DB" — curated flat-file JSON
     ---------------------------------------------------------- */
  async function randomFromDb() {
    const selected = categorySelect.value || 'all';
    randomDbBtn.disabled = true;

    try {
      let pool = [];
      if (selected === 'all') {
        for (const entry of DB_MANIFEST) {
          const items = await loadCategory(entry).catch(() => []);
          pool = pool.concat(items.map((i) => ({ ...i, category: entry.key })));
        }
      } else {
        const entry = DB_MANIFEST.find((e) => e.key === selected);
        const items = entry ? await loadCategory(entry).catch(() => []) : [];
        pool = items.map((i) => ({ ...i, category: selected }));
      }

      if (pool.length === 0) {
        dbStatus.textContent = 'no sites available in this category';
        return;
      }

      let pick;
      const current = currentSite();
      do {
        pick = pool[Math.floor(Math.random() * pool.length)];
      } while (pool.length > 1 && current && pick.url === current.url);

      loadSite({ name: pick.name, url: pick.url, description: pick.description, source: 'db' }, true);
    } finally {
      randomDbBtn.disabled = false;
    }
  }

  /* ----------------------------------------------------------
     8. "RANDOM ANY" — wider, open-web pool
     ---------------------------------------------------------- */
  function randomAny() {
    let pick;
    const current = currentSite();
    do {
      pick = RANDOM_ANY_POOL[Math.floor(Math.random() * RANDOM_ANY_POOL.length)];
    } while (RANDOM_ANY_POOL.length > 1 && current && pick.url === current.url);

    // Cache-bust Special:Random links so repeat clicks actually vary,
    // since some browsers/CDNs cache the redirect target.
    const url = pick.url + (pick.url.includes('?') ? '&' : '?') + '_r=' + Date.now();
    loadSite({ name: pick.name, url, source: 'any' }, true);
  }

  /* ----------------------------------------------------------
     9. EVENT WIRING
     ---------------------------------------------------------- */
  randomDbBtn.addEventListener('click', randomFromDb);
  randomAnyBtn.addEventListener('click', randomAny);

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

  /* ----------------------------------------------------------
     10. INIT
     ---------------------------------------------------------- */
  initDatabase();
})();
