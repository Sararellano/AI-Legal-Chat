"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { PORTFOLIO_URL, PRIVACY_PATH, ACCOUNT_API_PATH } from "@/lib/constants";
import { UI_COPY } from "@/lib/constants/ui-copy";

/**
 * Footer credit, privacy link, and account actions.
 */
function SiteFooterComponent() {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(UI_COPY.accountDeleteConfirm)) {
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(ACCOUNT_API_PATH, { method: "DELETE" });
      if (response.ok) {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <footer className="shrink-0 border-t border-legal-border bg-legal-navy-light px-4 py-3 text-center text-xs text-legal-slate sm:px-6">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span>
          {UI_COPY.footerMadeBy}{" "}
          <a
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-300 underline-offset-2 hover:text-slate-100 hover:underline"
          >
            {UI_COPY.footerAuthor}
          </a>
        </span>
        <span aria-hidden="true">·</span>
        <Link
          href={PRIVACY_PATH}
          className="text-slate-300 underline-offset-2 hover:text-slate-100 hover:underline"
        >
          {UI_COPY.privacyLink}
        </Link>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="text-slate-300 underline-offset-2 hover:text-slate-100 hover:underline"
        >
          {UI_COPY.accountSignOut}
        </button>
        <span aria-hidden="true">·</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={deleting}
          onClick={() => void handleDeleteAccount()}
          className="h-auto px-0 py-0 text-xs text-red-400 hover:bg-transparent hover:text-red-300"
        >
          {UI_COPY.accountDelete}
        </Button>
      </div>
    </footer>
  );
}

const SiteFooter = memo(SiteFooterComponent);
SiteFooter.displayName = "SiteFooter";

export default SiteFooter;
