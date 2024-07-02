# Mutli Line Chart

```js
import { MultiLineChart } from "@get-dx/d3-charts";

const multiLineChart = new MultiLineChart({
  elChart: document.getElementById("#multi-line-chart"),

  // optional
  yAxisLabel: "Something",

  // optional - if set, show tooltips on hover
  tooltipHtml(d, cd) {
    return `
      <div>
        <div class=''>${d.dateLabel}</div>
        <div class=''>${d.value} vs ${cd.value}</div>
      </div>
    `;
  },

  // optional - we can initialize chart without data then fetch remote data
  series: [
    { key: "deletions", color: "#f87171" },
    { key: "additions", color: "#60a5fa" },
    { key: "files_changed", color: "#fb923c" },
  ],

  // optional - we can initialize chart without data then fetch remote data
  values: [
    {
      xValue: "2024-10-21",
      series: "deletions",
      yValue: 1,
    },
    {
      xValue: "2024-10-28",
      series: "deletions",
      yValue: 52,
    },
    {
      xValue: "2024-11-05",
      series: "deletions",
      yValue: 6,
    },
    {
      xValue: "2024-11-12",
      series: "deletions",
      yValue: 12,
    },
    {
      xValue: "2024-11-19",
      series: "deletions",
      yValue: 104,
    },
    {
      xValue: "2024-10-21",
      series: "additions",
      yValue: 10,
    },
    {
      xValue: "2024-10-28",
      series: "additions",
      yValue: 2,
    },
    {
      xValue: "2024-11-05",
      series: "additions",
      yValue: 64,
    },
    {
      xValue: "2024-11-12",
      series: "additions",
      yValue: 412,
    },
    {
      xValue: "2024-11-19",
      series: "additions",
      yValue: 94,
    },
    {
      xValue: "2024-10-21",
      series: "files_changed",
      yValue: 88,
    },
    {
      xValue: "2024-10-28",
      series: "files_changed",
      yValue: 24,
    },
    {
      xValue: "2024-11-05",
      series: "files_changed",
      yValue: 4,
    },
    {
      xValue: "2024-11-12",
      series: "files_changed",
      yValue: 42,
    },
    {
      xValue: "2024-11-19",
      series: "files_changed",
      yValue: 9,
    },
  ],
});

// we can set values after instantiation and then call redraw() to re-render
multiLineChart.values = newValues;
multiLineChart.series = newSeries;
mutliLineChart.redraw();
```
