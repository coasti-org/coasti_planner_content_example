import { execFileSync } from "node:child_process";

import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

import {
  CONTRACT_VERSION,
  type ExtensionManifest,
} from "@coasti/planner-contract";

function coastiValue(path: string): string | undefined {
  const value = execFileSync("yq", ["-r", path, "coasti.yml"], {
    encoding: "utf8",
  }).trim();
  if (value === "" || value === "null") {
    console.warn(`Missing coasti.yml field: ${path}`);
    return undefined;
  }
  return value;
}

// Manifest needed by the extension loader to allow loading the extension.
const manifest: ExtensionManifest = {
  id: coastiValue(".id") ?? "",
  name: coastiValue(".name") ?? "",
  version: coastiValue(".version") ?? "",
  description: coastiValue(".description"),
  contractVersion: CONTRACT_VERSION,
  entry: "remoteEntry.js",
};

function manifestPlugin(): Plugin {
  return {
    name: "coasti:extension-manifest-maker",
    // dev setup serves manifest.json via vite server middleware
    configureServer(server) {
      server.middlewares.use("/manifest.json", (request, response) => {
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify(manifest, null, 2));
      });
    },
    // prod setup places manifest.json in folder next to entry
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "manifest.json",
        source: JSON.stringify(manifest, null, 2),
      });
    },
  };
}

export default defineConfig({
  server: {
    port: 5174,
  },
  base: "/",
  plugins: [
    manifestPlugin(),
    federation({
      name: manifest.id,
      filename: "remoteEntry.js",
      exposes: {
        "./index": "./src/index.tsx",
      },
      shared: {
        react: {
          singleton: true,
          import: false,
        },
        "react/jsx-runtime": {
          singleton: true,
          import: false,
        },
        "react-dom": {
          singleton: true,
          import: false,
        },
        "react-dom/client": {
          singleton: true,
          import: false,
        },
        "@coasti/planner-ui/components": {
          singleton: true,
          import: false,
        },
      },
      dts: false,
      // Use the host's runtime-core instead of bundling a second copy.
      experiments: { externalRuntime: true },
    }),
    react({ reactRefreshHost: "http://localhost:5173" }),
  ],
  build: {
    target: "es2022",
    rolldownOptions: {
      input: "./src/index.tsx",
    },
  },
});
