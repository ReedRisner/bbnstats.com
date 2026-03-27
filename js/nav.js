const NAV_LINKS = [
  { href: "index.html", label: "Dashboard" },
  { href: "players.html", label: "Players" },
  { href: "schedule.html", label: "Schedule" },
  { href: "stats.html", label: "Player Stats" },
  { href: "team-stats.html", label: "Team Stats" },
  { href: "compare.html", label: "Compare" },
  { href: "lineups.html", label: "Lineups" },
  { href: "rankings.html", label: "Rankings" },
  { href: "ratings.html", label: "Ratings" },
  { href: "offseason.html", label: "News" }
];

const SEASON_OPTIONS = Array.from({ length: 2026 - 2000 + 1 }, (_, index) => 2026 - index);
const THEME_STORAGE_KEY = "bbnstats_theme";
const BRAND_MARK_SRC = "assets/bbn-ball-mark.svg";

function getPreferredTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return "dark";
}

function applyTheme(theme) {
  const nextTheme = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", nextTheme);
  document.documentElement.style.colorScheme = nextTheme;
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.textContent = nextTheme === "light" ? "Dark Mode" : "Light Mode";
    toggle.setAttribute("aria-pressed", String(nextTheme === "light"));
  }
}

applyTheme(getPreferredTheme());

function getUtils() {
  return window.BBNStatsUtils || {};
}

function normalizePathname(pathname) {
  if (!pathname || pathname === "/") {
    return "index.html";
  }

  const normalized = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
  return normalized.replace(/^\/+/, "");
}

function normalizeNavHref(href) {
  return String(href || "").replace(/^\/+/, "");
}

function getActivePath() {
  return normalizePathname(window.location.pathname);
}

function getCurrentSeason() {
  const { getSeason } = getUtils();
  return typeof getSeason === "function" ? getSeason() : 2026;
}

function handleSeasonChange(event) {
  const { setSeason } = getUtils();
  const nextSeason = String(event.target.value || 2026);

  if (typeof setSeason === "function") {
    localStorage.setItem("bbnstats_season", nextSeason);
  } else {
    localStorage.setItem("bbnstats_season", nextSeason);
  }

  const url = new URL(window.location.href);

  if (url.searchParams.has("season")) {
    url.searchParams.set("season", nextSeason);
    window.location.href = url.toString();
    return;
  }

  window.location.reload();
}

function createSeasonOptions(selectedSeason) {
  return SEASON_OPTIONS.map((season) => {
    const selected = season === selectedSeason ? " selected" : "";
    return `<option value="${season}"${selected}>${season}</option>`;
  }).join("");
}

function createNavLinks(activePath) {
  return NAV_LINKS.map((link) => {
    const isActive = activePath === normalizeNavHref(link.href);
    const activeClass = isActive ? " is-active" : "";
    const ariaCurrent = isActive ? ' aria-current="page"' : "";
    return `<a class="site-nav__link${activeClass}" href="${link.href}"${ariaCurrent}>${link.label}</a>`;
  }).join("");
}

function handleThemeToggle() {
  const activeTheme = document.documentElement.getAttribute("data-theme") || getPreferredTheme();
  applyTheme(activeTheme === "light" ? "dark" : "light");
}

function ensureFavicon() {
  const head = document.head || document.querySelector("head");
  if (!head) {
    return;
  }

  let favicon = document.querySelector('link[rel="icon"][data-bbnstats-favicon]');
  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/svg+xml";
    favicon.setAttribute("data-bbnstats-favicon", "true");
    head.appendChild(favicon);
  }

  favicon.href = BRAND_MARK_SRC;
}

function renderNav() {
  const activePath = getActivePath();
  const selectedSeason = getCurrentSeason();
  const theme = document.documentElement.getAttribute("data-theme") || getPreferredTheme();
  const themeLabel = theme === "light" ? "Dark Mode" : "Light Mode";

  return `
    <nav class="site-nav" aria-label="Primary">
      <div class="site-nav__inner">
        <a class="site-brand" href="index.html" aria-label="BBN Stats home">
          <span class="site-brand__logo" aria-hidden="true">
            <img class="site-brand__logo-image" src="${BRAND_MARK_SRC}" alt="">
          </span>
          <span class="site-brand__text">
            <span class="site-brand__eyebrow">BBN Stats</span>
            <span class="site-brand__title">Kentucky Basketball</span>
          </span>
        </a>
        <div class="site-nav__menu">
          <div class="site-nav__links">
            ${createNavLinks(activePath)}
          </div>
          <div class="site-nav__controls">
            <button class="theme-toggle" id="theme-toggle" type="button" aria-label="Toggle color theme" aria-pressed="${theme === "light"}">
              ${themeLabel}
            </button>
            <label class="season-select-wrap" for="season-select">
              <span class="sr-only">Select season</span>
              <select class="season-select" id="season-select" name="season">
                ${createSeasonOptions(selectedSeason)}
              </select>
            </label>
          </div>
        </div>
      </div>
    </nav>
  `;
}

function injectNav(targetSelector = "body") {
  const target = document.querySelector(targetSelector);

  if (!target) {
    return null;
  }

  ensureFavicon();
  target.insertAdjacentHTML("afterbegin", renderNav());

  const seasonSelect = document.getElementById("season-select");

  if (seasonSelect) {
    seasonSelect.addEventListener("change", handleSeasonChange);
  }

  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", handleThemeToggle);
  }

  return seasonSelect;
}

document.addEventListener("DOMContentLoaded", () => {
  injectNav();
});

window.BBNStatsNav = {
  NAV_LINKS,
  SEASON_OPTIONS,
  BRAND_MARK_SRC,
  applyTheme,
  renderNav,
  injectNav
};
