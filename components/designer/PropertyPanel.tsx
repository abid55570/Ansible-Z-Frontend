"use client";

import { Trash2 } from "lucide-react";
import type { PropSpec } from "@/lib/designer";

export default function PropertyPanel({
  nodeId,
  blockType,
  schema,
  props,
  note,
  onChange,
  onNoteChange,
  onDelete,
}: {
  nodeId: string | null;
  blockType?: string;
  schema: Record<string, PropSpec>;
  props: Record<string, unknown>;
  note?: string;
  onChange: (props: Record<string, unknown>) => void;
  onNoteChange: (note: string) => void;
  onDelete: () => void;
}) {
  if (!nodeId) {
    return (
      <aside className="w-72 shrink-0 border-l border-white/10 bg-panel/40 p-4 text-sm text-slate-500">
        Select a node to edit its properties.
      </aside>
    );
  }

  const setField = (name: string, value: unknown) => onChange({ ...props, [name]: value });
  const entries = Object.entries(schema);

  return (
    <aside className="w-72 shrink-0 overflow-y-auto border-l border-white/10 bg-panel/40 p-4">
      <div className="text-sm font-semibold text-white">{blockType}</div>
      <div className="font-mono text-[11px] text-slate-500">{nodeId}</div>

      <div className="mt-3">
        <label htmlFor="az-note" className="text-xs font-medium text-slate-200">
          Note / label <span className="text-[10px] text-slate-500">(shown on the box)</span>
        </label>
        <textarea
          id="az-note"
          rows={2}
          value={note ?? ""}
          placeholder="e.g. 10.0.1.0/24, prod-web, or a description…"
          onChange={(e) => onNoteChange(e.target.value)}
          className="mt-1 w-full resize-none rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white outline-none focus:border-brand"
        />
      </div>

      <div className="mt-4 grid gap-4">
        {entries.length === 0 && <p className="text-xs text-slate-500">No editable properties.</p>}
        {entries.map(([name, spec]) => (
          <div key={name}>
            <label htmlFor={name} className="flex items-center justify-between text-xs font-medium text-slate-200">
              <span className="font-mono">
                {name}
                {spec.required && <span className="ml-1 text-rose-400">*</span>}
              </span>
              <span className="text-[10px] text-slate-500">{spec.type ?? "string"}</span>
            </label>

            {spec.type === "bool" ? (
              <label className="mt-1 flex items-center gap-2 text-xs text-slate-300">
                <input
                  id={name}
                  type="checkbox"
                  checked={Boolean(props[name] ?? spec.default ?? false)}
                  onChange={(e) => setField(name, e.target.checked)}
                />
                enabled
              </label>
            ) : (
              <input
                id={name}
                value={String(props[name] ?? spec.default ?? "")}
                placeholder={spec.example ?? ""}
                onChange={(e) => setField(name, spec.type === "number" ? Number(e.target.value) : e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white outline-none focus:border-brand"
              />
            )}

            {spec.guidance && <p className="mt-1 text-[10px] text-slate-500">{spec.guidance}</p>}
          </div>
        ))}
      </div>

      <button
        onClick={onDelete}
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20"
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete node
      </button>
    </aside>
  );
}
