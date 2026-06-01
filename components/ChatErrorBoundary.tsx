"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { UI_COPY } from "@/lib/constants/ui-copy";

export interface ChatErrorBoundaryProps {
  children: ReactNode;
}

interface ChatErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render errors in the chat tree and shows a recoverable fallback UI.
 */
export class ChatErrorBoundary extends Component<
  ChatErrorBoundaryProps,
  ChatErrorBoundaryState
> {
  constructor(props: ChatErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ChatErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ChatErrorBoundary]", error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex h-dvh flex-col items-center justify-center gap-4 bg-legal-navy px-6 text-center"
        >
          <h1 className="text-lg font-semibold text-slate-100">
            {UI_COPY.errorBoundaryTitle}
          </h1>
          <p className="max-w-md text-sm text-legal-slate">
            {UI_COPY.errorBoundaryDescription}
          </p>
          <Button type="button" variant="outline" onClick={this.handleRetry}>
            {UI_COPY.errorBoundaryRetry}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
