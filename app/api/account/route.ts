import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAuditEvent } from "@/lib/supabase/audit";

/**
 * DELETE /api/account — GDPR right to erasure.
 * Removes user data and the auth account (service role).
 */
export async function DELETE(request: Request): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  await logAuditEvent(supabase, {
    userId: user.id,
    action: "account.deletion_requested",
    request,
  });

  const admin = createAdminClient();

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return Response.json(
      { error: "Failed to delete account." },
      { status: 500 },
    );
  }

  await supabase.auth.signOut();

  return Response.json({ success: true });
}
