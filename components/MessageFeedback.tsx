"use client";

import { memo, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UI_COPY } from "@/lib/constants/ui-copy";
import { cn } from "@/lib/utils";
import type { FeedbackRating } from "@/lib/types";

export interface MessageFeedbackProps {
  messageId: string;
  currentRating?: FeedbackRating;
  onSubmit: (messageId: string, rating: FeedbackRating) => void;
  disabled?: boolean;
}

/**
 * Thumbs up/down feedback controls for assistant messages.
 */
function MessageFeedbackComponent({
  messageId,
  currentRating,
  onSubmit,
  disabled,
}: MessageFeedbackProps) {
  const [pending, setPending] = useState(false);

  const handleClick = async (rating: FeedbackRating) => {
    if (disabled || pending || currentRating) {
      return;
    }
    setPending(true);
    try {
      onSubmit(messageId, rating);
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      className="mt-2 flex items-center gap-1"
      role="group"
      aria-label={UI_COPY.feedbackLabel}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled || pending || !!currentRating}
        aria-pressed={currentRating === "helpful"}
        aria-label={UI_COPY.feedbackHelpful}
        className={cn(
          "h-7 px-2 text-legal-slate hover:text-slate-100",
          currentRating === "helpful" && "text-emerald-400",
        )}
        onClick={() => void handleClick("helpful")}
      >
        <ThumbsUp className="size-3.5" aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled || pending || !!currentRating}
        aria-pressed={currentRating === "not_helpful"}
        aria-label={UI_COPY.feedbackNotHelpful}
        className={cn(
          "h-7 px-2 text-legal-slate hover:text-slate-100",
          currentRating === "not_helpful" && "text-red-400",
        )}
        onClick={() => void handleClick("not_helpful")}
      >
        <ThumbsDown className="size-3.5" aria-hidden />
      </Button>
      {currentRating ? (
        <span className="text-xs text-legal-slate">{UI_COPY.feedbackThanks}</span>
      ) : null}
    </div>
  );
}

const MessageFeedback = memo(MessageFeedbackComponent);
MessageFeedback.displayName = "MessageFeedback";

export default MessageFeedback;
