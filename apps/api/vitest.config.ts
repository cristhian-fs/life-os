import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

const plugins = [
  tsconfigPaths(),
  swc.vite({
    module: { type: "es6" },
  }),
];

export default defineConfig({
  test: {
    projects: [
      {
        plugins,
        test: {
          name: "unit",
          globals: true,
          root: "./",
          exclude: ["**/*.e2e.ts", "**/node_modules/**", "**/.git/**"],
        },
      },
      {
        plugins,
        test: {
          name: "e2e",
          include: ["src/**/*.e2e.ts"],
          exclude: ["src/db/data-source.e2e.ts"],
          globals: true,
          root: "./",
          fileParallelism: false,
        },
      },
    ],
  },
});
