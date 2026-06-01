# Components

Presentational and container React components for the legal chat UI.

| Component | Responsibility |
|-----------|----------------|
| `ChatShell` | Wires `useChat` to layout children |
| `ChatHeader` | Title and scope |
| `MessageList` | Scrollable transcript + empty state |
| `MessageBubble` | Single message (Markdown for assistant) |
| `ChatInput` | Composer with send/stop |
| `LegalDisclaimer` | Mandatory legal notice |
| `SuggestedPrompts` | Empty-state prompt chips |
| `SiteFooter` | Portfolio credit |
| `ChatErrorBoundary` | Client error boundary |
| `ui/` | shadcn/ui primitives (`Button`, `Textarea`) |

All user-facing copy is sourced from `lib/constants/ui-copy.ts`.
