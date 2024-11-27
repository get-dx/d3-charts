import * as d3 from "d3";
import { linearRegression } from "./linearRegression.js";

export class MultiLineChart {
  constructor({
    elChart,
    series = [],
    values = [],
    showXAxisLine = true,
    showXAxisTicks = true,
    xAxisTickLabelFormat = d3.timeFormat("%b %d"),
    showPoints = false,
    startDate,
    endDate,
    yAxisMin,
    yAxisMax,
    showYAxisTickLabels = true,
    showYAxisTicks = true,
    showYAxisInnerTicks = false,
    showYAxisLine = false,
    yAxisTickLabelSpread = 50,
    yAxisTickLabelFormat = (d) => d.toLocaleString(),
    yAxisLabel = "",
    xAxisLabel = "",
    tooltipHtml,
    showTrendlines = false,
    trendlineClass = "trend-line",
    minTickSpacing = null,
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
    this.showTrendlines = showTrendlines;
    this.trendlineClass = trendlineClass;
    this.minTickSpacing = minTickSpacing;
    this.resize = this.resize.bind(this);
    this.entered = this.entered.bind(this);
    this.moved = this.moved.bind(this);
    this.left = this.left.bind(this);
    this.xAxisTickLabelFormat = xAxisTickLabelFormat;
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
      this.yAxisMin === undefined
        ? Math.max(0, minY - gapY * padding)
        : this.yAxisMin,
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

    if (this.showTrendlines) {
      this.lineData = this.lineData.map((series) => {
        const nonNullIndexes = series.values.reduce((idx, d, i) => {
          if (d !== undefined) idx.push(i);
          return idx;
        }, []);

        let lr = null;
        if (nonNullIndexes.length >= 2) {
          const x = nonNullIndexes;
          const y = nonNullIndexes.map((i) => series.values[i]);
          lr = linearRegression(x, y);
        }

        return {
          ...series,
          trendline: lr,
        };
      });
    }

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
    this.renderTrendlines();
    this.renderSeries();
  }

  adjustXMargin() {
    // Start with minimum margins
    this.margin.left = 1;
    this.margin.right = 1;

    if (this.showYAxisTickLabels) {
      // Find the maximum width of y-axis tick labels
      let maxLabelWidth = 0;
      this.g.selectAll(".axis--y .tick text").each(function () {
        const bbox = this.getBBox();
        maxLabelWidth = Math.max(maxLabelWidth, bbox.width);
      });

      // Add padding to the label width
      const labelPadding = 16;
      this.margin.left = maxLabelWidth + labelPadding;
    }

    // Add extra space for y-axis label if present
    this.showYAxisLabel = this.yAxisLabel !== "";
    if (this.showYAxisLabel) {
      this.margin.left += 24;
    }

    // Update x scale range with new margins
    this.x.range([this.margin.left, this.width - this.margin.right]);
  }

  adjustYMargin() {
    this.margin.top = 3;
    this.margin.bottom = 4;

    // Calculate height needed for x-axis tick labels
    const xAxisHeight = Math.ceil(
      this.g.select(".axis--x").node()?.getBoundingClientRect().height || 20,
    );

    this.margin.bottom += xAxisHeight;

    this.showXAxisLabel = this.xAxisLabel !== "";
    if (this.showXAxisLabel) {
      this.margin.bottom += 16;
    }

    this.y.range([this.height - this.margin.bottom, this.margin.top]);
  }

  renderXAxis() {
    const tickSize = 0;

    // Update temporary axis to use format
    const tempAxis = this.g
      .append("g")
      .attr("class", "temp-axis")
      .call(
        d3
          .axisBottom(this.x)
          .tickValues([this.dates[0]])
          .tickFormat(this.xAxisTickLabelFormat),
      );

    // Measure tick label width
    let tickWidth = 0;
    tempAxis.selectAll(".tick text").each(function () {
      tickWidth = Math.max(tickWidth, this.getBoundingClientRect().width);
    });

    tempAxis.remove();

    // Calculate optimal spacing with padding
    const padding = 16;
    const optimalSpacing = tickWidth + padding;
    const effectiveSpacing = Math.max(
      optimalSpacing,
      this.minTickSpacing || optimalSpacing,
    );

    // Always include first and last dates
    const selectedTicks = [this.dates[0]];
    let lastX = this.x(this.dates[0]);

    // Select intermediate ticks
    this.dates.slice(1, -1).forEach((date) => {
      const xPos = this.x(date);
      if (xPos - lastX >= effectiveSpacing) {
        selectedTicks.push(date);
        lastX = xPos;
      }
    });

    // Add last date if it's not too close to previous tick
    const lastDate = this.dates[this.dates.length - 1];
    const lastXPos = this.x(lastDate);
    if (lastXPos - lastX >= effectiveSpacing * 0.75) {
      // Allow slightly closer spacing for last tick
      selectedTicks.push(lastDate);
    } else {
      // If too close, remove the previous tick and add the last one
      selectedTicks.pop();
      selectedTicks.push(lastDate);
    }

    // Update main axis to use format
    this.g
      .selectAll(".axis--x")
      .data(this.showXAxisTicks ? [0] : [])
      .join((enter) => enter.append("g").attr("class", "axis axis--x"))
      .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
      .call(
        d3
          .axisBottom(this.x)
          .tickValues(selectedTicks)
          .tickSize(tickSize)
          .tickPadding(14)
          .tickFormat(this.xAxisTickLabelFormat),
      )
      .call((g) => g.select(".domain").remove())
      .call((g) => {
        // Always force first label to left align at margin
        const firstTick = g.select(".tick:first-of-type");
        firstTick
          .select("text")
          .attr("text-anchor", "start")
          .attr(
            "transform",
            `translate(${this.margin.left - this.x(this.dates[0])},0)`,
          );

        // Always force last label to right align at margin
        const lastTick = g.select(".tick:last-of-type");
        lastTick
          .select("text")
          .attr("text-anchor", "end")
          .attr(
            "transform",
            `translate(${this.width - this.margin.right - this.x(this.dates[this.dates.length - 1])},0)`,
          );

        // Adjust intermediate labels if they overlap with first or last
        const ticks = g.selectAll(".tick").nodes();
        if (ticks.length > 2) {
          const firstTickRect = firstTick
            .select("text")
            .node()
            .getBoundingClientRect();
          const lastTickRect = lastTick
            .select("text")
            .node()
            .getBoundingClientRect();

          // Check and adjust second tick if it overlaps with first
          const secondTick = g.select(".tick:nth-of-type(2)");
          const secondTickRect = secondTick
            .select("text")
            .node()
            .getBoundingClientRect();
          if (firstTickRect.right + 10 > secondTickRect.left) {
            secondTick.select("text").style("opacity", 0);
          }

          // Check and adjust second-to-last tick if it overlaps with last
          if (ticks.length > 3) {
            const secondLastTick = g.select(`.tick:nth-last-of-type(2)`);
            const secondLastTickRect = secondLastTick
              .select("text")
              .node()
              .getBoundingClientRect();
            if (secondLastTickRect.right + 10 > lastTickRect.left) {
              secondLastTick.select("text").style("opacity", 0);
            }
          }
        }
      })
      .call((g) => g.selectAll(".tick text"))
      .call((g) =>
        g
          .selectAll(".x-axis-label")
          .data(this.xAxisLabel !== "" ? [this.xAxisLabel] : [])
          .join((enter) =>
            enter
              .append("text")
              .attr("class", "x-axis-label axis-title-text")
              .attr("text-anchor", "middle")
              .attr("fill", "currentColor"),
          )
          .attr("x", (this.x.range()[0] + this.x.range()[1]) / 2)
          .attr("y", 46)
          .text((d) => d),
      );
  }

  renderYAxis() {
    // Create axis first to measure label widths
    const yAxis = this.g
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
          .tickPadding(16)
          .tickFormat((d) =>
            this.showYAxisTickLabels ? this.yAxisTickLabelFormat(d) : "",
          ),
      );

    // Calculate max label width if labels are shown
    let maxLabelWidth = 0;
    if (this.showYAxisTickLabels) {
      yAxis.selectAll(".tick text").each(function () {
        const bbox = this.getBBox();
        maxLabelWidth = Math.max(maxLabelWidth, bbox.width);
      });
    }

    const labelOffset = maxLabelWidth + 40;

    // Position y-axis label with proper offset
    yAxis
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
          .attr("x", -labelOffset) // Position to the left of tick labels
          .attr("y", (this.margin.top + this.height - this.margin.bottom) / 2)
          .attr(
            "transform",
            () =>
              `rotate(-90,${-labelOffset},${
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
      .attr("transform", `translate(0,${this.y(0)})`)
      .attr("x2", this.width - this.margin.right);
  }

  renderTrendlines() {
    if (!this.showTrendlines) return;

    const trendlineG = this.g
      .selectAll(".trend-lines")
      .data([0])
      .join((enter) => enter.append("g").attr("class", "trend-lines"));

    trendlineG
      .selectAll(".trend-line")
      .data(this.lineData.filter((d) => d.trendline))
      .join((enter) =>
        enter
          .append("line")
          .attr("class", () => `trend-line ${this.trendlineClass}`),
      )
      .attr("stroke", (d) => this.color(d.key))
      .attr("x1", (d) => {
        const firstValidIndex = d.values.findIndex((v) => v !== undefined);
        return this.x(this.dates[firstValidIndex]);
      })
      .attr("x2", (d) => {
        const lastValidIndex =
          d.values.length -
          1 -
          [...d.values].reverse().findIndex((v) => v !== undefined);
        return this.x(this.dates[lastValidIndex]);
      })
      .attr("y1", (d) => {
        const firstValidIndex = d.values.findIndex((v) => v !== undefined);
        return this.y(
          d.trendline.slope * firstValidIndex + d.trendline.intercept,
        );
      })
      .attr("y2", (d) => {
        const lastValidIndex =
          d.values.length -
          1 -
          [...d.values].reverse().findIndex((v) => v !== undefined);
        return this.y(
          d.trendline.slope * lastValidIndex + d.trendline.intercept,
        );
      });
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
