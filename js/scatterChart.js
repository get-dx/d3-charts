window.ScatterChart = class ScatterChart {
  constructor({
    elChart,
    showXAxisTicks = true,
    xAxisTickLabelFormat = (d) => d.toLocaleString(),
    showXAxisLabel = true,
    showXAxisLine = true,
    showXAxisTickLabels = true,
    xAxisTickLabelSpread = 100,
    showYAxisTicks = true,
    yAxisTickLabelFormat = (d) => d.toLocaleString(),
    showYAxisLabel = true,
    showYAxisLine = true,
    showYAxisTickLabels = true,
    yAxisTickLabelSpread = 50,
    showTrendline = false,
    matrix,
    highlightedQuadrant,
    axis = {
      x: {
        label: "",
      },
      y: {
        label: "",
      },
    },
    dotRadius = 2.5,
    labelTextFormat,
    onClick,
    tooltipHtml,
    values = [],
  }) {
    this.elChart = elChart;
    this.showXAxisTicks = showXAxisTicks;
    this.xAxisTickLabelFormat = xAxisTickLabelFormat;
    this.showXAxisLabel = showXAxisLabel;
    this.showXAxisLine = showXAxisLine;
    this.showXAxisTickLabels = showXAxisTickLabels;
    this.showYAxisTicks = showYAxisTicks;
    this.xAxisTickLabelSpread = xAxisTickLabelSpread;
    this.yAxisTickLabelFormat = yAxisTickLabelFormat;
    this.showYAxisLabel = showYAxisLabel;
    this.showYAxisLine = showYAxisLine;
    this.showYAxisTickLabels = showYAxisTickLabels;
    this.yAxisTickLabelSpread = yAxisTickLabelSpread;
    this.showTrendline = showTrendline;
    this.matrix = matrix;
    this.highlightedQuadrant = highlightedQuadrant;
    this.axis = axis;
    this.dotRadius = dotRadius;
    this.labelTextFormat = labelTextFormat;
    this.onClick = onClick;
    this.tooltipHtml = tooltipHtml;
    this.values = values;
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

    this.margin = {
      top: 8,
      right: 16,
    };

    this.indexData = null;

    this.x = d3.scaleLinear();

    this.y = d3.scaleLinear();
  }

  scaffold() {
    this.container = d3
      .select(this.elChart)
      .classed("chart scatter-chart", true);

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
      x: (d) => d.x,
      y: (d) => d.y,
    };

    const padding = 0.05;
    const [minX, maxX] = d3.extent(this.values, this.accessor.x);
    const gapX = maxX - minX;
    this.x.domain([
      this.axis.x.min === undefined ? minX - gapX * padding : this.axis.x.min,
      this.axis.x.max === undefined ? maxX + gapX * padding : this.axis.x.max,
    ]);
    if (this.axis.x.min === undefined && this.axis.x.max === undefined)
      this.x.nice();
    const [minY, maxY] = d3.extent(this.values, this.accessor.y);
    const gapY = maxY - minY;
    this.y.domain([
      this.axis.y.min === undefined ? minY - gapY * padding : this.axis.y.min,
      this.axis.y.max === undefined ? maxY + gapY * padding : this.axis.y.max,
    ]);
    if (this.axis.y.min === undefined && this.axis.y.max === undefined)
      this.y.nice();

    this.lr = null;
    if (this.showTrendline) {
      const nonNullIndexes = this.values.reduce((idx, d, i) => {
        if (this.accessor.y(d) !== null) idx.push(i);
        return idx;
      }, []);
      if (nonNullIndexes.length >= 2) {
        const x = nonNullIndexes.map((i) => this.accessor.x(this.values[i]));
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

    this.svg.attr("viewBox", [0, 0, this.width, this.height]);

    if (this.values.length === 0) return;

    this.render();
  }

  render() {
    this.adjustMargin();
    this.renderDelaunay();
    this.renderClip();
    this.renderXAxis();
    this.renderYAxis();
    this.renderMatrix();
    this.renderDots();
    this.renderLabels();
    this.renderTrendLine();
  }

  adjustMargin() {
    this.margin.bottom = 4;
    if (this.showXAxisTickLabels) {
      this.margin.bottom += 20;
    }
    if (this.showXAxisLabel) {
      this.margin.bottom += 20;
    }
    this.margin.left = 4;
    if (this.showYAxisTickLabels) {
      this.margin.left += 48;
    }
    if (this.showYAxisLabel) {
      this.margin.left += 20;
    }

    this.x.range([this.margin.left, this.width - this.margin.right]);

    this.y.range([this.height - this.margin.bottom, this.margin.top]);
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

  renderXAxis() {
    this.svg
      .selectAll(".axis--x")
      .data([0])
      .join((enter) => enter.append("g").attr("class", "axis axis--x"))
      .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
      .call(
        d3
          .axisBottom(this.x)
          .ticks(
            (this.width - this.margin.left - this.margin.right) /
              this.xAxisTickLabelSpread
          )
          .tickSizeOuter(0)
          .tickSizeInner(this.showXAxisTickLabels ? 6 : 0)
          .tickFormat((d) =>
            this.showXAxisTickLabels ? this.xAxisTickLabelFormat(d) : ""
          )
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
          .data(this.showXAxisLabel ? [this.axis.x.label] : [])
          .join((enter) =>
            enter
              .append("text")
              .attr("class", "axis-title-text")
              .attr("fill", "currentColor")
              .attr("text-anchor", "middle")
          )
          .attr("x", (this.margin.left + this.width - this.margin.right) / 2)
          .attr("y", this.margin.bottom - 4)
          .text((d) => d)
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
              this.yAxisTickLabelSpread
          )
          .tickSizeOuter(0)
          .tickSizeInner(this.showYAxisTickLabels ? 6 : 0)
          .tickFormat((d) =>
            this.showYAxisTickLabels ? this.yAxisTickLabelFormat(d) : ""
          )
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
          .data(this.showYAxisLabel ? [this.axis.y.label] : [])
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

  renderMatrix() {
    this.matrixG = this.svg
      .selectAll(".matrix-g")
      .data([0])
      .join((enter) => enter.append("g").attr("class", "matrix-g"));

    const quadrantRects =
      this.matrix && this.highlightedQuadrant
        ? {
            1: {
              x: this.x(this.matrix[0]),
              y: this.y.range()[1],
              width: this.x.range()[1] - this.x(this.matrix[0]),
              height: this.y(this.matrix[1]) - this.y.range()[1],
            },
            2: {
              x: this.x.range()[0],
              y: this.y.range()[1],
              width: this.x(this.matrix[0]) - this.x.range()[0],
              height: this.y(this.matrix[1]) - this.y.range()[1],
            },
            3: {
              x: this.x.range()[0],
              y: this.y(this.matrix[1]),
              width: this.x(this.matrix[0]) - this.x.range()[0],
              height: this.y.range()[0] - this.y(this.matrix[1]),
            },
            4: {
              x: this.x(this.matrix[0]),
              y: this.y(this.matrix[1]),
              width: this.x.range()[1] - this.x(this.matrix[0]),
              height: this.y.range()[0] - this.y(this.matrix[1]),
            },
          }
        : {};

    this.matrixG
      .selectAll(".matrix-rect")
      .data(
        this.matrix && this.highlightedQuadrant
          ? [quadrantRects[this.highlightedQuadrant]]
          : []
      )
      .join((enter) => enter.append("rect").attr("class", "matrix-rect"))
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("width", (d) => d.width)
      .attr("height", (d) => d.height);

    this.matrixG
      .selectAll(".matrix-line--x")
      .data(this.matrix ? [this.matrix[0]] : [])
      .join((enter) =>
        enter.append("line").attr("class", "matrix-line matrix-line--x")
      )
      .attr("y1", this.margin.top)
      .attr("y2", this.height - this.margin.bottom)
      .attr("transform", (d) => `translate(${this.x(d)},0)`);

    this.matrixG
      .selectAll(".matrix-line--y")
      .data(this.matrix ? [this.matrix[1]] : [])
      .join((enter) =>
        enter.append("line").attr("class", "matrix-line matrix-line--y")
      )
      .attr("x1", this.margin.left)
      .attr("x2", this.width - this.margin.right)
      .attr("transform", (d) => `translate(0,${this.y(d)})`);
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

  renderLabels() {
    let anchors = [];
    let labels = [];
    const maxLabelWidth = 120;

    if (this.labelTextFormat) {
      anchors = this.values.map((d) => ({
        x: this.x(this.accessor.x(d)) - this.margin.left,
        y: this.y(this.accessor.y(d)) - this.margin.top,
        r: this.dotRadius,
      }));

      labels = anchors.map((d, i) => ({
        x: d.x,
        y: d.y,
        name: this.labelTextFormat(this.values[i]),
      }));
    }

    this.labelText = this.svg
      .selectAll(".dot-label-texts")
      .data([0])
      .join((enter) => enter.append("g").attr("class", "dot-label-texts"))
      .selectAll(".dot-label-text")
      .data(labels)
      .join((enter) => enter.append("text").attr("class", "dot-label-text"))
      .text((d) => d.name)
      .each(function (d) {
        const { width, height } = this.getBBox();
        d.width = Math.ceil(width);
        d.height = Math.ceil(height);
      });

    if (this.labelTextFormat) {
      d3.labeler()
        .label(labels)
        .anchor(anchors)
        .width(
          this.width - this.margin.left - this.margin.right - maxLabelWidth
        )
        .height(this.height - this.margin.top - this.margin.bottom)
        .start(1000);

      labels.forEach((d) => {
        d.x += this.margin.left;
        d.y += this.margin.top;
      });
    }

    this.labelText.attr("x", (d) => d.x).attr("y", (d) => d.y);
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
          this.y(this.lr.slope * this.x.domain()[1] + this.lr.intercept)
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
    const d = this.values[this.indexData];
    this.onClick(d);
  }

  updateTooltip() {
    if (this.indexData === null) {
      this.tooltip.classed("is-visible", false);
    } else {
      const d = this.values[this.indexData];
      this.tooltip
        .html(this.tooltipHtml(d, this.axis))
        .classed("is-visible", true);
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
