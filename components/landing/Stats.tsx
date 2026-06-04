"use client";

import { motion } from "framer-motion";
import { TEMPLATES } from "@/lib/templates";

const STATS = [
  { value: String(TEMPLATES.length), label: "infrastructure templates" },
  { value: "25", label: "drag-and-drop building blocks" },
  { value: "Day-2", label: "deploy & update layer built in" },
  { value: "100%", label: "lint + syntax-checked exports" },
];

export default function Stats() {
  return (
    <section className="border-y border-white/10 bg-panel/30">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-white md:text-4xl">{s.value}</div>
            <div className="mt-1 text-sm text-slate-400">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
