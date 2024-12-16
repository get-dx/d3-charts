import { StackedBarChart } from "../../src/stackedBarChart.js";

// Example data with a goal line
const data = {
  series: [
    { key: "completed", color: "#60a5fa" },
    { key: "in_progress", color: "#f97316" },
    { key: "target", color: "#f87171" },
  ],
  values: [
    // Completed tasks
    {
      xValue: "Week 1",
      series: "completed",
      yValue: 15,
    },
    {
      xValue: "Week 2",
      series: "completed",
      yValue: 20,
    },
    {
      xValue: "Week 3",
      series: "completed",
      yValue: 25,
    },
    {
      xValue: "Week 4",
      series: "completed",
      yValue: 18,
    },
    // In-progress tasks
    {
      xValue: "Week 1",
      series: "in_progress",
      yValue: 8,
    },
    {
      xValue: "Week 2",
      series: "in_progress",
      yValue: 10,
    },
    {
      xValue: "Week 3",
      series: "in_progress",
      yValue: 12,
    },
    {
      xValue: "Week 4",
      series: "in_progress",
      yValue: 15,
    },
    // Target line (constant value)
    {
      xValue: "Week 1",
      series: "target",
      yValue: 30,
    },
    {
      xValue: "Week 2",
      series: "target",
      yValue: 30,
    },
    {
      xValue: "Week 3",
      series: "target",
      yValue: 30,
    },
    {
      xValue: "Week 4",
      series: "target",
      yValue: 30,
    },
  ],
};

// Initialize goal line chart
const stackedBarGoalProps = {
  elChart: document.getElementById("stacked-bar-goal-chart"),
  series: data.series,
  values: data.values,
  goalLines: ["target"], // Specify which series should be rendered as goal lines
  yAxisLabel: "Tasks",
  xAxisLabel: "Time Period",
  tooltipHtml: (values) => {
    const completed = values.find((d) => d.series === "completed")?.yValue || 0;
    const inProgress =
      values.find((d) => d.series === "in_progress")?.yValue || 0;
    const target = values.find((d) => d.series === "target")?.yValue || 0;
    const total = completed + inProgress;

    return `
      <div style="padding: 8px; background: white; border: 1px solid #eee; border-radius: 4px;">
        <div style="font-weight: 500; margin-bottom: 4px;">Task Summary</div>
        <div style="color: #60a5fa;">Completed: ${completed}</div>
        <div style="color: #f97316;">In Progress: ${inProgress}</div>
        <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #eee;">
          <div>Total: ${total}</div>
          <div style="color: #f87171;">Target: ${target}</div>
        </div>
      </div>
    `;
  },
};
const stackedBarGoal = new StackedBarChart(stackedBarGoalProps);
window.chartProps["stacked-bar-goal-chart"] = stackedBarGoalProps;
stackedBarGoal.redraw();

// Basic Stacked Bar Chart
const stackedBar1Props = {
  elChart: document.getElementById("stacked-bar-1-chart"),
  values: [],
  series: [],
};
const stackedBar1 = new StackedBarChart(stackedBar1Props);
window.chartProps["stacked-bar-1-chart"] = stackedBar1Props;

// Stacked Bar with Trendline
const stackedBar2Props = {
  elChart: document.getElementById("stacked-bar-2-chart"),
  series: [
    { key: "additions", color: "#6366f1" },
    { key: "deletions", color: "#e5e5e5" },
  ],
  values: [],
  maxBarWidth: 48,
  showTrendline: true,
  yAxisLabel: "Y Axis Label",
  xAxisLabel: "X Axis Label",
  xAxisTickLabelFormat: (d) => `${d}`,
  showYAxisTicks: true,
  yAxisTickLabelFormat: (d) => `${d}%`,
};
const stackedBar2 = new StackedBarChart(stackedBar2Props);
window.chartProps["stacked-bar-2-chart"] = stackedBar2Props;

// Load data for basic and trendline examples
fetch("data/stacked_bar_dataset.json")
  .then((response) => response.json())
  .then((dataset) => {
    stackedBar1Props.values = dataset;
    stackedBar1Props.series = Array.from(
      new Set(dataset.map((d) => d.series)),
    ).map((key) => ({ key }));
    stackedBar1.values = dataset;
    stackedBar1.redraw();

    stackedBar2Props.values = dataset;
    stackedBar2.values = dataset;
    stackedBar2.redraw();
  });

// Single Series Bar with Trendline
const stackedBar3Props = {
  elChart: document.getElementById("stacked-bar-3-chart"),
  series: [{ key: "additions", color: "#6366f1" }],
  values: [
    {
      xValue: "Oct 21",
      series: "additions",
      yValue: 1250,
    },
    {
      xValue: "Oct 28",
      series: "additions",
      yValue: 50,
    },
    {
      xValue: "Nov 04",
      series: "additions",
      yValue: 100,
    },
    {
      xValue: "Nov 11",
      series: "additions",
      yValue: 400,
    },
    {
      xValue: "Nov 18",
      series: "additions",
      yValue: 150,
    },
  ],
  yAxisLabel: "Count",
  xAxisLabel: "during the week of",
  showTrendline: true,
};
const stackedBar3 = new StackedBarChart(stackedBar3Props);
window.chartProps["stacked-bar-3-chart"] = stackedBar3Props;

stackedBar3.redraw();

// Dense Multi-Series Bar Chart
const generateNameData = () => {
  const firstNames = [
    "Alice",
    "Bob",
    "Charlie",
    "David",
    "Emma",
    "Frank",
    "Grace",
    "Henry",
    "Isabel",
    "Jack",
    "Kyle",
    "Liam",
    "Mason",
    "Noah",
    "Olivia",
    "Pam",
    "Quinn",
    "Rachel",
    "Sam",
    "Tyler",
    "Uma",
    "Vincent",
    "Wendy",
    "Xander",
    "Yara",
    "Zane",
  ];

  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
    "Lee",
    "Perez",
    "Thompson",
    "White",
    "Harris",
    "Sanchez",
  ];

  const names = firstNames.map(
    (firstName, index) => `${firstName} ${lastNames[index]}`,
  );
  const series = ["Code Reviews", "Pull Requests", "Comments"];
  const values = [];

  names.forEach((name) => {
    series.forEach((seriesName) => {
      values.push({
        xValue: name,
        series: seriesName,
        // Random value between 10-50
        yValue: Math.floor(Math.random() * 40) + 10,
      });
    });
  });

  return {
    series: series.map((name) => ({
      key: name,
      color:
        name === "Code Reviews"
          ? "#6366f1"
          : name === "Pull Requests"
            ? "#22c55e"
            : "#f97316",
    })),
    values,
  };
};

const denseData = generateNameData();
const denseMultiLineStackedBarProps = {
  elChart: document.getElementById("dense-multi-line-stacked-bar"),
  series: [
    { key: "Code Reviews", color: "#6366f1" },
    { key: "Pull Requests", color: "#f97316" },
    { key: "Comments", color: "#22c55e" },
  ],
  values: denseData.values,
  yAxisLabel: "Count",
  xAxisLabel: "Developer",
  maxBarWidth: 24,
  paddingInner: 0.2,
  paddingOuter: 0.1,
};
const denseMultiLineStackedBar = new StackedBarChart(
  denseMultiLineStackedBarProps,
);
window.chartProps["dense-multi-line-stacked-bar"] =
  denseMultiLineStackedBarProps;

denseMultiLineStackedBar.redraw();

// Stacked Bar with Zero Values
const stackedBarZeroValuesProps = {
  elChart: document.getElementById("stacked-bar-zero-values-chart"),
  series: [
    { key: "completed", color: "#60a5fa" },
    { key: "in_progress", color: "#f97316" },
  ],
  values: [
    // Completed tasks
    {
      xValue: "Week 1",
      series: "completed",
      yValue: 15,
    },
    {
      xValue: "Week 2",
      series: "completed",
      yValue: 0,
    },
    {
      xValue: "Week 3",
      series: "completed",
      yValue: 25,
    },
    {
      xValue: "Week 4",
      series: "completed",
      yValue: 0,
    },
    // In-progress tasks
    {
      xValue: "Week 1",
      series: "in_progress",
      yValue: 8,
    },
    {
      xValue: "Week 2",
      series: "in_progress",
      yValue: 0,
    },
    {
      xValue: "Week 3",
      series: "in_progress",
      yValue: 12,
    },
    {
      xValue: "Week 4",
      series: "in_progress",
      yValue: 0,
    },
  ],
  yAxisLabel: "Tasks",
  xAxisLabel: "Time Period",
};
const stackedBarZeroValues = new StackedBarChart(stackedBarZeroValuesProps);
window.chartProps["stacked-bar-zero-values-chart"] = stackedBarZeroValuesProps;

stackedBarZeroValues.redraw();

// Stacked Bar with Goal Line and Trend Line
const stackedBarGoalTrendProps = {
  elChart: document.getElementById("stacked-bar-goal-trend-chart"),
  series: data.series,
  values: data.values,
  goalLines: ["target"],
  showTrendline: true,
  yAxisLabel: "Tasks",
  xAxisLabel: "Time Period",
  tooltipHtml: (values) => {
    const completed = values.find((d) => d.series === "completed")?.yValue || 0;
    const inProgress =
      values.find((d) => d.series === "in_progress")?.yValue || 0;
    const target = values.find((d) => d.series === "target")?.yValue || 0;
    const total = completed + inProgress;

    return `
      <div style="padding: 8px; background: white; border: 1px solid #eee; border-radius: 4px;">
        <div style="font-weight: 500; margin-bottom: 4px;">Task Summary</div>
        <div style="color: #60a5fa;">Completed: ${completed}</div>
        <div style="color: #f97316;">In Progress: ${inProgress}</div>
        <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #eee;">
          <div>Total: ${total}</div>
          <div style="color: #f87171;">Target: ${target}</div>
        </div>
      </div>
    `;
  },
};
const stackedBarGoalTrend = new StackedBarChart(stackedBarGoalTrendProps);
window.chartProps["stacked-bar-goal-trend-chart"] = stackedBarGoalTrendProps;

stackedBarGoalTrend.redraw();
