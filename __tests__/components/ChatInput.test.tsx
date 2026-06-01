import { fireEvent, render, screen } from "@testing-library/react";
import ChatInput from "@/components/ChatInput";

describe("ChatInput", () => {
  const defaultProps = {
    value: "",
    onChange: jest.fn(),
    onSubmit: jest.fn(),
    onStop: jest.fn(),
    isStreaming: false,
  };

  it("matches snapshot", () => {
    const { container } = render(<ChatInput {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it("calls onSubmit when Enter is pressed", () => {
    const onSubmit = jest.fn();
    render(
      <ChatInput {...defaultProps} value="Hola" onSubmit={onSubmit} />,
    );

    const textarea = screen.getByLabelText("Mensaje");
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect(onSubmit).toHaveBeenCalled();
  });

  it("shows stop button while streaming", () => {
    render(<ChatInput {...defaultProps} isStreaming />);
    expect(screen.getByRole("button", { name: "Detener" })).toBeInTheDocument();
  });
});
