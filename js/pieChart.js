window.PieChart = class PieChart {
  constructor({
    elChart,
    tooltipHtml,
    values = [],
    minAngleForValueLabel = 15,
    labelRadiusRatio = 0.7,
  }) {
    this.elChart = elChart;
    this.tooltipHtml = tooltipHtml;
    this.values = values;
    this.minAngleForValueLabel = minAngleForValueLabel;
    this.labelRadiusRatio = labelRadiusRatio;
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
      top: 3,
      right: 3,
      bottom: 3,
      left: 3,
    };

    this.color = d3.scaleOrdinal();

    this.pie = d3.pie();

    this.arc = d3.arc().innerRadius(0);

    this.arcLabel = d3.arc();

    this.tooltipData = null;
  }

  scaffold() {
    this.container = d3.select(this.elChart).classed("chart pie-chart", true);

    this.svg = this.container
      .append("svg")
      .attr("class", "chart-svg")
      .on("mouseover", this.entered)
      .on("mouseout", this.left);

    this.tooltip = this.container.append("div").attr("class", "chart-tooltip");
  }

  wrangle() {
    if (this.values.length === 0) return;

    this.accessor = {
      value: (d) => d.value,
      label: (d) => d.label,
      color: (d) => d.color,
    };

    this.pie.value(this.accessor.value);

    this.sortedValues = this.values
      .slice()
      .sort((a, b) =>
        d3.descending(this.accessor.value(a), this.accessor.value(b)),
      );

    const nGeneratedColors = this.sortedValues.filter(
      (d) => !this.accessor.color(d),
    ).length;
    const generatedColors = d3.quantize(
      (t) => d3.interpolateSpectral(t * 0.8 + 0.1),
      Math.max(nGeneratedColors, 2),
    );
    let colors = [];
    this.sortedValues.forEach((d) => {
      colors.push(
        !!this.accessor.color(d)
          ? this.accessor.color(d)
          : generatedColors.pop(),
      );
    });
    this.color.domain(this.sortedValues.map(this.accessor.value)).range(colors);

    console.log("tyler", this.sortedValues);
    this.arcs = this.pie(this.sortedValues);

    if (!this.width) return;
    this.render();
  }

  resize() {
    this.width = this.container.node().clientWidth;
    this.height = this.container.node().clientHeight;

    this.radius =
      Math.min(
        this.width - this.margin.left - this.margin.right,
        this.height - this.margin.top - this.margin.bottom,
      ) / 2;

    this.arc.outerRadius(this.radius);

    const labelRadius = this.radius * this.labelRadiusRatio;
    this.arcLabel.innerRadius(labelRadius).outerRadius(labelRadius);

    this.svg.attr("viewBox", [
      -this.margin.left - this.radius,
      -this.margin.top - this.radius,
      this.width,
      this.height,
    ]);

    if (this.values.length === 0) return;
    this.render();
  }

  render() {
    this.renderArcs();
    this.renderLabels();
  }

  renderArcs() {
    this.arcPath = this.svg
      .selectAll(".arc-paths")
      .data([0])
      .join((enter) => enter.append("g").attr("class", "arc-paths"))
      .selectAll(".arc-path")
      .data(this.arcs, (d) => this.accessor.value(d.data))
      .join((enter) => enter.append("path").attr("class", "arc-path"))
      .attr("fill", (d) => this.color(this.accessor.value(d.data)))
      .attr("d", this.arc);
  }

  renderLabels() {
    this.svg
      .selectAll(".arc-value-texts")
      .data([0])
      .join((enter) =>
        enter
          .append("g")
          .attr("class", "arc-value-texts")
          .attr("text-anchor", "middle"),
      )
      .selectAll(".arc-value-text")
      .data(this.arcs, (d) => this.accessor.value(d.data))
      .join((enter) =>
        enter
          .append("text")
          .attr("class", "arc-value-text")
          .attr("dy", "0.32em"),
      )
      .attr("transform", (d) => `translate(${this.arcLabel.centroid(d)})`)
      .text((d) =>
        d.endAngle - d.startAngle > (this.minAngleForValueLabel / 180) * Math.PI
          ? this.accessor.value(d.data)
          : "",
      );
  }

  entered(event) {
    if (!this.tooltipHtml) return;
    const arcPathEl = event.target.closest(".arc-path");
    if (!arcPathEl) return;
    this.arcPath
      .classed("is-active", function () {
        return this === arcPathEl;
      })
      .filter(function () {
        return this === arcPathEl;
      })
      .raise();
    this.tooltipData = d3.select(arcPathEl).datum();
    this.updateTooltip();
    this.positionTooltip();
  }

  left(event) {
    if (!this.tooltipHtml) return;
    const arcPathEl = event.target.closest(".arc-path");
    if (!arcPathEl) return;
    this.arcPath.classed("is-active", false).order();
    this.tooltipData = null;
    this.updateTooltip();
  }

  updateTooltip() {
    if (this.tooltipData) {
      this.tooltip
        .html(this.tooltipHtml(this.tooltipData.data))
        .classed("is-visible", true);
    } else {
      this.tooltip.classed("is-visible", false);
    }
  }

  positionTooltip() {
    const tooltipRect = this.tooltip.node().getBoundingClientRect();

    const centroid = this.arcLabel.centroid(this.tooltipData);
    centroid[0] += this.margin.left + this.radius;
    centroid[1] += this.margin.top + this.radius;

    let x = centroid[0] - tooltipRect.width / 2;
    if (x + tooltipRect.width > this.width) {
      x = this.width - tooltipRect.width;
    } else if (x < 0) {
      x = 0;
    }

    const yOffset = 8;
    let y = centroid[1] - yOffset - tooltipRect.height;
    if (y < 0) {
      y = centroid[1] + yOffset;
    }

    this.tooltip.style("transform", `translate(${x}px,${y}px)`);
  }

  redraw() {
    this.wrangle();
  }
};
