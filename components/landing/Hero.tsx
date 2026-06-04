"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

const fade = (delay = 0) => ({
  initial: { y: 24, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.6, delay },
});

export default function Hero() {
  return (
    <section className="relative isolate pt-40 pb-32">
      <div className="grid-bg absolute inset-0 -z-20" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <HeroScene />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/10 via-ink/40 to-ink" />

      <div className="mx-auto max-w-4xl px-6 text-center">
        <motion.div
          {...fade(0)}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-300"
        >
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Production infrastructure, generated — not hand-written
        </motion.div>

        <motion.h1 {...fade(0.08)} className="text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-7xl">
          Ship <span className="gradient-text">production-ready</span> infrastructure in minutes
        </motion.h1>

        <motion.p {...fade(0.16)} className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          Pick a battle-tested template, fill in guided variables, and export a complete, lint-clean Ansible project —
          with a setup guide written for your team. From weeks of YAML to a few clicks.
        </motion.p>

        <motion.div {...fade(0.24)} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-medium text-white transition hover:bg-brand-600 glow"
          >
            Start building free
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
          <a
            href="#templates"
            className="rounded-xl border border-white/15 px-6 py-3 font-medium text-slate-200 transition hover:bg-white/5"
          >
            Explore 11 templates
          </a>
        </motion.div>

        <motion.p {...fade(0.32)} className="mt-6 text-xs text-slate-500">
          Google sign-in · No credit card · Export to GitHub
        </motion.p>
      </div>
    </section>
  );
}
