"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, CheckCircle2, Download, LayoutGrid, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import {
  advisories,
  canConnect,
  fromIR,
  initialProps,
  toIR,
  type Catalogue,
  type DesignEdge,
  type DesignNode,
} from "@/lib/designer";
import CustomNode from "@/components/designer/CustomNode";
import ZoneNode from "@/components/designer/ZoneNode";
import Palette from "@/components/designer/Palette";
import PropertyPanel from "@/components/designer/PropertyPanel";
import { layoutInZones, reparentOnDrop } from "@/components/designer/zones";

const nodeTypes = { block: CustomNode, zone: ZoneNode };
const ZONE_TYPES = new Set(["vpc", "subnet"]);
const ZONE_SIZE: Record<string, { width: number; height: number }> = {
  vpc: { width: 360, height: 260 },
  subnet: { width: 230, height: 180 },
};
let counter = 0;

export default function Canvas() {
  const [catalogue, setCatalogue] = useState<Catalogue>({});
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("my-design");
  const [region, setRegion] = useState("ap-south-1");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.blocks().then(setCatalogue).catch(() => setStatus("Could not load blocks — is the API running on :8000?"));
  }, []);

  // Load a design forked from a template (stashed in sessionStorage) once blocks are known.
  useEffect(() => {
    if (Object.keys(catalogue).length === 0) return;
    const forked = sessionStorage.getItem("az-fork");
    if (!forked) return;
    sessionStorage.removeItem("az-fork");
    try {
      const ir = JSON.parse(forked);
      const flow = fromIR(ir);
      const built = flow.nodes.map((n) => {
        const blockType = (n.data as { blockType: string }).blockType;
        // Template diagrams carry no props, so seed defaults/examples for required
        // props (e.g. vpc/subnet cidr) — otherwise the fork fails validation.
        const seeded = initialProps(catalogue[blockType]?.props ?? {});
        const existing = (n.data as { props?: Record<string, unknown> }).props ?? {};
        return {
          ...n,
          data: {
            ...n.data,
            props: { ...seeded, ...existing },
            inputPorts: Object.keys(catalogue[blockType]?.inputs ?? {}),
          },
        } as Node;
      });
      const arranged = layoutInZones(built, flow.edges as unknown as Edge[]);
      setNodes(arranged.nodes);
      setEdges(arranged.edges);
      if (ir.name) setName(String(ir.name));
      if (ir.region) setRegion(String(ir.region));
      setStatus("Loaded from template — arranged into zones. Edit, then Validate or Generate.");
    } catch {
      /* ignore malformed fork payloads */
    }
  }, [catalogue, setNodes, setEdges]);

  const addNode = (type: string) => {
    counter += 1;
    const id = `${type}-${counter}`;
    const inputPorts = Object.keys(catalogue[type]?.inputs ?? {});
    const isZone = ZONE_TYPES.has(type);
    setNodes((ns) =>
      ns.concat({
        id,
        type: isZone ? "zone" : "block",
        position: { x: 120 + ns.length * 28, y: 70 + ns.length * 26 },
        ...(isZone ? { style: ZONE_SIZE[type] } : {}),
        data: { blockType: type, inputPorts, props: initialProps(catalogue[type]?.props ?? {}) },
      } as Node),
    );
  };

  // Drag a node onto a VPC/subnet box to nest it (and auto-wire its zone inputs).
  const onNodeDragStop = useCallback(
    (_e: unknown, node: Node) => {
      const live = nodes.map((n) =>
        n.id === node.id ? ({ ...n, position: node.position, parentId: node.parentId } as Node) : n,
      );
      const next = reparentOnDrop(live, edges, node.id, catalogue as unknown as Parameters<typeof reparentOnDrop>[3]);
      if (next) {
        setNodes(next.nodes);
        setEdges(next.edges);
      }
    },
    [nodes, edges, catalogue, setNodes, setEdges],
  );

  const onConnect = useCallback((c: Connection) => setEdges((es) => addEdge(c, es)), [setEdges]);

  const isValidConnection = useCallback(
    (c: Edge | Connection) => {
      const sourceType = (nodes.find((n) => n.id === c.source)?.data as { blockType?: string })?.blockType;
      const targetType = (nodes.find((n) => n.id === c.target)?.data as { blockType?: string })?.blockType;
      return canConnect(catalogue, sourceType, targetType, c.targetHandle);
    },
    [nodes, catalogue],
  );

  const buildIR = () =>
    toIR(nodes as unknown as DesignNode[], edges as unknown as DesignEdge[], catalogue, { region, name });

  const advisoryList = useMemo(
    () =>
      Object.keys(catalogue).length > 0
        ? advisories(toIR(nodes as unknown as DesignNode[], edges as unknown as DesignEdge[], catalogue, { region, name }))
        : [],
    [nodes, edges, catalogue, region, name],
  );

  function arrange() {
    const { nodes: nn, edges: ee } = layoutInZones(nodes, edges);
    setNodes(nn);
    setEdges(ee);
    setStatus("Arranged into VPC / subnet zones.");
  }

  async function validate() {
    setStatus("Validating…");
    try {
      const result = await api.validateDesign(buildIR());
      setStatus(result.valid ? "Valid ✓ — ready to generate" : `Errors: ${result.errors.join("; ")}`);
    } catch {
      setStatus("Validation failed — sign in first.");
    }
  }

  async function generate() {
    setBusy(true);
    setStatus("Generating…");
    try {
      const project = await api.createProject({
        name,
        template_slug: "__custom__",
        config: buildIR() as unknown as Record<string, unknown>,
      });
      await api.generate(project.id, "uat");
      window.location.href = api.downloadUrl(project.id, "uat");
      setStatus("Downloading ✓ — includes a Day-2 deploy layer (apps.yml / deploy.yml — see DAY2.md)");
    } catch {
      setStatus("Generate failed — sign in, then Validate the design.");
    } finally {
      setBusy(false);
    }
  }

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selected), [nodes, selected]);

  function updateProps(props: Record<string, unknown>) {
    setNodes((ns) => ns.map((n) => (n.id === selected ? { ...n, data: { ...n.data, props } } : n)));
  }

  function deleteSelected() {
    if (!selected) return;
    setNodes((ns) => ns.filter((n) => n.id !== selected));
    setEdges((es) => es.filter((e) => e.source !== selected && e.target !== selected));
    setSelected(null);
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-panel/50 px-4 py-2">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="design name"
            className="w-40 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-sm text-white"
          />
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            aria-label="region"
            className="w-32 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-sm text-white"
          />
          <button
            onClick={arrange}
            title="Lay out into VPC / subnet zones"
            className="inline-flex items-center gap-1 rounded-md border border-white/15 px-3 py-1 text-sm text-slate-200 hover:text-white"
          >
            <LayoutGrid className="h-4 w-4" /> Arrange
          </button>
          <button
            onClick={validate}
            className="inline-flex items-center gap-1 rounded-md border border-white/15 px-3 py-1 text-sm text-slate-200 hover:text-white"
          >
            <CheckCircle2 className="h-4 w-4" /> Validate
          </button>
          <button
            onClick={generate}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Generate
          </button>
        </div>
      </header>

      {status && <div className="border-b border-white/10 bg-black/30 px-4 py-1 text-xs text-slate-300">{status}</div>}
      {advisoryList.length > 0 && (
        <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-1 text-xs text-amber-300">
          ⚠ {advisoryList.length} advisory: {advisoryList.join("   ·   ")}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Palette blocks={Object.keys(catalogue)} onAdd={addNode} />
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            isValidConnection={isValidConnection}
            nodeTypes={nodeTypes}
            onNodeClick={(_, n) => setSelected(n.id)}
            deleteKeyCode={["Backspace", "Delete"]}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
        <PropertyPanel
          nodeId={selectedNode ? selected : null}
          blockType={selectedNode?.data.blockType as string | undefined}
          schema={catalogue[selectedNode?.data.blockType as string]?.props ?? {}}
          props={(selectedNode?.data.props as Record<string, unknown>) ?? {}}
          onChange={updateProps}
          onDelete={deleteSelected}
        />
      </div>
    </div>
  );
}
