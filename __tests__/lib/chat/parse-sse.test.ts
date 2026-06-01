import { parseSseLine } from "@/lib/chat/parse-sse";

describe("parseSseLine", () => {
  it("returns null for non-data lines", () => {
    expect(parseSseLine("")).toBeNull();
    expect(parseSseLine("event: ping")).toBeNull();
  });

  it("returns done for [DONE] payload", () => {
    expect(parseSseLine("data: [DONE]")).toBe("done");
  });

  it("returns text chunk for valid JSON payload", () => {
    expect(parseSseLine('data: {"text":"Hola"}')).toEqual({ text: "Hola" });
  });

  it("returns meta for stream metadata event", () => {
    expect(
      parseSseLine(
        'data: {"type":"meta","conversationId":"c1","userMessageId":"u1","assistantMessageId":"a1"}',
      ),
    ).toEqual({
      type: "meta",
      conversationId: "c1",
      userMessageId: "u1",
      assistantMessageId: "a1",
    });
  });

  it("returns null for invalid JSON", () => {
    expect(parseSseLine("data: {broken")).toBeNull();
  });

  it("returns null when text field is missing or empty", () => {
    expect(parseSseLine("data: {}")).toBeNull();
    expect(parseSseLine('data: {"text":""}')).toBeNull();
  });
});
