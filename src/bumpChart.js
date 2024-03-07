import * as d3 from "d3";

export class BumpChart {
  constructor({ elChart, data, colorByChange = false }) {
    this.elChart = elChart;
    this.data = data;
    this.colorByChange = colorByChange;
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
      top: 32,
      right: 200,
      bottom: 0,
      left: 48,
    };
    this.rowHeight = 40;
    this.narrowColumnThreshold = 80;
    this.nodeRadius = 4;

    this.parseDate = d3.utcParse("%Y-%m-%d");

    this.formatTickDate = (d) => {
      const parsed = this.parseDate(d);
      return this.isNarrow
        ? d3.utcFormat("%b %-d")(parsed)
        : d3.utcFormat("%b %-d, %Y")(parsed);
    };

    this.x = d3.scalePoint();

    this.y = d3.scalePoint().padding(0.5);

    const colors = [
      ["#FB7185", "#F43F5E"], // Rose
      ["#F472B6", "#EC4899"], // Pink
      ["#E879F9", "#D946EF"], // Fuchsia
      ["#C084FC", "#A855F7"], // Purple
      ["#A78BFA", "#8B5CF6"], // Violet
      ["#818CF8", "#6366F1"], // Indigo
      ["#60A5FA", "#3B82F6"], // Blue
      ["#38BDF8", "#0EA5E9"], // Sky
      ["#22D3EE", "#06B6D4"], // Cyan
      ["#2DD4BF", "#14B8A6"], // Teal
      ["#34D399", "#10B981"], // Emerald
      ["#4ADE80", "#22C55E"], // Green
      ["#A3E635", "#84CC16"], // Lime
      ["#FACC15", "#EAB308"], // Yellow
      ["#FBBF24", "#F59E0B"], // Amber
      ["#FB923C", "#F97316"], // Orange
      ["#F87171", "#EF4444"], // Red
      ["#94A3B8", "#64748B"], // Slate
    ];

    this.colorLine = d3.scaleOrdinal().range(colors.map((d) => d[0]));

    this.colorLabel = d3.scaleOrdinal().range(colors.map((d) => d[1]));

    this.yNames = this.y.copy();

    this.diff = (a, b) => {
      if (!this.colorByChange) return "";
      if (a === null || b === null) return "is-flat";
      if (a === b) return "is-flat";
      if (a > b) return "is-down";
      return "is-up";
    };

    this.line = d3
      .line()
      .x((d) => this.x(d[0]))
      .y((d) => this.y(d[1]))
      .curve(d3.curveBumpX);
  }

  scaffold() {
    this.container = d3.select(this.elChart).classed("bump-chart", true);

    this.svg = this.container.append("svg").attr("class", "chart-svg");

    this.gTop = this.svg.append("g").attr("class", "axis axis--top");
    this.gNamesRight = this.svg
      .append("g")
      .attr("class", "axis axis--right axis--right--names");

    this.gLinks = this.svg.append("g").attr("class", "links");

    this.gNodes = this.svg.append("g").attr("class", "nodes");
  }

  wrangle() {
    this.x.domain(this.data.dates);

    this.height =
      this.rowHeight * this.data.series.length +
      this.margin.top +
      this.margin.bottom;

    this.y
      .domain(d3.range(1, this.data.series.length + 1))
      .range([this.margin.top, this.height - this.margin.bottom]);

    this.yNames.range(this.y.range());

    this.data.series.forEach((d) => {
      d.meanRank = d3.mean(d.ranks);
      d.visualRanks = [];
    });

    this.nodes = [];
    this.links = [];

    for (let i = 0; i < this.data.dates.length; i++) {
      this.data.series
        .sort(
          (a, b) =>
            d3.descending(a.ranks[i] !== null, b.ranks[i] !== null) ||
            d3.ascending(a.ranks[i], b.ranks[i]) ||
            d3.ascending(a.meanRank, b.meanRank),
        )
        .forEach((d, j) => {
          const visualRank = d.ranks[i] === null ? null : j + 1;
          d.visualRanks.push(visualRank);

          if (visualRank !== null) {
            this.nodes.push({
              name: d.name,
              date: this.data.dates[i],
              rank: d.ranks[i],
              visualRank: visualRank,
              diff:
                i === 0
                  ? this.diff(null, visualRank)
                  : this.diff(d.visualRanks[i - 1], visualRank),
            });
          }
        });

      if (i === this.data.dates.length - 1) {
        this.yNames.domain(this.data.series.map((d) => d.name));

        const sortedNames = this.yNames.domain().sort(d3.ascending);
        this.colorLine.domain(sortedNames);
        this.colorLabel.domain(sortedNames);
      }
    }

    this.data.series.reverse();

    this.data.series.forEach((d) => {
      for (let i = 0; i < d.visualRanks.length - 1; i++) {
        const a = d.visualRanks[i];
        const b = d.visualRanks[i + 1];
        if (a !== null && b !== null) {
          this.links.push({
            points: [
              [this.data.dates[i], a],
              [this.data.dates[i + 1], b],
            ],
            diff: this.diff(a, b),
            name: d.name,
          });
        }
      }
    });
  }

  resize() {
    this.width = this.container.node().clientWidth;

    this.x.range([this.margin.left, this.width - this.margin.right]);

    this.isNarrow = this.x.step() < this.narrowColumnThreshold;

    this.delaunay = d3.Delaunay.from(
      this.nodes,
      (d) => this.x(d.date),
      (d) => this.y(d.visualRank),
    );

    this.svg.attr("viewBox", [0, 0, this.width, this.height]);

    this.render();
  }

  render() {
    this.renderXAxisTop();
    this.renderYNamesAxisRight();
    this.renderLinks();
    this.renderNodes();
  }

  renderXAxisTop() {
    this.gTop
      .attr("transform", `translate(0,${this.margin.top})`)
      .call(
        d3
          .axisTop(this.x)
          .tickFormat(this.formatTickDate)
          .tickSize(0)
          .tickPadding(12),
      )
      .call((g) => g.select(".domain").remove());
  }

  renderYNamesAxisRight() {
    this.gNamesRight
      .attr("transform", `translate(${this.width - this.margin.right + 20},0)`)
      .call(d3.axisRight(this.yNames).tickSize(0))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick")
          .on("mouseenter", this.entered)
          .on("mouseleave", this.left)
          .select("text")
          .attr("fill", (d) =>
            this.colorByChange ? "currentColor" : this.colorLabel(d),
          ),
      );
  }

  renderLinks() {
    this.link = this.gLinks
      .selectAll(".link")
      .data(this.links)
      .join((enter) =>
        enter
          .append("g")
          .attr("class", "link")
          .call((g) => g.append("path").attr("class", "link__path link__bg"))
          .call((g) =>
            g
              .append("path")
              .attr("class", (d) => `link__path link__fg ${d.diff}`),
          )
          .on("mouseenter", (event, d) => {
            this.entered(event, d.name);
          })
          .on("mouseleave", this.left),
      )
      .call((g) => g.select(".link__bg").attr("d", (d) => this.line(d.points)))
      .call((g) =>
        g
          .select(".link__fg")
          .attr("d", (d) => this.line(d.points))
          .attr("stroke", (d) => this.colorLine(d.name)),
      );
  }

  renderNodes() {
    this.node = this.gNodes
      .selectAll(".node")
      .data(this.nodes)
      .join((enter) =>
        enter
          .append("g")
          .attr("class", "node")
          .call((g) =>
            g
              .append("circle")
              .attr("class", (d) => `node__circle ${d.diff}`)
              .attr("r", this.nodeRadius),
          )
          .on("mouseenter", (event, d) => {
            this.entered(event, d.name);
          })
          .on("mouseleave", this.left),
      )
      .attr(
        "transform",
        (d) => `translate(${this.x(d.date)},${this.y(d.visualRank)})`,
      )
      .attr("stroke", (d) => this.colorLine(d.name));
  }

  entered(event, name) {
    this.svg.classed("is-highlighting", true);
    this.link.classed("is-muted", (d) => d.name !== name);
    this.node.classed("is-muted", (d) => d.name !== name);
    if (!this.colorByChange)
      this.gNamesRight
        .selectAll(".tick")
        .select("text")
        .attr("fill", (d) =>
          d === name ? this.colorLine(d) : this.colorLabel(d),
        );
  }

  left() {
    this.svg.classed("is-highlighting", false);
    this.link.classed("is-muted", false);
    this.node.classed("is-muted", false);
    if (!this.colorByChange)
      this.gNamesRight
        .selectAll(".tick")
        .select("text")
        .attr("fill", (d) => this.colorLabel(d));
  }
}
