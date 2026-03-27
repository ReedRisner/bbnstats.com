const CANVAS_W = 640;
const CANVAS_H = 560;
const BKCX = 320;
const BKCY = 52;
const LANE_LEFT = 243;
const LANE_RIGHT = 397;
const FT_Y = 226;
const THREE_RADIUS = 274;
const CORNER_CX_L = 96;
const CORNER_CX_R = 544;
const CORNER_Y = 167;

const FULL_COURT_W = 940;
const FULL_COURT_H = 500;
const HALF_COURT_X = 470;
const LEFT_BASKET_X = 75;
const LEFT_BASKET_Y = 250;

const SHOT_CHART_WIDTH = CANVAS_W;
const SHOT_CHART_HEIGHT = CANVAS_H;
const API_COURT_WIDTH = FULL_COURT_W;
const API_HALF_HEIGHT = HALF_COURT_X;
const BASKET_X_API = LEFT_BASKET_X;
const BASKET_Y_API = LEFT_BASKET_Y;

const DEBUG = new URLSearchParams(window.location.search).get("debug") === "shotchart";

const ZONE_KEYS = [
  "restricted",
  "shortMidL",
  "shortMidR",
  "shortMidCenter",
  "midL",
  "midR",
  "midCenter",
  "corner3L",
  "corner3R",
  "wing3L",
  "wing3R",
  "center3"
];

const ZONE_LABELS = {
  restricted: "Rim",
  shortMidL: "Left Side Short Mid",
  shortMidR: "Right Side Short Mid",
  shortMidCenter: "Short Mid Center",
  midL: "Left Mid-Range",
  midR: "Right Mid-Range",
  midCenter: "Center Mid-Range",
  corner3L: "Left Corner 3",
  corner3R: "Right Corner 3",
  wing3L: "Left Wing 3",
  wing3R: "Right Wing 3",
  center3: "Center 3"
};

const ZONE_LABEL_POSITIONS = {
  restricted: { x: 320, y: 68 },
  shortMidCenter: { x: 320, y: 140 },
  shortMidL: { x: 175, y: 130 },
  shortMidR: { x: 465, y: 130 },
  midL: { x: 130, y: 220 },
  midR: { x: 510, y: 220 },
  midCenter: { x: 320, y: 260 },
  corner3L: { x: 42, y: 80 },
  corner3R: { x: 598, y: 80 },
  wing3L: { x: 55, y: 320 },
  wing3R: { x: 585, y: 320 },
  center3: { x: 320, y: 430 }
};

const THREE_POINT_ZONES = new Set(["corner3L", "corner3R", "wing3L", "wing3R", "center3"]);
const PAINT_ZONES = new Set(["restricted", "shortMidL", "shortMidR", "shortMidCenter"]);

function getDebugShotChartMode() {
  return DEBUG;
}

function normalizeToLeftBasket(apiX, apiY) {
  if (apiX > HALF_COURT_X) {
    return { x: FULL_COURT_W - apiX, y: apiY };
  }
  return { x: apiX, y: apiY };
}

function toCanvas(normalizedX, normalizedY) {
  return {
    cx: (normalizedY / FULL_COURT_H) * CANVAS_W,
    cy: (normalizedX / HALF_COURT_X) * CANVAS_H
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }

  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function createEmptyZoneSummary() {
  return ZONE_KEYS.reduce((summary, key) => {
    summary[key] = { key, label: ZONE_LABELS[key], made: 0, attempted: 0, pct: 0 };
    return summary;
  }, {});
}

function getZone(normX, normY) {
  if (normX > 440) return null;
  if (normX <= 0 && normY <= 0) return null;

  const dx = normX - LEFT_BASKET_X;
  const dy = normY - LEFT_BASKET_Y;
  const dist = Math.sqrt((dx * dx) + (dy * dy));

  if (dist < 35) return "restricted";
  if (normX < 140 && normY < 90) return "corner3L";
  if (normX < 140 && normY > 410) return "corner3R";

  if (dist > 275) {
    if (normY < 200) return "wing3L";
    if (normY > 300) return "wing3R";
    return "center3";
  }

  if (dist < 100) {
    if (normY < 220) return "shortMidL";
    if (normY > 280) return "shortMidR";
    return "shortMidCenter";
  }

  if (normY < 200) return "midL";
  if (normY > 300) return "midR";
  return "midCenter";
}

function getZoneName(shot) {
  const location = shot?.point?.normX !== undefined
    ? { x: shot.point.normX, y: shot.point.normY }
    : normalizeToLeftBasket(Number(shot?.shotInfo?.location?.x), Number(shot?.shotInfo?.location?.y));
  const zone = getZone(location.x, location.y);
  return zone ? ZONE_LABELS[zone] : "Unknown";
}

function getShotDistanceFeet(shot) {
  const rawX = Number(shot?.point?.normX ?? shot?.shotInfo?.location?.x);
  const rawY = Number(shot?.point?.normY ?? shot?.shotInfo?.location?.y);
  if (!Number.isFinite(rawX) || !Number.isFinite(rawY)) return null;

  const dx = rawX - LEFT_BASKET_X;
  const dy = rawY - LEFT_BASKET_Y;
  return Math.sqrt((dx * dx) + (dy * dy)) / 8.75;
}

function normalizeShots(plays = [], athleteId = null) {
  return safeArray(plays).map((play) => {
    if (!play?.shootingPlay) return null;

    if (athleteId !== null) {
      const shooterId = play?.shotInfo?.shooter?.id;
      if (shooterId != null && Number(shooterId) !== Number(athleteId)) return null;
    }

    if (String(play?.shotInfo?.range || "").toLowerCase() === "free_throw") return null;

    const rawX = Number(play?.shotInfo?.location?.x);
    const rawY = Number(play?.shotInfo?.location?.y);
    if (!Number.isFinite(rawX) || !Number.isFinite(rawY)) return null;
    if (rawX === 0 && rawY === 0) return null;

    const norm = normalizeToLeftBasket(rawX, rawY);
    if (norm.x > 440) return null;

    const zoneKey = getZone(norm.x, norm.y);
    if (!zoneKey) return null;

    const point = toCanvas(norm.x, norm.y);
    return {
      original: play,
      point: {
        x: point.cx,
        y: point.cy,
        rawX,
        rawY,
        normX: norm.x,
        normY: norm.y
      },
      made: Boolean(play?.shotInfo?.made),
      assisted: Boolean(play?.shotInfo?.assisted),
      zoneKey,
      zone: ZONE_LABELS[zoneKey],
      playText: play?.playText || "Shot attempt",
      distanceFeet: getShotDistanceFeet({ point: { normX: norm.x, normY: norm.y } })
    };
  }).filter(Boolean);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function filterShots(plays = [], options = {}) {
  const normalized = Array.isArray(plays) && plays[0]?.point ? plays.slice() : normalizeShots(plays, options.athleteId ?? null);
  const mode = options.mode || options.filter || "all";

  return normalized.filter((shot) => {
    if (mode === "made") return shot.made;
    if (mode === "missed") return !shot.made;
    if (mode === "assisted") return shot.assisted;
    if (mode === "unassisted") return !shot.assisted;
    return true;
  });
}

function summarizeZoneChart(plays = [], options = {}) {
  const summary = createEmptyZoneSummary();
  filterShots(plays, options).forEach((shot) => {
    summary[shot.zoneKey].attempted += 1;
    if (shot.made) summary[shot.zoneKey].made += 1;
  });
  Object.values(summary).forEach((zone) => {
    zone.pct = zone.attempted ? zone.made / zone.attempted : 0;
  });
  return summary;
}

function summarizeZones(plays = [], athleteId = null) {
  return summarizeZoneChart(plays, { athleteId });
}

function zoneColor(pct, attempted, zoneKey) {
  if (attempted === 0) return "rgba(100,100,100,0.25)";

  if (THREE_POINT_ZONES.has(zoneKey)) {
    if (pct >= 0.45) return "#c1440e";
    if (pct >= 0.40) return "#e8956d";
    if (pct >= 0.34) return "#f0c060";
    if (pct >= 0.28) return "#7fc97f";
    return "#2d6a2d";
  }

  if (PAINT_ZONES.has(zoneKey)) {
    if (pct >= 0.65) return "#c1440e";
    if (pct >= 0.55) return "#e8956d";
    if (pct >= 0.46) return "#f0c060";
    if (pct >= 0.38) return "#7fc97f";
    return "#2d6a2d";
  }

  if (pct >= 0.52) return "#c1440e";
  if (pct >= 0.46) return "#e8956d";
  if (pct >= 0.40) return "#f0c060";
  if (pct >= 0.33) return "#7fc97f";
  return "#2d6a2d";
}

function drawFloor(ctx) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = "#c8a96e";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.strokeStyle = "rgba(150, 100, 40, 0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i < CANVAS_H; i += 4) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(CANVAS_W, i);
    ctx.stroke();
  }

  ctx.fillStyle = "#b8975a";
  ctx.fillRect(LANE_LEFT, BKCY, LANE_RIGHT - LANE_LEFT, FT_Y - BKCY);
}

function drawCourtLines(ctx) {
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 2;
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.moveTo(295, 16);
  ctx.lineTo(345, 16);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(BKCX, BKCY, 9, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(BKCX, BKCY, 30, 0, Math.PI, false);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(LANE_LEFT, BKCY);
  ctx.lineTo(LANE_LEFT, FT_Y);
  ctx.moveTo(LANE_RIGHT, BKCY);
  ctx.lineTo(LANE_RIGHT, FT_Y);
  ctx.moveTo(LANE_LEFT, FT_Y);
  ctx.lineTo(LANE_RIGHT, FT_Y);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(BKCX, FT_Y, 55, 0, Math.PI, false);
  ctx.stroke();

  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.arc(BKCX, FT_Y, 55, Math.PI, 0, false);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.moveTo(CORNER_CX_L, BKCY);
  ctx.lineTo(CORNER_CX_L, CORNER_Y);
  ctx.moveTo(CORNER_CX_R, BKCY);
  ctx.lineTo(CORNER_CX_R, CORNER_Y);
  ctx.stroke();

  const aLeft = Math.atan2(CORNER_Y - BKCY, CORNER_CX_L - BKCX);
  const aRight = Math.atan2(CORNER_Y - BKCY, CORNER_CX_R - BKCX);
  ctx.beginPath();
  ctx.arc(BKCX, BKCY, THREE_RADIUS, aLeft, aRight, true);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, CANVAS_H - 10);
  ctx.lineTo(CANVAS_W, CANVAS_H - 10);
  ctx.stroke();

  [100, 140, 180].forEach((y) => {
    ctx.beginPath();
    ctx.moveTo(LANE_LEFT - 8, y);
    ctx.lineTo(LANE_LEFT, y);
    ctx.moveTo(LANE_RIGHT, y);
    ctx.lineTo(LANE_RIGHT + 8, y);
    ctx.stroke();
  });
}

function fillZonePath(ctx, zoneKey, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();

  const W = CANVAS_W;
  const H = CANVAS_H;
  const BX = BKCX;
  const BY = BKCY;
  const LL = LANE_LEFT;
  const LR = LANE_RIGHT;
  const FT = FT_Y;
  const TR = THREE_RADIUS;
  const CL = CORNER_CX_L;
  const CR = CORNER_CX_R;
  const CY = CORNER_Y;
  const aLeft = Math.atan2(CY - BY, CL - BX);
  const aRight = Math.atan2(CY - BY, CR - BX);

  switch (zoneKey) {
    case "restricted":
      ctx.arc(BX, BY, 30, 0, Math.PI, false);
      ctx.closePath();
      break;

    case "shortMidCenter":
      ctx.rect(LL, BY + 30, LR - LL, FT - BY - 30);
      break;

    case "shortMidL":
      ctx.moveTo(LL, BY);
      ctx.lineTo(LL, FT);
      ctx.lineTo(180, FT);
      ctx.lineTo(180, BY);
      ctx.closePath();
      break;

    case "shortMidR":
      ctx.moveTo(LR, BY);
      ctx.lineTo(LR, FT);
      ctx.lineTo(460, FT);
      ctx.lineTo(460, BY);
      ctx.closePath();
      break;

    case "midL":
      ctx.moveTo(CL, BY);
      ctx.lineTo(180, BY);
      ctx.lineTo(180, FT);
      ctx.lineTo(LL, FT);
      ctx.arc(BX, FT, 55, Math.PI, Math.PI * 1.4, false);
      ctx.lineTo(60, 370);
      ctx.lineTo(CL, CY);
      ctx.arc(BX, BY, TR, aLeft, aLeft - 0.01, false);
      ctx.closePath();
      break;

    case "midR":
      ctx.moveTo(CR, BY);
      ctx.lineTo(460, BY);
      ctx.lineTo(460, FT);
      ctx.lineTo(LR, FT);
      ctx.arc(BX, FT, 55, 0, -0.4 * Math.PI, true);
      ctx.lineTo(580, 370);
      ctx.lineTo(CR, CY);
      ctx.closePath();
      break;

    case "midCenter":
      ctx.moveTo(180, FT);
      ctx.lineTo(460, FT);
      ctx.lineTo(460, BY);
      ctx.lineTo(CR, BY);
      ctx.arc(BX, BY, TR, aRight, aLeft, true);
      ctx.lineTo(180, BY);
      ctx.closePath();
      ctx.moveTo(LL, BY);
      ctx.lineTo(LR, BY);
      ctx.lineTo(LR, FT);
      ctx.lineTo(LL, FT);
      ctx.closePath();
      ctx.fill("evenodd");
      ctx.restore();
      return;

    case "corner3L":
      ctx.rect(0, 0, CL, CY);
      break;

    case "corner3R":
      ctx.rect(CR, 0, W - CR, CY);
      break;

    case "wing3L": {
      const arcEnd = Math.asin(Math.min(1, (H - BY) / TR));
      ctx.moveTo(0, CY);
      ctx.lineTo(CL, CY);
      ctx.arc(BX, BY, TR, aLeft, Math.PI - arcEnd, false);
      ctx.lineTo(0, H);
      ctx.closePath();
      break;
    }

    case "wing3R": {
      const arcEnd = Math.asin(Math.min(1, (H - BY) / TR));
      ctx.moveTo(CR, CY);
      ctx.lineTo(W, CY);
      ctx.lineTo(W, H);
      ctx.arc(BX, BY, TR, arcEnd, aRight, false);
      ctx.closePath();
      break;
    }

    case "center3": {
      const arcEnd = Math.asin(Math.min(1, (H - BY) / TR));
      const bLX = BX + TR * Math.cos(Math.PI - arcEnd);
      const bRX = BX + TR * Math.cos(arcEnd);
      ctx.moveTo(bLX, H);
      ctx.arc(BX, BY, TR, Math.PI - arcEnd, arcEnd, false);
      ctx.lineTo(bRX, H);
      ctx.closePath();
      break;
    }

    default:
      ctx.restore();
      return;
  }

  ctx.fill();
  ctx.restore();
}

function drawZoneLabel(ctx, x, y, zone) {
  const line1 = `${zone.made} / ${zone.attempted}`;
  const line2 = zone.attempted ? `${(zone.pct * 100).toFixed(1)}%` : "-";
  const boxW = 74;
  const boxH = 34;
  const bx = x - boxW / 2;
  const by = y - boxH / 2;

  ctx.fillStyle = "rgba(30, 30, 30, 0.80)";
  drawRoundedRect(ctx, bx, by, boxW, boxH, 3);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "bold 11px Inter, sans-serif";
  ctx.fillText(line1, x, y - 2);
  ctx.font = "11px Inter, sans-serif";
  ctx.fillText(line2, x, y + 12);
}

function drawZoneFills(ctx, summary) {
  ZONE_KEYS.forEach((key) => {
    fillZonePath(ctx, key, zoneColor(summary[key].pct, summary[key].attempted, key));
  });
}

function drawZoneLabels(ctx, summary) {
  ZONE_KEYS.forEach((key) => {
    const position = ZONE_LABEL_POSITIONS[key];
    if (position) drawZoneLabel(ctx, position.x, position.y, summary[key]);
  });
}

function drawDebugLabel(ctx, shot) {
  if (!DEBUG) return;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "8px monospace";
  ctx.textAlign = "left";
  const text = `${shot.point.rawX},${shot.point.rawY} | ${shot.point.normX},${shot.point.normY} | ${shot.zoneKey}`;
  ctx.fillText(text, shot.point.x + 7, shot.point.y);
}

function drawShotDots(ctx, shots) {
  shots.forEach((shot) => {
    if (shot.made) {
      ctx.beginPath();
      ctx.arc(shot.point.x, shot.point.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#0033A0";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      ctx.strokeStyle = "#E74C3C";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(shot.point.x - 5, shot.point.y - 5);
      ctx.lineTo(shot.point.x + 5, shot.point.y + 5);
      ctx.moveTo(shot.point.x + 5, shot.point.y - 5);
      ctx.lineTo(shot.point.x - 5, shot.point.y + 5);
      ctx.stroke();
    }

    drawDebugLabel(ctx, shot);
  });
}

function drawHeatmap(ctx, shots) {
  const offscreen = document.createElement("canvas");
  offscreen.width = CANVAS_W;
  offscreen.height = CANVAS_H;
  const octx = offscreen.getContext("2d");

  shots.forEach((shot) => {
    const gradient = octx.createRadialGradient(shot.point.x, shot.point.y, 0, shot.point.x, shot.point.y, 34);
    gradient.addColorStop(0, "rgba(0, 51, 160, 0.18)");
    gradient.addColorStop(1, "rgba(0, 51, 160, 0)");
    octx.fillStyle = gradient;
    octx.fillRect(shot.point.x - 34, shot.point.y - 34, 68, 68);
    drawDebugLabel(octx, shot);
  });

  ctx.drawImage(offscreen, 0, 0);
}

function drawWatermark(ctx) {
  ctx.fillStyle = "rgba(80, 50, 20, 0.5)";
  ctx.font = "italic 11px Inter, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("bbnstats.com", CANVAS_W - 8, CANVAS_H - 8);
}

function renderShotChartCanvas(ctx, shots, mode) {
  drawFloor(ctx);

  if (mode === "zone") {
    const summary = summarizeZoneChart(shots);
    drawZoneFills(ctx, summary);
    drawCourtLines(ctx);
    drawZoneLabels(ctx, summary);
    drawWatermark(ctx);
    return summary;
  }

  drawCourtLines(ctx);
  if (mode === "heatmap") {
    drawHeatmap(ctx, shots);
  } else {
    drawShotDots(ctx, shots);
  }
  drawWatermark(ctx);
  return summarizeZoneChart(shots);
}

function createTooltip(canvas) {
  const parent = canvas.parentElement;
  if (!parent) return null;
  parent.style.position = parent.style.position || "relative";
  const tooltip = document.createElement("div");
  tooltip.hidden = true;
  tooltip.style.position = "absolute";
  tooltip.style.pointerEvents = "none";
  tooltip.style.zIndex = "5";
  tooltip.style.maxWidth = "260px";
  tooltip.style.padding = "10px 12px";
  tooltip.style.borderRadius = "10px";
  tooltip.style.background = "rgba(10, 15, 30, 0.96)";
  tooltip.style.border = "1px solid rgba(74, 144, 217, 0.22)";
  tooltip.style.color = "#DCEBFF";
  tooltip.style.font = "12px Inter, sans-serif";
  parent.appendChild(tooltip);
  return tooltip;
}

function positionTooltip(canvas, tooltip, event) {
  const rect = canvas.getBoundingClientRect();
  const parentRect = canvas.parentElement.getBoundingClientRect();
  const left = event.clientX - parentRect.left + 12;
  const top = event.clientY - parentRect.top - 12;
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function getTooltipContent(shot) {
  const distance = shot.distanceFeet ? ` | ${shot.distanceFeet.toFixed(1)} ft` : "";
  return `${shot.playText}${distance}`;
}

function findShotAtPoint(shots, x, y) {
  return shots.find((shot) => Math.sqrt(((x - shot.point.x) ** 2) + ((y - shot.point.y) ** 2)) < 8) || null;
}

function resizeCanvasForDisplay(canvas) {
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
}

function createShotChart(canvas, plays = [], options = {}) {
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("createShotChart requires a canvas element.");
  }

  resizeCanvasForDisplay(canvas);
  const ctx = canvas.getContext("2d");
  const tooltip = createTooltip(canvas);
  let currentPlays = Array.isArray(plays) ? plays.slice() : [];
  let currentMode = options.mode || "dots";
  let currentFilter = options.filter || "all";
  let currentShots = [];
  let currentSummary = createEmptyZoneSummary();

  function render() {
    currentShots = filterShots(currentPlays, { mode: currentFilter, athleteId: options.athleteId ?? null });
    currentSummary = renderShotChartCanvas(ctx, currentShots, currentMode);
  }

  function onMouseMove(event) {
    if (!tooltip || currentMode !== "dots" || !currentShots.length) {
      if (tooltip) tooltip.hidden = true;
      canvas.style.cursor = "default";
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const shot = findShotAtPoint(currentShots, x, y);

    if (!shot) {
      tooltip.hidden = true;
      canvas.style.cursor = "default";
      return;
    }

    tooltip.hidden = false;
    tooltip.textContent = getTooltipContent(shot);
    canvas.style.cursor = "pointer";
    positionTooltip(canvas, tooltip, event);
  }

  function onMouseLeave() {
    if (tooltip) tooltip.hidden = true;
    canvas.style.cursor = "default";
  }

  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseleave", onMouseLeave);
  render();

  return {
    render,
    setShots(nextShots = []) {
      currentPlays = Array.isArray(nextShots) ? nextShots.slice() : [];
      render();
    },
    setMode(nextMode = "zone") {
      currentMode = nextMode;
      render();
    },
    setFilter(nextFilter = "all") {
      currentFilter = nextFilter;
      render();
    },
    getMode() {
      return currentMode;
    },
    getFilter() {
      return currentFilter;
    },
    getNormalizedShots() {
      return currentShots.slice();
    },
    getZoneSummary() {
      return JSON.parse(JSON.stringify(currentSummary));
    },
    downloadImage(filename = "shot-chart.png") {
      const link = document.createElement("a");
      link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    },
    destroy() {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      if (tooltip?.parentElement) tooltip.parentElement.removeChild(tooltip);
    }
  };
}

function renderShotChart(canvasId, plays, mode = "zone") {
  const canvas = document.getElementById(canvasId);
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("renderShotChart requires a canvas element id.");
  }

  resizeCanvasForDisplay(canvas);
  const ctx = canvas.getContext("2d");
  return renderShotChartCanvas(ctx, filterShots(plays), mode);
}

function exportShotChart(canvasId, playerName, season) {
  const canvas = document.getElementById(canvasId);
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const link = document.createElement("a");
  link.download = `${String(playerName || "player").replace(/\s+/g, "-")}-shotchart-${season}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

window.BBNStatsShotChart = {
  CANVAS_W,
  CANVAS_H,
  SHOT_CHART_WIDTH,
  SHOT_CHART_HEIGHT,
  FULL_COURT_W,
  FULL_COURT_H,
  HALF_COURT_X,
  LEFT_BASKET_X,
  LEFT_BASKET_Y,
  API_COURT_WIDTH,
  API_HALF_HEIGHT,
  BASKET_X_API,
  BASKET_Y_API,
  getDebugShotChartMode,
  normalizeToLeftBasket,
  toCanvas,
  getZone,
  getZoneName,
  getShotDistanceFeet,
  normalizeShots,
  filterShots,
  summarizeZones,
  summarizeZoneChart,
  drawFloor,
  drawCourtLines,
  drawHeatmap,
  drawShotDots,
  renderShotChart,
  createShotChart,
  exportShotChart
};
