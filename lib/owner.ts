/**
 * Owner / super-admin bypass for plan gates.
 *
 * Vercel env (comma-separated):
 *   OWNER_EMAILS=tu@email.com,otro@email.com
 *   OWNER_USER_IDS=uuid-opcional
 *
 * Also accepts APEX_OWNER_EMAILS as alias.
 */
export function isOwner(
  email?: string | null,
  userId?: string | null,
): boolean {
  const emails = parseList(
    process.env.OWNER_EMAILS || process.env.APEX_OWNER_EMAILS,
  );
  const ids = parseList(process.env.OWNER_USER_IDS);

  if (email && emails.includes(email.trim().toLowerCase())) return true;
  if (userId && ids.includes(userId.trim())) return true;
  return false;
}

function parseList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}
