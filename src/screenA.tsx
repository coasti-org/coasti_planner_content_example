import {
  ActionButton,
  DataFilter,
  DataTable,
  PersistButton,
  ResetButton,
} from "@coasti/planner-ui/components";

export function ScreenA() {
  return (
    <>
      <h3>Extension screen</h3>
      <p>This screen uses Ant Design with the host theme.</p>
      <ActionButton actionId="dummy_notify_action">
        Notify the backend
      </ActionButton>
      <p>Filter Example</p>
      <DataFilter sourceSqlId="dummy_filter" />
      <p>SQLite Table</p>
      <DataTable filterIds={["dummy_filter"]} sourceSqlId="dummy_table" />
      <PersistButton tableId="dummy_table" />
      <ResetButton tableId="dummy_table" />
    </>
  );
}
