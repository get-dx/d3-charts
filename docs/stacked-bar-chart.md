# Stacked bar chart

```javascript
import { StackedBarChart } from "@get-dx/d3-charts";

const stackedbarchart = new StackedBarChart({
  elChart: document.getElementById("#mystackedbarchart"),

    // optional - defaults to 0.4
  paddingOuter: 0.4,

  // optional - defaults to 0
  paddingInner: 0,

  // optional - if set, show tooltips on hover
  tooltipHtml(d) {
    return `
      <div>
        <div class=''>${d.series}</div>
        <div class=''>${d.label}</div>
        <div class=''>${d.value}</div>
      </div>
    `;
  },

  // optional - we can initialize chart without data then fetch remote data
  values: [
    {
      xValue: 1,
      series: "additions"
      yValue: 1313,
    },
  ],

  // optional - set the series order and color
  series: [
    {
      key: "additions",
      color: "#6366f1"
    }
  ],

  // optional - defaults to true
  showXAxisTicks: false,
  // optional - defaults to false
  showXAxisLine: false,
  // optional - defaults to just the original value
  xAxisTickLabelFormat(d) {
    return d;
  },

  // optional - defaults to true
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
      label: "Something",
    },
    y: {
      label: "Something Else",
      // optional - defaults to max based on values
      max: 100
    }
  }
});

// we can set values after instantiation and then call redraw() to re-render
stackedbarchart.values = newValues;
stackedbarchart.series = newSeries;
stackedbarchart.redraw();
```
