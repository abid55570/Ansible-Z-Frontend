import type { Edge, Node } from "@xyflow/react";

// Lay a flat design out as nested AWS-style zones: VPC and subnet nodes become
// container boxes, and resources nest inside the subnet/VPC they are wired to.
// Containment is derived from the structural edges (vpc/subnet/subnets ports);
// those edges are hidden afterwards because the nesting already shows them.

const W = 156; // resource tile width
const H = 92; // resource tile height
const GAP = 20;
const HEADER = 34; // zone label strip
const PAD = 16; // zone inner padding
const ZONE_GAP = 48;
const STRUCTURAL = new Set(["vpc", "subnet", "subnets"]);

type Patch = Partial<Node> & { position: { x: number; y: number } };

export function layoutInZones(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  const typeOf = new Map(nodes.map((n) => [n.id, (n.data as { blockType?: string }).blockType]));
  const isZone = (t?: string) => t === "vpc" || t === "subnet";

  const vpcOfSubnet = new Map<string, string>();
  for (const e of edges) {
    if (e.targetHandle === "vpc" && typeOf.get(e.target) === "subnet") vpcOfSubnet.set(e.target, e.source);
  }

  // resource -> the subnet or vpc it lives in
  const container = new Map<string, string>();
  for (const e of edges) {
    if (isZone(typeOf.get(e.target))) continue;
    if (e.targetHandle && STRUCTURAL.has(e.targetHandle) && !container.has(e.target)) {
      container.set(e.target, e.source);
    }
  }

  const idsByType = (t: string) => nodes.filter((n) => typeOf.get(n.id) === t).map((n) => n.id);
  const childrenOf = (z: string) =>
    nodes.filter((n) => container.get(n.id) === z && !isZone(typeOf.get(n.id))).map((n) => n.id);

  const patch = new Map<string, Patch>();

  const stack = (zone: string, startY: number) => {
    let y = startY;
    for (const k of childrenOf(zone)) {
      patch.set(k, { parentId: zone, extent: "parent", type: "block", position: { x: PAD, y } });
      y += H + GAP;
    }
    return y;
  };

  let vx = 40;
  const top = 130;
  for (const vpc of idsByType("vpc")) {
    let y = stack(vpc, HEADER + GAP); // direct (non-subnet) children at the top
    for (const sub of idsByType("subnet").filter((s) => vpcOfSubnet.get(s) === vpc)) {
      const end = stack(sub, HEADER + GAP);
      const subH = Math.max(end, HEADER + GAP + H);
      patch.set(sub, { parentId: vpc, extent: "parent", type: "zone", position: { x: PAD, y }, style: { width: W + 2 * PAD, height: subH } } as Patch);
      y += subH + GAP;
    }
    patch.set(vpc, { type: "zone", position: { x: vx, y: top }, style: { width: W + 4 * PAD, height: Math.max(y + GAP, 170) } } as Patch);
    vx += W + 4 * PAD + ZONE_GAP;
  }

  // subnets that aren't inside a VPC -> standalone zones
  for (const sub of idsByType("subnet").filter((s) => !vpcOfSubnet.has(s))) {
    const end = stack(sub, HEADER + GAP);
    patch.set(sub, { type: "zone", position: { x: vx, y: top }, style: { width: W + 2 * PAD, height: Math.max(end, HEADER + GAP + H) } } as Patch);
    vx += W + 2 * PAD + ZONE_GAP;
  }

  // top-level resources (not wired into any zone) -> a row across the top
  let tx = 40;
  for (const n of nodes) {
    if (isZone(typeOf.get(n.id)) || container.has(n.id) || patch.has(n.id)) continue;
    patch.set(n.id, { type: "block", position: { x: tx, y: 20 } });
    tx += W + GAP;
  }

  // React Flow needs parents before children; rank vpc < subnet < resource
  const rank = (id: string) => (typeOf.get(id) === "vpc" ? 0 : typeOf.get(id) === "subnet" ? 1 : 2);
  const laidOut = nodes
    .map((n) => (patch.has(n.id) ? ({ ...n, ...patch.get(n.id), data: n.data } as Node) : n))
    .sort((a, b) => rank(a.id) - rank(b.id));

  const hiddenEdges = edges.map((e) => ({ ...e, hidden: Boolean(e.targetHandle && STRUCTURAL.has(e.targetHandle)) }));

  return { nodes: laidOut, edges: hiddenEdges };
}
