"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Boxes, Download, GitFork, Loader2 } from "lucide-react";
import { api, ApiError, type TemplateDetail } from "@/lib/api";
import { initialConfig, missingRequired } from "@/lib/wizard";
import { diagramToIR } from "@/lib/designer";
import VariableField from "@/components/wizard/VariableField";

const DiagramView = dynamic(() => import("@/components/designer/DiagramView"), { ssr: false });

const ENVS = ["local", "uat", "prod"];

type Status = "loading" | "idle" | "generating" | "done" | "error";

export default function WizardPage() {
  const params = useParams<{ slug: string }>();
  const slug = String(params.slug);
  const router = useRouter();

  const [tpl, setTpl] = useState<TemplateDetail | null>(null);
  const [env, setEnv] = useState("uat");
  const [config, setConfig] = useState<Record<string, string>>({});
  const [invalid, setInvalid] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .template(slug)
      .then((t) => {
        setTpl(t);
        setConfig(initialConfig(t.variables));
        setStatus("idle");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Could not load this template. Is the API running on :8000?");
      });
  }, [slug]);

  function setField(name: string, value: string) {
    setConfig((c) => ({ ...c, [name]: value }));
  }

  function forkToCanvas() {
    if (!tpl?.diagram) return;
    const ir = diagramToIR(tpl.diagram, { region: config.aws_region || "ap-south-1", name: tpl.slug });
    sessionStorage.setItem("az-fork", JSON.stringify(ir));
    router.push("/designer");
  }

  async function handleGenerate() {
    if (!tpl) return;
    const missing = missingRequired(tpl.variables, config, env);
    setInvalid(missing);
    if (missing.length > 0) return;

    setStatus("generating");
    setMessage("");
    try {
      const project = await api.createProject({ name: `${tpl.name} (${env})`, template_slug: tpl.slug, config });
      await api.generate(project.id, env);
      window.location.href = api.downloadUrl(project.id, env);
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setMessage(
        e instanceof ApiError && e.status === 401
          ? "Please sign in with Google first."
          : "Generation failed. Check the API logs.",
      );
    }
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-white/10 bg-panel/50 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/" className="flex items-center gap-2 font-semibold text-white">
            <Boxes className="h-5 w-5 text-brand" /> Ansible-Z
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        {status === "loading" && <p className="text-slate-400">Loading template…</p>}

        {tpl && (
          <>
            <h1 className="text-2xl font-bold text-white">{tpl.name}</h1>
            <p className="mt-1 text-slate-400">{tpl.summary}</p>

            {tpl.diagram && (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-300">Architecture</h2>
                  <button
                    onClick={forkToCanvas}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand/40 bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand-400 transition hover:bg-brand/20"
                  >
                    <GitFork className="h-3.5 w-3.5" /> Fork to canvas
                  </button>
                </div>
                <DiagramView diagram={tpl.diagram} />
              </div>
            )}

            {!tpl.ready ? (
              <div className="panel mt-8 p-6 text-slate-300">
                This template is in the catalogue but not generatable yet. <code>{tpl.slug}</code> is coming soon.
              </div>
            ) : (
              <>
                <div className="mt-8 flex gap-2">
                  {ENVS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEnv(e)}
                      className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                        env === e ? "bg-brand text-white" : "border border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>

                <div className="mt-6 grid gap-4">
                  {Object.entries(tpl.variables).map(([name, spec]) => (
                    <VariableField
                      key={name}
                      name={name}
                      spec={spec}
                      env={env}
                      value={config[name] ?? ""}
                      invalid={invalid.includes(name)}
                      onChange={setField}
                    />
                  ))}
                </div>

                {invalid.length > 0 && (
                  <p className="mt-4 text-sm text-rose-400">Fill the required fields: {invalid.join(", ")}</p>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={status === "generating"}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-medium text-white transition hover:bg-brand-600 disabled:opacity-60"
                >
                  {status === "generating" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Generate &amp; download ({env})
                </button>

                <p className="mt-3 text-xs text-slate-500">
                  Exports a complete project: <code>site.yml</code> to provision, plus a Day-2 layer
                  (<code>apps.yml</code> / <code>deploy.yml</code>) to deploy and update your apps.
                </p>
              </>
            )}

            {status === "done" && (
              <div className="panel mt-6 p-5">
                <p className="text-sm font-medium text-accent">✅ Your project is downloading.</p>
                <div className="mt-3 border-t border-white/10 pt-3 text-sm text-slate-300">
                  <p className="font-semibold text-white">Includes a Day-2 deploy layer</p>
                  <p className="mt-1 text-slate-400">
                    Beyond <code>site.yml</code> (provision), the zip ships <code>apps.yml</code>,{" "}
                    <code>deploy.yml</code> and <code>rollback.yml</code>. Declare your apps in{" "}
                    <code>apps.yml</code>, then provision and deploy:
                  </p>
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-black/40 p-3 text-xs leading-relaxed text-slate-200">
                    ansible-playbook site.yml{"      "}# provision the infrastructure{"\n"}
                    ansible-playbook deploy.yml{"    "}# deploy / update your apps (see DAY2.md)
                  </pre>
                </div>
              </div>
            )}
            {status === "error" && <p className="mt-4 text-sm text-rose-400">{message}</p>}
          </>
        )}
      </div>
    </main>
  );
}
