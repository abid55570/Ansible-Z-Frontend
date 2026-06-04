"use client";

import { ReactFlow, Background, Handle, Position, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { diagramToFlow, type Diagram } from "@/lib/designer";

function DiagramNode({ data }: NodeProps) {
  const d = data as { blockType?: string; label?: string };
  return (
    <div className="rounded-lg border border-white/15 bg-panel px-3 py-2 text-center text-white">
      <div className="text-xs font-semibold">{d.label}</div>
      <div className="font-mono text-[10px] text-slate-500">{d.blockType}</div>
      <Handle type="target" position={Position.Left} className="!h-1 !w-1 !border-0 !bg-transparent" />
      <Handle type="source" position={Position.Right} className="!h-1 !w-1 !border-0 !bg-transparent" />
    </div>
  );
}

const nodeTypes = { block: DiagramNode };

export default function DiagramView({ diagram }: { diagram: Diagram }) {
  const { nodes, edges } = diagramToFlow(diagram);
  return (
    <div className="h-72 w-full overflow-hidden rounded-xl border border-white/10 bg-black/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
