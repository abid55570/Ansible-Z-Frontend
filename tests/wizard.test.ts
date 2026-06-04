import { describe, expect, it } from "vitest";
import { initialConfig, isRequiredInEnv, missingRequired, type Variables } from "@/lib/wizard";

const vars: Variables = {
  project_name: { required: true },
  vpc_cidr: { required: true, default: "10.0.0.0/16" },
  office_ip: { required: true, scope: ["uat", "prod"] },
  certificate_arn: { required: false, scope: ["uat", "prod"] },
  note: {},
};

describe("isRequiredInEnv", () => {
  it("unscoped required vars are required in every env", () => {
    expect(isRequiredInEnv(vars.project_name, "local")).toBe(true);
    expect(isRequiredInEnv(vars.project_name, "prod")).toBe(true);
  });

  it("scoped vars are only required inside their scope", () => {
    expect(isRequiredInEnv(vars.office_ip, "local")).toBe(false);
    expect(isRequiredInEnv(vars.office_ip, "uat")).toBe(true);
  });

  it("non-required vars are never required", () => {
    expect(isRequiredInEnv(vars.certificate_arn, "uat")).toBe(false);
    expect(isRequiredInEnv(vars.note, "uat")).toBe(false);
  });
});

describe("initialConfig", () => {
  it("pre-fills declared defaults and blanks the rest", () => {
    const config = initialConfig(vars);
    expect(config.vpc_cidr).toBe("10.0.0.0/16");
    expect(config.project_name).toBe("");
  });
});

describe("missingRequired", () => {
  it("ignores scoped vars in local", () => {
    const missing = missingRequired(vars, initialConfig(vars), "local");
    expect(missing).toContain("project_name");
    expect(missing).not.toContain("office_ip");
  });

  it("treats absent config keys as missing", () => {
    expect(missingRequired(vars, {}, "local")).toContain("project_name");
  });

  it("requires office_ip in uat", () => {
    const config = { ...initialConfig(vars), project_name: "x" };
    expect(missingRequired(vars, config, "uat")).toContain("office_ip");
  });

  it("returns empty when all required fields are filled", () => {
    const config = {
      project_name: "x",
      vpc_cidr: "10.0.0.0/16",
      office_ip: "1.2.3.4/32",
      certificate_arn: "",
      note: "",
    };
    expect(missingRequired(vars, config, "uat")).toEqual([]);
  });
});
