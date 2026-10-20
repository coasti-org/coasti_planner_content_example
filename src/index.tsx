import type { ExtensionRuntimeContract } from "@coasti/planner-contract";

import { HomePage } from "./homePage";
import { LandingPageCard } from "./landingPageCard";
import { ScreenA } from "./screenA";

export function activate(context: ExtensionRuntimeContract): void {
  context.set_home_screen(HomePage, { id: "home", name: "Home" });
  context.set_card(LandingPageCard);
  context.add_screen(ScreenA, { id: "A", name: "Screen A" });
}
