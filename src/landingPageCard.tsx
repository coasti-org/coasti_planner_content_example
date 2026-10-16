import { Card, Flex, Typography } from "antd";

const iconUrl = new URL("./assets/landing-page-icon.svg", import.meta.url).href;

export interface LandingPageCardProps {
  homeScreenUrl: string;
  name: string;
  description: string | undefined;
}

export function LandingPageCard({
  homeScreenUrl,
  name,
  description,
}: LandingPageCardProps) {
  return (
    <Typography.Link
      href={homeScreenUrl}
      style={{ color: "inherit", display: "block", textDecoration: "none" }}
    >
      <Card hoverable size="small" style={{ height: "100%" }}>
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
    </Typography.Link>
  );
}
