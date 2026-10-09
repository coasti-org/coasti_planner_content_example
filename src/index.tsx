import { ConfigProvider } from "antd";
import type { PropsWithChildren } from "react";

import type { ExtensionContext } from "@coasti/planner-contract";

import { ScreenA } from "./screenA";

// TODO: This screen-level theme is temporary. Define global theming for shared
// cross-extension UI, especially the navbar, likely through backend YAML config.
function ExtensionTheme({ children }: PropsWithChildren) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0f766e",
          borderRadius: 8,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

export function activate(context: ExtensionContext): void {
  console.log("extension activating...");

  const screens = new Map([["A", <ScreenA />]]);
  screens.forEach((screen, path) => {
    context.add_screen(<ExtensionTheme>{screen}</ExtensionTheme>, path);
  });

  console.log("extension activated");
}
