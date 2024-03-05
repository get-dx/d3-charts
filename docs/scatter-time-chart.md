# Scatter time chart

```javascript
import { ScatterTimeChart } from "@get-dx/d3-charts";

const scattertimechart = new ScatterTimeChart({
  elChart: document.getElementById("#myscattertimechart"),

  // optional — infer from the data unless set
  startDate: "2022-06-05",
  endDate: "2023-03-05",

  // optional — infer from the data unless set
  yAxisMin: 0,
  yAxisMax: 100,

  // optional - defaults to true; don't show x axis line if set to false
  showXAxisLine: true,

  // optional - defaults to false; draw best fit line if set to true
  showTrendline: false,

  // optional - show pointer cursor on chart bar hover if set
  onClick(d) {
    alert(d.date);
  },

  // optional - if set, show tooltips on hover
  tooltipHtml(d) {
    return `
      <div>
        <div class=''>${d.dateLabel}</div>
        <div class=''>${d.value}</div>
      </div>
    `;
  },

  // optional - draw benchmark line if set
  benchmarkValue: 90,

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
scattertimechart.startDate = "2022-04-05";
scattertimechart.values = newValues;
scattertimechart.redraw();
```
