import * as d3 from "d3";

export class MultiLineChart {
  constructor({
    elChart,
    series = [],
    values = [],
    showXAxisLine = true,
    showXAxisTicks = true,
    showPoints = false,
    startDate,
    endDate,
    yAxisMin,
    yAxisMax,
    showYAxisTickLabels = false,
    showYAxisTicks = false,
    showYAxisInnerTicks = false,
    showYAxisLine = false,
    yAxisTickLabelSpread = 50,
    yAxisTickLabelFormat = (d) => d.toLocaleString(),
    yAxisLabel = "",
    xAxisLabel = "",
    tooltipHtml,
  }) {
    this.elChart = elChart;
    this.series = series;
    this.values = values;
    this.showXAxisLine = showXAxisLine;
    this.showXAxisTicks = showXAxisTicks;
    this.showPoints = showPoints;
    this.startDate = startDate;
    this.endDate = endDate;
    this.yAxisMin = yAxisMin;
    this.yAxisMax = yAxisMax;
    this.showYAxisTickLabels = showYAxisTickLabels;
    this.showYAxisTicks = showYAxisTicks;
    this.showYAxisInnerTicks = showYAxisInnerTicks;
    this.showYAxisLine = showYAxisLine;
    this.yAxisTickLabelSpread = yAxisTickLabelSpread;
    this.yAxisTickLabelFormat = yAxisTickLabelFormat;
    this.yAxisLabel = yAxisLabel;
    this.xAxisLabel = xAxisLabel;
    this.tooltipHtml = tooltipHtml;
    this.resize = this.resize.bind(this);
    this.entered = this.entered.bind(this);
    this.moved = this.moved.bind(this);
    this.left = this.left.bind(this);
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
    this.margin = {};

    this.dotRadius = 2.5;

    this.parseDate = d3.utcParse("%Y-%m-%d");

    this.indexDate = null;

    this.x = d3.scaleUtc();

    this.y = d3.scaleLinear();

    this.color = d3.scaleOrdinal();

    this.line = d3
      .line()
      .x((_, i) => this.x(this.dates[i]))
      .y((d) => this.y(d))
      .defined((d) => d !== undefined);
  }

  scaffold() {
    this.container = d3
      .select(this.elChart)
      .classed("chart multi-line-chart", true);

    this.svg = this.container
      .append("svg")
      .attr("class", "chart-svg")
      .on("mouseover", this.entered)
      .on("mousemove", this.moved)
      .on("mouseout", this.left);

    this.g = this.svg.append("g");

    this.focusLine = this.svg.append("line").attr("class", "focus-line");

    this.tooltip = this.container.append("div").attr("class", "chart-tooltip");
  }

  wrangle() {
    if (this.values.length === 0 || this.series.length === 0) return;

    this.seriesAccessor = {
      key: (d) => d.key,
      color: (d) => d.color,
    };

    this.accessor = {
      xString: (d) => d.xValue,
      x: (d) => this.parseDate(d.xValue),
      y: (d) => d.yValue,
      z: (d) => d.series,
    };

    let [minX, maxX] = d3.extent(this.values, this.accessor.x);
    this.x.domain([
      this.startDate === undefined ? minX : this.parseDate(this.startDate),
      this.endDate === undefined ? maxX : this.parseDate(this.endDate),
    ]);

    const padding = 0.05;
    let [minY, maxY] = d3.extent(this.values, this.accessor.y);
    const gapY = maxY - minY;
    this.y.domain([
      this.yAxisMin === undefined ? minY - gapY * padding : this.yAxisMin,
      this.yAxisMax === undefined ? maxY + gapY * padding : this.yAxisMax,
    ]);
    if (this.yAxisMin === undefined && this.yAxisMax === undefined)
      this.y.nice();

    this.color
      .domain(this.series.map(this.seriesAccessor.key))
      .range(this.series.map(this.seriesAccessor.color));

    const indexedValue = d3.rollup(
      this.values,
      (v) => this.accessor.y(v[0]),
      this.accessor.z,
      this.accessor.x,
    );

    this.dates = Array.from(new Set(this.values.map(this.accessor.xString)))
      .map(this.parseDate)
      .sort(d3.ascending);

    this.lineData = this.color.domain().map((key) => ({
      key,
      values: this.dates.map((date) => indexedValue.get(key)?.get(date)),
    }));

    if (!this.width) return;
    this.render();
  }

  resize() {
    this.width = this.container.node().clientWidth;
    this.height = this.container.node().clientHeight;

    this.svg.attr("viewBox", [0, 0, this.width, this.height]);

    if (this.values.length === 0 || this.series.length === 0) return;

    this.render();
  }

  render() {
    this.adjustXMargin();
    this.adjustYMargin();
    this.renderXAxis();
    this.renderYAxis();
    this.renderFocusLine();
    this.renderZeroLine();
    this.renderSeries();
  }

  adjustXMargin() {
    this.margin.left = 1;
    this.margin.right = 1;

    if (this.showYAxisTickLabels) {
      this.margin.left = 4 + 48;
    }

    this.showYAxisLabel = this.yAxisLabel !== "";
    if (this.showYAxisLabel) {
      this.margin.left += 20;
    }

    this.x.range([this.margin.left, this.width - this.margin.right]);
  }

  adjustYMargin() {
    this.margin.top = 3;
    this.margin.bottom = 3;

    this.showXAxisLabel = this.xAxisLabel !== "";
    if (this.showXAxisLabel) {
      this.margin.bottom += 20;
    }

    this.y.range([this.height - this.margin.bottom, this.margin.top]);
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
      .call((g) => g.selectAll(".tick text").remove())
      .call((g) =>
        g
          .selectAll(".axis-title-text")
          .data(this.showXAxisLabel ? [this.xAxisLabel] : [])
          .join((enter) =>
            enter
              .append("text")
              .attr("class", "axis-title-text")
              .attr("fill", "currentColor")
              .attr("text-anchor", "middle"),
          )
          .attr("x", (this.margin.left + this.width - this.margin.right) / 2)
          .attr("y", this.margin.bottom - 4)
          .text((d) => d),
      );
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
          .data(this.yAxisLabel !== "" ? [this.yAxisLabel] : [])
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

  renderFocusLine() {
    this.focusLine.attr("y2", this.height - this.margin.bottom);
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

  renderSeries() {
    const seriesG = this.g
      .selectAll(".all-series")
      .data([0])
      .join((enter) => enter.append("g").attr("class", "all-series"))
      .selectAll(".series")
      .data(this.lineData, (d) => d.key)
      .join((enter) =>
        enter
          .append("g")
          .attr("class", "series")
          .call((g) =>
            g.append("path").attr("class", "line").attr("fill", "none"),
          )
          .call((g) => g.append("g").attr("class", "dot-circles")),
      );

    seriesG
      .select(".line")
      .attr("stroke", (d) => this.color(d.key))
      .attr("d", (d) => this.line(d.values));

    seriesG
      .select(".dot-circles")
      .attr("fill", (d) => this.color(d.key))
      .selectAll(".dot-circle")
      .data((d) =>
        d.values
          .map((v, i) => {
            const date = this.dates[i];
            const isPrevUndefined = i === 0 || d.values[i - 1] === undefined;
            const isNextUndefined =
              i === d.values.length - 1 || d.values[i + 1] === undefined;
            const isVisible =
              v !== undefined &&
              ((isPrevUndefined && isNextUndefined) || this.showPoints);
            return {
              date,
              value: v,
              isVisible,
            };
          })
          .filter((d) => d.isVisible),
      )
      .join((enter) =>
        enter
          .append("circle")
          .attr("class", "dot-circle")
          .attr("r", this.dotRadius),
      )
      .attr("cx", (d) => this.x(d.date))
      .attr("cy", (d) => this.y(d.value));
  }

  entered() {
    if (!this.tooltipHtml) return;
    if (this.values.length === 0 || this.series.length === 0) return;
    this.focusLine.classed("is-visible", true);
  }

  moved(event) {
    if (!this.tooltipHtml) return;
    if (this.values.length === 0 || this.series.length === 0) return;
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
      this.updateTooltip();
    }
    if (this.tooltip.classed("is-visible")) this.positionTooltip();
  }

  left() {
    if (!this.tooltipHtml) return;
    if (this.values.length === 0 || this.series.length === 0) return;
    this.indexDate = null;
    this.focusLine.classed("is-visible", false);
    this.updateTooltip();
  }

  updateTooltip() {
    if (this.indexDate === null) {
      this.tooltip.classed("is-visible", false);
    } else {
      const date = this.dates[this.indexDate];
      const ds = this.values.filter((d) => this.accessor.x(d) - date === 0);
      this.tooltip.html(this.tooltipHtml(ds)).classed("is-visible", true);
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
