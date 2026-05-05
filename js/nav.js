const NAV_LINKS = [
  { href: "index.html", label: "Dashboard" },
  { href: "players.html", label: "Players" },
  { href: "schedule.html", label: "Schedule" },
  { href: "stats.html", label: "Player Stats" },
  { href: "leaderboards.html", label: "Leaderboards" },
  { href: "finder.html", label: "Player Finder" },
  { href: "team-stats.html", label: "Team Stats" },
  { href: "team-compare.html", label: "Team Compare" },
  { href: "compare.html", label: "Player Compare" },
  { href: "lineups.html", label: "Lineups" },
  { href: "rankings.html", label: "Rankings" },
  { href: "ratings.html", label: "Ratings" }
];

const SEASON_OPTIONS = Array.from({ length: 2027 - 2000 + 1 }, (_, index) => 2027 - index);
const BRAND_MARK_SRC = "assets/bbn-ball-mark.svg";
const SEARCH_RESULT_LIMIT = 8;

let navSearchState = {
  playersBySeason: new Map(),
  teamsBySeason: new Map(),
  results: [],
  activeIndex: -1
};

function getUtils() {
  return window.BBNStatsUtils || {};
}

function getApi() {
  return window.BBNStatsApi || {};
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
    const external = link.external ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a class="site-nav__link${activeClass}" href="${link.href}"${ariaCurrent}${external}>${link.label}</a>`;
  }).join("");
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
            <div class="nav-search" id="nav-search-shell">
              <input
                class="nav-search__input"
                id="nav-search-input"
                type="search"
                placeholder="Search"
                autocomplete="off"
                spellcheck="false"
                aria-label="Search any player or team in the nation for this season"
                aria-expanded="false"
                aria-controls="nav-search-results"
              >
              <div class="nav-search__results" id="nav-search-results" hidden></div>
            </div>
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

  bindNavSearch();

  return seasonSelect;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeSearchText(value) {
  const utils = getUtils();
  if (typeof utils.normalizePlayerName === "function") {
    return utils.normalizePlayerName(value);
  }

  return String(value || "").trim().toLowerCase();
}

function buildPlayerPageUrl(player, season) {
  const url = new URL("player.html", window.location.href);
  url.searchParams.set("id", String(player.athleteId));
  url.searchParams.set("season", String(season));
  if (player.team) {
    url.searchParams.set("team", player.team);
  }
  return url.toString();
}

function buildTeamPageUrl(team, season) {
  const url = new URL("team-stats.html", window.location.href);
  url.searchParams.set("team", team.team);
  url.searchParams.set("season", String(season));
  return url.toString();
}

async function ensureNavSearchIndex(season) {
  if (navSearchState.playersBySeason.has(season) && navSearchState.teamsBySeason.has(season)) {
    return;
  }

  const api = getApi();
  if (typeof api.apiFetch !== "function") {
    return;
  }

  const [playersResponse, teamsResponse] = await Promise.all([
    api.apiFetch("/stats/player/season", { season }),
    api.apiFetch("/stats/team/season", { season })
  ]);

  const normalizeArray = typeof api.normalizeArrayResponse === "function"
    ? api.normalizeArrayResponse
    : (value) => (Array.isArray(value) ? value : value?.value || []);

  const players = normalizeArray(playersResponse)
    .map((player) => ({
      type: "player",
      athleteId: Number(player.athleteId),
      teamId: Number(player.teamId),
      name: player.name || "Unknown Player",
      team: player.team || "",
      position: player.position || "",
      searchText: normalizeSearchText(`${player.name || ""} ${player.team || ""}`)
    }))
    .filter((player) => Number.isFinite(player.athleteId));

  const teamRows = normalizeArray(teamsResponse)
    .map((team) => ({
      type: "team",
      teamId: Number(team.teamId),
      team: team.team || "",
      conference: team.conference || "",
      wins: Number(team.wins || 0),
      losses: Number(team.losses || 0),
      searchText: normalizeSearchText(`${team.team || ""} ${team.conference || ""}`)
    }))
    .filter((team) => team.team);

  navSearchState.playersBySeason.set(season, players);
  navSearchState.teamsBySeason.set(season, teamRows);
}

function rankNavSearchResults(query, season) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return [];
  }

  const players = navSearchState.playersBySeason.get(season) || [];
  const teams = navSearchState.teamsBySeason.get(season) || [];
  const merged = players.concat(teams);

  return merged
    .map((item) => {
      const haystack = item.searchText || "";
      const startsWith = haystack.startsWith(normalizedQuery);
      const index = haystack.indexOf(normalizedQuery);
      if (index === -1) {
        return null;
      }

      return {
        ...item,
        score: startsWith ? 0 : index + 1
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return left.score - right.score;
      }

      const leftLabel = left.type === "player" ? `${left.name} ${left.team}` : left.team;
      const rightLabel = right.type === "player" ? `${right.name} ${right.team}` : right.team;
      return leftLabel.localeCompare(rightLabel);
    })
    .slice(0, SEARCH_RESULT_LIMIT);
}

function renderNavSearchResults(results) {
  const input = document.getElementById("nav-search-input");
  const panel = document.getElementById("nav-search-results");

  if (!input || !panel) {
    return;
  }

  navSearchState.results = results;
  navSearchState.activeIndex = results.length ? 0 : -1;
  input.setAttribute("aria-expanded", String(results.length > 0));

  if (!results.length) {
    panel.hidden = true;
    panel.innerHTML = "";
    return;
  }

  panel.hidden = false;
  panel.innerHTML = results.map((result, index) => {
    if (result.type === "player") {
      return `
        <button class="nav-search__result${index === navSearchState.activeIndex ? " is-active" : ""}" type="button" data-nav-result-index="${index}">
          <span class="nav-search__primary">${escapeHtml(result.name)}</span>
          <span class="nav-search__secondary">${escapeHtml(`${result.team || "Unknown team"}${result.position ? ` | ${result.position}` : ""}`)}</span>
        </button>
      `;
    }

    return `
      <button class="nav-search__result${index === navSearchState.activeIndex ? " is-active" : ""}" type="button" data-nav-result-index="${index}">
        <span class="nav-search__primary">${escapeHtml(result.team)}</span>
        <span class="nav-search__secondary">${escapeHtml(`${result.conference || "Team"}${result.wins || result.losses ? ` | ${result.wins}-${result.losses}` : ""}`)}</span>
      </button>
    `;
  }).join("");
}

function closeNavSearchResults() {
  renderNavSearchResults([]);
}

function goToNavSearchResult(result, season) {
  if (!result) {
    return;
  }

  window.location.href = result.type === "player"
    ? buildPlayerPageUrl(result, season)
    : buildTeamPageUrl(result, season);
}

async function updateNavSearchResults(query) {
  const season = getCurrentSeason();
  try {
    await ensureNavSearchIndex(season);
    renderNavSearchResults(rankNavSearchResults(query, season));
  } catch (error) {
    closeNavSearchResults();
  }
}

function bindNavSearch() {
  const input = document.getElementById("nav-search-input");
  const panel = document.getElementById("nav-search-results");

  if (!input || !panel) {
    return;
  }

  input.addEventListener("focus", async () => {
    if (input.value.trim()) {
      await updateNavSearchResults(input.value);
      return;
    }

    ensureNavSearchIndex(getCurrentSeason()).catch(() => {});
  });

  input.addEventListener("input", async () => {
    const query = input.value.trim();
    if (!query) {
      closeNavSearchResults();
      return;
    }

    await updateNavSearchResults(query);
  });

  input.addEventListener("keydown", (event) => {
    if (!navSearchState.results.length) {
      if (event.key === "Enter") {
        event.preventDefault();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      navSearchState.activeIndex = (navSearchState.activeIndex + 1) % navSearchState.results.length;
      renderNavSearchResults(navSearchState.results);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      navSearchState.activeIndex = (navSearchState.activeIndex - 1 + navSearchState.results.length) % navSearchState.results.length;
      renderNavSearchResults(navSearchState.results);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const season = getCurrentSeason();
      const target = navSearchState.results[Math.max(0, navSearchState.activeIndex)];
      goToNavSearchResult(target, season);
      return;
    }

    if (event.key === "Escape") {
      closeNavSearchResults();
    }
  });

  panel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-nav-result-index]");
    if (!button) {
      return;
    }

    const index = Number(button.dataset.navResultIndex);
    const season = getCurrentSeason();
    goToNavSearchResult(navSearchState.results[index], season);
  });

  document.addEventListener("click", (event) => {
    const shell = document.getElementById("nav-search-shell");
    if (shell && !shell.contains(event.target)) {
      closeNavSearchResults();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  injectNav();
});

window.BBNStatsNav = {
  NAV_LINKS,
  SEASON_OPTIONS,
  BRAND_MARK_SRC,
  renderNav,
  injectNav
};
