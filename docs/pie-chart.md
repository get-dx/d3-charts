# Pie chart

```javascript
import { PieChart } from "@get-dx/d3-charts";

const piechart = new PieChart({
  elChart: document.getElementById("#mypiechart"),

  // optional - if set, show tooltips on hover
  tooltipHtml(d) {
    return `
      <div>
        <div class=''>${d.label}</div>
        <div class=''>${d.value}</div>
      </div>
    `;
  },

  // optional - we can initialize chart without data then fetch remote data
  values: [
    {
      label: "Storefront",
      value: 10,
      // optional - if not specified, a color will be generated
      color: "#6366f1",
    },
  ],

  // optional - set the minimum angle of a segment that hides the value label in degrees
  minAngleForValueLabel: 15,

  // optional - set the label's position as a ratio of the max radius
  labelRadiusRatio: 0.95,

  // optional - set the pie radius as a ratio of the max radius
  pieRadiusRatio: 0.9,

  // optional - set the value label's position as a ratio of the max radius
  valueRadiusRatio: 0.7,
});

// we can set values after instantiation and then call redraw() to re-render
piechart.values = newValues;
piechart.redraw();
```
