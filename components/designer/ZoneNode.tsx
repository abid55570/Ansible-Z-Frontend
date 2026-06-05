"use client";

import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react";

export default function ZoneNode({ data, selected }: NodeProps) {
  const d = data as { blockType?: string; inputPorts?: string[]; label?: string; note?: string };
  const isVpc = d.blockType === "vpc";
  const ports = d.inputPorts ?? [];
  const title = d.label ?? (isVpc ? "VPC" : "Subnet");

  return (
    <div
      className={`h-full w-full rounded-xl border-2 ${
        isVpc ? "border-brand/50 bg-brand/[0.06]" : "border-emerald-400/40 bg-emerald-400/[0.06]"
      } ${selected ? "ring-2 ring-brand/60" : ""}`}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={190}
        minHeight={120}
        lineClassName="!border-brand/50"
        handleClassName="!h-2.5 !w-2.5 !rounded-sm !border-none !bg-brand"
      />
      <div className="flex items-center gap-1.5 px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-white/95">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/aws-icons/${d.blockType}.png`} alt="" className="h-4 w-4 object-contain" />
        </span>
        {title}
      </div>
      {d.note && (
        <div className="mx-3 mt-1 inline-block rounded bg-black/30 px-1.5 py-0.5 text-[10px] font-medium normal-case text-slate-300">
          {d.note}
        </div>
      )}
      {ports.map((p, i) => (
        <Handle
          key={p}
          id={p}
          type="target"
          position={Position.Left}
          style={{ top: 18 + i * 12 }}
          className="!h-2 !w-2 !bg-brand"
        />
      ))}
      <Handle id="out" type="source" position={Position.Right} className="!h-2 !w-2 !bg-accent" />
    </div>
  );
}
