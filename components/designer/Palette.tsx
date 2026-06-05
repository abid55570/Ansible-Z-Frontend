"use client";

import { Boxes } from "lucide-react";

export default function Palette({ blocks, onAdd }: { blocks: string[]; onAdd: (type: string) => void }) {
  return (
    <aside className="w-44 shrink-0 overflow-y-auto border-r border-white/10 bg-panel/40 p-3">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <Boxes className="h-4 w-4 text-brand" /> Blocks
      </div>
      <div className="grid gap-2">
        {blocks.map((b) => (
          <button
            key={b}
            onClick={() => onAdd(b)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-left font-mono text-xs text-slate-200 transition hover:border-brand/40 hover:text-white"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/95">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/aws-icons/${b}.png`} alt="" className="h-5 w-5 object-contain" />
            </span>
            <span className="truncate">{b}</span>
          </button>
        ))}
        {blocks.length === 0 && <p className="text-xs text-slate-500">Loading blocks…</p>}
      </div>
    </aside>
  );
}
