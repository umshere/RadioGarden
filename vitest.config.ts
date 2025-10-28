import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: [{ find: "~", replacement: path.resolve(__dirname, "app") }],
  },
});
