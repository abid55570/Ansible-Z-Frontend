import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import UserMenu from "@/components/dashboard/UserMenu";

describe("UserMenu", () => {
  it("shows the email and calls onLogout when clicked", () => {
    const onLogout = vi.fn();
    render(<UserMenu email="u@x.com" onLogout={onLogout} />);

    expect(screen.getByText("u@x.com")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Log out"));
    expect(onLogout).toHaveBeenCalled();
  });
});
