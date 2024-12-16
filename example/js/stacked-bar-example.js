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
new StackedBarChart({
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
});

// Basic Stacked Bar Chart
const stackedBar1 = new StackedBarChart({
  elChart: document.getElementById("stacked-bar-1-chart"),
});

// Stacked Bar with Trendline
const stackedBar2 = new StackedBarChart({
  elChart: document.getElementById("stacked-bar-2-chart"),
  series: [
    { key: "additions", color: "#6366f1" },
    { key: "deletions", color: "#e5e5e5" },
  ],
  maxBarWidth: 48,
  showTrendline: true,
  yAxisLabel: "Y Axis Label",
  xAxisLabel: "X Axis Label",
  xAxisTickLabelFormat: (d) => `${d}`,
  showYAxisTicks: true,
  yAxisTickLabelFormat: (d) => `${d}%`,
});

// Load data for basic and trendline examples
fetch("data/stacked_bar_dataset.json")
  .then((response) => response.json())
  .then((dataset) => {
    stackedBar1.values = dataset;
    stackedBar1.redraw();

    stackedBar2.values = dataset;
    stackedBar2.redraw();
  });

// Single Series Bar with Trendline
const stackedBar3 = new StackedBarChart({
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
});

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

const nameBasedData = generateNameData();

const denseStackedBar = new StackedBarChart({
  elChart: document.getElementById("dense-multi-line-stacked-bar"),
  series: nameBasedData.series,
  values: nameBasedData.values,
  yAxisLabel: "Count",
  xAxisLabel: "Developer",
  showTrendline: true,
  maxBarWidth: 48,
});

denseStackedBar.redraw();

// Zero Values Example
const zeroValuesData = [
  { xValue: "Jan", series: "A", yValue: 10 },
  { xValue: "Jan", series: "B", yValue: 20 },
  { xValue: "Feb", series: "A", yValue: 0 }, // Zero value
  { xValue: "Feb", series: "B", yValue: 15 },
  { xValue: "Mar", series: "A", yValue: 5 },
  { xValue: "Mar", series: "B", yValue: 0 }, // Zero value
  { xValue: "Apr", series: "A", yValue: 0 }, // Both series are zero
  { xValue: "Apr", series: "B", yValue: 0 }, // Both series are zero
];

const zeroValuesChart = new StackedBarChart({
  elChart: document.getElementById("stacked-bar-zero-values-chart"),
  values: zeroValuesData,
  series: [
    { key: "A", color: "#6baed6" },
    { key: "B", color: "#3182bd" },
  ],
  yAxisLabel: "Value",
  xAxisLabel: "Month",
  tooltipHtml: (data) => {
    return `
      <div style="padding: 8px; background: white; border: 1px solid #eee; border-radius: 4px;">
        <div style="font-weight: 500; margin-bottom: 4px;">Values</div>
        ${data
          .map(
            (d) => `
          <div style="color: ${d.series === "A" ? "#6baed6" : "#3182bd"}">
            ${d.series}: ${d.yValue}
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  },
});

zeroValuesChart.redraw();
