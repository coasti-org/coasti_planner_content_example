import { Typography } from "antd";

/** First step of the example process: capture the application. */
export function ApplicationScreen() {
  return (
    <section>
      <Typography.Title level={3}>Submit application</Typography.Title>
      <Typography.Paragraph>
        Capture the applicant details and hand the application to the reviewer.
      </Typography.Paragraph>
    </section>
  );
}
