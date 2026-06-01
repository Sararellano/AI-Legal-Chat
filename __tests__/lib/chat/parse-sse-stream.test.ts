import { consumeSseStream } from "@/lib/chat/parse-sse";

function createStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream({
    pull(controller) {
      if (index >= chunks.length) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(chunks[index]));
      index += 1;
    },
  });
}

describe("consumeSseStream", () => {
  it("invokes onToken for each text chunk until DONE", async () => {
    const tokens: string[] = [];
    const stream = createStream([
      'data: {"text":"A"}\n\n',
      "data: [DONE]\n\n",
    ]);
    const reader = stream.getReader();

    await consumeSseStream(reader, (text) => tokens.push(text));

    expect(tokens).toEqual(["A"]);
  });

  it("concatenates multiple tokens from separate lines", async () => {
    const tokens: string[] = [];
    const stream = createStream([
      'data: {"text":"Hello"}\n\n',
      'data: {"text":" world"}\n\n',
      "data: [DONE]\n\n",
    ]);

    await consumeSseStream(stream.getReader(), (text) => tokens.push(text));

    expect(tokens).toEqual(["Hello", " world"]);
  });
});
