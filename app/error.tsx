"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UI_COPY } from "@/lib/constants/ui-copy";

export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js App Router error boundary for unhandled route errors.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

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
      <Button type="button" variant="outline" onClick={reset}>
        {UI_COPY.errorBoundaryRetry}
      </Button>
    </div>
  );
}
