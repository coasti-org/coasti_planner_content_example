import { ConfigProvider } from "antd";
import type { PropsWithChildren } from "react";

import type {
  ExtensionContext,
  ExtensionScreen,
} from "@coasti/planner-contract";

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

export function activate(context: ExtensionContext): void {
  console.log("extension activating...");

  const screens: ExtensionScreen[] = [
    // PS: we should create a class for this, that can be extended?
    // we already have the interface, next, lets make CP Devs use those.
    // but did not find a pattern i liked yet
    {
      id: "/screen_a",
      name: "Screen A",
      url: context.screen_url("/screen_a"),
      content: <ScreenA />,
    },
  ];
  const homeScreen: ExtensionScreen = {
    id: context.manifest.home_screen_id,
    name: "Home",
    url: context.screen_url(context.manifest.home_screen_id),
    content: (
      <ExtensionTheme>
        <HomePage screens={screens} />
      </ExtensionTheme>
    ),
  };

  context.set_card(
    <ExtensionTheme>
      <LandingPageCard
        description={context.manifest.description}
        homeScreenUrl={homeScreen.url}
        name={context.manifest.name}
      />
    </ExtensionTheme>,
  );
  context.add_screen(homeScreen);
  screens.forEach((screen) => {
    context.add_screen({
      ...screen,
      content: <ExtensionTheme>{screen.content}</ExtensionTheme>,
    });
  });

  console.log("extension activated");
}
