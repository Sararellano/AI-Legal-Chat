"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createMessageId } from "@/lib/chat/create-message-id";
import { streamChatCompletion } from "@/lib/chat/stream-chat";
import { CONVERSATIONS_API_PATH } from "@/lib/constants";
import { UI_COPY } from "@/lib/constants/ui-copy";
import type {
  ApiChatMessage,
  ChatMessage,
  ConversationSummary,
  FeedbackRating,
} from "@/lib/types";

/** Return type of {@link useChat} — chat state and actions for the shell UI. */
export interface UseChatReturn {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  isStreaming: boolean;
  streamingAssistantId: string | null;
  error: string | null;
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  isLoadingConversations: boolean;
  sendMessage: (text: string) => Promise<void>;
  stopStreaming: () => void;
  selectConversation: (id: string) => Promise<void>;
  startNewConversation: () => void;
  submitFeedback: (
    messageId: string,
    rating: FeedbackRating,
  ) => Promise<void>;
  feedbackByMessageId: Record<string, FeedbackRating>;
}

/**
 * Encapsulates chat state, Supabase-backed persistence, and OpenAI streaming.
 */
export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingAssistantId, setStreamingAssistantId] = useState<
    string | null
  >(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [feedbackByMessageId, setFeedbackByMessageId] = useState<
    Record<string, FeedbackRating>
  >({});
  const abortRef = useRef<AbortController | null>(null);
  const assistantIdRef = useRef<string | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch(CONVERSATIONS_API_PATH);
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as {
        conversations: ConversationSummary[];
      };
      setConversations(data.conversations ?? []);
    } catch {
      /* non-fatal */
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const selectConversation = useCallback(async (id: string) => {
    setError(null);
    setActiveConversationId(id);
    setFeedbackByMessageId({});

    try {
      const response = await fetch(`${CONVERSATIONS_API_PATH}?id=${id}`);
      if (!response.ok) {
        setError(UI_COPY.loadConversationFailed);
        return;
      }

      const data = (await response.json()) as {
        messages?: { id: string; role: "user" | "assistant"; content: string }[];
      };

      setMessages(
        (data.messages ?? []).map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        })),
      );
    } catch {
      setError(UI_COPY.loadConversationFailed);
    }
  }, []);

  const startNewConversation = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setFeedbackByMessageId({});
    setError(null);
  }, []);

  const submitFeedback = useCallback(
    async (messageId: string, rating: FeedbackRating) => {
      try {
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId, rating }),
        });
        if (response.ok) {
          setFeedbackByMessageId((prev) => ({ ...prev, [messageId]: rating }));
        }
      } catch {
        /* non-fatal */
      }
    },
    [],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) {
        return;
      }

      setError(null);
      setInput("");

      const tempUserId = createMessageId();
      const tempAssistantId = createMessageId();
      assistantIdRef.current = tempAssistantId;

      const userMessage: ChatMessage = {
        id: tempUserId,
        role: "user",
        content: trimmed,
      };
      const assistantMessage: ChatMessage = {
        id: tempAssistantId,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);
      setStreamingAssistantId(tempAssistantId);

      const apiMessages: ApiChatMessage[] = [
        ...messages.map(({ role, content }) => ({ role, content })),
        { role: "user", content: trimmed },
      ];

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamChatCompletion({
          messages: apiMessages,
          conversationId: activeConversationId,
          signal: controller.signal,
          onMeta: (meta) => {
            if (meta.conversationId) {
              setActiveConversationId(meta.conversationId);
            }
            if (meta.userMessageId) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempUserId ? { ...m, id: meta.userMessageId! } : m,
                ),
              );
            }
            if (meta.assistantMessageId) {
              assistantIdRef.current = meta.assistantMessageId;
              setStreamingAssistantId(meta.assistantMessageId);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempAssistantId
                    ? { ...m, id: meta.assistantMessageId! }
                    : m,
                ),
              );
            }
          },
          onToken: (token) => {
            const targetId = assistantIdRef.current;
            if (!targetId) {
              return;
            }
            setMessages((prev) =>
              prev.map((message) =>
                message.id === targetId
                  ? { ...message, content: message.content + token }
                  : message,
              ),
            );
          },
        });

        void loadConversations();
      } catch (err) {
        const targetId = assistantIdRef.current ?? tempAssistantId;
        if (err instanceof Error && err.name === "AbortError") {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === targetId && !message.content
                ? { ...message, content: UI_COPY.interrupted }
                : message,
            ),
          );
        } else {
          const errMsg =
            err instanceof Error ? err.message : UI_COPY.requestFailed;
          setError(errMsg);
          setMessages((prev) =>
            prev.filter(
              (message) =>
                message.id !== targetId && message.id !== tempUserId,
            ),
          );
        }
      } finally {
        setIsStreaming(false);
        setStreamingAssistantId(null);
        assistantIdRef.current = null;
        abortRef.current = null;
      }
    },
    [isStreaming, messages, activeConversationId, loadConversations],
  );

  return {
    messages,
    input,
    setInput,
    isStreaming,
    streamingAssistantId,
    error,
    conversations,
    activeConversationId,
    isLoadingConversations,
    sendMessage,
    stopStreaming,
    selectConversation,
    startNewConversation,
    submitFeedback,
    feedbackByMessageId,
  };
}
