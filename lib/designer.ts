export interface PropSpec {
  type?: string;
  required?: boolean;
  default?: unknown;
  example?: string;
  guidance?: string;
}
export interface BlockSpec {
  inputs: Record<string, { type: string; many?: boolean }>;
  props: Record<string, PropSpec>;
  output: string;
}
export type Catalogue = Record<string, BlockSpec>;

export interface DesignNode {
  id: string;
  data: { blockType: string; props: Record<string, unknown> };
}
export interface DesignEdge {
  id: string;
  source: string;
  target: string;
  targetHandle?: string | null;
}

export interface IRNode {
  id: string;
  type: string;
  props: Record<string, unknown>;
  inputs: Record<string, string | string[]>;
}
export interface IR {
  version: number;
  provider: string;
  region: string;
  name: string;
  nodes: IRNode[];
}

/** Convert the React-Flow graph (nodes + edges) into the backend IR. */
export function toIR(
  nodes: DesignNode[],
  edges: DesignEdge[],
  catalogue: Catalogue,
  meta: { region: string; name: string },
): IR {
  const typeOf = new Map(nodes.map((n) => [n.id, n.data.blockType]));
  const inputs: Record<string, Record<string, string | string[]>> = {};

  for (const edge of edges) {
    const port = edge.targetHandle;
    if (!port) continue;
    const targetType = typeOf.get(edge.target);
    const many = Boolean(targetType && catalogue[targetType]?.inputs[port]?.many);
    const bag = (inputs[edge.target] ||= {});
    if (many) {
      const current = (bag[port] as string[] | undefined) ?? [];
      bag[port] = [...current, edge.source];
    } else {
      bag[port] = edge.source;
    }
  }

  return {
    version: 1,
    provider: "aws",
    region: meta.region,
    name: meta.name,
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.data.blockType,
      props: n.data.props ?? {},
      inputs: inputs[n.id] ?? {},
    })),
  };
}

export interface PositionedNode {
  id: string;
  type: "block";
  position: { x: number; y: number };
  data: { blockType: string; props: Record<string, unknown> };
}

/** Convert an IR back into React-Flow nodes + edges (for loading designs / forking templates). */
export function fromIR(ir: IR): { nodes: PositionedNode[]; edges: DesignEdge[] } {
  const nodes: PositionedNode[] = ir.nodes.map((n, i) => ({
    id: n.id,
    type: "block",
    position: { x: (i % 3) * 230, y: Math.floor(i / 3) * 150 },
    data: { blockType: n.type, props: n.props ?? {} },
  }));

  const edges: DesignEdge[] = [];
  for (const n of ir.nodes) {
    for (const [port, value] of Object.entries(n.inputs ?? {})) {
      for (const source of Array.isArray(value) ? value : [value]) {
        edges.push({ id: `e-${source}-${n.id}-${port}`, source, target: n.id, targetHandle: port });
      }
    }
  }
  return { nodes, edges };
}

// --- template diagrams (read-only single view + "fork to canvas") ---

export interface DiagramNode {
  id: string;
  type: string;
  label?: string;
}
export interface DiagramEdge {
  from: string;
  to: string;
  port?: string;
}
export interface Diagram {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface DiagramFlowNode {
  id: string;
  type: "block";
  position: { x: number; y: number };
  data: { blockType: string; label: string };
}

/** A template Diagram -> React-Flow nodes + edges, for the read-only single view. */
export function diagramToFlow(diagram: Diagram): { nodes: DiagramFlowNode[]; edges: DesignEdge[] } {
  const nodes: DiagramFlowNode[] = diagram.nodes.map((n, i) => ({
    id: n.id,
    type: "block",
    position: { x: (i % 3) * 230, y: Math.floor(i / 3) * 150 },
    data: { blockType: n.type, label: n.label ?? n.id },
  }));
  const edges: DesignEdge[] = diagram.edges.map((e, i) => ({
    id: `d-${i}-${e.from}-${e.to}`,
    source: e.from,
    target: e.to,
  }));
  return { nodes, edges };
}

/** A template Diagram -> an IR for "fork to canvas" (repeated edges into one port become a list). */
export function diagramToIR(diagram: Diagram, meta: { region: string; name: string }): IR {
  const inputs: Record<string, Record<string, string | string[]>> = {};
  for (const e of diagram.edges) {
    if (!e.port) continue;
    const bag = (inputs[e.to] ||= {});
    if (e.port in bag) {
      const current = bag[e.port];
      bag[e.port] = Array.isArray(current) ? [...current, e.from] : [current, e.from];
    } else {
      bag[e.port] = e.from;
    }
  }
  return {
    version: 1,
    provider: "aws",
    region: meta.region,
    name: meta.name,
    nodes: diagram.nodes.map((n) => ({ id: n.id, type: n.type, props: {}, inputs: inputs[n.id] ?? {} })),
  };
}

// --- canvas polish: connection validation + advisory linter ---

/** True if an edge from a `sourceType` node into `targetType`'s `port` is type-valid. */
export function canConnect(
  catalogue: Catalogue,
  sourceType: string | undefined,
  targetType: string | undefined,
  port: string | null | undefined,
): boolean {
  if (!port || !targetType) return false;
  const spec = catalogue[targetType]?.inputs?.[port];
  return Boolean(spec && spec.type === sourceType);
}

/** Best-practice warnings for a design (shown live in the canvas). */
export function advisories(ir: IR): string[] {
  const warnings: string[] = [];
  for (const n of ir.nodes) {
    const props = (n.props ?? {}) as Record<string, unknown>;
    if (n.type === "rds" && props.publicly_accessible === true) {
      warnings.push(`${n.id}: RDS is publicly accessible — keep databases private.`);
    }
    if (n.type === "ec2_instance" && props.public === true) {
      warnings.push(`${n.id}: instance has a public IP — prefer a bastion/ALB.`);
    }
    if (n.type === "security_group" && props.ssh_cidr === "0.0.0.0/0") {
      warnings.push(`${n.id}: SSH (22) is open to 0.0.0.0/0 — restrict to your IP.`);
    }
  }
  if (ir.nodes.some((n) => n.type === "vpc") && !ir.nodes.some((n) => n.type === "subnet")) {
    warnings.push("VPC has no subnets.");
  }
  return warnings;
}

/**
 * Initial props for a new (or forked) node: each prop's default, falling back to
 * its example for required props so they are never left empty (which would fail
 * validation the moment a template is forked onto the canvas).
 */
export function initialProps(schema: Record<string, PropSpec>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [name, spec] of Object.entries(schema)) {
    if (spec.default !== undefined) out[name] = spec.default;
    else if (spec.required && spec.example !== undefined) out[name] = spec.example;
  }
  return out;
}
