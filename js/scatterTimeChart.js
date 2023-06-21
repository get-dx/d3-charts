window.ScatterTimeChart = class ScatterTimeChart {
  constructor({
    elChart,
    values = [],
    showXAxisLine = true,
    startDate,
    endDate,
    yAxisMin,
    yAxisMax,
    showTrendline = false,
    benchmarkValue,
    tooltipHtml,
    onClick,
  }) {
    this.elChart = elChart;
    this.values = values;
    this.showXAxisLine = showXAxisLine;
    this.startDate = startDate;
    this.endDate = endDate;
    this.yAxisMin = yAxisMin;
    this.yAxisMax = yAxisMax;
    this.showTrendline = showTrendline;
    this.benchmarkValue = benchmarkValue;
    this.tooltipHtml = tooltipHtml;
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

    this.indexData = null;

    this.x = d3.scaleUtc();

    this.y = d3.scaleLinear();
  }

  scaffold() {
    this.container = d3
      .select(this.elChart)
      .classed("chart scatter-time-chart", true);

    this.svg = this.container
      .append("svg")
      .attr("class", "chart-scg")
      .on("mouseover", this.entered)
      .on("mousemove", this.moved)
      .on("mouseout", this.left)
      .on("click", this.clicked);
    this.defs = this.svg.append("defs");
    this.tooltip = this.container.append("div").attr("class", "chart-tooltip");
  }

  wrangle() {
    if (this.values.length === 0) return;

    this.accessor = {
      x: (d) => this.parseDate(d.date),
      y: (d) => d.value,
      tooltipData: (d) => d.tooltip_data,
    };

    this.hasBenchmarkLine = this.benchmarkValue !== undefined;

    const values = this.values.map(this.accessor.y);
    if (this.hasBenchmarkLine) {
      values.push(this.benchmarkValue);
    }
    const [minValue, maxValue] = d3.extent(values);
    const padding = 0.05;
    const gap = maxValue - minValue;
    const minY = minValue - gap * padding;
    const maxY = maxValue + gap * padding;
    this.y.domain([
      this.yAxisMin === undefined ? minY : this.yAxisMin,
      this.yAxisMax === undefined ? maxY : this.yAxisMax,
    ]);

    this.x.domain([
      this.startDate
        ? this.parseDate(this.startDate)
        : d3.min(this.values, this.accessor.x),
      this.endDate
        ? this.parseDate(this.endDate)
        : d3.max(this.values, this.accessor.x),
    ]);

    this.lr = null;
    if (this.showTrendline) {
      const nonNullIndexes = this.values.reduce((idx, d, i) => {
        if (this.accessor.y(d) !== null) idx.push(i);
        return idx;
      }, []);
      if (nonNullIndexes.length >= 2) {
        const x = nonNullIndexes.map((i) =>
          d3.utcDay.count(this.x.domain()[0], this.accessor.x(this.values[i]))
        );
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
    this.renderDelaunay();
    this.renderClip();
    this.renderZeroLine();
    this.renderDots();
    this.renderBenchmarkLine();
    this.renderTrendLine();
  }

  renderDelaunay() {
    this.delaunay = d3.Delaunay.from(
      this.values,
      (d) => this.x(this.accessor.x(d)),
      (d) => this.y(this.accessor.y(d))
    );
  }

  renderClip() {
    this.defs
      .selectAll("clipPath")
      .data([0])
      .join((enter) =>
        enter
          .append("clipPath")
          .attr("id", `${this.id}-clip`)
          .call((clipPath) =>
            clipPath
              .append("rect")
              .attr("x", this.margin.left)
              .attr("y", this.margin.top)
          )
      )
      .select("rect")
      .attr("width", this.width - this.margin.left - this.margin.right)
      .attr("height", this.height - this.margin.top - this.margin.bottom);
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

  renderDots() {
    this.dotCircle = this.svg
      .selectAll(".dot-circles")
      .data([0])
      .join((enter) => enter.append("g").attr("class", "dot-circles"))
      .classed("is-clickable", !!this.onClick)
      .selectAll(".dot-circle")
      .data(this.values)
      .join((enter) =>
        enter
          .append("circle")
          .attr("class", "dot-circle")
          .attr("r", this.dotRadius)
      )
      .attr("cx", (d) => this.x(this.accessor.x(d)))
      .attr("cy", (d) => this.y(this.accessor.y(d)));
  }

  renderBenchmarkLine() {
    this.svg
      .selectAll(".benchmark-line")
      .data(this.hasBenchmarkLine ? [0] : [])
      .join((enter) =>
        enter
          .append("line")
          .attr("class", "benchmark-line")
          .attr("clip-path", `url(#${this.id}-clip)`)
      )
      .attr("x1", this.x(this.parseDate(this.startDate)))
      .attr("y1", this.y(this.benchmarkValue))
      .attr("x2", this.x(this.parseDate(this.endDate)))
      .attr("y2", this.y(this.benchmarkValue));
  }

  renderTrendLine() {
    const tl = this.svg
      .selectAll(".trend-line")
      .data(this.lr ? [0] : [])
      .join((enter) =>
        enter
          .append("line")
          .attr("class", "trend-line")
          .attr("clip-path", `url(#${this.id}-clip)`)
      );
    if (this.lr) {
      tl.attr("x1", this.x(this.x.domain()[0]))
        .attr("y1", this.y(this.lr.intercept))
        .attr("x2", this.x(this.x.domain()[1]))
        .attr(
          "y2",
          this.y(
            this.lr.slope *
              d3.utcDay.count(this.x.domain()[0], this.x.domain()[1]) +
              this.lr.intercept
          )
        );
    }
  }

  entered(event) {
    if (!this.tooltipHtml) return;
    this.moved(event);
  }

  moved(event) {
    if (!this.tooltipHtml) return;
    const indexData = this.delaunay.find(
      ...d3.pointer(event),
      this.indexData || 0
    );
    if (this.indexData !== indexData) {
      this.indexData = indexData;
      this.dotCircle.classed("is-active", (d, i, n) => {
        if (d === this.values[this.indexData]) {
          d3.select(n[i]).raise();
          return true;
        } else {
          return false;
        }
      });
      this.updateTooltip();
      this.positionTooltip();
    }
  }

  left() {
    if (!this.tooltipHtml) return;
    this.indexData = null;
    this.dotCircle.classed("is-active", false).order();
    this.updateTooltip();
  }

  clicked() {
    if (!this.onClick || this.indexData === null) return;
    const d = this.accessor.tooltipData(this.values[this.indexData]);
    this.onClick(d);
  }

  updateTooltip() {
    if (this.indexData === null) {
      this.tooltip.classed("is-visible", false);
    } else {
      const d = this.accessor.tooltipData(this.values[this.indexData]);
      this.tooltip.html(this.tooltipHtml(d)).classed("is-visible", true);
    }
  }

  positionTooltip() {
    const tooltipRect = this.tooltip.node().getBoundingClientRect();

    let x =
      this.x(this.accessor.x(this.values[this.indexData])) -
      tooltipRect.width / 2;
    if (x + tooltipRect.width > this.width) {
      x = this.width - tooltipRect.width;
    } else if (x < 0) {
      x = 0;
    }

    const yOffset = this.dotRadius + 8;
    let y =
      this.y(this.accessor.y(this.values[this.indexData])) -
      yOffset -
      tooltipRect.height;
    if (y < 0) {
      y = this.y(this.accessor.y(this.values[this.indexData])) + yOffset;
    }

    this.tooltip.style("transform", `translate(${x}px,${y}px)`);
  }

  redraw() {
    this.wrangle();
  }
};
