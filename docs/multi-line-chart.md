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
      date: "2022-07-27",
      value: 5,
      // optional - include additional attributes to use in onClick or tooltipHtml
      dateLabel: "Mon, 7/27",
    },
    {
      date: "2022-08-27",
      value: 7,
      dateLabel: "Mon, 8/27",
    },
  ],
});

// we can set values after instantiation and then call redraw() to re-render
multiLineChart.values = newValues;
multiLineChart.series = newSeries;
mutliLineChart.redraw();
```
