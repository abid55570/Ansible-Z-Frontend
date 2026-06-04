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
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left font-mono text-xs text-slate-200 transition hover:border-brand/40 hover:text-white"
          >
            + {b}
          </button>
        ))}
        {blocks.length === 0 && <p className="text-xs text-slate-500">Loading blocks…</p>}
      </div>
    </aside>
  );
}
