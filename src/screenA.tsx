import { Button } from "antd";

import {
  DataFilter,
  DataProvider,
  DataTable,
} from "@coasti/planner-ui/components";

export function ScreenA() {
  return (
    <DataProvider>
      <h3>Themed extension screen</h3>
      <p>This screen uses Ant Design with the extension theme.</p>
      <Button type="primary">Themed action</Button>
      <p>Filter Example</p>
      <DataFilter sourceSqlId="dummy_filter" />
      <p>SQLite Table</p>
      <DataTable sourceSqlId="dummy_table" filterId="dummy_filter" />
    </DataProvider>
  );
}
