"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MessageFeedback from "@/components/MessageFeedback";
import { UI_COPY } from "@/lib/constants/ui-copy";
import { cn } from "@/lib/utils";
import type { ChatMessage, FeedbackRating } from "@/lib/types";

export interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
  feedbackRating?: FeedbackRating;
  onFeedback?: (messageId: string, rating: FeedbackRating) => void;
  showFeedback?: boolean;
}

/**
 * Single chat turn — user plain text, assistant rendered as Markdown.
 */
function MessageBubbleComponent({
  message,
  isStreaming,
  feedbackRating,
  onFeedback,
  showFeedback,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const canShowFeedback =
    showFeedback &&
    !isUser &&
    !isStreaming &&
    message.content.length > 0 &&
    onFeedback;

  return (
    <article
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
      aria-label={isUser ? "Your message" : "Assistant message"}
    >
      <div
        className={cn(
          "max-w-[min(100%,42rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:text-[0.9375rem]",
          isUser
            ? "bg-slate-600/90 text-slate-50"
            : "border border-legal-border bg-legal-surface text-slate-100",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <>
            <div className="prose-legal">
              {message.content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              ) : isStreaming ? (
                <span className="text-legal-slate" aria-live="polite">
                  {UI_COPY.typing}
                </span>
              ) : null}
            </div>
            {canShowFeedback ? (
              <MessageFeedback
                messageId={message.id}
                currentRating={feedbackRating}
                onSubmit={onFeedback}
              />
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}

const MessageBubble = memo(MessageBubbleComponent);
MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
