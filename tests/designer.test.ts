import { describe, expect, it } from "vitest";
import {
  advisories,
  canConnect,
  diagramToFlow,
  diagramToIR,
  fromIR,
  initialProps,
  toIR,
  type Catalogue,
  type DesignNode,
  type IR,
} from "@/lib/designer";

const CAT: Catalogue = {
  vpc: { inputs: {}, props: {}, output: "vpc.id" },
  subnet: { inputs: { vpc: { type: "vpc" } }, props: {}, output: "subnet.id" },
  alb: {
    inputs: { subnets: { type: "subnet", many: true }, security_group: { type: "security_group" } },
    props: {},
    output: "dns_name",
  },
};

const NODES = [
  { id: "vpc1", data: { blockType: "vpc", props: { cidr: "10.0.0.0/16" } } },
  { id: "pub1", data: { blockType: "subnet", props: { cidr: "10.0.1.0/24" } } },
  { id: "pub2", data: { blockType: "subnet", props: { cidr: "10.0.2.0/24" } } },
  { id: "alb1", data: { blockType: "alb", props: {} } },
];
const EDGES = [
  { id: "e1", source: "vpc1", target: "pub1", targetHandle: "vpc" },
  { id: "e2", source: "vpc1", target: "pub2", targetHandle: "vpc" },
  { id: "e3", source: "pub1", target: "alb1", targetHandle: "subnets" },
  { id: "e4", source: "pub2", target: "alb1", targetHandle: "subnets" },
  { id: "e5", source: "x", target: "alb1", targetHandle: null }, // no handle -> ignored
];

describe("toIR", () => {
  it("maps single and many inputs and carries meta", () => {
    const ir = toIR(NODES, EDGES, CAT, { region: "ap-south-1", name: "d" });
    expect(ir.region).toBe("ap-south-1");
    expect(ir.nodes.find((n) => n.id === "pub1")!.inputs.vpc).toBe("vpc1");
    expect(ir.nodes.find((n) => n.id === "alb1")!.inputs.subnets).toEqual(["pub1", "pub2"]);
  });

  it("leaves unconnected nodes with empty inputs", () => {
    const ir = toIR([{ id: "vpc1", data: { blockType: "vpc", props: {} } }], [], CAT, { region: "r", name: "n" });
    expect(ir.nodes[0].inputs).toEqual({});
  });

  it("tolerates a node whose data has no props", () => {
    const ir = toIR([{ id: "v", data: { blockType: "vpc" } } as unknown as DesignNode], [], CAT, { region: "r", name: "n" });
    expect(ir.nodes[0].props).toEqual({});
  });
});

describe("fromIR", () => {
  it("rebuilds nodes and edges (including many)", () => {
    const ir = toIR(NODES, EDGES, CAT, { region: "r", name: "n" });
    const { nodes, edges } = fromIR(ir);
    expect(nodes).toHaveLength(4);
    expect(edges.filter((e) => e.target === "alb1" && e.targetHandle === "subnets")).toHaveLength(2);
  });

  it("round-trips inputs back through toIR", () => {
    const ir = toIR(NODES, EDGES, CAT, { region: "r", name: "n" });
    const { nodes, edges } = fromIR(ir);
    const ir2 = toIR(nodes, edges, CAT, { region: "r", name: "n" });
    expect(ir2.nodes.find((n) => n.id === "alb1")!.inputs.subnets).toEqual(["pub1", "pub2"]);
    expect(ir2.nodes.find((n) => n.id === "pub1")!.inputs.vpc).toBe("vpc1");
  });

  it("tolerates nodes without props or inputs", () => {
    const ir = { version: 1, provider: "aws", region: "r", name: "n", nodes: [{ id: "v", type: "vpc" }] } as unknown as IR;
    const { nodes, edges } = fromIR(ir);
    expect(nodes[0].data.props).toEqual({});
    expect(edges).toEqual([]);
  });
});

const DIAGRAM = {
  nodes: [
    { id: "vpc1", type: "vpc", label: "VPC" },
    { id: "pub1", type: "subnet" }, // no label -> falls back to id
    { id: "pub2", type: "subnet", label: "Public B" },
    { id: "alb1", type: "alb", label: "ALB" },
  ],
  edges: [
    { from: "vpc1", to: "pub1", port: "vpc" },
    { from: "pub1", to: "alb1", port: "subnets" },
    { from: "pub2", to: "alb1", port: "subnets" },
    { from: "vpc1", to: "alb1" }, // no port -> decorative only
  ],
};

describe("diagramToFlow", () => {
  it("builds labelled nodes and edges with target handles", () => {
    const { nodes, edges } = diagramToFlow(DIAGRAM);
    expect(nodes.find((n) => n.id === "vpc1")!.data.label).toBe("VPC");
    expect(nodes.find((n) => n.id === "pub1")!.data.label).toBe("pub1"); // label falls back to id
    expect(edges).toHaveLength(DIAGRAM.edges.length);
    expect(edges.some((e) => e.source === "pub1" && e.target === "alb1")).toBe(true);
  });
});

describe("diagramToIR", () => {
  it("forks a diagram into a valid IR (repeated port -> list, no-port skipped)", () => {
    const ir = diagramToIR(DIAGRAM, { region: "ap-south-1", name: "forked" });
    expect(ir.region).toBe("ap-south-1");
    expect(ir.nodes.find((n) => n.id === "pub1")!.inputs.vpc).toBe("vpc1");
    expect(ir.nodes.find((n) => n.id === "alb1")!.inputs.subnets).toEqual(["pub1", "pub2"]);
  });

  it("merges three or more edges into one port into a list", () => {
    const ir = diagramToIR(
      {
        nodes: [{ id: "a", type: "alb" }],
        edges: [
          { from: "x", to: "a", port: "subnets" },
          { from: "y", to: "a", port: "subnets" },
          { from: "z", to: "a", port: "subnets" },
        ],
      },
      { region: "r", name: "n" },
    );
    expect(ir.nodes[0].inputs.subnets).toEqual(["x", "y", "z"]);
  });
});

describe("canConnect", () => {
  it("allows a type-matching port and rejects mismatches/unknowns", () => {
    expect(canConnect(CAT, "vpc", "subnet", "vpc")).toBe(true);
    expect(canConnect(CAT, "subnet", "subnet", "vpc")).toBe(false); // wrong source type
    expect(canConnect(CAT, "vpc", "subnet", "nope")).toBe(false); // unknown port
    expect(canConnect(CAT, "vpc", "subnet", null)).toBe(false); // no handle
    expect(canConnect(CAT, "vpc", undefined, "vpc")).toBe(false); // no target type
  });
});

describe("advisories", () => {
  it("flags public DBs, open SSH, public instances, and subnet-less VPCs", () => {
    const ir = {
      version: 1,
      provider: "aws",
      region: "r",
      name: "n",
      nodes: [
        { id: "vpc1", type: "vpc", props: {}, inputs: {} },
        { id: "db", type: "rds", props: { publicly_accessible: true }, inputs: {} },
        { id: "sg", type: "security_group", props: { ssh_cidr: "0.0.0.0/0" }, inputs: {} },
        { id: "web", type: "ec2_instance", props: { public: true }, inputs: {} },
      ],
    };
    const w = advisories(ir);
    expect(w.some((m) => m.includes("RDS"))).toBe(true);
    expect(w.some((m) => m.includes("SSH"))).toBe(true);
    expect(w.some((m) => m.includes("public IP"))).toBe(true);
    expect(w.some((m) => m.includes("no subnets"))).toBe(true);
  });

  it("returns nothing for a clean design", () => {
    const ir = {
      version: 1,
      provider: "aws",
      region: "r",
      name: "n",
      nodes: [
        { id: "vpc1", type: "vpc", props: {}, inputs: {} },
        { id: "pub", type: "subnet", props: {}, inputs: { vpc: "vpc1" } },
        { id: "db", type: "rds", props: {}, inputs: {} }, // not public -> not flagged
        {
          id: "sg",
          type: "security_group",
          props: { ingress: [{ port: 443, cidr: "0.0.0.0/0" }, { port: 22, cidr: "1.2.3.4/32" }] },
          inputs: {},
        },
      ],
    };
    expect(advisories(ir)).toEqual([]);
  });

  it("tolerates nodes without props and security groups without ingress", () => {
    const ir = { version: 1, provider: "aws", region: "r", name: "n", nodes: [{ id: "sg", type: "security_group" }] } as unknown as IR;
    expect(advisories(ir)).toEqual([]);
  });

  it("flags nodes that share a CIDR (ignoring empty/missing)", () => {
    const ir = {
      version: 1,
      provider: "aws",
      region: "r",
      name: "n",
      nodes: [
        { id: "a", type: "subnet", props: { cidr: "10.0.1.0/24" }, inputs: {} },
        { id: "b", type: "subnet", props: { cidr: "10.0.1.0/24" }, inputs: {} }, // duplicate
        { id: "c", type: "subnet", props: { cidr: "" }, inputs: {} }, // empty -> ignored
        { id: "d", type: "vpc", props: {}, inputs: {} }, // missing -> ignored
        { id: "e", type: "subnet", props: { cidr: "10.0.9.0/24" }, inputs: {} }, // unique -> not flagged
      ],
    } as unknown as IR;
    const w = advisories(ir);
    expect(w.filter((m) => m.includes("share CIDR"))).toEqual(["a, b: share CIDR 10.0.1.0/24 — give each its own range."]);
  });
});

describe("initialProps", () => {
  it("seeds defaults, falling back to example only for required props", () => {
    expect(
      initialProps({
        a: { default: "x" },
        b: { required: true }, // required, no default/example -> skipped
        c: { default: 5 },
        d: { required: true, example: "10.0.1.0/24" }, // required, no default -> example
        e: { example: "opt" }, // optional example -> skipped
      }),
    ).toEqual({ a: "x", c: 5, d: "10.0.1.0/24" });
  });
});
