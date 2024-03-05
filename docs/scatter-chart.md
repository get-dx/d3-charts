# Scatter chart

```javascript
import { ScatterChart } from '@get-dx/d3-charts'

const scatterplot = new ScatterChart({
  elChart: document.getElementById("#myscatterchart"),

  // optional - defaults to true
  showXAxisTicks: false,
  // optional - defaults to true
  showXAxisLabel: false,
  // optional - defaults to true
  showXAxisLine: false,
  // optional - defaults to true
  showXAxisTickLabels: false,
  // optional - defaults to 100
  xAxisTickLabelSpread: 100,
  // optional - defaults to plain value
  xAxisTickLabelFormat(d) {
    return `${d}%`;
  },

  // optional - defaults to true
  showYAxisTicks: false,
  // optional - defaults to true
  showYAxisLabel: false,
  // optional - defaults to true
  showYAxisLine: false,
  // optional - defaults to true
  showYAxisTickLabels: false,
  // optional - defaults to 50
  yAxisTickLabelSpread: 50,
  // optional - defaults to just the plain value
  yAxisTickLabelFormat(d) {
    return `${d}%`;
  },

   // optional - draw best fit line
  showTrendline: true,

  // optional - show matrix lines at specified coordinates if set
  matrix: [50, 100],

  // optional - highlight one of the four quadrants (1, 2, 3, 4) when matrix is set
  highlightedQuadrant: 4,

  // optional
  axis: {
    x: {
      label: "Something",
      // optional - defaults to min and max based on values
      min: 0,
      max: 100
    },
    y: {
      label: "Something Else",
      // optional - defaults to min and max based on values
      min: 0,
      max: 200
    }
  },

  // optional - dot radius
  dotRadius: 2.5,

  // optional - hover radius, the maximum radius from the center of a dot to trigger the tooltip
  hoverRadius, 12.5,

  // optional - show pointer cursor on chart bar hover if set
  onClick(d) {
    alert(d.team)
  },

  // optional - if set, display labels beside plotted points
  labelTextFormat(d) {
    return `Team ${d.team}`;
  }

  // optional - if set, show tooltips on hover
  tooltipHtml(d, axis) {
    return `
      <div>
        <div class=''>${axis.x.label}: ${d.x}</div>
        <div class=''>${axis.y.label}: ${d.y}</div>
      </div>
    `;
  },

  // optional - we can initialize chart without data then fetch remote data
  values: [
    {
      x: 5,
      y: 40,
      // optional - include additional attributes to use in onClick or tooltipHtml
      team: "Team 1"
    },
    {
      x: 9,
      y: 50,
      team: "Team 2"
    },
    {
      x: 10,
      y: 64,
      team: "Team 3"
    },
    {
      x: 10,
      y: 65,
      team: "Team 4"
    },
    {
      x: 32,
      y: 24,
      team: "Team 5"
    },
  ]
});

// we can set values after instantiation and then call redraw() to re-render
scatterplot.axis = newAxis;
scatterplot.values = newValues;
scatterplot.redraw();
```
