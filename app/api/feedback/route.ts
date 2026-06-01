import { createClient } from "@/lib/supabase/server";
import type { MessageFeedbackRating } from "@/lib/supabase/database.types";

const VALID_RATINGS: MessageFeedbackRating[] = ["helpful", "not_helpful"];

/**
 * POST /api/feedback — submit thumbs up/down on an assistant message.
 */
export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messageId =
    body && typeof body === "object" && "messageId" in body
      ? (body as { messageId: unknown }).messageId
      : null;
  const rating =
    body && typeof body === "object" && "rating" in body
      ? (body as { rating: unknown }).rating
      : null;
  const comment =
    body && typeof body === "object" && "comment" in body
      ? (body as { comment: unknown }).comment
      : undefined;

  if (typeof messageId !== "string" || !messageId) {
    return Response.json({ error: "messageId is required." }, { status: 400 });
  }

  if (
    typeof rating !== "string" ||
    !VALID_RATINGS.includes(rating as MessageFeedbackRating)
  ) {
    return Response.json(
      { error: "rating must be 'helpful' or 'not_helpful'." },
      { status: 400 },
    );
  }

  const { data: feedback, error } = await supabase
    .from("message_feedback")
    .upsert(
      {
        message_id: messageId,
        user_id: user.id,
        rating: rating as MessageFeedbackRating,
        comment: typeof comment === "string" ? comment.slice(0, 500) : null,
      },
      { onConflict: "message_id,user_id" },
    )
    .select()
    .single();

  if (error) {
    return Response.json({ error: "Failed to save feedback." }, { status: 500 });
  }

  return Response.json({ feedback }, { status: 201 });
}
