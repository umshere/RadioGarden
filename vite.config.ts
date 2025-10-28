import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import { vercelPreset } from "@vercel/remix/vite";
import path from "path";

installGlobals();

export default defineConfig({
  plugins: [
    remix({
      presets: [vercelPreset()],
      // Future flags for React Router v7 compatibility
      future: {
        v3_fetcherPersist: true,
        v3_lazyRouteDiscovery: true,
        v3_relativeSplatPath: true,
        v3_singleFetch: true,
        v3_throwAbortReason: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "app"),
      "three/webgpu": "three",
      "three/tsl": "three",
      zustand: path.resolve(__dirname, "app/vendor/zustand/index.ts"),
      "zustand/middleware": path.resolve(__dirname, "app/vendor/zustand/middleware.ts"),
    },
  },
  ssr: {
    noExternal: ["@mantine/core", "@mantine/hooks"],
  },
  build: {
    target: "esnext",
  },
});
