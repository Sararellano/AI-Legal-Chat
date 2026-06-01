"use client";

import { memo, useCallback, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UI_COPY } from "@/lib/constants/ui-copy";

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  error?: string | null;
}

/**
 * Fixed bottom composer — Enter sends, Shift+Enter adds a newline.
 */
function ChatInputComponent({
  value,
  onChange,
  onSubmit,
  onStop,
  isStreaming,
  disabled,
  error,
}: ChatInputProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (!disabled && !isStreaming && value.trim()) {
          onSubmit();
        }
      }
    },
    [disabled, isStreaming, onSubmit, value],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!disabled && !isStreaming && value.trim()) {
        onSubmit();
      }
    },
    [disabled, isStreaming, onSubmit, value],
  );

  const canSend = !disabled && !isStreaming && value.trim().length > 0;

  return (
    <div className="shrink-0 border-t border-legal-border bg-legal-navy-light px-4 py-4 sm:px-6">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-3xl flex-col gap-2"
        aria-label="Send a message"
      >
        {error ? (
          <p
            role="alert"
            className="rounded-md border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200"
          >
            {error}
          </p>
        ) : null}
        <div className="flex items-end gap-2">
          <Textarea
            rows={1}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isStreaming}
            placeholder={UI_COPY.inputPlaceholder}
            aria-label={UI_COPY.inputAriaLabel}
            className="max-h-40"
          />
          {isStreaming ? (
            <Button
              type="button"
              variant="outline"
              onClick={onStop}
              aria-label={UI_COPY.stop}
            >
              {UI_COPY.stop}
            </Button>
          ) : (
            <Button type="submit" disabled={!canSend} aria-label={UI_COPY.send}>
              {UI_COPY.send}
            </Button>
          )}
        </div>
        <p className="text-center text-[0.65rem] text-legal-slate sm:text-xs">
          {UI_COPY.inputHint}
        </p>
      </form>
    </div>
  );
}

const ChatInput = memo(ChatInputComponent);
ChatInput.displayName = "ChatInput";

export default ChatInput;
