import type { ApiChatMessage } from "@/lib/types";

/**
 * Type guard for the chat API request body messages array.
 * @param value - Unknown JSON value from request body
 */
export function isValidChatMessages(value: unknown): value is ApiChatMessage[] {
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }

  return value.every(
    (message) =>
      message !== null &&
      typeof message === "object" &&
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string" &&
      message.content.trim().length > 0,
  );
}
