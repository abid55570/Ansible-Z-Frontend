export interface BlockSpec {
  inputs: Record<string, { type: string; many?: boolean }>;
  required: string[];
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
