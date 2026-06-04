"use client";

import { motion } from "framer-motion";
import { TEMPLATES, PCI_LABEL, type PciLevel } from "@/lib/templates";

const PCI_STYLES: Record<PciLevel, string> = {
  core: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  capable: "bg-brand/15 text-brand-400 border-brand/30",
  "scope-reducer": "bg-accent/15 text-accent border-accent/30",
  none: "bg-white/5 text-slate-400 border-white/10",
};

export default function TemplatesShowcase() {
  return (
    <section id="templates" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-white md:text-4xl">11 infrastructure templates</h2>
        <p className="mt-4 text-slate-400">From a simple 3-tier app to a PCI-DSS cardholder-data enclave — each one audited and ready.</p>
      </div>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t, i) => (
          <motion.div
            key={t.slug}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: (i % 3) * 0.05 }}
            className="group panel p-5 transition hover:border-brand/40 hover:bg-panel"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-white">{t.name}</h3>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${PCI_STYLES[t.pci]}`}>
                {PCI_LABEL[t.pci]}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-400">{t.summary}</p>
            <code className="mt-3 block font-mono text-xs text-slate-600">{t.slug}</code>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
