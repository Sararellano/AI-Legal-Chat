import { render } from "@testing-library/react";
import LegalDisclaimer from "@/components/LegalDisclaimer";

describe("LegalDisclaimer", () => {
  it("matches snapshot (default)", () => {
    const { container } = render(<LegalDisclaimer />);
    expect(container).toMatchSnapshot();
  });

  it("matches snapshot (compact)", () => {
    const { container } = render(<LegalDisclaimer compact />);
    expect(container).toMatchSnapshot();
  });

  it("exposes role=note for accessibility", () => {
    const { getByRole } = render(<LegalDisclaimer />);
    expect(getByRole("note")).toBeInTheDocument();
  });
});
