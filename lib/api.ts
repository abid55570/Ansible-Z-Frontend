import type { Variables } from "@/lib/wizard";
import type { BlockSpec, Diagram } from "@/lib/designer";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new ApiError(res.status, await res.text());
  }
  return (await res.json()) as T;
}

export interface TemplateSummary {
  slug: string;
  name: string;
  pci: string;
  tier?: string;
  summary: string;
  ready: boolean;
}

export interface SecurityGroupRule {
  name: string;
  inbound: string[];
  outbound: string[];
}

export interface TemplateDetail extends TemplateSummary {
  version: string;
  roles: string[];
  variables: Variables;
  diagram?: Diagram | null;
  key_points?: string[];
  security_groups?: SecurityGroupRule[];
}

export interface Project {
  id: number;
  name: string;
  template_slug: string;
  config: Record<string, unknown>;
}

export interface Generation {
  id: number;
  project_id: number;
  env: string;
  lint_status: string;
}

export const api = {
  templates: () => req<TemplateSummary[]>("/templates"),
  template: (slug: string) => req<TemplateDetail>(`/templates/${slug}`),
  me: () => req<{ email: string }>("/auth/me"),
  logout: () => req<{ status: string }>("/auth/logout", { method: "POST" }),
  projects: () => req<Project[]>("/projects"),
  createProject: (body: { name: string; template_slug: string; config: Record<string, unknown> }) =>
    req<Project>("/projects", { method: "POST", body: JSON.stringify(body) }),
  generate: (projectId: number, env: string) =>
    req<Generation>(`/projects/${projectId}/generate`, { method: "POST", body: JSON.stringify({ env }) }),
  downloadUrl: (projectId: number, env: string) =>
    `${BASE}/projects/${projectId}/download?env=${encodeURIComponent(env)}`,
  diagramImageUrl: (slug: string) => `${BASE}/templates/${encodeURIComponent(slug)}/diagram.png`,
  blocks: () => req<Record<string, BlockSpec>>("/designs/blocks"),
  validateDesign: (ir: unknown) =>
    req<{ valid: boolean; errors: string[] }>("/designs/validate", { method: "POST", body: JSON.stringify(ir) }),
};
