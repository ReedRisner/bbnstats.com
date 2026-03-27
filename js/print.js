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
  const resolvedSeason = season || (typeof getSeason === "function" ? getSeason() : 2025);
  const safePage = sanitizeFilenamePart(pageName) || "page";
  return `bbnstats-${safePage}-${resolvedSeason}`;
}

function exportAsImage(elementId, filename) {
  const el = document.getElementById(elementId);

  if (!el) {
    throw new Error(`Unable to export image. Element not found: ${elementId}`);
  }

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
  exportAsImage,
  printPage,
  moveExportButtonsToBottom,
  bindExportButtons
};
