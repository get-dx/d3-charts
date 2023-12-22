window.StackedBarChart = class StackedBarChart {
  constructor({
    elChart,
    paddingInner = 0.4,
    paddingOuter = 0,
    tooltipHtml,
    values = [],
    series = [],
    showXAxisTicks = false,
    showXAxisLine = true,
    xAxisTickLabelFormat = (d) => d.toLocaleString(),
    showYAxisTicks = true,
    showYAxisLine = false,
    yAxisTickLabelSpread = 50,
    yAxisTickLabelFormat = (d) => d.toLocaleString(),
    axis = {
      x: {
        label: "",
      },
      y: {
        label: "",
      },
    },
  }) {
    this.elChart = elChart;
    this.paddingInner = paddingInner;
    this.paddingOuter = paddingOuter;
    this.tooltipHtml = tooltipHtml;
    this.values = values;
    this.series = series;
    this.showXAxisTicks = showXAxisTicks;
    this.showXAxisLine = showXAxisLine;
    this.xAxisTickLabelFormat = xAxisTickLabelFormat;
    this.showYAxisTicks = showYAxisTicks;
    this.showYAxisLine = showYAxisLine;
    this.yAxisTickLabelSpread = yAxisTickLabelSpread;
    this.yAxisTickLabelFormat = yAxisTickLabelFormat;
    this.axis = axis;
    this.resize = this.resize.bind(this);
    this.entered = this.entered.bind(this);
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
    this.margin = {
      top: 8,
      right: 16,
    };

    this.x = d3
      .scaleBand()
      .paddingInner(this.paddingInner)
      .paddingOuter(this.paddingOuter);

    this.y = d3.scaleLinear();

    this.color = d3.scaleOrdinal();

    this.tooltipData = null;
  }

  scaffold() {
    this.container = d3
      .select(this.elChart)
      .classed("chart stacked-bar-chart", true);

    this.svg = this.container
      .append("svg")
      .attr("class", "chart-scg")
      .on("mouseover", this.entered)
      .on("mouseout", this.left);

    this.tooltip = this.container.append("div").attr("class", "chart-tooltip");
  }

  wrangle() {
    if (this.values.length === 0) return;

    this.accessor = {
      x: (d) => d.xValue,
      y: (d) => d.yValue,
      z: (d) => d.series,
    };

    this.seriesKeys =
      this.series.length > 0
        ? this.series.map((d) => d.key)
        : d3.union(this.values.map(this.accessor.z));

    this.color
      .domain(this.seriesKeys)
      .range(
        this.series.length > 0
          ? this.series.map((d) => d.color)
          : d3.quantize(
              (t) => d3.interpolateSpectral(t * 0.8 + 0.1),
              Math.max(this.seriesKeys.size, 2)
            )
      );

    this.stacked = d3
      .stack()
      .keys(this.seriesKeys)
      .value(([, D], key) => this.accessor.y(D.get(key)))(
      d3.index(this.values, this.accessor.x, this.accessor.z)
    );

    this.x.domain(d3.union(this.values.map(this.accessor.x)));

    const padding = 0.05;
    const maxY = d3.max(this.stacked, (d) => d3.max(d, (d) => d[1]));
    this.y.domain([
      0,
      this.axis.y.max === undefined ? maxY + maxY * padding : this.axis.y.max,
    ]);
    if (this.axis.y.max === undefined) this.y.nice();

    if (!this.width) return;
    this.render();
  }

  resize() {
    this.width = this.container.node().clientWidth;
    this.height = this.container.node().clientHeight;

    this.svg.attr("viewBox", [0, 0, this.width, this.height]);

    if (this.values.length === 0) return;

    this.render();
  }

  render() {
    this.adjustXMargin();
    this.renderXAxis();
    this.adjustYMargin();
    this.renderYAxis();
    this.renderBars();
  }

  adjustXMargin() {
    this.margin.left = 4 + 48;
    this.showYAxisLabel = this.axis.y.label !== "";
    if (this.showYAxisLabel) {
      this.margin.left += 20;
    }

    this.x.range([this.margin.left, this.width - this.margin.right]);
  }

  renderXAxis() {
    this.svg
      .selectAll(".axis--x")
      .data([0])
      .join((enter) => enter.append("g").attr("class", "axis axis--x"))
      .call(
        d3
          .axisBottom(this.x)
          .tickSizeOuter(0)
          .tickSizeInner(6)
          .tickFormat((d) => this.xAxisTickLabelFormat(d))
      )
      .call((g) => g.selectAll(".tick line").classed("tick-line", true))
      .call((g) =>
        g
          .selectAll(".tick")
          .selectAll(".grid-line")
          .data(this.showXAxisTicks ? [0] : [])
          .join((enter) => enter.append("line").attr("class", "grid-line"))
          .attr("y2", -(this.height - this.margin.top - this.margin.bottom))
      )
      .call((g) => g.selectAll(".tick text").classed("tick-label-text", true))
      .call((g) =>
        g.select(".domain").style("display", this.showXAxisLine ? null : "none")
      )
      .call((g) =>
        g
          .selectAll(".axis-title-text")
          .data(this.axis.x.label !== "" ? [this.axis.x.label] : [])
          .join((enter) =>
            enter
              .append("text")
              .attr("class", "axis-title-text")
              .attr("fill", "currentColor")
              .attr("text-anchor", "middle")
          )
          .attr("x", (this.margin.left + this.width - this.margin.right) / 2)
          .text("")
      );

    // Rotate x tick labels if necessary
    const availableXTickWidth =
      this.x.bandwidth() +
      Math.min(
        this.x.step() * this.paddingOuter + this.margin.right,
        (this.x.step() * this.paddingInner) / 2
      );
    let maxXTickWidth = availableXTickWidth;
    this.svg
      .select(".axis--x")
      .selectAll(".tick text")
      .each(function () {
        maxXTickWidth = Math.max(
          maxXTickWidth,
          this.getBoundingClientRect().width
        );
      });
    if (maxXTickWidth > availableXTickWidth) {
      this.svg
        .select(".axis--x")
        .selectAll(".tick text")
        .attr("text-anchor", "end")
        .attr("dy", "0.32em")
        .attr("transform", `rotate(-45,0,9)`);
    }
  }

  adjustYMargin() {
    this.margin.bottom =
      4 +
      Math.ceil(
        this.svg.select(".axis--x").node().getBoundingClientRect().height
      );
    this.showXAxisLabel = this.axis.x.label !== "";
    if (this.showXAxisLabel) {
      this.margin.bottom += 20;
    }
    this.svg
      .select(".axis--x")
      .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
      .selectAll(".axis-title-text")
      .attr("y", this.margin.bottom - 4)
      .text((d) => d);

    this.y.range([this.height - this.margin.bottom, this.margin.top]);
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
              this.yAxisTickLabelSpread
          )
          .tickSizeOuter(0)
          .tickSizeInner(6)
          .tickFormat((d) => this.yAxisTickLabelFormat(d))
      )
      .call((g) => g.selectAll(".tick line").classed("tick-line", true))
      .call((g) =>
        g
          .selectAll(".tick")
          .selectAll(".grid-line")
          .data(this.showYAxisTicks ? [0] : [])
          .join((enter) => enter.append("line").attr("class", "grid-line"))
          .attr("x2", this.width - this.margin.left - this.margin.right)
      )
      .call((g) => g.selectAll(".tick text").classed("tick-label-text", true))
      .call((g) =>
        g.select(".domain").style("display", this.showYAxisLine ? null : "none")
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
              .attr("dy", "0.71em")
          )
          .attr("x", -this.margin.left + 4)
          .attr("y", (this.margin.top + this.height - this.margin.bottom) / 2)
          .attr(
            "transform",
            `rotate(-90,${-this.margin.left + 4},${
              (this.margin.top + this.height - this.margin.bottom) / 2
            })`
          )
          .text((d) => d)
      );
  }

  renderBars() {
    this.barSeries = this.svg
      .selectAll(".bars")
      .data([0])
      .join((enter) => enter.append("g").attr("class", "bars"))
      .selectAll(".bar-series")
      .data(this.stacked, (d) => d.key)
      .join((enter) => enter.append("g").attr("class", "bar-series"))
      .attr("fill", (d) => this.color(d.key));
    this.barRect = this.barSeries
      .selectAll(".bar-rect")
      .data((D) => D.map((d) => ((d.key = D.key), d)))
      .join((enter) => enter.append("rect").attr("class", "bar-rect"))
      .attr("x", (d) => this.x(d.data[0]))
      .attr("y", (d) => this.y(d[1]))
      .attr("height", (d) => this.y(d[0]) - this.y(d[1]))
      .attr("width", this.x.bandwidth());
  }

  entered(event) {
    if (!this.tooltipHtml) return;
    const barRectEl = event.target.closest(".bar-rect");
    if (!barRectEl) return;
    const barSeriesEl = barRectEl.closest(".bar-series");
    this.barRect.classed("is-active", function () {
      return this === barRectEl;
    });
    this.barSeries
      .filter(function () {
        return this === barSeriesEl;
      })
      .raise();
    const d = d3.select(barRectEl).datum();
    this.tooltipData = d.data[1].get(d.key);
    this.updateTooltip();
    this.positionTooltip(event);
  }

  left(event) {
    if (!this.tooltipHtml) return;
    const barRectEl = event.target.closest(".bar-rect");
    if (!barRectEl) return;
    this.barRect.classed("is-active", false);
    this.tooltipData = null;
    this.updateTooltip();
  }

  updateTooltip() {
    if (this.tooltipData) {
      this.tooltip
        .html(this.tooltipHtml(this.tooltipData))
        .classed("is-visible", true);
    } else {
      this.tooltip.classed("is-visible", false);
    }
  }

  positionTooltip(event) {
    const tooltipRect = this.tooltip.node().getBoundingClientRect();
    let x =
      this.x(this.accessor.x(this.tooltipData)) +
      this.x.bandwidth() / 2 -
      tooltipRect.width / 2;
    if (x + tooltipRect.width > this.width) {
      x = this.width - tooltipRect.width;
    } else if (x < 0) {
      x = 0;
    }
    const yOffset = 8;
    const [mx, my] = d3.pointer(event);
    let y = my - yOffset - tooltipRect.height;
    if (y < 0) {
      y = my + yOffset;
    }
    this.tooltip.style("transform", `translate(${x}px,${y}px)`);
  }

  redraw() {
    this.wrangle();
  }
};
