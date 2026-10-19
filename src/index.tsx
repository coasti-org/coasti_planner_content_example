import { ConfigProvider } from "antd";
import type { PropsWithChildren } from "react";

import type { ExtensionRuntimeContract } from "@coasti/planner-contract";

import { HomePage } from "./homePage";
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

const screens = [{ id: "/screen_a", name: "Screen A", content: <ScreenA /> }];

export function activate(runtime: ExtensionRuntimeContract): void {
  console.log("extension activating...");

  runtime.set_home_screen(
    <ExtensionTheme>
      <HomePage screens={screens.map(({ id, name }) => ({ id, name }))} />
    </ExtensionTheme>,
    { id: "/home", name: "Home" },
  );

  runtime.set_card(
    <ExtensionTheme>
      <LandingPageCard
        description={runtime.manifest.description}
        name={runtime.manifest.name}
      />
    </ExtensionTheme>,
  );

  for (const { id, name, content } of screens) {
    runtime.add_screen(<ExtensionTheme>{content}</ExtensionTheme>, {
      id,
      name,
    });
  }

  console.log("extension activated");
}
