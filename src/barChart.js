import * as d3 from "d3";
import { linearRegression } from "./linearRegression.js";

export class BarChart {
  constructor({
    elChart,
    values = [],
    maxBarWidth = Infinity,
    enableHoverPointer = false,
    hoverColor = null,
    showXAxisTickLabels = false,
    showXAxisTicks = false,
    showXAxisInnerTicks = true,
    showXAxisLine = true,
    xAxisTickLabelFormat = (d) => d.toLocaleString(),
    showYAxisTickLabels = false,
    showYAxisTicks = false,
    showYAxisInnerTicks = true,
    showYAxisLine = false,
    yAxisTickLabelSpread = 50,
    yAxisTickLabelFormat = (d) => d.toLocaleString(),
    axis = {
      x: {
        label: "",
      },
      y: {
        label: "",
        max: undefined,
      },
    },
    showTrendline = false,
    paddingInner = 0.4,
    paddingOuter = 0,
    onClick,
    tooltipHtml,
    enableRoundedCorners = false,
    minimalBarHeightForZero = false,
  }) {
    this.elChart = elChart;
    this.values = values;
    this.maxBarWidth = maxBarWidth;
    this.enableHoverPointer = enableHoverPointer;
    this.hoverColor = hoverColor;
    this.showXAxisTickLabels = showXAxisTickLabels;
    this.showXAxisTicks = showXAxisTicks;
    this.showXAxisInnerTicks = showXAxisInnerTicks;
    this.showXAxisLine = showXAxisLine;
    this.xAxisTickLabelFormat = xAxisTickLabelFormat;
    this.showYAxisTickLabels = showYAxisTickLabels;
    this.showYAxisTicks = showYAxisTicks;
    this.showYAxisInnerTicks = showYAxisInnerTicks;
    this.showYAxisLine = showYAxisLine;
    this.yAxisTickLabelSpread = yAxisTickLabelSpread;
    this.yAxisTickLabelFormat = yAxisTickLabelFormat;
    this.axis = Object.assign(
      {
        x: {
          label: "",
        },
        y: {
          label: "",
          max: undefined,
        },
      },
      axis,
    );
    this.showTrendline = showTrendline;
    this.paddingInner = paddingInner;
    this.paddingOuter = paddingOuter;
    this.onClick = onClick;
    this.tooltipHtml = tooltipHtml;
    this.resize = this.resize.bind(this);
    this.entered = this.entered.bind(this);
    this.left = this.left.bind(this);
    this.clicked = this.clicked.bind(this);
    this.enableRoundedCorners = enableRoundedCorners;
    this.minimalBarHeightForZero = minimalBarHeightForZero;
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

    this.parseDate = d3.utcParse("%Y-%m-%d");

    this.x = d3
      .scaleBand()
      .paddingInner(this.paddingInner)
      .paddingOuter(this.paddingOuter);

    this.y = d3.scaleLinear();

    this.tooltipData = null;
  }

  scaffold() {
    this.container = d3.select(this.elChart).classed("chart bar-chart", true);

    this.svg = this.container
      .append("svg")
      .attr("class", "chart-svg")
      .on("mouseover", this.entered)
      .on("mouseout", this.left)
      .on("click", this.clicked);

    this.tooltip = this.container.append("div").attr("class", "chart-tooltip");
  }

  wrangle() {
    if (this.values.length === 0) return;

    this.accessor = {
      x: (d) => d.date || d.name,
      y: (d) => d.value,
      color: (d) => d.color,
    };

    this.x.domain(this.values.map(this.accessor.x));

    const padding = 0.05;
    this.y.domain([
      0,
      this.axis.y.max === undefined
        ? d3.max(this.values, this.accessor.y) * (1 + padding) || 1
        : this.axis.y.max,
    ]);

    this.lr = null;
    if (this.showTrendline) {
      const nonNullIndexes = this.values.reduce((idx, d, i) => {
        if (this.accessor.y(d) !== null) idx.push(i);
        return idx;
      }, []);
      if (nonNullIndexes.length >= 2) {
        const x = nonNullIndexes;
        const y = nonNullIndexes.map((i) => this.accessor.y(this.values[i]));
        this.lr = linearRegression(x, y);
      }
    }

    if (!this.width) return;
    this.render();
  }

  resize() {
    this.width = this.container.node().clientWidth;
    this.height = this.container.node().clientHeight;

    this.y.range([this.height - this.margin.bottom, this.margin.top]);

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

  renderXAxis() {
    this.svg
      .selectAll(".axis--x")
      .data([0])
      .join((enter) => enter.append("g").attr("class", "axis axis--x"))
      .call(
        d3
          .axisBottom(this.x)
          .tickSizeOuter(0)
          .tickSizeInner(this.showXAxisInnerTicks ? 6 : 0)
          .tickFormat((d, i) =>
            this.showXAxisTickLabels ? this.xAxisTickLabelFormat(d, i) : "",
          ),
      )
      .call((g) => g.selectAll(".tick line").classed("tick-line", true))
      .call((g) =>
        g
          .selectAll(".tick")
          .selectAll(".grid-line")
          .data(this.showXAxisTicks ? [0] : [])
          .join((enter) => enter.append("line").attr("class", "grid-line"))
          .attr("y2", -(this.height - this.margin.top - this.margin.bottom)),
      )
      .call((g) => g.selectAll(".tick text").classed("tick-label-text", true))
      .call((g) =>
        g
          .select(".domain")
          .style("display", this.showXAxisLine ? null : "none"),
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
              .attr("text-anchor", "middle"),
          )
          .attr("x", (this.margin.left + this.width - this.margin.right) / 2)
          .text(""),
      );

    if (this.showXAxisTickLabels) {
      // Rotate x tick labels if necessary
      const availableXTickWidth =
        this.x.bandwidth() +
        Math.min(
          this.x.step() * this.paddingOuter + this.margin.right,
          (this.x.step() * this.paddingInner) / 2,
        );
      let maxXTickWidth = availableXTickWidth;
      this.svg
        .select(".axis--x")
        .selectAll(".tick text")
        .each(function () {
          maxXTickWidth = Math.max(
            maxXTickWidth,
            this.getBoundingClientRect().width,
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
  }

  adjustYMargin() {
    this.margin.top = 1;
    this.margin.bottom = 4;
    if (this.showXAxisTickLabels) {
      this.margin.top = 8;
      this.margin.bottom += Math.ceil(
        this.svg.select(".axis--x").node().getBoundingClientRect().height,
      );
    }
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
      .call((g) => g.selectAll(".tick text").classed("tick-label-text", true))
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

  renderBars() {
    const barWidth = Math.min(this.maxBarWidth, this.x.bandwidth());
    const cornerRadius = this.enableRoundedCorners ? 5 : 0;

    this.barRect = this.svg
      .selectAll(".bar-rects")
      .data([0])
      .join((enter) => enter.append("g").attr("class", "bar-rects"))
      .classed("is-clickable", !!this.onClick)
      .selectAll(".bar-rect")
      .data(this.values)
      .join((enter) => enter.append("rect").attr("class", "bar-rect"))
      .attr(
        "x",
        (d) =>
          this.x(this.accessor.x(d)) + this.x.bandwidth() / 2 - barWidth / 2,
      )
      .attr("y", (d) => this.y(Math.max(this.accessor.y(d), 0)))
      .attr("width", barWidth)
      .attr("height", (d) => {
        const height = this.y(0) - this.y(this.accessor.y(d));
        return this.minimalBarHeightForZero && this.accessor.y(d) === 0
          ? 1
          : Math.max(height, 0);
      })
      .style("fill", (d) => this.accessor.color(d))
      .attr("rx", cornerRadius)
      .attr("ry", cornerRadius);

    if (this.enableHoverPointer) {
      this.barRect.style("cursor", "pointer");
    }

    if (this.hoverColor) {
      this.barRect
        .on("mouseover", (event, d) => {
            d3.select(event.currentTarget).style("fill", this.hoverColor);
        })
        .on("mouseout", (event, d) => {
            d3.select(event.currentTarget).style("fill", this.accessor.color(d));
        });
    }
  }

  renderTrendLine() {
    const tl = this.svg
      .selectAll(".trend-line")
      .data(this.lr ? [0] : [])
      .join((enter) => enter.append("line").attr("class", "trend-line"));
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
    this.barRect.classed("is-active", function () {
      return this === barRectEl;
    });
    this.tooltipData = d3.select(barRectEl).datum();
    this.updateTooltip();
    this.positionTooltip();
  }

  left(event) {
    if (!this.tooltipHtml) return;
    const barRectEl = event.target.closest(".bar-rect");
    if (!barRectEl) return;
    this.barRect.classed("is-active", false);
    this.tooltipData = null;
    this.updateTooltip();
  }

  clicked(event) {
    if (!this.onClick) return;
    const barRectEl = event.target.closest(".bar-rect");
    if (!barRectEl) return;
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

  positionTooltip() {
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
    let y =
      this.y(this.accessor.y(this.tooltipData)) - yOffset - tooltipRect.height;
    if (y < 0) {
      y = this.y(this.accessor.y(this.tooltipData)) + yOffset;
    }

    this.tooltip.style("transform", `translate(${x}px,${y}px)`);
  }

  redraw() {
    this.wrangle();
  }
}
