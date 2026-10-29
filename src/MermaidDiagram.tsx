import { theme } from "antd";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useExtension, useScreenNavigation } from "@coasti/planner-ui/contexts";

/** Visual state of one node in a process diagram. */
export type DiagramNodeState = "done" | "current" | "upcoming" | "blocked";

export interface MermaidDiagramProps {
  /** Mermaid source, for example a `flowchart` or `swimlane-beta` diagram. */
  chart: string;

  /**
   * Node ids on the happy path in order. Together with `current` this is
   * enough to colour the passed, current and upcoming nodes.
   */
  steps?: readonly string[];

  /** Node id the process is currently at. */
  current?: string;

  /**
   * Explicit state per node id. Wins over the state derived from
   * `steps`/`current`.
   */
  nodeStates?: Readonly<Record<string, DiagramNodeState>>;

  /**
   * Screen id per node id. A node with a screen becomes a link to that
   * extension screen.
   */
  nodeScreens?: Readonly<Record<string, string>>;

  /** Accessible label for the diagram. */
  ariaLabel?: string;

  /** Extra class for the wrapper element. */
  className?: string;
}

interface NodeColors {
  fill: string;
  stroke: string;
  color: string;
}

interface DiagramColors {
  done: NodeColors;
  current: NodeColors;
  upcoming: NodeColors;
  blocked: NodeColors;
}

// Mermaid cannot parse `rgba(...)` inside `classDef` because commas separate
// the properties, so the state colours are fixed hex values per theme.
const colorsByTheme: Record<"light" | "dark", DiagramColors> = {
  light: {
    done: { fill: "#e6f4ea", stroke: "#2e7d32", color: "#1b5e20" },
    current: { fill: "#eaf5b8", stroke: "#4f6a0a", color: "#1f2a00" },
    upcoming: { fill: "#f5f5f5", stroke: "#9e9e9e", color: "#616161" },
    blocked: { fill: "#fdecea", stroke: "#c62828", color: "#8e0000" },
  },
  dark: {
    done: { fill: "#14351f", stroke: "#59e98f", color: "#d7ffe6" },
    current: { fill: "#3a4408", stroke: "#d8ec29", color: "#f4ffc2" },
    upcoming: { fill: "#123441", stroke: "#4b7c8c", color: "#b7c9cf" },
    blocked: { fill: "#3a1b1d", stroke: "#ff7d80", color: "#ffd9da" },
  },
};

const stateClassNames: Record<DiagramNodeState, string> = {
  done: "cpfwDone",
  current: "cpfwCurrent",
  upcoming: "cpfwUpcoming",
  blocked: "cpfwBlocked",
};

interface NodeLink {
  nodeId: string;
  screenId: string;
  url: string;
  tooltip: string;
}

const diagramStyle = { overflowX: "auto", width: "100%" } as const;
const errorStyle = { color: "#c62828", margin: "4px 0 0" } as const;

/** Chooses the state of every node from the ordered path and explicit map. */
function resolveStates(
  steps: readonly string[] | undefined,
  current: string | undefined,
  nodeStates: Readonly<Record<string, DiagramNodeState>> | undefined,
): Map<string, DiagramNodeState> {
  const states = new Map<string, DiagramNodeState>();
  if (steps !== undefined && current !== undefined) {
    const activeIndex = steps.indexOf(current);
    if (activeIndex !== -1) {
      steps.forEach((nodeId, index) => {
        if (index < activeIndex) {
          states.set(nodeId, "done");
        } else if (index === activeIndex) {
          states.set(nodeId, "current");
        } else {
          states.set(nodeId, "upcoming");
        }
      });
    }
  }

  for (const [nodeId, state] of Object.entries(nodeStates ?? {})) {
    states.set(nodeId, state);
  }
  return states;
}

function classDefLine(state: DiagramNodeState, colors: NodeColors): string {
  const width = state === "current" ? "3px" : "2px";
  const dash = state === "upcoming" ? ",stroke-dasharray:5 5" : "";
  return (
    `classDef ${stateClassNames[state]} ` +
    `fill:${colors.fill},stroke:${colors.stroke},` +
    `color:${colors.color},stroke-width:${width}${dash}`
  );
}

/** Mermaid string literal: double quotes, with embedded quotes flattened. */
function mermaidString(value: string): string {
  return `"${value.replaceAll('"', "'")}"`;
}

/** Appends the state classes and screen links to the authored chart. */
function buildSource(
  chart: string,
  states: Map<string, DiagramNodeState>,
  colors: DiagramColors,
  links: readonly NodeLink[],
): string {
  const lines = [chart.trimEnd()];

  const byState = new Map<DiagramNodeState, string[]>();
  for (const [nodeId, state] of states) {
    const nodeIds = byState.get(state) ?? [];
    nodeIds.push(nodeId);
    byState.set(state, nodeIds);
  }

  for (const state of Object.keys(stateClassNames) as DiagramNodeState[]) {
    lines.push(classDefLine(state, colors[state]));
    const nodeIds = byState.get(state);
    if (nodeIds !== undefined && nodeIds.length > 0) {
      lines.push(`class ${nodeIds.join(",")} ${stateClassNames[state]}`);
    }
  }

  for (const link of links) {
    lines.push(
      `click ${link.nodeId} ${mermaidString(link.url)} ${mermaidString(
        link.tooltip,
      )}`,
    );
  }

  return lines.join("\n");
}

/** Whether a CSS colour is dark, used to pick the diagram theme. */
function isDarkColor(color: string): boolean {
  const hex = color.match(/^#([\da-f]{6})$/i);
  if (hex?.[1] === undefined) {
    // Unknown formats (for example a named colour) are treated as light.
    return false;
  }
  const value = Number.parseInt(hex[1], 16);
  const red = (value >> 16) & 0xff;
  const green = (value >> 8) & 0xff;
  const blue = value & 0xff;
  return (red * 299 + green * 587 + blue * 114) / 1000 < 128;
}

/**
 * Renders a Mermaid diagram offline.
 *
 * Nodes listed in `nodeScreens` link to extension screens using the host
 * router, and `steps`/`current` colour the passed, current and upcoming parts
 * of the process without touching the authored chart.
 */
export function MermaidDiagram({
  ariaLabel = "Process overview",
  chart,
  className,
  current,
  nodeScreens,
  nodeStates,
  steps,
}: MermaidDiagramProps) {
  const { token } = theme.useToken();
  const navigateToScreen = useScreenNavigation();
  const runtime = useExtension();
  const containerRef = useRef<HTMLDivElement>(null);
  const renderCountRef = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const reactId = useId();
  const renderId = useMemo(
    () => `cpfw-${reactId.replaceAll(/[^a-zA-Z0-9-]/g, "")}`,
    [reactId],
  );

  const isDark = isDarkColor(token.colorBgContainer);
  const colors = colorsByTheme[isDark ? "dark" : "light"];

  const links = useMemo<NodeLink[]>(() => {
    if (nodeScreens === undefined) {
      return [];
    }
    return Object.entries(nodeScreens).map(([nodeId, screenId]) => {
      const screen = runtime.screens.get(screenId);
      return {
        nodeId,
        screenId,
        url: runtime.screen_url(screenId),
        tooltip: `Open ${screen?.name ?? screenId}`,
      };
    });
  }, [nodeScreens, runtime]);

  const source = useMemo(
    () =>
      buildSource(
        chart,
        resolveStates(steps, current, nodeStates),
        colors,
        links,
      ),
    [chart, steps, current, nodeStates, colors, links],
  );

  useEffect(() => {
    const element = containerRef.current;
    let active = true;

    if (element !== null) {
      // A fresh id per render keeps React StrictMode's double effect from
      // rendering two diagrams under the same mermaid id.
      const renderCount = renderCountRef.current;
      renderCountRef.current += 1;
      const diagramId = `${renderId}-${renderCount}`;
      setError(null);
      element.replaceChildren();
      void (async () => {
        try {
          const module = await import("mermaid");
          const mermaid = module.default;
          mermaid.initialize({
            startOnLoad: false,
            // The extension author writes the chart, and `click` links are
            // only added from the trusted `nodeScreens` map.
            securityLevel: "loose",
            theme: "base",
            themeVariables: {
              background: "transparent",
              primaryColor: token.colorBgContainer,
              primaryTextColor: token.colorText,
              primaryBorderColor: token.colorBorder,
              lineColor: token.colorBorder,
              textColor: token.colorText,
              fontFamily: token.fontFamily,
              fontSize: "14px",
            },
          });
          const { svg } = await mermaid.render(diagramId, source);
          if (active) {
            element.innerHTML = svg;
          }
        } catch (cause: unknown) {
          if (active) {
            setError(cause instanceof Error ? cause.message : String(cause));
          }
        }
      })();
    }

    return () => {
      active = false;
    };
  }, [
    renderId,
    source,
    token.colorBgContainer,
    token.colorBorder,
    token.colorText,
    token.fontFamily,
  ]);

  useEffect(() => {
    const element = containerRef.current;
    const screenByUrl = new Map(links.map((link) => [link.url, link.screenId]));
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const href = target.closest("a")?.getAttribute("href");
      const screenId =
        href === null || href === undefined ? undefined : screenByUrl.get(href);
      if (screenId === undefined) {
        return;
      }
      event.preventDefault();
      navigateToScreen(screenId);
    };

    element?.addEventListener("click", onClick);
    return () => {
      element?.removeEventListener("click", onClick);
    };
  }, [links, navigateToScreen]);

  return (
    <figure aria-label={ariaLabel} className={className} style={diagramStyle}>
      <div ref={containerRef} />
      {error !== null && (
        <p role="alert" style={errorStyle}>
          Diagram could not be rendered: {error}
        </p>
      )}
    </figure>
  );
}
