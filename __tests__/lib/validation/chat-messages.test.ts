import { isValidChatMessages } from "@/lib/validation/chat-messages";

describe("isValidChatMessages", () => {
  it("rejects non-arrays and empty arrays", () => {
    expect(isValidChatMessages(null)).toBe(false);
    expect(isValidChatMessages({})).toBe(false);
    expect(isValidChatMessages([])).toBe(false);
  });

  it("accepts valid user and assistant messages", () => {
    expect(
      isValidChatMessages([
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi" },
      ]),
    ).toBe(true);
  });

  it("rejects invalid roles and blank content", () => {
    expect(isValidChatMessages([{ role: "system", content: "x" }])).toBe(false);
    expect(isValidChatMessages([{ role: "user", content: "   " }])).toBe(
      false,
    );
  });
});
