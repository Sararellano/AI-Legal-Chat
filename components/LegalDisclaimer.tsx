import { memo } from "react";
import { cn } from "@/lib/utils";
import { UI_COPY } from "@/lib/constants/ui-copy";

export interface LegalDisclaimerProps {
  /** Compact banner style when conversation is active */
  compact?: boolean;
}

/**
 * Persistent legal notice — required for informational legal tools.
 */
function LegalDisclaimerComponent({ compact = false }: LegalDisclaimerProps) {
  return (
    <div
      role="note"
      className={cn(
        compact
          ? "border-b border-legal-border bg-legal-surface/60 px-4 py-2 text-center text-xs text-legal-slate sm:px-6"
          : "mx-auto max-w-2xl rounded-lg border border-legal-border bg-legal-surface/40 px-4 py-3 text-center text-xs leading-relaxed text-legal-slate sm:text-sm",
      )}
    >
      {UI_COPY.disclaimer}
    </div>
  );
}

const LegalDisclaimer = memo(LegalDisclaimerComponent);
LegalDisclaimer.displayName = "LegalDisclaimer";

export default LegalDisclaimer;
