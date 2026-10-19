import { Typography } from "antd";

import { useExtension } from "@coasti/planner-ui/components";

export function HomePage() {
  const { screens } = useExtension();

  return (
    <section>
      <Typography.Title level={3}>Available screens</Typography.Title>
      <ul>
        {[...screens.values()].map((screen) => (
          <li key={screen.id}>
            <Typography.Link href={screen.url}>{screen.name}</Typography.Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
