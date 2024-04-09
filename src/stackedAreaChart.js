import * as d3 from "d3";

export class StackedAreaChart {
  constructor({
    elChart,
    tooltipHtml,
    values = {
      series: [],
      dates: [],
    },
  }) {
    this.elChart = elChart;
    this.tooltipHtml = tooltipHtml;
    this.values = values;
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
    this.margin = {
      top: 3,
      right: 3,
      bottom: 3,
      left: 3,
    };

    this.parseDate = d3.utcParse("%Y-%m-%d");

    this.x = d3.scaleUtc();

    this.y = d3.scaleLinear().domain([0, 1]);

    this.area = d3
      .area()
      .x((_, i) => this.x(this.dates[i]))
      .y0((d) => this.y(d[0]))
      .y1((d) => this.y(d[1]));

    this.indexDate = null;
  }

  scaffold() {
    this.container = d3
      .select(this.elChart)
      .classed("chart stacked-area-chart", true);

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
    if (this.values.dates.length === 0) return;

    this.dates = this.values.dates.map(this.parseDate);

    this.x.domain(d3.extent(this.dates));

    this.series = this.values.series.map((d) =>
      Object.assign(
        {
          percentages: Array(d.counts.length),
          stacked: Array(d.counts.length),
        },
        d,
      ),
    );
    for (let i = 0; i < this.dates.length; i++) {
      const total = d3.sum(this.series, (d) => d.counts[i]) | Infinity;
      let stacked = 0;
      this.series.forEach((d) => {
        d.percentages[i] = d.counts[i] / total;
        d.stacked[i] = [stacked, Math.min(1, (stacked += d.percentages[i]))];
      });
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

    this.focusLine.attr("y2", this.height - this.margin.bottom);

    if (this.values.dates.length === 0) return;

    this.render();
  }

  render() {
    this.renderZeroLine();
    this.renderStackedAreas();
  }

  renderZeroLine() {
    this.g
      .selectAll(".zero-line")
      .data([0])
      .join((enter) =>
        enter
          .append("line")
          .attr("class", "zero-line")
          .attr("x1", this.margin.left),
      )
      .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
      .attr("x2", this.width - this.margin.right);
  }

  renderStackedAreas() {
    this.g
      .selectAll(".stacked-areas")
      .data([0])
      .join((enter) => enter.append("g").attr("class", "stacked-areas"))
      .selectAll(".stacked-area")
      .data(this.series, (d) => d.name)
      .join((enter) => enter.append("path").attr("class", "stacked-area"))
      .attr("fill", (d) => d.color)
      .attr("d", (d) => this.area(d.stacked));
  }

  entered() {
    if (!this.tooltipHtml || !this.dates) return;
    this.focusLine.classed("is-visible", true);
  }

  moved(event) {
    if (!this.tooltipHtml || !this.dates) return;
    this.pointer = d3.pointer(event, this.svg.node());
    const xDate = this.x.invert(this.pointer[0]);
    const indexDate = d3.bisectCenter(this.dates, xDate);
    if (this.indexDate !== indexDate) {
      this.indexDate = indexDate;
      this.focusLine.attr(
        "transform",
        `translate(${this.x(this.dates[this.indexDate])},0)`,
      );
      this.updateTooltip();
    }
    if (this.tooltip.classed("is-visible")) this.positionTooltip();
  }

  left() {
    if (!this.tooltipHtml || !this.dates) return;
    this.indexDate = null;
    this.focusLine.classed("is-visible", false);
    this.updateTooltip();
  }

  updateTooltip() {
    if (this.indexDate === null) {
      this.tooltip.classed("is-visible", false);
    } else {
      const date = this.dates[this.indexDate];
      const series = this.series.map((d) => ({
        name: d.name,
        count: d.counts[this.indexDate],
        percentage: d.percentages[this.indexDate],
        color: d.color,
      }));
      this.tooltip
        .html(this.tooltipHtml(date, series))
        .classed("is-visible", true);
    }
  }

  positionTooltip() {
    const tooltipRect = this.tooltip.node().getBoundingClientRect();

    // position the tooltip to the right
    const xOffset = 4;
    let x = this.x(this.dates[this.indexDate]) + xOffset;
    if (x + tooltipRect.width > this.width) {
      // position the tooltip to the left
      x = this.x(this.dates[this.indexDate]) - xOffset - tooltipRect.width;
      if (x < 0) {
        x = 0;
      }
    }

    // position the tooltip at the top
    let y = 0;

    this.tooltip.style("transform", `translate(${x}px,${y}px)`);
  }

  redraw() {
    this.wrangle();
  }
}
