# d3-charts

This repository contains our [D3.js](https://d3js.org) chart classes:

- [Bar chart](#bar-chart)
- [Line chart](#line-chart)
- [Scatter chart](#scatter-chart)

This repository also contains examples which you can view by running [http-server](https://github.com/http-party/http-server):

```
brew install http-server

http-server
```

### Bar chart

```javascript
const barchart = new BarChart({
  element: document.getElementById("#mybarchart"),
  
  // optional - defaults to true; don't show x axis line if set to false
  showXAxis: false,

  // optional - defaults to 0.4
  paddingOuter: 0.2,
  // optional - defaults to 0
  paddingInner: 0.4,

  // optional - defaults to false; draw best fit line if set to true
  trendline: true,

  // optional - show pointer cursor on chart bar hover if set
  onClick: function (d) {
    alert(d.dateLabel)
  },

  // optional - if set, show tooltips on hover
  tooltipHtml: function(d) {
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
      dateLabel: "Mon, 7/27",
      value: 5,
    },
    // If value is null, we render a 0 bar but do not not affect the trend line
    {
      date: "2022-07-28",
      dateLabel: "Tue, 7/28",
      value: null,
    },
    {
      date: "2022-08-27",
      dateLabel: "Mon, 8/27",
      value: 7,
    }
  ]
});

// we can set values after instantiation and then call redraw() to re-render
barchart.values = newValues;
barchart.redraw();
```

### Line chart

```javascript
const linechart = new LineChart({
  element: document.getElementById("#mylinechart"),

  // optional — infer from the data unless set
  startDate: "2022-06-05",
  endDate: "2023-03-05",

  // optional - defaults to true; don't show x axis line if set to false
  showXAxis: false,

  // default to true
  showTicks: true,

  // optional - show pointer cursor on chart bar hover if set
  onClick: function (d) {
    alert(d.date)
  },

  // optional - show pointer cursor on chart bar hover if set
  tooltipHtml: function(d, cd) {
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
      dateLabel: "Mon, 7/27"
    },
    {
      date: "2022-08-27",
      value: 7,
      dateLabel: "Mon, 8/27"
    }
  ],

  // optional - don't show comparison line if not set
  comparisonValues: [
    {
      date: "2022-07-27",
      value: 5,
      // optional - include additional attributes to use in onClick or tooltipHtml
      dateLabel: "Mon, 4/27"
    },
    {
      date: "2022-08-27",
      value: 7,
      dateLabel: "Mon, 6/27"
    }
  ],
})

// we can set values after instantiation and then call redraw() to re-render
linechart.startDate = "2022-04-05";
linechart.values = newValues;
linechart.comparisonValues = [];
linechart.redraw();
```


### Scatter chart

```javascript
const scatterchart = new ScatterChart({
  element: document.getElementById("#myscatterchart"),

  // optional — infer from the data unless set
  startDate: "2022-06-05",
  endDate: "2023-03-05",

  // optional - defaults to true; don't show x axis line if set to false
  showXAxis: false,

  // optional - show pointer cursor on chart bar hover if set
  onClick: function (d) {
    alert(d.date)
  },

  // optional - show pointer cursor on chart bar hover if set
  tooltipHtml: function(d) {
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
      dateLabel: "Mon, 7/27"
    },
    {
      date: "2022-08-27",
      value: 7,
      dateLabel: "Mon, 8/27"
    }
  ],
})

// we can set values after instantiation and then call redraw() to re-render
scatterchart.startDate = "2022-04-05";
scatterchart.values = newValues;
scatterchart.redraw();
```