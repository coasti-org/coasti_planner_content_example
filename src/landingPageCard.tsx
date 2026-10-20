import { Card, Flex, Typography } from "antd";

import { useExtension } from "@coasti/planner-ui/contexts";

const iconUrl = new URL("./assets/landing-page-icon.svg", import.meta.url).href;

export function LandingPageCard() {
  const { manifest } = useExtension();

  return (
    <Card hoverable size="small" style={{ height: "100%" }}>
      <Flex align="center" gap="middle">
        <img alt="" aria-hidden="true" height={56} src={iconUrl} width={56} />
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {manifest.name}
          </Typography.Title>
          {manifest.description !== undefined && (
            <Typography.Paragraph
              type="secondary"
              style={{ margin: "4px 0 0" }}
            >
              {manifest.description}
            </Typography.Paragraph>
          )}
        </div>
      </Flex>
    </Card>
  );
}
