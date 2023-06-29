window.BarChart = class BarChart {
  constructor({
    elChart,
    values = [],
    showXAxisLine = true,
    showTrendline = false,
    paddingInner = 0.4,
    paddingOuter = 0,
    onClick,
    tooltipHtml,
  }) {
    this.elChart = elChart;
    this.values = values;
    this.showXAxisLine = showXAxisLine;
    this.showTrendline = showTrendline;
    this.paddingInner = paddingInner;
    this.paddingOuter = paddingOuter;
    this.onClick = onClick;
    this.tooltipHtml = tooltipHtml;
    this.resize = this.resize.bind(this);
    this.entered = this.entered.bind(this);
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
    this.margin = {
      top: 1,
      right: 1,
      bottom: 3,
      left: 1,
    };

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
      x: (d) => d.date,
      y: (d) => d.value,
    };

    this.x.domain(this.values.map(this.accessor.x));

    const padding = 0.05;
    this.y.domain([
      0,
      d3.max(this.values, this.accessor.y) * (1 + padding) || 1,
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

    this.x.range([this.margin.left, this.width - this.margin.right]);
    this.y.range([this.height - this.margin.bottom, this.margin.top]);

    this.svg.attr("viewBox", [0, 0, this.width, this.height]);

    if (this.values.length === 0) return;
    this.render();
  }

  render() {
    this.renderZeroLine();
    this.renderBars();
    this.renderTrendLine();
  }

  renderZeroLine() {
    this.svg
      .selectAll(".zero-line")
      .data(this.showXAxisLine ? [0] : [])
      .join((enter) =>
        enter
          .append("line")
          .attr("class", "zero-line")
          .attr("x1", this.margin.left)
      )
      .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
      .attr("x2", this.width - this.margin.right);
  }

  renderBars() {
    this.barRect = this.svg
      .selectAll(".bar-rects")
      .data([0])
      .join((enter) => enter.append("g").attr("class", "bar-rects"))
      .classed("is-clickable", !!this.onClick)
      .selectAll(".bar-rect")
      .data(this.values)
      .join((enter) => enter.append("rect").attr("class", "bar-rect"))
      .attr("x", (d) => this.x(this.accessor.x(d)))
      .attr("y", (d) => this.y(this.accessor.y(d) || 0))
      .attr("width", this.x.bandwidth())
      .attr("height", (d) => this.y(0) - this.y(this.accessor.y(d)) || 0);
  }

  renderTrendLine() {
    const tl = this.svg
      .selectAll(".trend-line")
      .data(this.lr ? [0] : [])
      .join((enter) => enter.append("line").attr("class", "trend-line"));
    if (this.lr) {
      tl.attr("x1", this.x(this.x.domain()[0]) + this.x.bandwidth() / 2)
        .attr(
          "x2",
          this.x(this.x.domain()[this.x.domain().length - 1]) +
            this.x.bandwidth() / 2
        )
        .attr("y1", this.y(this.lr.intercept))
        .attr(
          "y2",
          this.y(
            this.lr.slope * (this.x.domain().length - 1) + this.lr.intercept
          )
        );
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
};
