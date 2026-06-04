"use client";

import { motion } from "framer-motion";

const STEPS = [
  { n: "01", title: "Pick a template", body: "Choose from 11 production architectures. See its diagram and how the flow runs before you commit." },
  { n: "02", title: "Fill guided variables", body: "Each field tells you what it is and how to get it. Set values per environment — local, UAT, prod." },
  { n: "03", title: "Export & run", body: "Download a validated Ansible project (or push to GitHub) and run it with the generated setup guide." },
];

export default function HowItWorks() {
  return (
    <section id="how" className="border-y border-white/5 bg-white/[0.02] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Three steps to a runnable project</h2>
          <p className="mt-4 text-slate-400">No prior Ansible expertise required.</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ y: 24, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative panel p-7"
            >
              <span className="font-mono text-4xl font-bold text-brand/40">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
