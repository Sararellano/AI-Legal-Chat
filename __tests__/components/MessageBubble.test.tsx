import { render } from "@testing-library/react";
import MessageBubble from "@/components/MessageBubble";

describe("MessageBubble", () => {
  it("matches snapshot for user message", () => {
    const { container } = render(
      <MessageBubble
        message={{ id: "1", role: "user", content: "Hola" }}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it("matches snapshot for assistant markdown", () => {
    const { container } = render(
      <MessageBubble
        message={{
          id: "2",
          role: "assistant",
          content: "**Importante**: consulte a un abogado.",
        }}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
