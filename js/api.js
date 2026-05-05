const API_BASE = "https://api.collegebasketballdata.com";
const API_KEY = "0/5PdgRvOqvcUo9VqUAcXFUEYqXxU3T26cGqt9c6FFArBcyqE4BD3njMuwOnQz+3";
const cache = {};
const REQUEST_SPACING_MS = 0;
const RETRY_BASE_DELAY_MS = 750;
const MAX_RETRIES = 5;
const PERSISTED_CACHE_KEY = "bbnstats_api_cache_v1";
const PERSISTED_CACHE_TTL_MS = 30 * 60 * 1000;
const PERSISTED_CACHE_MAX_ENTRIES = 80;

let requestQueue = Promise.resolve();
let lastRequestAt = 0;

function buildUrl(path, params = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const queryParams = { ...params };

  queryParams.team = queryParams.team || undefined;

  const query = new URLSearchParams(
    Object.entries(queryParams).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ).toString();

  return `${API_BASE}${normalizedPath}${query ? `?${query}` : ""}`;
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getRetryDelay(res, attempt) {
  const retryAfter = Number.parseFloat(res?.headers?.get?.("Retry-After"));

  if (!Number.isNaN(retryAfter) && retryAfter > 0) {
    return retryAfter * 1000;
  }

  return RETRY_BASE_DELAY_MS * (2 ** attempt);
}

function scheduleRequest(task) {
  if (REQUEST_SPACING_MS <= 0) {
    return task();
  }

  requestQueue = requestQueue.then(async () => {
    const waitMs = Math.max(0, REQUEST_SPACING_MS - (Date.now() - lastRequestAt));

    if (waitMs > 0) {
      await sleep(waitMs);
    }

    lastRequestAt = Date.now();
    return task();
  });

  return requestQueue;
}

async function fetchWithRetry(url, attempt = 0) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_KEY}`
    }
  });

  if (res.status === 429 && attempt < MAX_RETRIES) {
    await sleep(getRetryDelay(res, attempt));
    return fetchWithRetry(url, attempt + 1);
  }

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${url}`);
  }

  return res.json();
}

function readPersistedCache() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PERSISTED_CACHE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function writePersistedCache(nextCache) {
  try {
    const entries = Object.entries(nextCache)
      .sort((left, right) => Number(right[1]?.savedAt || 0) - Number(left[1]?.savedAt || 0))
      .slice(0, PERSISTED_CACHE_MAX_ENTRIES);

    localStorage.setItem(PERSISTED_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch (error) {
    try {
      localStorage.removeItem(PERSISTED_CACHE_KEY);
    } catch (removeError) {
      // Ignore storage cleanup failures.
    }
  }
}

function getPersistedApiValue(url) {
  const persisted = readPersistedCache();
  const entry = persisted[url];

  if (!entry || (Date.now() - Number(entry.savedAt || 0)) > PERSISTED_CACHE_TTL_MS) {
    if (entry) {
      delete persisted[url];
      writePersistedCache(persisted);
    }

    return undefined;
  }

  return entry.value;
}

function setPersistedApiValue(url, value) {
  const persisted = readPersistedCache();
  persisted[url] = {
    savedAt: Date.now(),
    value
  };
  writePersistedCache(persisted);
}

async function apiFetch(path, params = {}) {
  const url = buildUrl(path, params);

  if (cache[url]) {
    return cache[url];
  }

  const persistedValue = getPersistedApiValue(url);

  if (persistedValue !== undefined) {
    cache[url] = Promise.resolve(persistedValue);
    return cache[url];
  }

  cache[url] = scheduleRequest(() => fetchWithRetry(url).then((value) => {
    setPersistedApiValue(url, value);
    return value;
  })).catch((error) => {
    delete cache[url];
    throw error;
  });

  return cache[url];
}

function clearApiCache() {
  Object.keys(cache).forEach((key) => {
    delete cache[key];
  });

  try {
    localStorage.removeItem(PERSISTED_CACHE_KEY);
  } catch (error) {
    // Ignore cache clearing failures.
  }
}

function getCachedApiValue(path, params = {}) {
  return cache[buildUrl(path, params)];
}

function normalizeArrayResponse(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && Array.isArray(value.value)) {
    return value.value;
  }

  return [];
}

function normalizeTeamName(team) {
  return String(team || "").trim().toLowerCase();
}

function getAdjustedMetricValue(row, metric) {
  if (!row) {
    return Number.NaN;
  }

  if (metric === "offense") {
    return Number(row.offensiveRating ?? row.offRtg ?? Number.NaN);
  }

  if (metric === "defense") {
    return Number(row.defensiveRating ?? row.defRtg ?? Number.NaN);
  }

  if (metric === "net") {
    const off = Number(row.offensiveRating ?? row.offRtg ?? Number.NaN);
    const def = Number(row.defensiveRating ?? row.defRtg ?? Number.NaN);
    return Number(row.netRating ?? (Number.isNaN(off) || Number.isNaN(def) ? Number.NaN : off - def));
  }

  return Number.NaN;
}

function findAdjustedTeamRow(rows, team) {
  const normalizedTeam = normalizeTeamName(team);
  return normalizeArrayResponse(rows).find((row) => normalizeTeamName(row?.team) === normalizedTeam) || null;
}

function buildMetricRank(rows, team, getValue, ascending = false) {
  const rankedRows = normalizeArrayResponse(rows)
    .map((row) => ({ row, value: Number(getValue(row)) }))
    .filter((entry) => Number.isFinite(entry.value))
    .sort((left, right) => {
      if (left.value === right.value) {
        return String(left.row?.team || "").localeCompare(String(right.row?.team || ""));
      }

      return ascending ? left.value - right.value : right.value - left.value;
    });

  const normalizedTeam = normalizeTeamName(team);
  const index = rankedRows.findIndex((entry) => normalizeTeamName(entry.row?.team) === normalizedTeam);
  return index >= 0 ? index + 1 : null;
}

function getAdjustedRanks(rows, team) {
  const normalizedRows = normalizeArrayResponse(rows);
  const teamRow = findAdjustedTeamRow(normalizedRows, team);

  if (!teamRow) {
    return null;
  }

  const getRank = (metric, ascending = false) => {
    const sorted = normalizedRows
      .filter((row) => !Number.isNaN(getAdjustedMetricValue(row, metric)))
      .slice()
      .sort((a, b) => {
        const diff = getAdjustedMetricValue(a, metric) - getAdjustedMetricValue(b, metric);

        if (diff === 0) {
          return String(a?.team || "").localeCompare(String(b?.team || ""));
        }

        return ascending ? diff : -diff;
      });

    const rankIndex = sorted.findIndex((row) => row?.teamId === teamRow?.teamId || normalizeTeamName(row?.team) === normalizeTeamName(teamRow?.team));
    return rankIndex >= 0 ? rankIndex + 1 : null;
  };

  return {
    offense: getRank("offense", false),
    defense: getRank("defense", true),
    net: getRank("net", false)
  };
}

async function getAdjustedRatingsSummary(team, season) {
  const rows = normalizeArrayResponse(await apiFetch("/ratings/adjusted", { season }));
  return {
    rows,
    team: findAdjustedTeamRow(rows, team) || {},
    ranks: getAdjustedRanks(rows, team) || {}
  };
}

async function getTeamSeasonStatRanks(team, season) {
  const rows = normalizeArrayResponse(await apiFetch("/stats/team/season", { season }));

  const perGame = (row, getter) => {
    const games = Number(row?.games || 0);
    return games ? getter(row) / games : Number.NaN;
  };

  return {
    ppg: buildMetricRank(rows, team, (row) => perGame(row, (entry) => Number(entry?.teamStats?.points?.total || 0)), false),
    oppPpg: buildMetricRank(rows, team, (row) => perGame(row, (entry) => Number(entry?.opponentStats?.points?.total || 0)), true),
    fgPct: buildMetricRank(rows, team, (row) => Number(row?.teamStats?.fieldGoals?.pct), false),
    threePct: buildMetricRank(rows, team, (row) => Number(row?.teamStats?.threePointFieldGoals?.pct), false),
    ftPct: buildMetricRank(rows, team, (row) => Number(row?.teamStats?.freeThrows?.pct), false),
    reboundsPerGame: buildMetricRank(rows, team, (row) => perGame(row, (entry) => Number(entry?.teamStats?.rebounds?.total || 0)), false),
    assistsPerGame: buildMetricRank(rows, team, (row) => perGame(row, (entry) => Number(entry?.teamStats?.assists || 0)), false),
    turnoversPerGame: buildMetricRank(rows, team, (row) => perGame(row, (entry) => Number(entry?.teamStats?.turnovers?.total || 0)), true)
  };
}

window.BBNStatsApi = {
  API_BASE,
  API_KEY,
  cache,
  buildUrl,
  apiFetch,
  clearApiCache,
  getCachedApiValue,
  normalizeArrayResponse,
  findAdjustedTeamRow,
  getAdjustedRanks,
  getAdjustedRatingsSummary,
  getTeamSeasonStatRanks
};
