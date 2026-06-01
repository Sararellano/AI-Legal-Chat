/**
 * Creates a stable unique id for chat messages (client-side only).
 * @returns UUID string
 */
export function createMessageId(): string {
  return crypto.randomUUID();
}
