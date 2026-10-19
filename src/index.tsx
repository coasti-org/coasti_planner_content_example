import type { ExtensionRuntimeContract } from "@coasti/planner-contract";

import { HomePage } from "./homePage";
import { LandingPageCard } from "./landingPageCard";
import { ScreenA } from "./screenA";

const screens = [{ id: "/screen_a", name: "Screen A", content: <ScreenA /> }];

export function activate(runtime: ExtensionRuntimeContract): void {
  console.log("extension activating...");

  runtime.set_home_screen(<HomePage />, { id: "/home", name: "Home" });

  runtime.set_card(
    <LandingPageCard
      description={runtime.manifest.description}
      name={runtime.manifest.name}
    />,
  );

  for (const { id, name, content } of screens) {
    runtime.add_screen(content, { id, name });
  }

  console.log("extension activated");
}
