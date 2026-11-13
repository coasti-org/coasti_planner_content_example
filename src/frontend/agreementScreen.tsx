import { Typography } from "antd";

/** Last step of the example process: sign the agreement. */
export function AgreementScreen() {
  return (
    <section>
      <Typography.Title level={3}>Sign agreement</Typography.Title>
      <Typography.Paragraph>
        The applicant has an account and can sign the agreement to finish the
        process.
      </Typography.Paragraph>
    </section>
  );
}
