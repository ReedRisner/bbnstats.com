const DEFAULT_SEASON = 2026;
const MIN_SEASON = 2000;
const MAX_SEASON = 2027;
const SEASON_STORAGE_KEY = "bbnstats_season";
const PLAYER_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "svg"];
const TEAM_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "svg"];
const CLASS_YEAR_BY_SEASON = {
  2018: {
    "Kevin Knox": "FR",
    "Shai Gilgeous-Alexander": "FR",
    "PJ Washington": "FR",
    "Hamidou Diallo": "FR",
    "Quade Green": "FR",
    "Wenyen Gabriel": "SO",
    "Nick Richards": "FR",
    "Sacha Killeya-Jones": "SO",
    "Jarred Vanderbilt": "FR",
    "Tai Wynyard": "SO",
    "Brad Calipari": "SO",
    "Jonny David": "JR",
    "Dillon Pulliam": "JR"
  },
  2019: {
    "PJ Washington": "SO",
    "Tyler Herro": "FR",
    "Keldon Johnson": "FR",
    "Reid Travis": "SR",
    "Ashton Hagans": "FR",
    "Immanuel Quickley": "FR",
    "Nick Richards": "SO",
    "EJ Montgomery": "FR",
    "Quade Green": "SO",
    "Jemarl Baker": "FR",
    "Jonny David": "SR"
  },
  2020: {
    "Immanuel Quickley": "SO",
    "Nick Richards": "JR",
    "Tyrese Maxey": "FR",
    "Ashton Hagans": "SO",
    "EJ Montgomery": "SO",
    "Nate Sestina": "SR",
    "Keion Brooks": "FR",
    "Johnny Juzang": "FR",
    "Kahlil Whitney": "FR",
    "Brennan Canada": "FR",
    "Ben Jordan": "SO",
    "Zan Payne": "FR",
    "Riley Welch": "JR"
  },
  2021: {
    "Davion Mintz": "SR",
    "Brandon Boston": "FR",
    "Olivier Sarr": "SR",
    "Isaiah Jackson": "FR",
    "Keion Brooks": "SO",
    "Devin Askew": "FR",
    "Jacob Toppin": "SO",
    "Dontaie Allen": "FR",
    "Terrence Clarke": "FR",
    "Lance Ware": "FR",
    "Cam'Ron Fletcher": "FR",
    "Zan Payne": "SO",
    "Brennan Canada": "SO",
    "Kareem Watkins": "FR",
    "Riley Welch": "SR"
  },
  2022: {
    "Oscar Tshiebwe": "JR",
    "TyTy Washington": "FR",
    "Kellan Grady": "SR",
    "Keion Brooks": "JR",
    "Sahvir Wheeler": "JR",
    "Davion Mintz": "SR",
    "Jacob Toppin": "JR",
    "Daimion Collins": "FR",
    "Bryce Hopkins": "FR",
    "Lance Ware": "SO",
    "Dontaie Allen": "SO",
    "Zan Payne": "JR",
    "Brennan Canada": "JR",
    "Kareem Watkins": "SO"
  },
  2023: {
    "Oscar Tshiebwe": "SR",
    "Antonio Reeves": "SR",
    "Jacob Toppin": "SR",
    "Cason Wallace": "FR",
    "Chris Livingston": "FR",
    "CJ Fredrick": "SR",
    "Sahvir Wheeler": "SR",
    "Lance Ware": "JR",
    "Daimion Collins": "SO",
    "Adou Thiero": "FR",
    "Ugonna Onyenso": "FR",
    "Brennan Canada": "SR",
    "Walker Horn": "FR",
    "Kareem Watkins": "JR"
  },
  2024: {
    "Antonio Reeves": "SR",
    "Rob Dillingham": "FR",
    "Reed Sheppard": "FR",
    "Tre Mitchell": "SR",
    "D.J. Wagner": "FR",
    "Justin Edwards": "FR",
    "Adou Thiero": "SO",
    "Aaron Bradshaw": "FR",
    "Ugonna Onyenso": "SO",
    "Zvonimir Ivisic": "FR",
    "Jordan Burks": "FR",
    "Joey Hart": "FR",
    "Brennan Canada": "SR",
    "Grant Darbyshire": "SO",
    "Walker Horn": "SO",
    "Kareem Watkins": "SR"
  },
  2025: {
    "Otega Oweh": "JR",
    "Koby Brea": "SR",
    "Amari Williams": "SR",
    "Andrew Carr": "SR",
    "Jaxson Robinson": "SR",
    "Lamont Butler": "SR",
    "Brandon Garrison": "SO",
    "Ansley Almonor": "SR",
    "Travis Perry": "FR",
    "Collin Chandler": "FR",
    "Trent Noah": "FR",
    "Kerr Kriisa": "SR",
    "Grant Darbyshire": "JR",
    "Walker Horn": "JR",
    "Zach Tow": "JR"
  },
  2026: {
    "Otega Oweh": "SR",
    "Denzel Aberdeen": "SR",
    "Collin Chandler": "SO",
    "Malachi Moreno": "FR",
    "Mouhamed Dioubate": "JR",
    "Andrija Jelavic": "FR",
    "Jasper Johnson": "FR",
    "Brandon Garrison": "JR",
    "Kam Williams": "SO",
    "Trent Noah": "SO",
    "Jaland Lowe": "JR",
    "Jayden Quaintance": "SO",
    "Zach Tow": "SR",
    "Walker Horn": "SR",
    "Braydon Hawthorne": "FR",
    "Reece Potter": "JR"
  }
};

function normalizePlayerName(name) {
  return String(name || "")
    .normalize("NFKD")
    .replace(/[^\w\s.'-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizeTeamName(team) {
  return String(team || "")
    .normalize("NFKD")
    .replace(/[^\w\s&.'-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isKentuckyTeam(team) {
  const normalized = normalizeTeamName(team);
  return normalized === "kentucky" || normalized === "kentucky wildcats";
}

function normalizeClassYearLabel(value) {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\./g, "");

  if (["FR", "FRESHMAN", "FIRST YEAR", "1"].includes(normalized)) return "Fr.";
  if (["SO", "SOPHOMORE", "SECOND YEAR", "2"].includes(normalized)) return "So.";
  if (["JR", "JUNIOR", "THIRD YEAR", "3"].includes(normalized)) return "Jr.";
  if (["SR", "SENIOR", "FOURTH YEAR", "4"].includes(normalized)) return "Sr.";
  if (["GR", "GRAD", "GRADUATE", "FIFTH YEAR", "5"].includes(normalized)) return "Gr.";

  return "";
}

function getPlayerClassYear(player, season = DEFAULT_SEASON) {
  const seasonMap = CLASS_YEAR_BY_SEASON[season] || {};
  const exactName = String(player?.name || "").trim();
  const normalizedName = normalizePlayerName(exactName);
  const matchedEntry = Object.entries(seasonMap).find(([name]) => normalizePlayerName(name) === normalizedName);

  if (matchedEntry) {
    return normalizeClassYearLabel(matchedEntry[1]);
  }

  const explicitClass = normalizeClassYearLabel(player?.classYear || player?.class || player?.year);
  if (explicitClass) {
    return explicitClass;
  }

  const start = Number(player?.startSeason || season);
  const years = Math.max(0, Number(season) - start);
  const labels = ["Fr.", "So.", "Jr.", "Sr.", "Gr."];
  return labels[Math.min(years, labels.length - 1)] || "Fr.";
}

function getSeason() {
  const storedSeason = Number.parseInt(localStorage.getItem(SEASON_STORAGE_KEY), 10);

  if (Number.isNaN(storedSeason)) {
    return DEFAULT_SEASON;
  }

  if (storedSeason === 2027) {
    localStorage.setItem(SEASON_STORAGE_KEY, String(DEFAULT_SEASON));
    return DEFAULT_SEASON;
  }

  return Math.min(MAX_SEASON, Math.max(MIN_SEASON, storedSeason));
}

function setSeason(year) {
  const nextSeason = Number.parseInt(year, 10);
  const safeSeason = Number.isNaN(nextSeason)
    ? DEFAULT_SEASON
    : Math.min(MAX_SEASON, Math.max(MIN_SEASON, nextSeason));

  localStorage.setItem(SEASON_STORAGE_KEY, String(safeSeason));
  window.location.reload();
}

function fmtPct(val) {
  const num = Number(val);

  if (val === null || val === undefined || Number.isNaN(num)) {
    return "0.0%";
  }

  const normalized = Math.abs(num) <= 1 ? num * 100 : num;
  return `${normalized.toFixed(1)}%`;
}

function fmtNum(val, decimals = 1) {
  if (val === null || val === undefined || Number.isNaN(Number(val))) {
    return (0).toFixed(decimals);
  }

  return Number(val).toFixed(decimals);
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function norm(value, low, high) {
  const num = numberOrNull(value);

  if (num === null || high === low) {
    return 0;
  }

  return clamp01((num - low) / (high - low));
}

function normLowerBetter(value, low, high) {
  const num = numberOrNull(value);

  if (num === null || num <= 0 || high === low) {
    return 0;
  }

  return clamp01((high - num) / (high - low));
}

function firstNumber(...values) {
  for (const value of values) {
    const num = numberOrNull(value);

    if (num !== null) {
      return num;
    }
  }

  return null;
}

function perGameValue(total, games, fallback) {
  const fallbackNum = numberOrNull(fallback);

  if (fallbackNum !== null) {
    return fallbackNum;
  }

  const totalNum = numberOrNull(total);
  const gamesNum = numberOrNull(games);

  if (totalNum === null || !gamesNum) {
    return null;
  }

  return totalNum / gamesNum;
}

function percentForRating(...values) {
  const num = firstNumber(...values);

  if (num === null) {
    return null;
  }

  return Math.abs(num) <= 1 ? num * 100 : num;
}

function calculateCollegePlayerRating(player = {}) {
  const games = firstNumber(player.games, player.gamesPlayed);
  const winShares = typeof player.winShares === "object"
    ? firstNumber(player.winShares?.total, player.winShares?.value)
    : firstNumber(player.winShares);
  const wsPer40 = typeof player.winShares === "object"
    ? firstNumber(player.winShares?.totalPer40, player.wsPer40)
    : firstNumber(player.wsPer40);

  const ratingPlayer = {
    ppg: perGameValue(player.points, games, player.ppg, player.pointsPerGame),
    rpg: perGameValue(player.rebounds?.total ?? player.rebounds, games, player.rpg, player.reboundsPerGame),
    apg: perGameValue(player.assists, games, player.apg, player.assistsPerGame),
    spg: perGameValue(player.steals, games, player.spg, player.stealsPerGame),
    bpg: perGameValue(player.blocks, games, player.bpg, player.blocksPerGame),
    mpg: perGameValue(player.minutes, games, player.mpg, player.minutesPerGame),
    tsPercent: percentForRating(player.tsPercent, player.trueShootingPct),
    efgPercent: percentForRating(player.efgPercent, player.effectiveFieldGoalPct),
    fgPercent: percentForRating(player.fgPercent, player.fieldGoals?.pct),
    threePercent: percentForRating(player.threePercent, player.threePointFieldGoals?.pct),
    ftPercent: percentForRating(player.ftPercent, player.freeThrows?.pct),
    ftRate: percentForRating(player.ftRate, player.freeThrowRate),
    usagePercent: percentForRating(player.usagePercent, player.usage),
    offRtg: firstNumber(player.offRtg, player.offensiveRating),
    defRtg: firstNumber(player.defRtg, player.defensiveRating),
    netRtg: firstNumber(player.netRtg, player.netRating),
    porpag: firstNumber(player.porpag, player.PORPAG),
    winShares,
    wsPer40,
    astTo: firstNumber(player.astTo, player.assistsTurnoverRatio)
  };

  const production =
    0.45 * norm(ratingPlayer.ppg, 4, 20) +
    0.18 * norm(ratingPlayer.rpg, 1, 7) +
    0.15 * norm(ratingPlayer.apg, 0.5, 5) +
    0.12 * norm(ratingPlayer.spg, 0.3, 2.2) +
    0.05 * norm(ratingPlayer.bpg, 0, 1.2) +
    0.05 * norm(ratingPlayer.mpg, 12, 34);

  const efficiency =
    0.25 * norm(ratingPlayer.tsPercent, 48, 62) +
    0.20 * norm(ratingPlayer.efgPercent, 43, 58) +
    0.15 * norm(ratingPlayer.fgPercent, 38, 55) +
    0.15 * norm(ratingPlayer.threePercent, 25, 40) +
    0.10 * norm(ratingPlayer.ftPercent, 60, 85) +
    0.15 * norm(ratingPlayer.ftRate, 15, 55);

  const advancedImpact =
    0.18 * norm(ratingPlayer.usagePercent, 16, 30) +
    0.20 * norm(ratingPlayer.offRtg, 95, 125) +
    0.15 * normLowerBetter(ratingPlayer.defRtg, 92, 115) +
    0.17 * norm(ratingPlayer.netRtg, -5, 15) +
    0.12 * norm(ratingPlayer.porpag, 0, 5.5) +
    0.10 * norm(ratingPlayer.winShares, 0.5, 5) +
    0.08 * norm(ratingPlayer.wsPer40, 0.06, 0.18);

  const defense =
    0.45 * norm(ratingPlayer.spg, 0.3, 2.2) +
    0.20 * norm(ratingPlayer.bpg, 0, 1.2) +
    0.20 * normLowerBetter(ratingPlayer.defRtg, 92, 115) +
    0.15 * norm(ratingPlayer.netRtg, -5, 15);

  const playmaking =
    0.55 * norm(ratingPlayer.astTo, 0.6, 2.5) +
    0.30 * norm(ratingPlayer.apg, 0.5, 5) +
    0.15 * norm(ratingPlayer.usagePercent, 16, 30);

  const rating =
    100 *
    (
      0.30 * production +
      0.25 * efficiency +
      0.25 * advancedImpact +
      0.12 * defense +
      0.08 * playmaking
    );

  const generousRating = rating + ((100 - rating) * 0.30);

  return Math.round(Math.min(100, generousRating) * 10) / 10;
}

function colorStat(val, low, mid, high) {
  const num = Number(val);

  if (Number.isNaN(num)) {
    return "heat-neutral";
  }

  if (num >= high) {
    return "heat-best";
  }

  if (num >= mid) {
    return "heat-good";
  }

  if (num >= low) {
    return "heat-neutral";
  }

  return "heat-low";
}

function heightInches(val) {
  const inches = Number.parseInt(val, 10);

  if (Number.isNaN(inches) || inches <= 0) {
    return "--";
  }

  const feet = Math.floor(inches / 12);
  const remainder = inches % 12;
  return `${feet}'${remainder}"`;
}

function formatDate(iso) {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(date);
}

function getResult(game, teamName = "Kentucky") {
  if (!game) {
    return "";
  }

  const isHomeTeam = game.homeTeam === teamName;
  const teamScore = isHomeTeam ? game.homePoints : game.awayPoints;
  const opponentScore = isHomeTeam ? game.awayPoints : game.homePoints;

  if (teamScore === null || teamScore === undefined || opponentScore === null || opponentScore === undefined) {
    return "";
  }

  const outcome = teamScore >= opponentScore ? "W" : "L";
  return `${outcome} ${teamScore}-${opponentScore}`;
}

function winProbColor(prob) {
  const normalized = Math.min(1, Math.max(0, Number(prob) || 0));

  if (normalized <= 0.33) {
    return "#e74c3c";
  }

  if (normalized <= 0.66) {
    return "#f1c40f";
  }

  return "#27ae60";
}

function buildLocalImageCandidates(folder, id, extensions = []) {
  const normalizedId = String(id ?? "").trim();

  if (!normalizedId) {
    return [];
  }

  return extensions.map((extension) => `assets/images/${folder}/${encodeURIComponent(normalizedId)}.${extension}`);
}

function getPlayerImageCandidates(playerId) {
  return buildLocalImageCandidates("players", playerId, PLAYER_IMAGE_EXTENSIONS);
}

function getTeamImageCandidates(teamId) {
  return buildLocalImageCandidates("teams", teamId, TEAM_IMAGE_EXTENSIONS);
}

function getFallbackImage(type = "player") {
  return type === "team"
    ? "assets/images/teams/placeholder.svg"
    : "assets/images/players/placeholder.svg";
}

function applyImageFallback(image, fallbackSrc) {
  if (!image) {
    return;
  }

  image.onerror = null;
  image.src = fallbackSrc;
}

function hydrateManagedImages(scope = document) {
  const root = scope && typeof scope.querySelectorAll === "function" ? scope : document;

  root.querySelectorAll("img[data-image-candidates]").forEach((image) => {
    const raw = image.dataset.imageCandidates || "";
    const candidates = raw.split("|").filter(Boolean);
    const fallback = image.dataset.fallbackSrc || getFallbackImage(image.dataset.imageType || "player");

    if (!candidates.length) {
      applyImageFallback(image, fallback);
      return;
    }

    let index = 0;
    const tryNext = () => {
      if (index >= candidates.length) {
        applyImageFallback(image, fallback);
        return;
      }

      const nextSrc = candidates[index];
      index += 1;
      image.src = nextSrc;
    };

    image.onerror = tryNext;
    tryNext();
  });
}

function normalizePositionGroup(position) {
  const value = String(position || "").toLowerCase();

  if (value.includes("guard")) return "guard";
  if (value.includes("forward")) return "forward";
  if (value.includes("center")) return "center";
  return "unknown";
}

function isPostseasonLike(item) {
  const text = [
    item?.seasonType,
    item?.seasonTypeLabel,
    item?.tournament,
    item?.eventType,
    item?.eventName,
    item?.notes,
    item?.name,
    item?.label,
    item?.postseasonLabel
  ].filter(Boolean).join(" ").toLowerCase();

  return text.includes("post") ||
    text.includes("ncaa") ||
    text.includes("march madness") ||
    text.includes("sec tournament") ||
    text.includes("sec tourney") ||
    text.includes("southeastern conference tournament") ||
    text.includes("nit") ||
    text.includes("cbi") ||
    text.includes("crown") ||
    text.includes("tournament") ||
    text.includes("championship") ||
    text.includes("sec tournament") ||
    text.includes("sec tourney") ||
    text.includes("conference tournament");
}

window.BBNStatsUtils = {
  DEFAULT_SEASON,
  SEASON_STORAGE_KEY,
  normalizePlayerName,
  normalizeTeamName,
  isKentuckyTeam,
  normalizeClassYearLabel,
  getSeason,
  setSeason,
  fmtPct,
  fmtNum,
  calculateCollegePlayerRating,
  colorStat,
  heightInches,
  formatDate,
  getResult,
  winProbColor,
  getPlayerClassYear,
  getPlayerImageCandidates,
  getTeamImageCandidates,
  getFallbackImage,
  hydrateManagedImages,
  isPostseasonLike
};
