"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

export default function CustomNode({ data, selected }: NodeProps) {
  const d = data as { blockType?: string; inputPorts?: string[] };
  const ports = d.inputPorts ?? [];
  return (
    <div
      className={`min-w-[120px] rounded-lg border bg-panel px-3 py-2 text-white ${
        selected ? "border-brand" : "border-white/15"
      }`}
    >
      <div className="font-mono text-xs font-semibold">{d.blockType}</div>
      {ports.map((p, i) => (
        <Handle
          key={p}
          id={p}
          type="target"
          position={Position.Left}
          style={{ top: 22 + i * 12 }}
          className="!h-2 !w-2 !bg-brand"
        />
      ))}
      <Handle id="out" type="source" position={Position.Right} className="!h-2 !w-2 !bg-accent" />
    </div>
  );
}
