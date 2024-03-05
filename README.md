# d3-charts

This repository contains our [D3.js](https://d3js.org) chart classes:

- [Bar chart](#bar-chart)
- [Line chart](#line-chart)
- [Scatter time chart](#scatter-time-chart)
- [Scatter chart](#scatter-chart)
- [Pie chart](#pie-chart)
- [Stacked bar chart](#stacked-bar-chart)

This repository also contains examples which you can view by running —

```bash
bin/start
```

### Bar chart

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

### Line chart

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

### Scatter time chart

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

### Scatter chart

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

### Pie chart

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

### Stacked bar chart

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
