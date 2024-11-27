import * as d3 from "d3";
import { linearRegression } from "./linearRegression.js";

export class StackedBarChart {
  constructor({
    elChart,
    values = [],
    series = [],
    showXAxisLine = true,
    xAxisTickLabelFormat = (d) => d.toLocaleString(),
    showYAxisTicks = true,
    showYAxisInnerTicks = true,
    showYAxisLine = false,
    yAxisTickLabelSpread = 50,
    yAxisTickLabelFormat = (d) => d.toLocaleString(),
    spaceBetweenSeries = false,
    yAxisLabel = "",
    yAxisMin,
    yAxisMax,
    xAxisLabel = "",
    paddingInner = 0.4,
    paddingOuter = 0,
    maxBarWidth = Infinity,
    tooltipHtml,
    enableRoundedCorners = true,
    leftMargin = null,
    showTrendline = false,
    trendlineClass = "trend-line",
  }) {
    this.elChart = elChart;
    this.paddingInner = paddingInner;
    this.paddingOuter = paddingOuter;
    this.maxBarWidth = maxBarWidth;
    this.tooltipHtml = tooltipHtml;
    this.values = values;
    this.series = series;
    this.spaceBetweenSeries = spaceBetweenSeries;
    this.showXAxisLine = showXAxisLine;
    this.xAxisTickLabelFormat = xAxisTickLabelFormat;
    this.showYAxisTicks = showYAxisTicks;
    this.showYAxisInnerTicks = showYAxisInnerTicks;
    this.showYAxisLine = showYAxisLine;
    this.yAxisTickLabelSpread = yAxisTickLabelSpread;
    this.yAxisTickLabelFormat = yAxisTickLabelFormat;
    this.maxBarWidth = maxBarWidth;
    this.leftMargin = leftMargin;
    this.enableRoundedCorners = enableRoundedCorners;
    this.showTrendline = showTrendline;
    this.trendlineClass = trendlineClass;
    this.resize = this.resize.bind(this);
    this.entered = this.entered.bind(this);
    this.left = this.left.bind(this);
    this.yAxisLabel = yAxisLabel;
    this.xAxisLabel = xAxisLabel;
    this.yAxisMin = yAxisMin;
    this.yAxisMax = yAxisMax;
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

    this.margin = {
      top: 16,
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
      .classed(
        `chart stacked-bar-chart ${this.spaceBetweenSeries ? "stacked-bar-chart-spaced" : ""}`,
        true,
      );

    this.svg = this.container
      .append("svg")
      .attr("class", "chart-scg")
      .on("mouseover", this.entered)
      .on("mouseout", this.left);

    this.defs = this.svg.append("defs");

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
              Math.max(this.seriesKeys.size, 2),
            ),
      );

    this.stacked = d3
      .stack()
      .keys(this.seriesKeys)
      .value(([, D], key) => this.accessor.y(D.get(key)))(
      d3.index(this.values, this.accessor.x, this.accessor.z),
    );

    this.x.domain(d3.union(this.values.map(this.accessor.x)));

    const padding = 0.05;
    const maxY = d3.max(this.stacked, (d) => d3.max(d, (d) => d[1]));
    this.y.domain([
      0,
      this.yAxisMax === undefined ? maxY + maxY * padding : this.yAxisMax,
    ]);
    if (this.yAxisMax === undefined) this.y.nice();

    this.lr = null;
    if (this.showTrendline) {
      const totals = Array.from(d3.group(this.values, this.accessor.x)).map(
        ([_, values]) => d3.sum(values, this.accessor.y),
      );

      const nonNullIndexes = totals.reduce((idx, d, i) => {
        if (d !== null) idx.push(i);
        return idx;
      }, []);

      if (nonNullIndexes.length >= 2) {
        const x = nonNullIndexes;
        const y = nonNullIndexes.map((i) => totals[i]);
        this.lr = linearRegression(x, y);
      }
    }

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
    this.renderTrendLine();
  }

  adjustXMargin() {
    this.margin.left = 4 + 48;
    this.showYAxisLabel = this.yAxisLabel !== "";
    if (this.showYAxisLabel) {
      this.margin.left += 32;
    }

    if (this.leftMargin !== null) {
      this.margin.left = this.leftMargin;
    }

    this.x.range([this.margin.left, this.width - this.margin.right]);
  }

  renderXAxis() {
    // First render the axis normally
    const axis = this.svg
      .selectAll(".axis--x")
      .data([0])
      .join((enter) => enter.append("g").attr("class", "axis axis--x"))
      .call(
        d3
          .axisBottom(this.x)
          .tickSizeOuter(0)
          .tickSizeInner(0)
          .tickFormat((d, i) => this.xAxisTickLabelFormat(d, i)),
      )
      .call((g) => g.selectAll(".tick line").classed("tick-line", true))
      .call((g) =>
        g
          .select(".domain")
          .style("display", this.showXAxisLine ? null : "none"),
      );

    // Check for label overlap
    const tickNodes = axis.selectAll(".tick text").nodes();
    let hasOverlap = false;

    for (let i = 0; i < tickNodes.length - 1; i++) {
      const bbox1 = tickNodes[i].getBoundingClientRect();
      const bbox2 = tickNodes[i + 1].getBoundingClientRect();
      if (bbox1.right > bbox2.left) {
        hasOverlap = true;
        break;
      }
    }

    // Apply appropriate text styling based on overlap
    axis
      .selectAll(".tick text")
      .classed("tick-label-text", true)
      .style("text-anchor", hasOverlap ? "end" : "middle")
      .attr("dy", hasOverlap ? "0.6em" : "1.5em")
      .attr("dx", hasOverlap ? "-0.2em" : null)
      .attr("transform", hasOverlap ? "rotate(-45)" : null);

    // Handle axis label
    axis.call((g) =>
      g
        .selectAll(".axis-title-text")
        .data(this.xAxisLabel !== "" ? [this.xAxisLabel] : [])
        .join((enter) =>
          enter
            .append("text")
            .attr("class", "axis-title-text")
            .attr("fill", "currentColor")
            .attr("text-anchor", "middle"),
        )
        .attr("x", (this.x.range()[0] + this.x.range()[1]) / 2)
        .attr("y", this.margin.bottom - 30)
        .text((d) => d),
    );

    return;
  }

  adjustYMargin() {
    const xAxisNode = this.svg.select(".axis--x").node();
    const xAxisHeight = xAxisNode
      ? Math.ceil(xAxisNode.getBoundingClientRect().height)
      : 20; // Default height if axis doesn't exist yet

    this.margin.bottom = 4 + xAxisHeight;

    const yAxisLabels = this.svg.select(".axis--y").selectAll(".tick text");
    if (!yAxisLabels.empty()) {
      const labelHeight = Math.ceil(
        yAxisLabels.nodes()[0].getBoundingClientRect().height,
      );
      this.margin.top = Math.max(16, labelHeight / 2);
    }

    this.showXAxisLabel = this.xAxisLabel !== "";
    if (this.showXAxisLabel) {
      this.margin.bottom += 20;
    }

    this.svg
      .select(".axis--x")
      .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
      .selectAll(".axis-title-text")
      .attr("y", this.margin.bottom - 10)
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
              this.yAxisTickLabelSpread,
          )
          .tickSizeOuter(0)
          .tickPadding(12)
          .tickFormat((d) => this.yAxisTickLabelFormat(d)),
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
      .call((g) => g.selectAll(".tick text").classed("tick-label-text", true))
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

  renderBars() {
    const barWidth = Math.min(this.maxBarWidth, this.x.bandwidth());
    const cornerRadius = this.enableRoundedCorners ? 3 : 0;

    this.bars = this.svg
      .selectAll(".bars")
      .data([0])
      .join((enter) => enter.append("g").attr("class", "bars"));

    this.barSeries = this.bars
      .selectAll(".bar-series")
      .data(this.stacked, (d) => d.key)
      .join((enter) => enter.append("g").attr("class", "bar-series"))
      .attr("fill", (d) => this.color(d.key));

    // Create a map of the highest points for each x value
    const maxHeightsByX = new Map();
    this.stacked.forEach((series) => {
      series.forEach((d) => {
        const xVal = d.data[0];
        const yVal = d[1];
        if (!maxHeightsByX.has(xVal) || maxHeightsByX.get(xVal) < yVal) {
          maxHeightsByX.set(xVal, yVal);
        }
      });
    });

    this.barRect = this.barSeries
      .selectAll(".bar-rect")
      .data((D) => D.map((d) => ((d.key = D.key), d)))
      .join((enter) => enter.append("path").attr("class", "bar-rect"))
      .attr("d", (d) => {
        const x = this.x(d.data[0]) + this.x.bandwidth() / 2 - barWidth / 2;
        const y = this.y(d[1]);
        const height = this.y(d[0]) - this.y(d[1]);
        const width = barWidth;

        // Only add top rounded corners for the topmost bar
        const isTopBar = maxHeightsByX.get(d.data[0]) === d[1];
        const r = isTopBar ? cornerRadius : 0;

        // Create path with rounded top corners only
        return `
          M ${x + r},${y}
          L ${x + width - r},${y}
          Q ${x + width},${y} ${x + width},${y + r}
          L ${x + width},${y + height}
          L ${x},${y + height}
          L ${x},${y + r}
          Q ${x},${y} ${x + r},${y}
          Z
        `;
      })
      .attr("fill", (d) =>
        this.barSeries.filter((D) => D.key === d.key).attr("fill"),
      );
  }

  renderTrendLine() {
    const tl = this.svg
      .selectAll(".trend-line")
      .data(this.lr ? [0] : [])
      .join((enter) => enter.append("line").attr("class", this.trendlineClass));

    if (this.lr) {
      const xScaleDomain = this.x.domain();
      const yScaleRange = this.y.range();

      const x1 = this.x(xScaleDomain[0]) + this.x.bandwidth() / 2;
      const x2 =
        this.x(xScaleDomain[xScaleDomain.length - 1]) + this.x.bandwidth() / 2;

      const y1 = Math.max(
        yScaleRange[1],
        Math.min(yScaleRange[0], this.y(this.lr.intercept)),
      );
      const y2 = Math.max(
        yScaleRange[1],
        Math.min(
          yScaleRange[0],
          this.y(this.lr.slope * (xScaleDomain.length - 1) + this.lr.intercept),
        ),
      );

      tl.attr("x1", x1).attr("x2", x2).attr("y1", y1).attr("y2", y2);
    }
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
    const my = d3.pointer(event)[1];
    let y = my - yOffset - tooltipRect.height;
    if (y < 0) {
      y = my + yOffset;
    }
    this.tooltip.style("transform", `translate(${x}px,${y}px)`);
  }

  redraw() {
    this.wrangle();
  }
}
