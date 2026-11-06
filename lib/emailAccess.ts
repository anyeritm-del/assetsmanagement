// Who may sign in (see auth.ts). Both lists come from comma-separated env vars:
//   ALLOWED_EMAIL_DOMAIN=astonhotelsinternational.com,archipelagohotels.com
//   ALLOWED_EMAILS=someone@gmail.com   (individual exceptions outside those domains)
// With no domain configured, any verified Google account may sign in.

function parseList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export const allowedEmailDomains: string[] = parseList(process.env.ALLOWED_EMAIL_DOMAIN).map(
  (domain) => domain.replace(/^@/, ""),
);

const allowedEmails = new Set(parseList(process.env.ALLOWED_EMAILS));

export function isEmailAllowed(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (allowedEmails.has(normalized)) return true;
  if (allowedEmailDomains.length === 0) return true;
  const at = normalized.lastIndexOf("@");
  if (at < 0) return false;
  return allowedEmailDomains.includes(normalized.slice(at + 1));
}

/** "@a.com or @b.com", for sign-in page copy. */
export function describeAllowedDomains(): string {
  return allowedEmailDomains.map((domain) => `@${domain}`).join(" or ");
}
