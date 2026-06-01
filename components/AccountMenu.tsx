"use client";

import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { UI_COPY } from "@/lib/constants/ui-copy";

/**
 * Sign-out and account deletion actions.
 */
function AccountMenuComponent() {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function handleDeleteAccount() {
    if (!window.confirm(UI_COPY.accountDeleteConfirm)) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/account", { method: "DELETE" });
      if (response.ok) {
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 px-4 py-2">
      <Button type="button" variant="ghost" size="sm" onClick={handleSignOut}>
        {UI_COPY.accountSignOut}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={() => void handleDeleteAccount()}
        className="border-red-900/50 text-red-300 hover:bg-red-950/40"
      >
        {UI_COPY.accountDelete}
      </Button>
    </div>
  );
}

const AccountMenu = memo(AccountMenuComponent);
AccountMenu.displayName = "AccountMenu";

export default AccountMenu;
