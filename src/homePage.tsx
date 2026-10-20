import { Link } from "@tanstack/react-router";
import { Typography } from "antd";

import { useExtension } from "@coasti/planner-ui/contexts";

export function HomePage() {
  const { manifest, screens } = useExtension();

  return (
    <section>
      <Typography.Title level={3}>Available screens</Typography.Title>
      <ul>
        {[...screens.values()].map((screen) => (
          <li key={screen.id}>
            <Link
              params={{ extensionId: manifest.id, screen: screen.id }}
              to="/extension/$extensionId/$screen"
            >
              {screen.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
