import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import TemplateGrid from "@/components/dashboard/TemplateGrid";

describe("TemplateGrid", () => {
  it("links ready templates and locks the unready ones", () => {
    render(
      <TemplateGrid
        templates={[
          { slug: "web-3tier", name: "Web 3-Tier", pci: "capable", summary: "s", ready: true },
          { slug: "k8s", name: "K8s", pci: "weird", summary: "s2", ready: false },
        ]}
      />,
    );

    expect(screen.getByText("Use template")).toBeInTheDocument();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
    expect(screen.getByLabelText("Use Web 3-Tier")).toHaveAttribute("href", "/templates/web-3tier");
    expect(screen.getByText("PCI · capable")).toBeInTheDocument();
    expect(screen.getByText("weird")).toBeInTheDocument(); // unknown pci -> raw fallback
    // with no starter templates there is no tier heading
    expect(screen.queryByRole("heading", { name: /Enterprise/ })).toBeNull();
  });

  it("splits starter and enterprise tiers under headings", () => {
    render(
      <TemplateGrid
        templates={[
          { slug: "single-vm-app", name: "Single VM", pci: "none", tier: "starter", summary: "s", ready: true },
          { slug: "web-3tier", name: "Web 3-Tier", pci: "capable", tier: "enterprise", summary: "s2", ready: true },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: /Starter/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Enterprise/ })).toBeInTheDocument();
    expect(screen.getByLabelText("Use Single VM")).toHaveAttribute("href", "/templates/single-vm-app");
    expect(screen.getByLabelText("Use Web 3-Tier")).toHaveAttribute("href", "/templates/web-3tier");
  });
});
