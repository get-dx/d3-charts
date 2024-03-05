import terser from "@rollup/plugin-terser";

export default {
  input: "src/main.js",
  output: {
    dir: "dist",
  },
  plugins: [terser()],
  external: ["d3"],
};
