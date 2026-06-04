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
import { ArrowLeft, CheckCircle2, Download, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { advisories, canConnect, fromIR, toIR, type Catalogue, type DesignEdge, type DesignNode } from "@/lib/designer";
import CustomNode from "@/components/designer/CustomNode";
import Palette from "@/components/designer/Palette";
import PropertyPanel from "@/components/designer/PropertyPanel";

const nodeTypes = { block: CustomNode };
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
      setNodes(
        flow.nodes.map((n) => {
          const blockType = (n.data as { blockType: string }).blockType;
          return { ...n, data: { ...n.data, inputPorts: Object.keys(catalogue[blockType]?.inputs ?? {}) } } as Node;
        }),
      );
      setEdges(flow.edges as unknown as Edge[]);
      if (ir.name) setName(String(ir.name));
      if (ir.region) setRegion(String(ir.region));
      setStatus("Loaded from template — edit, then Validate or Generate.");
    } catch {
      /* ignore malformed fork payloads */
    }
  }, [catalogue, setNodes, setEdges]);

  const addNode = (type: string) => {
    counter += 1;
    const id = `${type}-${counter}`;
    const inputPorts = Object.keys(catalogue[type]?.inputs ?? {});
    setNodes((ns) =>
      ns.concat({
        id,
        type: "block",
        position: { x: 140 + ns.length * 24, y: 80 + ns.length * 30 },
        data: { blockType: type, inputPorts, props: {} },
      } as Node),
    );
  };

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
      setStatus("Downloading ✓");
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
          props={(selectedNode?.data.props as Record<string, unknown>) ?? {}}
          onChange={updateProps}
          onDelete={deleteSelected}
        />
      </div>
    </div>
  );
}
