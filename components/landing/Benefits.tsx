"use client";

import { motion } from "framer-motion";
import { Clock, ShieldCheck, BadgeCheck } from "lucide-react";

const STATS = [
  { value: "Weeks → minutes", label: "Time to a working project", icon: Clock },
  { value: "0 hand-written YAML", label: "Composed from tested roles", icon: BadgeCheck },
  { value: "PCI-aware", label: "Secure defaults baked in", icon: ShieldCheck },
];

export default function Benefits() {
  return (
    <section id="benefits" className="mx-auto max-w-6xl px-6 py-24">
      <div className="panel relative overflow-hidden p-10 md:p-14">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-white md:text-4xl">Save weeks of work — and ship it correctly</h2>
            <p className="mt-4 text-slate-400">
              Most infra projects start by copying a half-broken repo and debugging it for days. Ansible-Z hands you a
              clean, validated foundation with a setup guide your whole team can follow — so you spend time on your
              product, not on plumbing.
            </p>
          </div>
          <div className="grid gap-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ x: 24, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5"
              >
                <s.icon className="h-7 w-7 text-accent" />
                <div>
                  <div className="text-xl font-semibold text-white">{s.value}</div>
                  <div className="text-sm text-slate-400">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
