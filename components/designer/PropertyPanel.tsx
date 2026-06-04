"use client";

export default function PropertyPanel({
  nodeId,
  blockType,
  props,
  onChange,
}: {
  nodeId: string | null;
  blockType?: string;
  props: Record<string, unknown>;
  onChange: (props: Record<string, unknown>) => void;
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
    </aside>
  );
}
