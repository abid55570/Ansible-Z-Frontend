"use client";

import { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export default function CustomNode({ data, selected }: NodeProps) {
  const d = data as { blockType?: string; inputPorts?: string[] };
  const ports = d.inputPorts ?? [];
  const [noIcon, setNoIcon] = useState(false);

  return (
    <div
      className={`flex min-w-[132px] flex-col items-center gap-1.5 rounded-xl border bg-panel px-3 py-2.5 text-white ${
        selected ? "border-brand ring-1 ring-brand/40" : "border-white/15"
      }`}
    >
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
