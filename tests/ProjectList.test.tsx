import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectList from "@/components/dashboard/ProjectList";

describe("ProjectList", () => {
  it("shows an empty state when there are no projects", () => {
    render(<ProjectList projects={[]} />);
    expect(screen.getByText(/No projects yet/)).toBeInTheDocument();
  });

  it("lists projects with an open link", () => {
    render(<ProjectList projects={[{ id: 1, name: "My App", template_slug: "web-3tier", config: {} }]} />);
    expect(screen.getByText("My App")).toBeInTheDocument();
    expect(screen.getByText("Open")).toHaveAttribute("href", "/templates/web-3tier");
  });
});
