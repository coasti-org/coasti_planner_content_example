import { Space, Tag, Typography } from "antd";

import { useOutletValue, useOutletValues } from "@coasti/planner-ui/contexts";

/** Shows the two example outlets: a single boolean and a list of strings. */
export function OutletScreen() {
  const hasDraft = useOutletValue<boolean>("has_draft_rows");
  const amts = useOutletValues<string>("amt_options");

  return (
    <section>
      <Typography.Title level={3}>Outlets</Typography.Title>
      <Typography.Paragraph type="secondary">
        Read-only values loaded from the extension database.
      </Typography.Paragraph>

      <Typography.Title level={4}>Draft rows?</Typography.Title>
      {hasDraft.isPending ? (
        <Typography.Text type="secondary">Loading…</Typography.Text>
      ) : hasDraft.error !== null ? (
        <Typography.Text type="danger">
          Could not load the value.
        </Typography.Text>
      ) : (
        <Typography.Text>{hasDraft.data ? "Yes" : "No"}</Typography.Text>
      )}

      <Typography.Title level={4}>Amts</Typography.Title>
      {amts.isPending ? (
        <Typography.Text type="secondary">Loading…</Typography.Text>
      ) : amts.error !== null ? (
        <Typography.Text type="danger">
          Could not load the values.
        </Typography.Text>
      ) : (
        <Space size={[0, 8]} wrap>
          {amts.data?.map((amt) => (
            <Tag key={amt}>{amt}</Tag>
          ))}
        </Space>
      )}
    </section>
  );
}
