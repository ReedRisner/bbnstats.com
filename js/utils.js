const DEFAULT_SEASON = 2026;
const MIN_SEASON = 2000;
const MAX_SEASON = 2026;
const SEASON_STORAGE_KEY = "bbnstats_season";
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

function normalizeClassYearLabel(value) {
  const normalized = String(value || "").trim().toUpperCase();

  if (normalized === "FR") return "Fr.";
  if (normalized === "SO") return "So.";
  if (normalized === "JR") return "Jr.";
  if (normalized === "SR") return "Sr.";
  if (normalized === "GR") return "Gr.";

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

  const start = Number(player?.startSeason || season);
  const years = Math.max(0, season - start);
  const labels = ["Fr.", "So.", "Jr.", "Sr."];
  return labels[Math.min(years, labels.length - 1)] || "Fr.";
}

function getSeason() {
  const storedSeason = Number.parseInt(localStorage.getItem(SEASON_STORAGE_KEY), 10);

  if (Number.isNaN(storedSeason)) {
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

window.BBNStatsUtils = {
  DEFAULT_SEASON,
  SEASON_STORAGE_KEY,
  getSeason,
  setSeason,
  fmtPct,
  fmtNum,
  colorStat,
  heightInches,
  formatDate,
  getResult,
  winProbColor,
  getPlayerClassYear
};
