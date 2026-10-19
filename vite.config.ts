import { readFileSync } from "node:fs";

import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { load } from "js-yaml";
import { defineConfig, loadEnv, type Plugin } from "vite";

import {
  CONTRACT_VERSION,
  type ExtensionManifest,
} from "@coasti/planner-contract";

const coastiConfig = load(readFileSync("coasti.yml", "utf8")) as {
  id: string;
  name: string;
  version: string;
  description?: string;
  coasti_planner_extension: {
    frontend_build_folder: string;
  };
};

// Manifest needed by the extension loader to allow loading the extension.
const manifest: ExtensionManifest = {
  id: coastiConfig.id,
  name: coastiConfig.name,
  version: coastiConfig.version,
  description: coastiConfig.description,
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

export default defineConfig(({ mode }) => ({
  server: {
    port: 5174,
  },
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
    // Point the refresh runtime at the host when a Vite host serves this
    // extension. Unset for a built host, which injects its own runtime.
    react({ reactRefreshHost: loadEnv(mode, ".").VITE_DEV_HOST_URL }),
  ],
  build: {
    target: "es2022",
    outDir:
      coastiConfig.coasti_planner_extension.frontend_build_folder ?? "dist",
    rolldownOptions: {
      input: "./src/index.tsx",
    },
  },
}));
