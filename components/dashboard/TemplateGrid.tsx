"use client";

import Link from "next/link";
import { Lock, Plus } from "lucide-react";
import type { TemplateSummary } from "@/lib/api";

const PCI_LABEL: Record<string, string> = {
  core: "PCI · core",
  capable: "PCI · capable",
  "scope-reducer": "PCI · scope-reducer",
  none: "general",
};

function Card({ t }: { t: TemplateSummary }) {
  return (
    <div className={`group panel flex h-full flex-col p-5 transition ${t.ready ? "hover:border-brand/40" : "opacity-60"}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">{t.name}</h3>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
          {PCI_LABEL[t.pci] ?? t.pci}
        </span>
      </div>
      <p className="mt-2 flex-1 text-sm text-slate-400">{t.summary}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-400">
        {t.ready ? (
          <>
            <Plus className="h-4 w-4" /> Use template
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" /> Coming soon
          </>
        )}
      </span>
    </div>
  );
}

export default function TemplateGrid({ templates }: { templates: TemplateSummary[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t) =>
        t.ready ? (
          <Link key={t.slug} href={`/templates/${t.slug}`} aria-label={`Use ${t.name}`}>
            <Card t={t} />
          </Link>
        ) : (
          <div key={t.slug}>
            <Card t={t} />
          </div>
        ),
      )}
    </div>
  );
}
