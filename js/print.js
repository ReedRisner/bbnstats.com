function getPrintUtils() {
  return window.BBNStatsUtils || {};
}

function sanitizeFilenamePart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildExportFilename(pageName = "page", season) {
  const { getSeason } = getPrintUtils();
  const resolvedSeason = season || (typeof getSeason === "function" ? getSeason() : 2026);
  const safePage = sanitizeFilenamePart(pageName) || "page";
  return `bbnstats-${safePage}-${resolvedSeason}`;
}

function loadHtml2Canvas() {
  if (typeof window.html2canvas === "function") {
    return Promise.resolve(window.html2canvas);
  }

  if (window.BBNStatsHtml2CanvasPromise) {
    return window.BBNStatsHtml2CanvasPromise;
  }

  window.BBNStatsHtml2CanvasPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.async = true;
    script.onload = () => resolve(window.html2canvas);
    script.onerror = () => reject(new Error("html2canvas failed to load."));
    document.head.appendChild(script);
  });

  return window.BBNStatsHtml2CanvasPromise;
}

async function exportAsImage(elementId, filename) {
  const el = document.getElementById(elementId);

  if (!el) {
    throw new Error(`Unable to export image. Element not found: ${elementId}`);
  }

  await loadHtml2Canvas();

  if (typeof window.html2canvas !== "function") {
    throw new Error("html2canvas is not loaded.");
  }

  return window.html2canvas(el, {
    backgroundColor: "#0A0F1E",
    scale: 2,
    useCORS: true
  }).then((canvas) => {
    const link = document.createElement("a");
    link.download = `${sanitizeFilenamePart(filename) || "bbnstats-export"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    return canvas;
  });
}

function printPage() {
  window.print();
}

function moveExportButtonsToBottom(elementId = "main-content") {
  const target = document.getElementById(elementId);

  if (!target) {
    return;
  }

  const groups = Array.from(target.querySelectorAll(".export-buttons"));

  groups.forEach((group) => {
    group.classList.add("export-buttons--bottom");
    group.style.marginBottom = "";
    target.appendChild(group);
  });
}

function bindExportButtons(options = {}) {
  const {
    imageButtonSelector = "[data-export-image]",
    printButtonSelector = "[data-print-page]",
    elementId = "main-content",
    pageName
  } = options;

  const imageButtons = document.querySelectorAll(imageButtonSelector);
  const printButtons = document.querySelectorAll(printButtonSelector);
  const currentPageName = pageName || sanitizeFilenamePart(document.body?.dataset?.page || window.location.pathname.split("/").pop()?.replace(".html", "")) || "page";

  moveExportButtonsToBottom(elementId);

  imageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filename = button.dataset.filename || buildExportFilename(currentPageName);
      const targetId = button.dataset.exportTarget || elementId;
      exportAsImage(targetId, filename).catch((error) => {
        console.error(error);
      });
    });
  });

  printButtons.forEach((button) => {
    button.addEventListener("click", () => {
      printPage();
    });
  });
}

window.BBNStatsPrint = {
  sanitizeFilenamePart,
  buildExportFilename,
  loadHtml2Canvas,
  exportAsImage,
  printPage,
  moveExportButtonsToBottom,
  bindExportButtons
};
