"use client";

import dynamic from "next/dynamic";
import { ChatErrorBoundary } from "@/components/ChatErrorBoundary";

const ChatShell = dynamic(() => import("@/components/ChatShell"), {
  loading: () => (
    <div
      className="flex h-dvh items-center justify-center bg-legal-navy text-sm text-legal-slate"
      role="status"
      aria-live="polite"
    >
      Loading assistant…
    </div>
  ),
  ssr: false,
});

/**
 * Client entry that lazy-loads the chat shell for a smaller initial JS bundle.
 */
export default function HomeChat() {
  return (
    <ChatErrorBoundary>
      <ChatShell />
    </ChatErrorBoundary>
  );
}
