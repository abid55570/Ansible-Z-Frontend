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
  });
});
