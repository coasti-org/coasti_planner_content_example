import { Segmented, Typography } from "antd";
import { useState } from "react";

import { MermaidDiagram, ScreenLink } from "@coasti/planner-ui/components";
import { useExtension } from "@coasti/planner-ui/contexts";

/** Steps of the example process, in the order of the happy path. */
const steps = [
  { id: "apply", label: "Submit application" },
  { id: "screen", label: "Screen application" },
  { id: "decide", label: "Decide" },
  { id: "create", label: "Create account" },
  { id: "notify", label: "Send welcome email" },
  { id: "sign", label: "Sign agreement" },
] as const;

type StepId = (typeof steps)[number]["id"];

const stepIds: readonly string[] = steps.map((step) => step.id);
const stepOptions = steps.map((step) => ({
  label: step.label,
  value: step.id,
}));

/** Diagram nodes that open one of the registered example screens. */
const nodeScreens = {
  apply: "application",
  screen: "A",
  sign: "agreement",
} as const;

const flow = `swimlane-beta LR
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

function isStepId(value: string | number): value is StepId {
  return typeof value === "string" && steps.some((step) => step.id === value);
}

export function HomePage() {
  const { screens } = useExtension();
  const [current, setCurrent] = useState<StepId>("apply");

  return (
    <section>
      <Typography.Title level={3}>Application overview</Typography.Title>
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
        ariaLabel="Application process overview"
        chart={flow}
        current={current}
        nodeScreens={nodeScreens}
        steps={stepIds}
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
