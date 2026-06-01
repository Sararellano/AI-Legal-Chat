import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Accessible textarea primitive for the chat composer (shadcn/ui pattern).
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[2.75rem] w-full resize-none rounded-xl border border-legal-border bg-legal-surface px-4 py-3 text-sm text-slate-100 placeholder:text-legal-slate focus-visible:border-blue-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-800 disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
