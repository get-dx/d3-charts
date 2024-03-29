# Bump chart

```javascript
import { StackedAreaChart } from "@get-dx/d3-charts";

new StackedAreaChart({
  elChart: document.getElementById("#mybarchart"),
  data: {
    series: [
      {
        name: "Less than once per week",
        color: "#3730a3",
        counts: [0, 20, 40],
      },
      {
        name: "At least once per week",
        color: "#4338ca",
        counts: [30, 2, 15],
      },
    ],
    dates: ["2022-03-13", "2022-07-10", "2022-09-18"],
  },
  // optional - if set, show tooltips on hover
  tooltipHtml: (date, series) => {
    // a given vertical line/tooltip "d" should have the areas array so we can display all values and counts (or percentages)
  },
});
```
