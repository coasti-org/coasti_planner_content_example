import { Segmented, Typography } from "antd";
import { useState } from "react";

import { MermaidDiagram, type DiagramNodeState } from "./MermaidDiagram";

/**
 * Example-only process shown on the landing page. The steps are the happy path
 * of a small application flow, and every node in the chart below uses one of
 * their ids.
 */
const steps = [
  { id: "apply", label: "Submit application" },
  { id: "screen", label: "Screen application" },
  { id: "decide", label: "Decide" },
  { id: "create", label: "Create account" },
  { id: "notify", label: "Send welcome email" },
  { id: "sign", label: "Sign agreement" },
] as const;

type StepId = (typeof steps)[number]["id"];

const stepOptions = steps.map((step) => ({
  label: step.label,
  value: step.id,
}));

/** Example chart; the node ids match the step ids above. */
const chart = `swimlane-beta LR
  subgraph Applicant
    apply[Submit application]
    sign[Sign agreement]
  end

  subgraph Reviewer
    screen[Screen application]
    decide{Approved?}
  end

  subgraph System
    create[Create account]
    notify[Send welcome email]
  end

  apply -->|Application received| screen
  screen --> decide
  decide -->|Approved| create --> notify --> sign
  decide -->|Needs changes| apply
`;

/** Diagram nodes that open one of the registered example screens. */
const nodeScreenLinks = {
  apply: "application",
  screen: "A",
  sign: "agreement",
} as const;

/**
 * Example state derivation: nodes before the current stage are `done`, the
 * stage itself is `current`, and later nodes are `upcoming`. `blocked` is not
 * used here, but a node on the `Needs changes` branch could be marked with it.
 */
function nodeStatesFor(current: StepId): Record<string, DiagramNodeState> {
  const activeIndex = steps.findIndex((step) => step.id === current);
  const nodeStates: Record<string, DiagramNodeState> = {};
  steps.forEach((step, index) => {
    if (index < activeIndex) {
      nodeStates[step.id] = "done";
    } else if (index === activeIndex) {
      nodeStates[step.id] = "current";
    } else {
      nodeStates[step.id] = "upcoming";
    }
  });
  return nodeStates;
}

function isStepId(value: string | number): value is StepId {
  return typeof value === "string" && steps.some((step) => step.id === value);
}

/** Stage picker plus the example process diagram. */
export function ProcessDiagram() {
  const [current, setCurrent] = useState<StepId>("apply");

  return (
    <>
      <Typography.Paragraph type="secondary">
        Pick the stage the process is at, then follow the highlighted step or
        click a node to open its screen.
      </Typography.Paragraph>
      <Segmented
        onChange={(value) => {
          if (isStepId(value)) {
            setCurrent(value);
          }
        }}
        options={stepOptions}
        style={{ marginBottom: 16 }}
        value={current}
      />
      <MermaidDiagram
        chart={chart}
        nodeScreenLinks={nodeScreenLinks}
        nodeStates={nodeStatesFor(current)}
      />
    </>
  );
}
