import { streamChatCompletion } from "@/lib/chat/stream-chat";

describe("streamChatCompletion", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("streams tokens and meta events", async () => {
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'data: {"type":"meta","conversationId":"c1","userMessageId":"u1","assistantMessageId":"a1"}\n\n',
          ),
        );
        controller.enqueue(encoder.encode('data: {"text":"Hi"}\n\n'));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: { getReader: () => body.getReader() },
    }) as typeof fetch;

    const tokens: string[] = [];
    let meta: { conversationId?: string } = {};

    await streamChatCompletion({
      conversationId: null,
      messages: [{ role: "user", content: "Test" }],
      onToken: (text) => tokens.push(text),
      onMeta: (m) => {
        meta = m;
      },
    });

    expect(tokens).toEqual(["Hi"]);
    expect(meta.conversationId).toBe("c1");
  });
});
