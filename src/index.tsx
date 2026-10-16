import { ConfigProvider } from "antd";
import type { PropsWithChildren } from "react";

import type { ExtensionContext } from "@coasti/planner-contract";

import { LandingPageCard } from "./landingPageCard";
import { ScreenA } from "./screenA";

// TODO: This extension theme is temporary. Define global theming for shared
// cross-extension UI, especially the navbar, likely through backend YAML config.
function ExtensionTheme({ children }: PropsWithChildren) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0f766e",
          colorBgContainer: "#f0fdfa",
          colorBorderSecondary: "#99f6e4",
          colorTextHeading: "#134e4a",
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
  context.set_card(
    <ExtensionTheme>
      <LandingPageCard
        description={context.manifest.description}
        name={context.manifest.name}
      />
    </ExtensionTheme>,
  );

  const screens = new Map([["A", <ScreenA />]]);
  screens.forEach((screen, path) => {
    context.add_screen(<ExtensionTheme>{screen}</ExtensionTheme>, path);
  });

  console.log("extension activated");
}
