import type { ExtensionRuntimeContract } from "@coasti/planner-contract";

import { AgreementScreen } from "./agreementScreen";
import { ApplicationScreen } from "./applicationScreen";
import { HomePage } from "./homePage";
import { LandingPageCard } from "./landingPageCard";
import { OutletScreen } from "./outletScreen";
import { ScreenA } from "./screenA";

export function activate(context: ExtensionRuntimeContract): void {
  context.set_home_screen(HomePage, { id: "home", name: "Home" });
  context.set_card(LandingPageCard);
  context.add_screen(ApplicationScreen, {
    id: "application",
    name: "Application",
  });
  context.add_screen(ScreenA, { id: "A", name: "Screen A" });
  context.add_screen(AgreementScreen, {
    id: "agreement",
    name: "Agreement",
  });
  context.add_screen(OutletScreen, { id: "outlets", name: "Outlets" });
}
