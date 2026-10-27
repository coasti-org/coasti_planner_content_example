import { Space, Typography } from "antd";

import {
  ActionButton,
  MermaidDiagram,
  ScreenLink,
} from "@coasti/planner-ui/components";
import { useExtension, useOutletValue } from "@coasti/planner-ui/contexts";

/**
 * The stages of the process, in the order of the happy path.
 *
 * The `id` is the piece that ties this example together. The exact same string
 * has to appear in three places:
 *
 *   1. here, so the component knows the order of the path,
 *   2. as a node id in `flow` below, so Mermaid knows the shape of the process,
 *   3. as `current_stage` in the extension database, written by the actions and
 *      read back through the `current_stage` outlet.
 *
 * If one of them drifts, the diagram silently stops highlighting the stage.
 */
const stages = [
  { id: "draft", label: "Draft" },
  { id: "locked", label: "Locked" },
  { id: "done", label: "Done" },
] as const;

type StageId = (typeof stages)[number]["id"];

const stageIds: readonly string[] = stages.map((stage) => stage.id);

/** Narrows an outlet value to a stage id we can hand to the diagram. */
function isStageId(value: unknown): value is StageId {
  return (
    typeof value === "string" && stages.some((stage) => stage.id === value)
  );
}

/**
 * Node ids that link to a screen registered in `src/index.tsx`.
 *
 * The keys are the same node ids used in `flow` and in `stages`; the values are
 * screen ids passed to `context.add_screen(...)`.
 */
const nodeScreens = {
  draft: "application",
  locked: "A",
  done: "agreement",
} as const;

/**
 * The process drawn by Mermaid.
 *
 * The node ids `draft`, `locked` and `done` must match the stage ids above and
 * the values stored in `process_state.current_stage`.
 */
const flow = `swimlane-beta LR
  subgraph Applicant
    draft[Submit application]
  end

  subgraph Reviewer
    locked{Review application}
  end

  subgraph System
    done[Create account]
  end

  draft -->|Application received| locked
  locked -->|Approved| done
  locked -->|Needs changes| draft
`;

/** Maps each stage to the action that writes it into the database. */
const stageActions: Record<StageId, string> = {
  draft: "set_stage_draft",
  locked: "set_stage_locked",
  done: "set_stage_done",
};

export function HomePage() {
  const { screens } = useExtension();

  // The backend round trip. The outlet runs a read-only SQL query against the
  // extension database and returns `process_state.current_stage`.
  const stageQuery = useOutletValue<string>("current_stage");

  // Respect the value from the backend whenever it names a known stage; fall
  // back to the first stage while the query loads.
  const current: StageId = isStageId(stageQuery.data)
    ? stageQuery.data
    : "draft";

  return (
    <section>
      <Typography.Title level={3}>Application overview</Typography.Title>
      <Typography.Paragraph type="secondary">
        The highlighted step is read from the extension database. Press a button
        to write a new stage with a backend action and watch the diagram follow
        the round trip.
      </Typography.Paragraph>

      {/*
        These buttons stand in for the real trigger in a production extension
        (a scheduled job, a table edit, another screen). Each button runs a SQL
        action that updates `process_state.current_stage`. A successful action
        invalidates the cached queries, so `stageQuery` refetches and the
        diagram re-renders at the new stage.
      */}
      <Space style={{ marginBottom: 16 }} wrap>
        {stages.map((stage) => (
          <ActionButton actionId={stageActions[stage.id]} key={stage.id}>
            {stage.label}
          </ActionButton>
        ))}
      </Space>

      <MermaidDiagram
        ariaLabel="Application process overview"
        chart={flow}
        current={current}
        nodeScreens={nodeScreens}
        steps={stageIds}
      />

      <Typography.Title level={3}>Available screens</Typography.Title>
      <ul>
        {[...screens.values()].map((screen) => (
          <li key={screen.id}>
            <ScreenLink screenId={screen.id}>{screen.name}</ScreenLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
