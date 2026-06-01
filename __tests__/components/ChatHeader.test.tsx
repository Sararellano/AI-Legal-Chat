import { render } from "@testing-library/react";
import ChatHeader from "@/components/ChatHeader";

describe("ChatHeader", () => {
  it("matches snapshot", () => {
    const { container } = render(<ChatHeader />);
    expect(container).toMatchSnapshot();
  });

  it("renders the main heading", () => {
    const { getByRole } = render(<ChatHeader />);
    expect(getByRole("heading", { level: 1 })).toHaveTextContent(
      "Asistente laboral",
    );
  });
});
