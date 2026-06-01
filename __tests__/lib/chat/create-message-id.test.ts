import { createMessageId } from "@/lib/chat/create-message-id";

describe("createMessageId", () => {
  it("returns a non-empty UUID string", () => {
    const id = createMessageId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});
