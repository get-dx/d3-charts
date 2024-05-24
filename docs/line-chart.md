# Line chart

```javascript
import { LineChart } from "@get-dx/d3-charts";

const linechart = new LineChart({
  elChart: document.getElementById("#mylinechart"),

  // optional — infer from the data unless set
  startDate: "2022-06-05",
  endDate: "2023-03-05",

  // optional — infer from the data unless set
  yAxisMin: 0,
  yAxisMax: 100,

  // optional - defaults to true; don't show x axis line if set to false
  showXAxisLine: true,

  // default to true
  showXAxisTicks: true,

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
  axis: {
    x: {
      min: "2022-06-05",
      max: "2023-03-05",
    },
    y: {
      label: "Something Else",
      // optional - defaults to based on values
      min: 0,
      max: 100,
    },
  },

  // optional - defaults to false; show value point dots
  showPoints: false,

  // optional - defaults to false; show comparison value point dots
  showComparisonPoints: false,

  // optional - defaults to false; show the last segment as a dashed line
  dotLastSegment: false,

  // optional - show pointer cursor on chart bar hover if set
  onClick(d) {
    alert(d.date);
  },

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

  // optional - don't show comparison line if not set
  comparisonValues: [
    {
      date: "2022-07-27",
      value: 5,
      // optional - include additional attributes to use in onClick or tooltipHtml
      dateLabel: "Mon, 4/27",
    },
    {
      date: "2022-08-27",
      value: 7,
      dateLabel: "Mon, 6/27",
    },
  ],
});

// we can set values after instantiation and then call redraw() to re-render
linechart.startDate = "2022-04-05";
linechart.values = newValues;
linechart.comparisonValues = [];
linechart.redraw();
```
