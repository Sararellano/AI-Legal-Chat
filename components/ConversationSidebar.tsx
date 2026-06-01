"use client";

import { memo } from "react";
import { MessageSquarePlus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UI_COPY } from "@/lib/constants/ui-copy";
import { cn } from "@/lib/utils";
import type { ConversationSummary } from "@/lib/types";

export interface ConversationSidebarProps {
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  isLoading: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
}

/**
 * Sidebar listing saved conversations (ChatGPT-style).
 */
function ConversationSidebarComponent({
  conversations,
  activeConversationId,
  isLoading,
  isOpen,
  onToggle,
  onSelect,
  onNewConversation,
}: ConversationSidebarProps) {
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? UI_COPY.sidebarClose : UI_COPY.sidebarOpen}
        className="fixed left-3 top-3 z-30 text-legal-slate hover:text-slate-100 sm:left-4 sm:top-4"
      >
        {isOpen ? (
          <PanelLeftClose className="size-5" aria-hidden />
        ) : (
          <PanelLeftOpen className="size-5" aria-hidden />
        )}
      </Button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-legal-border bg-legal-navy-light transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label={UI_COPY.sidebarLabel}
      >
        <div className="flex items-center justify-between border-b border-legal-border px-3 py-3 pt-14">
          <span className="text-sm font-medium text-slate-200">
            {UI_COPY.sidebarTitle}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onNewConversation}
            aria-label={UI_COPY.sidebarNewChat}
            className="h-8 px-2 text-legal-slate hover:text-slate-100"
          >
            <MessageSquarePlus className="size-4" aria-hidden />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <p className="px-2 py-3 text-xs text-legal-slate">{UI_COPY.sidebarLoading}</p>
          ) : conversations.length === 0 ? (
            <p className="px-2 py-3 text-xs text-legal-slate">
              {UI_COPY.sidebarEmpty}
            </p>
          ) : (
            <ul className="space-y-1">
              {conversations.map((conversation) => (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    className={cn(
                      "w-full truncate rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      activeConversationId === conversation.id
                        ? "bg-slate-700/60 text-slate-100"
                        : "text-legal-slate hover:bg-slate-700/30 hover:text-slate-200",
                    )}
                  >
                    {conversation.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </aside>

      {isOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-10 bg-black/40 sm:hidden"
          aria-label={UI_COPY.sidebarClose}
          onClick={onToggle}
        />
      ) : null}
    </>
  );
}

const ConversationSidebar = memo(ConversationSidebarComponent);
ConversationSidebar.displayName = "ConversationSidebar";

export default ConversationSidebar;
