import { memo } from "react";
import { UI_COPY } from "@/lib/constants/ui-copy";

/**
 * Top bar with product title and jurisdiction scope.
 */
function ChatHeaderComponent() {
  return (
    <header className="shrink-0 border-b border-legal-border bg-legal-navy-light px-4 py-4 pl-14 sm:px-6 sm:pl-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-1">
        <h1 className="text-lg font-semibold tracking-tight text-slate-100 sm:text-xl">
          {UI_COPY.headerTitle}
        </h1>
        <p className="text-sm text-legal-slate">{UI_COPY.headerSubtitle}</p>
      </div>
    </header>
  );
}

const ChatHeader = memo(ChatHeaderComponent);
ChatHeader.displayName = "ChatHeader";

export default ChatHeader;
