"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const SHOTS = [
  { slug: "kong-ecs-microservices", name: "Kong + ECS Microservices" },
  { slug: "web-3tier", name: "Secure 3-Tier Web App" },
  { slug: "pci-cde-enclave", name: "PCI CDE Enclave" },
];

export default function ProductPreview() {
  const [active, setActive] = useState(0);

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-white md:text-4xl">See exactly what you ship</h2>
        <p className="mt-4 text-slate-400">
          Every template renders a clean architecture diagram <em>and</em> a complete, runnable Ansible project —
          so you know exactly what you&apos;re deploying before you run a single command.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {SHOTS.map((s, i) => (
          <button
            key={s.slug}
            onClick={() => setActive(i)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              active === i ? "bg-brand text-white" : "border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-panel/60 shadow-2xl shadow-brand/10"
      >
        <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/40 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-3 truncate font-mono text-xs text-slate-500">
            ansible-z · {SHOTS[active].slug} · architecture
          </span>
        </div>
        <div className="bg-white p-4 sm:p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/showcase/${SHOTS[active].slug}.png`}
            alt={`${SHOTS[active].name} architecture diagram`}
            className="mx-auto max-h-[540px] w-auto object-contain"
          />
        </div>
      </motion.div>
    </section>
  );
}
