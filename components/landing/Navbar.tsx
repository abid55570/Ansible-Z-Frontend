"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Boxes } from "lucide-react";

const LINKS = [
  { label: "Templates", href: "#templates" },
  { label: "How it works", href: "#how" },
  { label: "Benefits", href: "#benefits" },
];

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <nav className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-panel/60 px-5 py-3 backdrop-blur">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <Boxes className="h-5 w-5 text-brand" />
          Ansible-Z
        </Link>
        <div className="hidden items-center gap-8 text-sm md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-slate-400 transition hover:text-white">
              {l.label}
            </a>
          ))}
        </div>
        <Link
          href="/login"
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-slate-200"
        >
          Sign in
        </Link>
      </nav>
    </motion.header>
  );
}
