const UK_CHART_COLORS = {
  blue: "#0033A0",
  lightBlue: "#4A90D9",
  cyan: "#5CC8FF",
  white: "#FFFFFF",
  text: "#9EB3D8",
  grid: "rgba(158, 179, 216, 0.16)",
  green: "#27AE60",
  red: "#E74C3C",
  yellow: "#F1C40F",
  slate: "#5A6E8A"
};

const chartRegistry = {};

function getChartCanvas(canvasOrId) {
  if (typeof canvasOrId === "string") {
    return document.getElementById(canvasOrId);
  }

  return canvasOrId;
}

function destroyChart(canvasOrId) {
  const canvas = getChartCanvas(canvasOrId);

  if (!canvas) {
    return;
  }

  const key = canvas.id || canvas;

  if (chartRegistry[key]) {
    chartRegistry[key].destroy();
    delete chartRegistry[key];
  }
}

function applyDatasetDefaults(datasets = [], type = "line") {
  return datasets.map((dataset, index) => {
    const fallbackColors = [
      UK_CHART_COLORS.blue,
      UK_CHART_COLORS.lightBlue,
      UK_CHART_COLORS.cyan,
      UK_CHART_COLORS.green,
      UK_CHART_COLORS.yellow,
      UK_CHART_COLORS.red
    ];

    const color = dataset.borderColor || dataset.backgroundColor || fallbackColors[index % fallbackColors.length];

    return {
      borderWidth: type === "radar" ? 2 : 3,
      pointRadius: type === "line" ? 3 : 2,
      pointHoverRadius: 5,
      tension: type === "line" ? 0.32 : 0,
      fill: type === "radar",
      backgroundColor: dataset.backgroundColor || `${color}33`,
      borderColor: dataset.borderColor || color,
      pointBackgroundColor: dataset.pointBackgroundColor || color,
      pointBorderColor: dataset.pointBorderColor || UK_CHART_COLORS.white,
      ...dataset
    };
  });
}

function createBaseOptions(type, customOptions = {}) {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: UK_CHART_COLORS.text,
          boxWidth: 14,
          boxHeight: 14,
          usePointStyle: true,
          pointStyle: "circle",
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: "rgba(10, 15, 30, 0.96)",
        titleColor: UK_CHART_COLORS.white,
        bodyColor: UK_CHART_COLORS.text,
        borderColor: "rgba(74, 144, 217, 0.22)",
        borderWidth: 1,
        padding: 12,
        displayColors: true
      }
    }
  };

  if (type === "bar" || type === "line") {
    baseOptions.scales = {
      x: {
        ticks: {
          color: UK_CHART_COLORS.text
        },
        grid: {
          color: "rgba(255, 255, 255, 0.04)"
        },
        border: {
          color: UK_CHART_COLORS.grid
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: UK_CHART_COLORS.text
        },
        grid: {
          color: UK_CHART_COLORS.grid
        },
        border: {
          color: UK_CHART_COLORS.grid
        }
      }
    };
  }

  if (type === "radar") {
    baseOptions.scales = {
      r: {
        beginAtZero: true,
        angleLines: {
          color: UK_CHART_COLORS.grid
        },
        grid: {
          color: UK_CHART_COLORS.grid
        },
        pointLabels: {
          color: UK_CHART_COLORS.text,
          font: {
            size: 12
          }
        },
        ticks: {
          color: UK_CHART_COLORS.text,
          backdropColor: "transparent"
        }
      }
    };
  }

  if (type === "doughnut") {
    baseOptions.cutout = "62%";
  }

  return mergeOptions(baseOptions, customOptions);
}

function mergeOptions(base, custom) {
  const output = { ...base };

  Object.entries(custom || {}).forEach(([key, value]) => {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      base[key] &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      output[key] = mergeOptions(base[key], value);
    } else {
      output[key] = value;
    }
  });

  return output;
}

function createChart(type, canvasOrId, labels = [], datasets = [], options = {}) {
  const canvas = getChartCanvas(canvasOrId);

  if (!canvas) {
    throw new Error(`Chart canvas not found: ${canvasOrId}`);
  }

  if (typeof window.Chart === "undefined") {
    throw new Error("Chart.js is not loaded.");
  }

  destroyChart(canvas);

  const chart = new window.Chart(canvas, {
    type,
    data: {
      labels,
      datasets: applyDatasetDefaults(datasets, type)
    },
    options: createBaseOptions(type, options)
  });

  const key = canvas.id || canvas;
  chartRegistry[key] = chart;
  return chart;
}

function barChart(canvasOrId, labels, datasets, options = {}) {
  return createChart("bar", canvasOrId, labels, datasets, options);
}

function lineChart(canvasOrId, labels, datasets, options = {}) {
  return createChart("line", canvasOrId, labels, datasets, options);
}

function radarChart(canvasOrId, labels, datasets, options = {}) {
  return createChart("radar", canvasOrId, labels, datasets, options);
}

function donutChart(canvasOrId, labels, values, options = {}) {
  const palette = options.colors || [
    UK_CHART_COLORS.blue,
    UK_CHART_COLORS.lightBlue,
    UK_CHART_COLORS.cyan,
    UK_CHART_COLORS.green,
    UK_CHART_COLORS.yellow,
    UK_CHART_COLORS.red
  ];

  return createChart(
    "doughnut",
    canvasOrId,
    labels,
    [
      {
        data: values,
        backgroundColor: labels.map((_, index) => palette[index % palette.length]),
        borderColor: "rgba(10, 15, 30, 0.92)",
        borderWidth: 2,
        hoverOffset: 8
      }
    ],
    options
  );
}

window.BBNStatsCharts = {
  UK_CHART_COLORS,
  chartRegistry,
  destroyChart,
  barChart,
  lineChart,
  radarChart,
  donutChart
};
