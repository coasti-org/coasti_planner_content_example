import { Button } from "antd";

import { DataFilter, DataTable } from "@coasti/planner-ui/components";

export function ScreenA() {
  return (
    <>
      <h3>Extension screen</h3>
      <p>This screen uses Ant Design with the host theme.</p>
      <Button type="primary">Themed action</Button>
      <p>Filter Example</p>
      <DataFilter sourceSqlId="dummy_filter" />
      <p>SQLite Table</p>
      <DataTable filterIds={["dummy_filter"]} sourceSqlId="dummy_table" />
    </>
  );
}
