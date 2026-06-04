"use client";

import { isRequiredInEnv, type VarSpec } from "@/lib/wizard";
import { HelpCircle, CheckCircle2 } from "lucide-react";

export default function VariableField({
  name,
  spec,
  env,
  value,
  invalid,
  onChange,
}: {
  name: string;
  spec: VarSpec;
  env: string;
  value: string;
  invalid: boolean;
  onChange: (name: string, value: string) => void;
}) {
  const required = isRequiredInEnv(spec, env);
  const guidance = spec.guidance ?? {};

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="font-mono text-sm font-medium text-white">
          {name}
          {required && <span className="ml-1 text-rose-400">*</span>}
        </label>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-slate-500">
          {spec.type ?? "string"}
        </span>
      </div>

      {guidance.what && <p className="mt-2 text-sm text-slate-400">{guidance.what}</p>}

      <input
        id={name}
        value={value}
        placeholder={spec.example ?? ""}
        onChange={(e) => onChange(name, e.target.value)}
        className={`mt-3 w-full rounded-lg border bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-brand ${
          invalid ? "border-rose-500" : "border-white/10"
        }`}
      />

      {guidance.how_to_get && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
          <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
          {guidance.how_to_get}
        </p>
      )}
      {env !== "local" && guidance.uat_check && (
        <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-500">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
          {guidance.uat_check}
        </p>
      )}
    </div>
  );
}
