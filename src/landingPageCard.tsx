import { Card, Flex, Typography } from "antd";

const iconUrl = new URL("./assets/landing-page-icon.svg", import.meta.url).href;

export interface LandingPageCardProps {
  name: string;
  description: string | undefined;
}

export function LandingPageCard({ name, description }: LandingPageCardProps) {
  return (
    <Card size="small" style={{ height: "100%" }}>
      <Flex align="center" gap="middle">
        <img alt="" aria-hidden="true" height={56} src={iconUrl} width={56} />
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {name}
          </Typography.Title>
          {description !== undefined && (
            <Typography.Paragraph
              type="secondary"
              style={{ margin: "4px 0 0" }}
            >
              {description}
            </Typography.Paragraph>
          )}
        </div>
      </Flex>
    </Card>
  );
}
