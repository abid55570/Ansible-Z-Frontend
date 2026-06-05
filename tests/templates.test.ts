import { describe, expect, it } from "vitest";
import { TEMPLATES, PCI_LABEL } from "@/lib/templates";

describe("templates catalogue", () => {
  it("exposes the full catalogue", () => {
    expect(TEMPLATES).toHaveLength(21);
  });

  it("includes the starter tier", () => {
    const starters = TEMPLATES.filter((t) => t.tier === "starter").map((t) => t.slug);
    expect(starters).toEqual(["single-vm-app", "simple-static-site", "basic-secure-vpc"]);
  });

  it("has unique slugs", () => {
    const slugs = TEMPLATES.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("includes the productised VietPay pattern and the PCI enclave", () => {
    const slugs = TEMPLATES.map((t) => t.slug);
    expect(slugs).toContain("vietpay-bastion-alb");
    expect(slugs).toContain("pci-cde-enclave");
  });

  it("only uses known PCI levels, each with a label", () => {
    for (const t of TEMPLATES) {
      expect(PCI_LABEL[t.pci]).toBeTruthy();
    }
  });

  it("every template has a non-empty summary", () => {
    for (const t of TEMPLATES) {
      expect(t.summary.length).toBeGreaterThan(10);
    }
  });
});
