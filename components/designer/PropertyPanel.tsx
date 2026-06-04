"use client";

import { Trash2 } from "lucide-react";

export default function PropertyPanel({
  nodeId,
  blockType,
  props,
  onChange,
  onDelete,
}: {
  nodeId: string | null;
  blockType?: string;
  props: Record<string, unknown>;
  onChange: (props: Record<string, unknown>) => void;
  onDelete: () => void;
}) {
  if (!nodeId) {
    return (
      <aside className="w-72 shrink-0 border-l border-white/10 bg-panel/40 p-4 text-sm text-slate-500">
        Select a node to edit its properties.
      </aside>
    );
  }

  return (
    <aside className="w-72 shrink-0 border-l border-white/10 bg-panel/40 p-4">
      <div className="text-sm font-semibold text-white">{blockType}</div>
      <div className="font-mono text-[11px] text-slate-500">{nodeId}</div>

      <label className="mt-3 block text-xs text-slate-400">Properties (JSON)</label>
      <textarea
        key={nodeId}
        defaultValue={JSON.stringify(props, null, 2)}
        onBlur={(e) => {
          try {
            onChange(JSON.parse(e.target.value || "{}"));
          } catch {
            /* keep the last valid value */
          }
        }}
        className="mt-1 h-48 w-full rounded-lg border border-white/10 bg-black/30 p-2 font-mono text-xs text-white outline-none focus:border-brand"
      />
      <p className="mt-1 text-[10px] text-slate-500">e.g. {'{ "cidr": "10.0.0.0/16" }'} — applied on blur.</p>

      <button
        onClick={onDelete}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20"
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete node
      </button>
    </aside>
  );
}
