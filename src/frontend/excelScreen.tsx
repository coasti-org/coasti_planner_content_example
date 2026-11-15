import { Space, Typography } from "antd";

import {
  DataTable,
  ExcelExportButton,
  ExcelImportButton,
} from "@coasti/planner-ui/components";

const IMPORT_ID = "dummy_table_excel";

/**
 * Round trip of the dummy table through Excel: export, edit, import. The
 * buttons hide themselves for users without the matching permission.
 */
export function ExcelScreen() {
  return (
    <section>
      <Typography.Title level={3}>Excel import and export</Typography.Title>
      <Typography.Paragraph type="secondary">
        Download the bookings, change them in Excel, and upload the file again.
        The import shows the problems in the file or the rows it would change,
        and writes nothing before you confirm. Rows with status{" "}
        <Typography.Text code>done</Typography.Text> cannot be changed.
      </Typography.Paragraph>
      <Typography.Paragraph type="secondary">
        Editors (<Typography.Text code>bearbeiter</Typography.Text>,{" "}
        <Typography.Text code>controller</Typography.Text>) may import and
        download the empty template; only controllers may export the data.
      </Typography.Paragraph>

      <Space wrap style={{ marginBottom: 16 }}>
        <ExcelExportButton importId={IMPORT_ID} variant="data" />
        <ExcelExportButton importId={IMPORT_ID} variant="template" />
        <ExcelImportButton importId={IMPORT_ID} />
      </Space>

      <DataTable sourceSqlId="dummy_table" />
    </section>
  );
}
