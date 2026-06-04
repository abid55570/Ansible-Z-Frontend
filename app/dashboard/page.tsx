"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Boxes } from "lucide-react";
import { api, type Project, type TemplateSummary } from "@/lib/api";
import TemplateGrid from "@/components/dashboard/TemplateGrid";
import ProjectList from "@/components/dashboard/ProjectList";
import UserMenu from "@/components/dashboard/UserMenu";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await api.me();
        const [tpls, projs] = await Promise.all([api.templates(), api.projects()]);
        if (!active) return;
        setEmail(me.email);
        setTemplates(tpls);
        setProjects(projs);
      } catch {
        router.push("/login");
        return;
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // ignore — clear client state regardless
    }
    router.push("/");
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-white/10 bg-panel/50 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-white">
            <Boxes className="h-5 w-5 text-brand" /> Ansible-Z
          </Link>
          {email && <UserMenu email={email} onLogout={handleLogout} />}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : (
          <>
            <section>
              <h1 className="text-xl font-bold text-white">Your projects</h1>
              <div className="mt-4">
                <ProjectList projects={projects} />
              </div>
            </section>

            <section className="mt-12">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Start a new project</h2>
                  <p className="mt-1 text-slate-400">Pick a template, or design your own architecture from scratch.</p>
                </div>
                <Link
                  href="/designer"
                  className="shrink-0 rounded-lg border border-brand/40 bg-brand/10 px-4 py-2 text-sm font-medium text-brand-400 transition hover:bg-brand/20"
                >
                  Design your own →
                </Link>
              </div>
              <div className="mt-6">
                <TemplateGrid templates={templates} />
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
