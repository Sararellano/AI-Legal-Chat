"use client";

import { memo, useCallback, useState } from "react";
import AccountMenu from "@/components/AccountMenu";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import ConversationSidebar from "@/components/ConversationSidebar";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import MessageList from "@/components/MessageList";
import SiteFooter from "@/components/SiteFooter";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

/**
 * Full-viewport chat layout composing sidebar, header, messages, composer, and footer.
 */
function ChatShellComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
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
  } = useChat();

  const handleSubmit = useCallback(() => {
    void sendMessage(input);
  }, [input, sendMessage]);

  const handleSuggestedSelect = useCallback(
    (prompt: string) => {
      void sendMessage(prompt);
    },
    [sendMessage],
  );

  const handleSelectConversation = useCallback(
    (id: string) => {
      void selectConversation(id);
      setSidebarOpen(false);
    },
    [selectConversation],
  );

  const handleNewConversation = useCallback(() => {
    startNewConversation();
    setSidebarOpen(false);
  }, [startNewConversation]);

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-dvh flex-col bg-legal-navy">
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        isLoading={isLoadingConversations}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((open) => !open)}
        onSelect={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col transition-[margin] duration-200",
          sidebarOpen && "sm:ml-64",
        )}
      >
        <div className="relative shrink-0">
          <AccountMenu />
          <ChatHeader />
        </div>
        {hasMessages ? (
          <div className="shrink-0 px-4 pt-2 sm:px-6">
            <LegalDisclaimer compact />
          </div>
        ) : null}
        <MessageList
          messages={messages}
          isStreaming={isStreaming}
          streamingAssistantId={streamingAssistantId}
          onSuggestedSelect={handleSuggestedSelect}
          disabled={isStreaming}
          feedbackByMessageId={feedbackByMessageId}
          onFeedback={submitFeedback}
        />
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          onStop={stopStreaming}
          isStreaming={isStreaming}
          error={error}
        />
        <SiteFooter />
      </div>
    </div>
  );
}

const ChatShell = memo(ChatShellComponent);
ChatShell.displayName = "ChatShell";

export default ChatShell;
