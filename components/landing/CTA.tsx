"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-28 text-center">
      <motion.h2
        initial={{ y: 24, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-white md:text-5xl"
      >
        Your next environment is <span className="gradient-text">one template away</span>
      </motion.h2>
      <p className="mx-auto mt-5 max-w-xl text-slate-400">
        Sign in with Google and export your first production-grade Ansible project in minutes.
      </p>
      <Link
        href="/login"
        className="mt-9 inline-flex items-center gap-2 rounded-xl bg-brand px-7 py-3.5 font-medium text-white transition hover:bg-brand-600 glow"
      >
        Get started free
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
