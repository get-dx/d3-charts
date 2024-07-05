import * as d3 from "d3";

export class PieChart {
  constructor({
    elChart,
    tooltipHtml,
    values = [],
    minAngleForValueLabel = 15,
    minAngleForLabel = 5,
    labelRadiusRatio = 0.95,
    pieRadiusRatio = 0.9,
    valueRadiusRatio = 0.7,
  }) {
    this.elChart = elChart;
    this.tooltipHtml = tooltipHtml;
    this.values = values;
    this.minAngleForValueLabel = minAngleForValueLabel;
    this.minAngleForLabel = minAngleForLabel;
    this.labelRadiusRatio = labelRadiusRatio;
    this.pieRadiusRatio = pieRadiusRatio;
    this.valueRadiusRatio = valueRadiusRatio;
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
      right: 8,
      bottom: 8,
      left: 8,
    };

    this.color = d3.scaleOrdinal();

    this.pie = d3.pie();

    this.arc = d3.arc().innerRadius(0);
    this.arcValue = d3.arc();
    this.arcLabel = d3.arc();
    this.arcLinkStart = d3.arc();

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
      value: (d) => +d.value || 0,
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
        this.accessor.color(d) ? this.accessor.color(d) : generatedColors.pop(),
      );
    });
    this.color.domain(this.sortedValues.map(this.accessor.label)).range(colors);

    this.arcs = this.pie(this.sortedValues);
    this.arcs.forEach((d) => (d.midAngle = (d.startAngle + d.endAngle) / 2));

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

    this.arc.outerRadius(this.radius * this.pieRadiusRatio);
    this.arcLabel
      .innerRadius(this.radius * this.labelRadiusRatio)
      .outerRadius(this.radius * this.labelRadiusRatio);
    this.arcValue
      .innerRadius(this.radius * this.valueRadiusRatio)
      .outerRadius(this.radius * this.valueRadiusRatio);
    this.arcLinkStart
      .innerRadius(this.radius * this.pieRadiusRatio)
      .outerRadius(this.radius * this.pieRadiusRatio);

    this.boundedWidth = this.width - this.margin.left - this.margin.right;
    this.boundedHeight = this.height - this.margin.top - this.margin.bottom;

    this.svg.attr("viewBox", [
      -this.margin.left - this.boundedWidth / 2,
      -this.margin.top - this.boundedHeight / 2,
      this.width,
      this.height,
    ]);

    if (this.values.length === 0) return;
    this.render();
  }

  render() {
    this.renderArcs();
    this.renderValues();
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
      .attr("fill", (d) => this.color(this.accessor.label(d.data)))
      .attr("d", this.arc);
  }

  renderValues() {
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
      .data(this.arcs, (d) => this.accessor.label(d.data))
      .join((enter) =>
        enter
          .append("text")
          .attr("class", "arc-value-text")
          .attr("dy", "0.32em"),
      )
      .attr("transform", (d) => `translate(${this.arcValue.centroid(d)})`)
      .text((d) =>
        d.endAngle - d.startAngle > (this.minAngleForValueLabel / 180) * Math.PI
          ? this.accessor.value(d.data)
          : "",
      );
  }

  renderLabels() {
    const gArcLabels = this.svg
      .selectAll(".arc-labels")
      .data([0])
      .join((enter) => enter.append("g").attr("class", "arc-labels"))
      .style("display", null);

    const gArcLabel = gArcLabels
      .selectAll(".arc-label")
      .data(this.arcs, (d) => this.accessor.label(d.data))
      .join((enter) =>
        enter
          .append("g")
          .attr("class", "arc-label")
          .call((g) =>
            g
              .append("polyline")
              .attr("class", "arc-label-polyline")
              .attr("fill", "none"),
          )
          .call((g) =>
            g
              .append("text")
              .attr("class", "arc-label-text")
              .attr("dy", "0.32em"),
          ),
      )
      .style("display", (d) =>
        d.endAngle - d.startAngle > (this.minAngleForLabel / 180) * Math.PI
          ? null
          : "none",
      )
      .call((g) =>
        g.select(".arc-label-polyline").attr("points", (d) => {
          const pos = this.arcLabel.centroid(d);
          pos[0] = this.radius * (d.midAngle < Math.PI ? 1 : -1);
          return [
            this.arcLinkStart.centroid(d),
            this.arcLabel.centroid(d),
            pos,
          ];
        }),
      )
      .call((g) =>
        g
          .select(".arc-label-text")
          .attr("transform", (d) => {
            const pos = this.arcLabel.centroid(d);
            pos[0] = this.radius * (d.midAngle < Math.PI ? 1.03 : -1.03);
            return `translate(${pos})`;
          })
          .attr("text-anchor", (d) => (d.midAngle < Math.PI ? "start" : "end"))
          .text((d) => this.accessor.label(d.data)),
      );

    // Hide all labels when the group is beyond the svg container
    const gArcLabelsBBox = gArcLabels.node().getBBox();
    gArcLabels.style(
      "display",
      gArcLabelsBBox.width > this.width || gArcLabelsBBox.height > this.height
        ? "none"
        : null,
    );

    // Hide individual labels when it's overlapping with previous labels
    const collide = (box1, box2) => {
      if (box1.x > box2.x + box2.width || box2.x > box1.x + box1.width)
        return false;
      if (box1.y > box2.y + box2.height || box2.y > box1.y + box1.height)
        return false;
      return true;
    };

    const gArcLabelBBoxes = [];
    gArcLabel.each((d, i, ns) => {
      const n = ns[i];
      const gArcLabelBBox = n.getBBox();
      const overlap =
        gArcLabelBBoxes.length > 0 &&
        collide(gArcLabelBBoxes[gArcLabelBBoxes.length - 1], gArcLabelBBox);
      if (!overlap) gArcLabelBBoxes.push(gArcLabelBBox);
      d3.select(n).style("display", overlap ? "none" : null);
    });
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

    const centroid = this.arcValue.centroid(this.tooltipData);
    centroid[0] += this.margin.left + this.boundedWidth / 2;
    centroid[1] += this.margin.top + this.boundedHeight / 2;

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
}
