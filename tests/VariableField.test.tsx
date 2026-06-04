import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import VariableField from "@/components/wizard/VariableField";

describe("VariableField", () => {
  it("shows guidance and marks a scoped-required field in uat", () => {
    render(
      <VariableField
        name="office_ip"
        spec={{
          required: true,
          scope: ["uat"],
          type: "cidr",
          guidance: { what: "Your office IP", how_to_get: "curl checkip", uat_check: "ssh test" },
        }}
        env="uat"
        value=""
        invalid={false}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("office_ip")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByText(/Your office IP/)).toBeInTheDocument();
    expect(screen.getByText(/curl checkip/)).toBeInTheDocument();
    expect(screen.getByText(/ssh test/)).toBeInTheDocument();
  });

  it("emits changes via onChange", () => {
    const onChange = vi.fn();
    render(
      <VariableField name="project_name" spec={{ required: true }} env="local" value="" invalid={false} onChange={onChange} />,
    );
    fireEvent.change(screen.getByLabelText(/project_name/), { target: { value: "vietpay" } });
    expect(onChange).toHaveBeenCalledWith("project_name", "vietpay");
  });

  it("omits the required marker for optional fields and reflects the invalid state", () => {
    render(
      <VariableField name="certificate_arn" spec={{ required: false }} env="uat" value="x" invalid={true} onChange={() => {}} />,
    );
    expect(screen.getByText("certificate_arn")).toBeInTheDocument();
    expect(screen.queryByText("*")).toBeNull();
  });
});
