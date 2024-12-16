import { MultiLineChart } from "../../src/multiLineChart.js";
import * as d3 from "d3";

// Example 1: Multi-Line with Points & Custom Y-Axis Ticks
const multiLine1Props = {
  elChart: document.getElementById("multi-line-1-chart"),
  yAxisTickLabelSpread: 30,
  showPoints: true,
  tooltipHtml: () => `<div></div>`,
};
const multiLine1 = new MultiLineChart(multiLine1Props);
window.chartProps["multi-line-1-chart"] = multiLine1Props;

// Example 2: Multi-Line with Full Axis Labels
const multiLine2Props = {
  elChart: document.getElementById("multi-line-2-chart"),
  showYAxisTickLabels: true,
  showYAxisTicks: true,
  yAxisLabel: "Y Axis",
  xAxisLabel: "X Axis",
  showPoints: true,
  tooltipHtml: () => `<div></div>`,
};
const multiLine2 = new MultiLineChart(multiLine2Props);
window.chartProps["multi-line-2-chart"] = multiLine2Props;

// Load data for examples 1 and 2
d3.json("data/multi_line_chart_dataset.json").then((data) => {
  multiLine1.series = data.series;
  multiLine1.values = data.values;
  multiLine1.redraw();

  multiLine2.series = data.series;
  multiLine2.values = data.values;
  multiLine2.redraw();
});

// Example 3: Dense Multi-Line with Limited Ticks & Points
// Create sample data with many points
const generateData = () => {
  const startDate = new Date("2024-01-01");
  const series = ["Series A", "Series B", "Series C"];
  const values = [];

  // Generate 50 dates (daily) for each series
  series.forEach((seriesName) => {
    for (let i = 0; i < 50; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      values.push({
        xValue: date.toISOString().split("T")[0],
        series: seriesName,
        yValue: Math.floor(Math.random() * 100) + 20, // Random value between 20-120
      });
    }
  });

  return {
    series: series.map((name) => ({
      key: name,
      color:
        name === "Series A"
          ? "#6366f1"
          : name === "Series B"
            ? "#22c55e"
            : "#f97316",
    })),
    values,
  };
};

const denseData = generateData();
const denseMultiLineProps = {
  elChart: document.getElementById("dense-multi-line-chart"),
  series: denseData.series,
  values: denseData.values,
  minTickSpacing: 20,
  showPoints: true,
  showYAxisTickLabels: true,
  showYAxisTicks: true,
  yAxisLabel: "Value",
  xAxisLabel: "Date",
  tooltipHtml: () => `<div></div>`,
};
const denseMultiLine = new MultiLineChart(denseMultiLineProps);
window.chartProps["dense-multi-line-chart"] = denseMultiLineProps;

denseMultiLine.redraw();

// Example 4: Multi-Line with Custom Date Format
const multiLine3Props = {
  elChart: document.getElementById("multi-line-3-chart"),
  showPoints: true,
  xAxisTickLabelFormat: (dateStr) => {
    const date = new Date(dateStr);
    const startDate = new Date("2024-01-01"); // Reference date
    const diffDays = Math.round((date - startDate) / (1000 * 60 * 60 * 24));

    // Format based on duration
    if (diffDays < 7) {
      return `Day ${diffDays + 1}`; // +1 for human-friendly counting
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      const days = diffDays % 7;
      return days === 0 ? `Week ${weeks}` : `Week ${weeks}+${days}d`;
    } else {
      const months = Math.floor(diffDays / 30);
      const days = diffDays % 30;
      return days === 0 ? `Month ${months}` : `Month ${months}+${days}d`;
    }
  },
  tooltipHtml: () => `<div></div>`,
};
const multiLine3 = new MultiLineChart(multiLine3Props);
window.chartProps["multi-line-3-chart"] = multiLine3Props;

// Generate sample data for custom date format example
const generateSampleData = () => {
  const startDate = new Date("2024-01-01");
  const series = ["Series A", "Series B"];
  const values = [];

  series.forEach((seriesName) => {
    for (let i = 0; i < 10; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i * 3); // Every 3 days

      values.push({
        xValue: date.toISOString().split("T")[0],
        series: seriesName,
        yValue: Math.floor(Math.random() * 50) + 25, // Random value between 25-75
      });
    }
  });

  return {
    series: series.map((name) => ({
      key: name,
      color: name === "Series A" ? "#6366f1" : "#22c55e",
    })),
    values,
  };
};

const customDateData = generateSampleData();
multiLine3.series = customDateData.series;
multiLine3.values = customDateData.values;
multiLine3.redraw();

// Example 5: Multi-Line with Trendline
const multiLine4Props = {
  elChart: document.getElementById("multi-line-4-chart"),
  showPoints: true,
  showTrendlines: true,
  series: [
    { key: "target", color: "#60a5fa" },
    { key: "prs_per_developer", color: "#ef4444" },
  ],
  values: [
    {
      xValue: "2024-01-01",
      yValue: 1,
      series: "prs_per_developer",
    },
    {
      xValue: "2024-01-01",
      yValue: 4,
      series: "target",
    },
    {
      xValue: "2024-01-08",
      yValue: 3,
      series: "prs_per_developer",
    },
    {
      xValue: "2024-01-08",
      yValue: 4,
      series: "target",
    },
    {
      xValue: "2024-01-15",
      yValue: 1.5,
      series: "prs_per_developer",
    },
    {
      xValue: "2024-01-15",
      yValue: 4,
      series: "target",
    },
    {
      xValue: "2024-01-22",
      yValue: 1.17,
      series: "prs_per_developer",
    },
    {
      xValue: "2024-01-22",
      yValue: 4,
      series: "target",
    },
  ],
  yAxisLabel: "Value",
  xAxisLabel: "Date",
  yAxisMin: 0,
  yAxisMax: 5,
};
const multiLine4 = new MultiLineChart(multiLine4Props);
window.chartProps["multi-line-4-chart"] = multiLine4Props;

multiLine4.redraw();

// Example 6: Multi-Line Chart with Goal Line
const goalLineData = {
  series: [
    { key: "actual", color: "#60a5fa" },
    { key: "target", color: "#f87171" },
  ],
  values: [
    {
      xValue: "2024-01-01",
      series: "actual",
      yValue: 80,
    },
    {
      xValue: "2024-02-01",
      series: "actual",
      yValue: 85,
    },
    {
      xValue: "2024-03-01",
      series: "actual",
      yValue: 90,
    },
    {
      xValue: "2024-04-01",
      series: "actual",
      yValue: 88,
    },
    {
      xValue: "2024-05-01",
      series: "actual",
      yValue: 92,
    },
    // Target line - constant value
    {
      xValue: "2024-01-01",
      series: "target",
      yValue: 95,
    },
    {
      xValue: "2024-02-01",
      series: "target",
      yValue: 95,
    },
    {
      xValue: "2024-03-01",
      series: "target",
      yValue: 95,
    },
    {
      xValue: "2024-04-01",
      series: "target",
      yValue: 95,
    },
    {
      xValue: "2024-05-01",
      series: "target",
      yValue: 95,
    },
  ],
};

const multiLineGoalProps = {
  elChart: document.getElementById("multi-line-goal-chart"),
  series: goalLineData.series,
  values: goalLineData.values,
  goalLines: ["target"],
  showPoints: true,
  showTrendlines: true,
  yAxisLabel: "Percentage",
  xAxisLabel: "Month",
  tooltipHtml: (values) => {
    const actual = values.find((d) => d.series === "actual")?.yValue || 0;
    const target = values.find((d) => d.series === "target")?.yValue || 0;
    return `
      <div style="padding: 8px; background: white; border: 1px solid #eee; border-radius: 4px;">
        <div style="color: #60a5fa;">Actual: ${actual}%</div>
        <div style="color: #f87171;">Target: ${target}%</div>
      </div>
    `;
  },
};
const multiLineGoal = new MultiLineChart(multiLineGoalProps);
window.chartProps["multi-line-goal-chart"] = multiLineGoalProps;
multiLineGoal.redraw();
