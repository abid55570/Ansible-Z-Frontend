export interface VarSpec {
  type?: string;
  required?: boolean;
  scope?: string[];
  default?: unknown;
  example?: string;
  guidance?: Record<string, string>;
}

export type Variables = Record<string, VarSpec>;

/** Mirrors the backend rule: a var is required if `required` and it applies to `env`. */
export function isRequiredInEnv(spec: VarSpec, env: string): boolean {
  if (!spec.required) return false;
  if (!spec.scope || spec.scope.length === 0) return true;
  return spec.scope.includes(env);
}

/** Seed a config object from the schema, pre-filling any declared defaults. */
export function initialConfig(variables: Variables): Record<string, string> {
  const config: Record<string, string> = {};
  for (const [name, spec] of Object.entries(variables)) {
    config[name] = spec.default != null ? String(spec.default) : "";
  }
  return config;
}

/** Names of variables that are required for `env` but missing/blank in `config`. */
export function missingRequired(
  variables: Variables,
  config: Record<string, string>,
  env: string,
): string[] {
  return Object.entries(variables)
    .filter(([name, spec]) => isRequiredInEnv(spec, env) && !(config[name] ?? "").trim())
    .map(([name]) => name);
}
