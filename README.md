# @get-dx/d3-charts package

This repository contains our [D3.js](https://d3js.org) chart classes:

- [BarChart](./docs/bar-chart.md)
- [BumpChart](./docs/bump-chart.md)
- [LineChart](./docs/line-chart.md)
- [PieChart](./docs/pie-chart.md)
- [ScatterChart](./docs/scatter-chart.md)
- [ScatterTimeChart](./docs/scatter-time-chart.md)
- [StackedBarChart](./docs/stacked-bar-chart.md)
- [StackedAreaChart](./docs/stacked-area-chart.md)
- [MultiLineChart](./docs/multi-line-chart.md)

## Install

```bash
npm install @get-dx/d3-charts # npm
yarn add @get-dx/d3-charts    # yarn
bun add @get-dx/d3-charts     # bun
pnpm add @get-dx/d3-charts    # pnpm
```

## Development

To get started —

1. Enable corepack -

```bash
corepack enable
```

1. Setup yarn -

```bash
yarn
```

1. View chart examples -

```bash
bin/start
```

To test this package locally in another app, use [yalc](https://github.com/wclr/yalc).

Before these steps, install `yalc` -

```bash
yarn global add yalc
```

### YALC Steps —

1. Setup yarn -

```bash
yarn
```

1. Build this package and publish —

```bash
yarn build && yalc publish
```

2. In the app where you want to test this package, add the package with yalc —

```bash
yalc add @get-dx/d3-charts
```

When you make changes to this package, run `yarn build && yalc publish` again, then in your app run `yalc update @get-dx/d3-charts`.

## Publishing

To release a new version —

1. Ensure you've incremented the `version` in `package.json` according to [semantic versioning standards](https://semver.org/)
1. Create a [new release](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release) in Github to publish the new version.
   - Ensure your release has a new tag and name matching the `version` in `package.json`. i.e. `v1.0.0`.
   - Creating a release will kickoff a github action to publish to NPM.
1. View the new version in NPM - https://www.npmjs.com/package/@get-dx/d3-charts
