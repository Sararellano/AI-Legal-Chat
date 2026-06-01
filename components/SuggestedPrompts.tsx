import { memo } from "react";
import { Button } from "@/components/ui/button";
import { SUGGESTED_PROMPTS } from "@/lib/prompts";

export interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

/**
 * Starter chips shown when the conversation is empty (ChatGPT-style).
 */
function SuggestedPromptsComponent({
  onSelect,
  disabled,
}: SuggestedPromptsProps) {
  return (
    <div
      className="flex flex-wrap justify-center gap-2"
      role="group"
      aria-label="Suggested questions"
    >
      {SUGGESTED_PROMPTS.map((prompt) => (
        <Button
          key={prompt}
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onSelect(prompt)}
          className="h-auto whitespace-normal px-3 py-2 text-left font-normal"
        >
          {prompt}
        </Button>
      ))}
    </div>
  );
}

const SuggestedPrompts = memo(SuggestedPromptsComponent);
SuggestedPrompts.displayName = "SuggestedPrompts";

export default SuggestedPrompts;
