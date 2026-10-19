import { Typography } from "antd";

import type { ExtensionScreen } from "@coasti/planner-contract";

export interface HomePageProps {
  screens: Pick<ExtensionScreen, "id" | "name">[];
}

export function HomePage({ screens }: HomePageProps) {
  return (
    <section>
      <Typography.Title level={3}>Available screens</Typography.Title>
      <ul>
        {screens.map((screen) => (
          <li key={screen.id}>{screen.name}</li>
        ))}
      </ul>
    </section>
  );
}
