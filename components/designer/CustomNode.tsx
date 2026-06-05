"use client";

import { useState } from "react";
import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react";

export default function CustomNode({ data, selected }: NodeProps) {
  const d = data as { blockType?: string; inputPorts?: string[]; note?: string };
  const ports = d.inputPorts ?? [];
  const [noIcon, setNoIcon] = useState(false);

  return (
    <div
      className={`flex h-full min-h-[88px] w-full min-w-[132px] flex-col items-center justify-center gap-1.5 rounded-xl border bg-panel px-3 py-2.5 text-white ${
        selected ? "border-brand ring-1 ring-brand/40" : "border-white/15"
      }`}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={120}
        minHeight={88}
        lineClassName="!border-brand/50"
        handleClassName="!h-2.5 !w-2.5 !rounded-sm !border-none !bg-brand"
      />
      {!noIcon && d.blockType ? (
        <div className="rounded-lg bg-white/95 p-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/aws-icons/${d.blockType}.png`}
            alt=""
            className="h-8 w-8 object-contain"
            onError={() => setNoIcon(true)}
          />
        </div>
      ) : null}
      <div className="font-mono text-[11px] font-semibold">{d.blockType}</div>
      {d.note && <div className="max-w-full truncate text-[10px] text-slate-400">{d.note}</div>}
      {ports.map((p, i) => (
        <Handle
          key={p}
          id={p}
          type="target"
          position={Position.Left}
          style={{ top: 26 + i * 12 }}
          className="!h-2 !w-2 !bg-brand"
        />
      ))}
      <Handle id="out" type="source" position={Position.Right} className="!h-2 !w-2 !bg-accent" />
    </div>
  );
}
