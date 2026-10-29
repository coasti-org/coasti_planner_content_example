import { Space, Typography } from "antd";

import { ActionButton } from "@coasti/planner-ui/components";
import { useOutletValue } from "@coasti/planner-ui/contexts";

import { MermaidDiagram, type DiagramNodeState } from "./MermaidDiagram";

/**
 * Example-only workflow shown on the landing page.
 *
 * The `id` of a stage ties the example together. The same string has to appear
 * in three places:
 *
 *   1. here, so the order of the path is known,
 *   2. as a node id in `chart` below, so Mermaid knows the shape of the process,
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

/** Narrows an outlet value to a stage id the diagram can use. */
function isStageId(value: unknown): value is StageId {
  return (
    typeof value === "string" && stages.some((stage) => stage.id === value)
  );
}

/** Node ids that link to a screen registered in `src/index.tsx`. */
const nodeScreenLinks = {
  draft: "application",
  locked: "A",
  done: "agreement",
} as const;

/** The process drawn by Mermaid; the node ids match the stage ids above. */
const chart = `swimlane-beta LR
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

/**
 * Example state derivation: stages before the current one are `done`, the
 * current stage is `current`, and later stages are `upcoming`.
 */
function nodeStatesFor(current: StageId): Record<string, DiagramNodeState> {
  const activeIndex = stages.findIndex((stage) => stage.id === current);
  const nodeStates: Record<string, DiagramNodeState> = {};
  stages.forEach((stage, index) => {
    if (index < activeIndex) {
      nodeStates[stage.id] = "done";
    } else if (index === activeIndex) {
      nodeStates[stage.id] = "current";
    } else {
      nodeStates[stage.id] = "upcoming";
    }
  });
  return nodeStates;
}

/** Stage picker plus the example process diagram, driven by the backend. */
export function ProcessDiagram() {
  // The backend round trip. The outlet runs a read-only SQL query against the
  // extension database and returns `process_state.current_stage`.
  const stageQuery = useOutletValue<string>("current_stage");

  // Respect the value from the backend whenever it names a known stage; fall
  // back to the first stage while the query loads.
  const current: StageId = isStageId(stageQuery.data)
    ? stageQuery.data
    : "draft";

  return (
    <>
      <Typography.Paragraph type="secondary">
        The highlighted step is read from the extension database. Press a button
        to write a new stage with a backend action and watch the diagram follow
        the round trip.
      </Typography.Paragraph>

      {/*
        These buttons stand in for the real trigger in a production extension
        (a scheduled job, a table edit, another screen). Each button runs a SQL
        action that updates `process_state.current_stage`. A successful action
        invalidates the cached queries, so the outlet refetches and the diagram
        re-renders at the new stage.
      */}
      <Space style={{ marginBottom: 16 }} wrap>
        {stages.map((stage) => (
          <ActionButton actionId={stageActions[stage.id]} key={stage.id}>
            {stage.label}
          </ActionButton>
        ))}
      </Space>

      <MermaidDiagram
        chart={chart}
        nodeScreenLinks={nodeScreenLinks}
        nodeStates={nodeStatesFor(current)}
      />
    </>
  );
}
