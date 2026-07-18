import { NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { isOwner } from "@/lib/owner";
import { PLANS } from "@/lib/plans";

/**
 * POST /api/billing/claim-owner
 * Body optional: { secret?: string }
 *
 * Grants Agency to the logged-in user if:
 *  - email/id is in OWNER_EMAILS / OWNER_USER_IDS, OR
 *  - body.secret matches OWNER_CLAIM_SECRET (one-time style unlock)
 */
export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let secret: string | undefined;
  try {
    const body = await req.json();
    secret = typeof body?.secret === "string" ? body.secret : undefined;
  } catch {
    /* empty body ok */
  }

  const claimSecret = process.env.OWNER_CLAIM_SECRET?.trim();
  const secretOk =
    Boolean(claimSecret) && Boolean(secret) && secret === claimSecret;
  const ownerOk = isOwner(user.email, user.id);

  if (!ownerOk && !secretOk) {
    return NextResponse.json(
      {
        error:
          "No autorizado. Configura OWNER_EMAILS con tu email en Vercel, o usa OWNER_CLAIM_SECRET.",
      },
      { status: 403 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ plan: "agency", plan_status: "active" })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    plan: PLANS.agency.id,
    planName: PLANS.agency.name,
    email: user.email,
    message: "Plan Agency activado para tu cuenta (owner).",
  });
}
