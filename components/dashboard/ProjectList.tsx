"use client";

import Link from "next/link";
import type { Project } from "@/lib/api";

export default function ProjectList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return <p className="text-sm text-slate-500">No projects yet — pick a template below to create your first.</p>;
  }

  return (
    <ul className="divide-y divide-white/5 rounded-xl border border-white/10">
      {projects.map((p) => (
        <li key={p.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="font-medium text-white">{p.name}</p>
            <code className="text-xs text-slate-500">{p.template_slug}</code>
          </div>
          <Link href={`/templates/${p.template_slug}`} className="text-sm text-brand-400 hover:underline">
            Open
          </Link>
        </li>
      ))}
    </ul>
  );
}
