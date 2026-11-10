import { Typography } from "antd";

import { ScreenLink } from "@coasti/planner-ui/components";
import { useExtension } from "@coasti/planner-ui/contexts";

import { ProcessDiagram } from "./mermaid/processDiagram";

export function HomePage() {
  const { screens } = useExtension();

  return (
    <section>
      <Typography.Title level={3}>Application overview</Typography.Title>
      <ProcessDiagram />
      <Typography.Title level={3}>Available screens</Typography.Title>
      <ul>
        {[...screens.values()].map((screen) => (
          <li key={screen.id}>
            <ScreenLink screenId={screen.id}>{screen.name}</ScreenLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
