# Mutli Line Chart

```js
import { MultiLineChart } from "@get-dx/d3-charts";

const multiLineChart = new MultiLineChart({
  elChart: document.getElementById("#multi-line-chart"),

  // optional — infer from the data unless set
  startDate: "2022-06-05",
  endDate: "2023-03-05",
  // optional - defaults to true; don't show x axis line if set to false
  showXAxisLine: true,
  // default to true
  showXAxisTicks: true,

  // optional — infer from the data unless set
  yAxisMin: 0,
  yAxisMax: 100,
  // optional - defaults to false
  showYAxisTickLabels: false,
  // optional - defaults to false
  showYAxisTicks: false,
  // optional - defaults to false
  showYAxisLine: false,
  // optional - defaults to 50
  yAxisTickLabelSpread: 50,
  // optional - defaults to just the original value
  yAxisTickLabelFormat(d) {
    return `${d}%`;
  },
  // optional
  yAxisLabel: "Something",

  // optional - defaults to false; show value point dots
  showPoints: false,

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
