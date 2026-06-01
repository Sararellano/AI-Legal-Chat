"use client";

import { memo, useEffect, useRef } from "react";
import MessageBubble from "@/components/MessageBubble";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import SuggestedPrompts from "@/components/SuggestedPrompts";
import { UI_COPY } from "@/lib/constants/ui-copy";
import type { ChatMessage, FeedbackRating } from "@/lib/types";

export interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingAssistantId: string | null;
  onSuggestedSelect: (prompt: string) => void;
  disabled?: boolean;
  feedbackByMessageId?: Record<string, FeedbackRating>;
  onFeedback?: (messageId: string, rating: FeedbackRating) => void;
}

/**
 * Scrollable message column with empty state and auto-scroll to latest message.
 */
function MessageListComponent({
  messages,
  isStreaming,
  streamingAssistantId,
  onSuggestedSelect,
  disabled,
  feedbackByMessageId = {},
  onFeedback,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isEmpty = messages.length === 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  return (
    <section
      className="flex-1 overflow-y-auto px-4 py-6 sm:px-6"
      aria-label="Conversation"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {isEmpty ? (
          <div className="flex flex-col items-center gap-6 pt-8 sm:pt-16">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold text-slate-100">
                {UI_COPY.emptyTitle}
              </h2>
              <p className="max-w-md text-sm text-legal-slate">
                {UI_COPY.emptyDescription}
              </p>
            </div>
            <LegalDisclaimer />
            <SuggestedPrompts
              onSelect={onSuggestedSelect}
              disabled={disabled}
            />
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isStreaming={
                isStreaming &&
                message.id === streamingAssistantId &&
                !message.content
              }
              feedbackRating={feedbackByMessageId[message.id]}
              onFeedback={onFeedback}
              showFeedback={message.role === "assistant"}
            />
          ))
        )}
        <div ref={bottomRef} aria-hidden="true" />
      </div>
    </section>
  );
}

const MessageList = memo(MessageListComponent);
MessageList.displayName = "MessageList";

export default MessageList;
