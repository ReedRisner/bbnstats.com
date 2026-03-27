const API_BASE = "https://api.collegebasketballdata.com";
const API_KEY = "AWYk+Gxvl0TAxEx0RvaeaAjHtKVDAqzQAMXEPeAKw1BL+T+i96D3O9yHadseldrw";
const cache = {};
const REQUEST_SPACING_MS = 0;
const RETRY_BASE_DELAY_MS = 750;
const MAX_RETRIES = 5;

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

async function apiFetch(path, params = {}) {
  const url = buildUrl(path, params);

  if (cache[url]) {
    return cache[url];
  }

  cache[url] = scheduleRequest(() => fetchWithRetry(url)).catch((error) => {
    delete cache[url];
    throw error;
  });

  return cache[url];
}

function clearApiCache() {
  Object.keys(cache).forEach((key) => {
    delete cache[key];
  });
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
  getAdjustedRatingsSummary
};
