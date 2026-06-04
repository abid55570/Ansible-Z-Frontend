"use client";

import { motion } from "framer-motion";
import { LayoutTemplate, ListChecks, ShieldCheck, GitBranch, Boxes, TerminalSquare } from "lucide-react";

const FEATURES = [
  { icon: LayoutTemplate, title: "Template-based", body: "Start from 11 real architectures — 3-tier, EKS, PCI enclave, serverless and more." },
  { icon: ListChecks, title: "Guided variables", body: "Every input explains what it is and how to get it — with per-environment scoping." },
  { icon: TerminalSquare, title: "Runs flawlessly", body: "Exports pass yamllint + ansible-lint + --syntax-check before you ever download." },
  { icon: ShieldCheck, title: "Secure by default", body: "No committed keys, secrets via vault, one clean env switch. PCI-aware blueprints." },
  { icon: Boxes, title: "Local → UAT → Prod", body: "Generated setup guide tells your team exactly how to run it on every environment." },
  { icon: GitBranch, title: "Export to GitHub", body: "Download a zip or push a brand-new repo with CI already wired up." },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-white md:text-4xl">Everything an Ansible project needs — done for you</h2>
        <p className="mt-4 text-slate-400">Stop copy-pasting playbooks and debugging YAML. Generate correct, secure infrastructure projects.</p>
      </div>
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="panel p-6"
          >
            <f.icon className="h-6 w-6 text-brand-400" />
            <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{f.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
