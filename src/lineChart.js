import * as d3 from "d3";

export class LineChart {
  constructor({
    elChart,
    values = [],
    comparisonValues = [],
    showXAxisLine = true,
    showXAxisTicks = true,
    showPoints = false,
    showComparisonPoints = false,
    dotLastSegment = false,
    startDate,
    endDate,
    yAxisMin,
    yAxisMax,
    showYAxisTickLabels = false,
    showYAxisTicks = false,
    showYAxisInnerTicks = true,
    showYAxisLine = false,
    yAxisTickLabelSpread = 50,
    yAxisTickLabelFormat = (d) => d.toLocaleString(),
    axis = {
      x: {
        label: "",
        min: startDate ?? undefined,
        max: endDate ?? undefined,
      },
      y: {
        label: "",
        min: yAxisMin ?? undefined,
        max: yAxisMax ?? undefined,
      },
    },
    tooltipHtml,
    onClick,
  }) {
    this.finishedRendering = false;
    this.elChart = elChart;
    this.values = values;
    this.comparisonValues = comparisonValues;
    this.showXAxisLine = showXAxisLine;
    this.showXAxisTicks = showXAxisTicks;
    this.showPoints = showPoints;
    this.showBenchmarkPoints = showComparisonPoints;
    this.dotLastSegment = dotLastSegment;
    this.tooltipHtml = tooltipHtml;
    this.showYAxisTickLabels = showYAxisTickLabels;
    this.showYAxisTicks = showYAxisTicks;
    this.showYAxisInnerTicks = showYAxisInnerTicks;
    this.showYAxisLine = showYAxisLine;
    this.yAxisTickLabelSpread = yAxisTickLabelSpread;
    this.yAxisTickLabelFormat = yAxisTickLabelFormat;
    this.axis = axis;
    this.onClick = onClick;
    this.resize = this.resize.bind(this);
    this.entered = this.entered.bind(this);
    this.moved = this.moved.bind(this);
    this.left = this.left.bind(this);
    this.clicked = this.clicked.bind(this);
    this.init();
  }

  init() {
    this.setup();
    this.scaffold();
    this.wrangle();
    this.resize();
    window.addEventListener("resize", this.resize);
  }

  setup() {
    this.id =
      this.elChart.id ||
      "_" + crypto.getRandomValues(new Uint32Array(1)).toString(36);

    this.dotRadius = 2.5;

    this.margin = {
      top: 3,
      right: 3,
      bottom: 3,
      left: 3,
    };

    this.parseDate = d3.utcParse("%Y-%m-%d");

    this.indexDate = null;

    this.x = d3.scaleUtc();

    this.y = d3.scaleLinear();

    this.line = d3
      .line()
      .x((d) => this.x(d.x))
      .y((d) => this.y(d.y));
  }

  scaffold() {
    this.container = d3.select(this.elChart).classed("chart line-chart", true);

    this.svg = this.container
      .append("svg")
      .attr("class", "chart-svg")
      .classed("is-clickable", !!this.onClick)
      .on("mouseover", this.entered)
      .on("mousemove", this.moved)
      .on("mouseout", this.left)
      .on("click", this.clicked);

    this.defs = this.svg.append("defs");

    this.g = this.svg.append("g");

    this.focusLine = this.svg.append("line").attr("class", "focus-line");

    this.tooltip = this.container.append("div").attr("class", "chart-tooltip");
  }

  wrangle() {
    if (this.values.length === 0) return;

    this.accessor = {
      x: (d) => this.parseDate(d.date),
      y: (d) => d.value,
    };

    const values = [
      ...this.values.map(this.accessor.y),
      ...this.comparisonValues.map(this.accessor.y),
    ];
    const [minValue, maxValue] = d3.extent(values);
    let minY = 0,
      maxY = maxValue;
    if (minValue > 15) minY = minValue - 10;
    this.y.domain([
      this.axis.y.min === undefined ? minY : this.axis.y.min,
      this.axis.y.max === undefined ? maxY : this.axis.y.max || 1,
    ]);

    this.foregroundData = this.values.map((d) => ({
      x: this.accessor.x(d),
      y: this.accessor.y(d),
    }));

    this.dates = this.foregroundData.map((d) => d.x);

    this.hasBenchmarkLine = this.comparisonValues.length > 0;

    this.foregroundBenchmarks = this.comparisonValues.map((d) => ({
      x: this.accessor.x(d),
      y: this.accessor.y(d),
    }));

    this.benchmarkDates = this.foregroundBenchmarks.map((d) => d.x);

    if (this.axis.x.min && this.axis.x.max) {
      this.xMin = this.parseDate(this.axis.x.min);
      this.xMax = this.parseDate(this.axis.x.max);
    } else {
      this.xMin = d3.min([this.dates[0], this.benchmarkDates[0]]);
      this.xMax = d3.max([
        this.dates[this.dates.length - 1],
        this.benchmarkDates[this.benchmarkDates.length - 1],
      ]);
    }

    this.backgroundData = [
      {
        x: this.xMin,
        y: this.foregroundData[0].y,
      },
      ...this.foregroundData,
      {
        x: this.xMax,
        y: this.foregroundData[this.foregroundData.length - 1].y,
      },
    ];

    this.clipData = [this.dates[0], this.dates[this.dates.length - 1]];

    if (this.hasBenchmarkLine) {
      this.backgroundBenchmarks = [
        {
          x: this.xMin,
          y: this.foregroundBenchmarks[0].y,
        },
        ...this.foregroundBenchmarks,
        {
          x: this.xMax,
          y: this.foregroundBenchmarks[this.foregroundBenchmarks.length - 1].y,
        },
      ];
      this.benchmarkClipData = [
        this.benchmarkDates[0],
        this.benchmarkDates[this.benchmarkDates.length - 1],
      ];
    } else {
      this.backgroundBenchmarks = [];
      this.benchmarkClipData = [];
    }

    this.x.domain([this.xMin, this.xMax]);

    if (!this.width) return;
    this.render();
  }

  resize() {
    this.width = this.container.node().clientWidth;
    this.height = this.container.node().clientHeight;

    this.y.range([this.height - this.margin.bottom, this.margin.top]);

    this.svg.attr("viewBox", [0, 0, this.width, this.height]);

    this.focusLine.attr("y2", this.height - this.margin.bottom);

    if (this.values.length === 0) return;

    this.render();
  }

  render() {
    this.adjustXMargin();
    this.renderClip();
    this.renderXAxis();
    this.renderYAxis();
    this.renderZeroLine();
    this.renderBenchmarkLine();
    this.renderBenchmarkDots();
    this.renderLine();
    this.renderDots();
    this.finishedRendering = true;
  }

  adjustXMargin() {
    this.margin.left = 1;
    this.margin.right = 1;

    if (this.showYAxisTickLabels) {
      this.margin.left = 4 + 48;
    }

    this.showYAxisLabel = this.axis.y.label !== "";
    if (this.showYAxisLabel) {
      this.margin.left += 20;
    }

    if (this.showXAxisTickLabels) {
      this.margin.right = 16;
    }

    this.x.range([this.margin.left, this.width - this.margin.right]);
  }

  renderClip() {
    const clip = this.defs
      .selectAll(".clip")
      .data(this.clipData ? [this.clipData] : [])
      .join((enter) =>
        enter
          .append("clipPath")
          .attr("class", "clip")
          .attr("id", `${this.id}-clip`)
          .call((clipPath) => clipPath.append("rect")),
      );

    if (this.clipData.length > 0)
      clip
        .select("rect")
        .attr("x", ([start]) => this.x(start))
        .attr("width", ([start, end]) => this.x(end) - this.x(start))
        .attr("height", this.height);

    const benchmarkClip = this.defs
      .selectAll(".benchmark-clip")
      .data(this.benchmarkClipData ? [this.benchmarkClipData] : [])
      .join((enter) =>
        enter
          .append("clipPath")
          .attr("class", "benchmark-clip")
          .attr("id", `${this.id}-benchmark-clip`)
          .call((clipPath) => clipPath.append("rect")),
      );

    if (this.benchmarkClipData.length > 0)
      benchmarkClip
        .select("rect")
        .attr("x", ([start]) => this.x(start))
        .attr("width", ([start, end]) => this.x(end) - this.x(start))
        .attr("height", this.height);
  }

  renderXAxis() {
    this.g
      .selectAll(".axis--x")
      .data(this.showXAxisTicks ? [0] : [])
      .join((enter) => enter.append("g").attr("class", "axis axis--x"))
      .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
      .call(
        d3
          .axisBottom(this.x)
          .tickValues(this.dates)
          .tickSize(-this.height + this.margin.top + this.margin.bottom),
      )
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll(".tick text").remove());
  }

  renderYAxis() {
    this.svg
      .selectAll(".axis--y")
      .data([0])
      .join((enter) => enter.append("g").attr("class", "axis axis--y"))
      .attr("transform", `translate(${this.margin.left},0)`)
      .call(
        d3
          .axisLeft(this.y)
          .ticks(
            (this.height - this.margin.top - this.margin.bottom) /
              this.yAxisTickLabelSpread,
          )
          .tickSizeOuter(0)
          .tickSizeInner(this.showYAxisInnerTicks ? 6 : 0)
          .tickFormat((d) =>
            this.showYAxisTickLabels ? this.yAxisTickLabelFormat(d) : "",
          ),
      )
      .call((g) => g.selectAll(".tick line").classed("tick-line", true))
      .call((g) =>
        g
          .selectAll(".tick")
          .selectAll(".grid-line")
          .data(this.showYAxisTicks ? [0] : [])
          .join((enter) => enter.append("line").attr("class", "grid-line"))
          .attr("x2", this.width - this.margin.left - this.margin.right),
      )
      .call((g) => g.selectAll(".tick text"))
      .call((g) =>
        g
          .select(".domain")
          .style("display", this.showYAxisLine ? null : "none"),
      )
      .call((g) =>
        g
          .selectAll(".axis-title-text")
          .data(this.axis.y.label !== "" ? [this.axis.y.label] : [])
          .join((enter) =>
            enter
              .append("text")
              .attr("class", "axis-title-text")
              .attr("fill", "currentColor")
              .attr("text-anchor", "middle")
              .attr("dy", "0.71em"),
          )
          .attr("x", -this.margin.left + 4)
          .attr("y", (this.margin.top + this.height - this.margin.bottom) / 2)
          .attr(
            "transform",
            `rotate(-90,${-this.margin.left + 4},${
              (this.margin.top + this.height - this.margin.bottom) / 2
            })`,
          )
          .text((d) => d),
      );
  }

  renderZeroLine() {
    this.g
      .selectAll(".zero-line")
      .data(this.showXAxisLine ? [0] : [])
      .join((enter) =>
        enter
          .append("line")
          .attr("class", "zero-line")
          .attr("x1", this.margin.left),
      )
      .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
      .attr("x2", this.width - this.margin.right);
  }

  renderBenchmarkLine() {
    this.g
      .selectAll(".benchmark-background-line")
      .data(this.hasBenchmarkLine ? [this.backgroundBenchmarks] : [])
      .join((enter) =>
        enter
          .append("path")
          .attr("class", "benchmark-background-line")
          .attr("fill", "none"),
      )
      .attr("d", this.line);

    this.g
      .selectAll(".benchmark-foreground-line")
      .data(this.hasBenchmarkLine ? [this.foregroundBenchmarks] : [])
      .join((enter) =>
        enter
          .append("path")
          .attr("class", "benchmark-foreground-line")
          .attr("clip-path", `url(#${this.id}-benchmark-clip)`)
          .attr("fill", "none"),
      )
      .attr("d", this.line);
  }

  renderBenchmarkDots() {
    this.benchmarkDotCircle = this.g
      .selectAll(".benchmark-dot-circles")
      .data(this.hasBenchmarkLine ? [0] : [])
      .join((enter) => enter.append("g").attr("class", "benchmark-dot-circles"))
      .selectAll(".benchmark-dot-circle")
      .data(this.foregroundBenchmarks)
      .join((enter) =>
        enter.append("circle").attr("class", "benchmark-dot-circle"),
      )
      .classed(
        "is-visible",
        this.foregroundBenchmarks.length === 1 || this.showBenchmarkPoints,
      )
      .attr(
        "r",
        this.foregroundBenchmarks.length === 1 || this.showBenchmarkPoints
          ? this.dotRadius
          : 1,
      )
      .attr("cx", (d) => this.x(d.x))
      .attr("cy", (d) => this.y(d.y));
  }

  renderLine() {
    this.g
      .selectAll(".background-line")
      .data([this.backgroundData])
      .join((enter) =>
        enter
          .append("path")
          .attr("class", "background-line")
          .attr("fill", "none"),
      )
      .attr("d", this.line);

    this.g
      .selectAll(".foreground-line")
      .data([
        this.dotLastSegment
          ? this.foregroundData.slice(0, -1)
          : this.foregroundData,
      ])
      .join((enter) =>
        enter
          .append("path")
          .attr("class", "foreground-line")
          .attr("fill", "none")
          .attr("clip-path", `url(#${this.id}-clip)`),
      )
      .attr("d", this.line);
  }

  renderDots() {
    this.dotCircle = this.g
      .selectAll(".dot-circles")
      .data([0])
      .join((enter) => enter.append("g").attr("class", "dot-circles"))
      .selectAll(".dot-circle")
      .data(this.foregroundData)
      .join((enter) => enter.append("circle").attr("class", "dot-circle"))
      .classed(
        "is-visible",
        this.foregroundData.length === 1 || this.showPoints,
      )
      .attr(
        "r",
        this.foregroundData.length === 1 || this.showPoints
          ? this.dotRadius
          : 1,
      )
      .attr("cx", (d) => this.x(d.x))
      .attr("cy", (d) => this.y(d.y));
  }

  entered() {
    if (!this.finishedRendering) return;
    if (!this.tooltipHtml) return;
    this.focusLine.classed("is-visible", true);
  }

  moved(event) {
    if (!this.finishedRendering) return;
    if (!this.tooltipHtml) return;
    this.pointer = d3.pointer(event, this.svg.node());
    const xDate = this.x.invert(this.pointer[0]);
    const indexDate = d3.bisectCenter(this.dates, xDate);
    if (this.indexDate !== indexDate) {
      this.indexDate = indexDate;
      this.focusLine
        .classed("has-ticks", this.showXAxisTicks)
        .attr(
          "transform",
          `translate(${this.x(this.dates[this.indexDate])},0)`,
        );
      this.dotCircle.classed(
        "is-active",
        (d) => d.x - this.dates[this.indexDate] === 0,
      );
      this.benchmarkDotCircle.classed(
        "is-active",
        (d) => d.x - this.dates[this.indexDate] === 0,
      );
      this.updateTooltip();
    }
    if (this.tooltip.classed("is-visible")) this.positionTooltip();
  }

  left() {
    if (!this.finishedRendering) return;
    if (!this.tooltipHtml) return;
    this.indexDate = null;
    this.focusLine.classed("is-visible", false);
    this.dotCircle.classed("is-active", false);
    this.benchmarkDotCircle.classed("is-active", false);
    this.updateTooltip();
  }

  clicked() {
    if (!this.onClick || this.indexDate === null) return;
    const date = this.dates[this.indexDate];
    const d = this.values.find((e) => this.accessor.x(e) - date === 0);
    const cd = this.comparisonValues.find(
      (e) => this.accessor.x(e) - date === 0,
    );
    this.onClick(d, cd);
  }

  updateTooltip() {
    if (this.indexDate === null) {
      this.tooltip.classed("is-visible", false);
    } else {
      const date = this.dates[this.indexDate];
      const d = this.values.find((e) => this.accessor.x(e) - date === 0);
      const cd = this.comparisonValues.find(
        (e) => this.accessor.x(e) - date === 0,
      );
      this.tooltip.html(this.tooltipHtml(d, cd)).classed("is-visible", true);
    }
  }

  positionTooltip() {
    const tooltipRect = this.tooltip.node().getBoundingClientRect();

    // center the tooltip horizontally
    let x = this.x(this.dates[this.indexDate]) - tooltipRect.width / 2;
    if (x + tooltipRect.width > this.width) {
      x = this.width - tooltipRect.width;
    } else if (x < 0) {
      x = 0;
    }

    // position the tooltip above
    const yOffset = 4;
    let y = -tooltipRect.height - yOffset;

    this.tooltip.style("transform", `translate(${x}px,${y}px)`);
  }

  redraw() {
    this.wrangle();
  }
}
