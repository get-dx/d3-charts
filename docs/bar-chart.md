# Bar chart

```javascript
import { BarChart } from "@get-dx/d3-charts";

const barchart = new BarChart({
  elChart: document.getElementById("#mybarchart"),

  // optional - defaults to true; don't show x axis line if set to false
  showXAxisLine: true,

  // optional - defaults to 0.4
  paddingOuter: 0.4,

  // optional - defaults to 0
  paddingInner: 0,

  // optional - defaults to false; draw best fit line if set to true
  showTrendline: false,

  // optional - show pointer cursor on chart bar hover if set
  onClick(d) {
    alert(d.dateLabel);
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

  // optional - we can initialize chart without data then fetch remote data
  values: [
    {
      date: "2022-07-27",
      value: 5,
      // optional - include additional attributes to use in onClick or tooltipHtml
      dateLabel: "Mon, 7/27",
    },
    // if value is null, render a 0 bar but do not not affect the trend line
    {
      date: "2022-07-28",
      value: null,
      dateLabel: "Tue, 7/28",
    },
    {
      date: "2022-08-27",
      value: 7,
      dateLabel: "Mon, 8/27",
    },
  ],
});

// we can set values after instantiation and then call redraw() to re-render
barchart.values = newValues;
barchart.redraw();
```
