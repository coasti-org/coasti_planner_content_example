import { ConfigProvider } from "antd";
import type { PropsWithChildren } from "react";

import type { ExtensionRuntimeContract } from "@coasti/planner-contract";

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

function ThemedScreenA() {
  return (
    <ExtensionTheme>
      <ScreenA />
    </ExtensionTheme>
  );
}

export function activate(context: ExtensionRuntimeContract): void {
  context.add_screen(ThemedScreenA, { id: "A", name: "Screen A" });
}
