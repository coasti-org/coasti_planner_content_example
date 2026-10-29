import { theme } from "antd";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useExtension, useScreenNavigation } from "@coasti/planner-ui/contexts";

/**
 * Visual state of one node in a process diagram.
 *
 * The four states are an example convention, not a framework concept:
 *
 * - `done`: the process already passed this node
 * - `current`: the process is at this node
 * - `upcoming`: the process has not reached this node yet
 * - `blocked`: the node cannot be reached, for example a rejected branch
 *
 * The state only changes how a node is coloured; it never changes the chart
 * itself. Deriving the state of every node from the overall process state is
 * up to the extension, see `processDiagram.tsx` for an example.
 */
export type DiagramNodeState = "done" | "current" | "upcoming" | "blocked";

export interface MermaidDiagramProps {
  /** Mermaid source, for example a `flowchart` or `swimlane-beta` diagram. */
  chart: string;

  /** State per node id. Nodes without an entry keep the chart's own style. */
  nodeStates?: Readonly<Record<string, DiagramNodeState>>;

  /**
   * Screen id per node id. A node with an entry becomes a link to that
   * extension screen; nodes without one stay plain.
   */
  nodeScreenLinks?: Readonly<Record<string, string>>;

  /** Extra class for the wrapper element. */
  className?: string;
}

type AntDesignTokens = ReturnType<typeof theme.useToken>["token"];

const stateClassNames: Record<DiagramNodeState, string> = {
  done: "cpfwDone",
  current: "cpfwCurrent",
  upcoming: "cpfwUpcoming",
  blocked: "cpfwBlocked",
};

/**
 * Antd hands out `rgba(...)` for some tokens, but Mermaid splits `classDef`
 * properties on commas, so functional colours are normalised to `#rrggbbaa`.
 */
function toMermaidColor(value: string): string {
  const functional = value.match(/^rgba?\(([^)]+)\)$/i);
  const parts = functional?.[1]?.split(/[\s,/]+/);
  if (parts === undefined) {
    return value;
  }
  const [red, green, blue, alpha] = parts.map(Number);
  if (!isColorChannel(red) || !isColorChannel(green) || !isColorChannel(blue)) {
    return value;
  }
  const opacity = isColorChannel(alpha) ? alpha : 1;
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}${toHex(opacity * 255)}`;
}

function isColorChannel(value: number | undefined): value is number {
  return value !== undefined && !Number.isNaN(value);
}

function toHex(value: number): string {
  return Math.round(value).toString(16).padStart(2, "0");
}

/** Theme-derived node styling, kept subtle so the active step stands out. */
const stateStyles: Record<
  DiagramNodeState,
  (token: AntDesignTokens) => string
> = {
  // Passed steps keep an accent outline, enough to read the path without
  // competing with the active step.
  done: (token) =>
    `fill:transparent,stroke:${toMermaidColor(token.colorPrimaryBorder)},` +
    `color:${toMermaidColor(token.colorTextSecondary)},stroke-width:2px`,
  // The active step is the only solid, opaque node, marked by the accent
  // border rather than a loud accent fill.
  current: (token) =>
    `fill:${toMermaidColor(token.colorBgContainer)},` +
    `stroke:${toMermaidColor(token.colorPrimary)},` +
    `color:${toMermaidColor(token.colorText)},stroke-width:2px`,
  // Locked steps stay faint and dashed.
  upcoming: (token) =>
    `fill:transparent,stroke:${toMermaidColor(token.colorBorder)},` +
    `color:${toMermaidColor(token.colorTextTertiary)},stroke-width:1px,` +
    `stroke-dasharray:4 4`,
  blocked: (token) =>
    `fill:transparent,stroke:${toMermaidColor(token.colorErrorBorder)},` +
    `color:${toMermaidColor(token.colorTextTertiary)},stroke-width:1px,` +
    `stroke-dasharray:4 4`,
};

interface NodeLink {
  nodeId: string;
  screenId: string;
  url: string;
  tooltip: string;
}

const diagramStyle = { overflowX: "auto", width: "100%" } as const;

function classDefLine(state: DiagramNodeState, token: AntDesignTokens): string {
  return `classDef ${stateClassNames[state]} ${stateStyles[state](token)}`;
}

/** Mermaid string literal: double quotes, with embedded quotes flattened. */
function mermaidString(value: string): string {
  return `"${value.replaceAll('"', "'")}"`;
}

/** Appends the state classes and screen links to the authored chart. */
function buildSource(
  chart: string,
  nodeStates: Readonly<Record<string, DiagramNodeState>> | undefined,
  token: AntDesignTokens,
  links: readonly NodeLink[],
): string {
  const lines = [chart.trimEnd()];

  const byState = new Map<DiagramNodeState, string[]>();
  for (const [nodeId, state] of Object.entries(nodeStates ?? {})) {
    const nodeIds = byState.get(state) ?? [];
    nodeIds.push(nodeId);
    byState.set(state, nodeIds);
  }

  for (const state of Object.keys(stateClassNames) as DiagramNodeState[]) {
    lines.push(classDefLine(state, token));
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

/**
 * Renders a Mermaid diagram offline and follows the host light/dark theme.
 *
 * Nodes listed in `nodeScreenLinks` open an extension screen, and `nodeStates`
 * colours the nodes without touching the authored chart.
 */
export function MermaidDiagram({
  chart,
  className,
  nodeScreenLinks,
  nodeStates,
}: MermaidDiagramProps) {
  const { token } = theme.useToken();
  const navigateToScreen = useScreenNavigation();
  const extension = useExtension();
  const containerRef = useRef<HTMLDivElement>(null);
  const renderCountRef = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const reactId = useId();
  const renderId = useMemo(
    () => `cpfw-${reactId.replaceAll(/[^a-zA-Z0-9-]/g, "")}`,
    [reactId],
  );

  // Mermaid cannot render React links, so `buildSource` turns these into
  // `click` directives. The same URLs are reused by the click handler below to
  // map a clicked anchor back to its screen.
  const links = useMemo<NodeLink[]>(() => {
    if (nodeScreenLinks === undefined) {
      return [];
    }
    return Object.entries(nodeScreenLinks).map(([nodeId, screenId]) => {
      const screen = extension.screens.get(screenId);
      return {
        nodeId,
        screenId,
        url: extension.screen_url(screenId),
        tooltip: `Open ${screen?.name ?? screenId}`,
      };
    });
  }, [nodeScreenLinks, extension]);

  const source = useMemo(
    () => buildSource(chart, nodeStates, token, links),
    [chart, nodeStates, token, links],
  );

  // Draws the authored chart plus the injected state classes and click
  // directives into the container. Mermaid is imported on demand so it stays
  // out of the initial bundle, and a render that finishes after the source
  // changed or the component unmounted is discarded instead of overwriting the
  // container.
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
            // only added from the trusted `nodeScreenLinks` map.
            securityLevel: "loose",
            theme: "base",
            themeVariables: {
              background: "transparent",
              primaryColor: token.colorBgContainer,
              primaryTextColor: token.colorText,
              primaryBorderColor: token.colorBorder,
              lineColor: token.colorBorder,
              textColor: token.colorText,
              // Neutralise Mermaid's derived palette, which otherwise paints
              // swimlane titles in rotated hues (tertiaryColor is primaryColor
              // rotated 180 degrees, i.e. a red lane background).
              secondaryColor: token.colorBgContainer,
              tertiaryColor: token.colorBgContainer,
              clusterBkg: token.colorFillQuaternary,
              clusterBorder: token.colorBorder,
              dropShadow: "none",
              fontFamily: token.fontFamily,
              fontSize: `${token.fontSize}px`,
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
    token.colorFillQuaternary,
    token.fontFamily,
    token.fontSize,
  ]);

  // Mermaid emits a plain anchor for every linked node, which would reload the
  // page. Intercept those clicks and open the screen through the host router,
  // while keeping the anchor itself intact for middle-click and accessibility.
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
    <figure
      aria-label="Process overview"
      className={className}
      style={diagramStyle}
    >
      <div ref={containerRef} />
      {error !== null && (
        <p role="alert" style={{ color: token.colorError, margin: "4px 0 0" }}>
          Diagram could not be rendered: {error}
        </p>
      )}
    </figure>
  );
}
