// Who may sign in (see auth.ts). Both lists come from comma-separated env vars:
//   ALLOWED_EMAIL_DOMAIN=astonhotelsinternational.com,archipelagohotels.com
//   ALLOWED_EMAILS=someone@gmail.com   (individual exceptions outside those domains)
//
// Rules:
// - ALLOWED_EMAILS entries are always allowed (exact address match).
// - ALLOWED_EMAIL_DOMAIN unset or blank: any verified Google account may sign in (local dev).
// - ALLOWED_EMAIL_DOMAIN set but with no usable domain (e.g. ","): nobody may sign in, so a
//   typo in the env value fails closed instead of opening the app to everyone.
// - Otherwise the email's domain must be listed AND Google's `hd` (hosted domain) claim must
//   equal it. `hd` is only sent for Google Workspace accounts, which blocks personal Google
//   accounts registered with a company address. Both current domains are on Workspace
//   (MX -> aspmx.l.google.com, checked 2026-11-06).

const ASCII_EMAIL = /^[\x21-\x7e]+$/;

function parseList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) =>
      entry
        .trim()
        .replace(/^["']+|["']+$/g, "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);
}

export interface EmailAccess {
  domains: string[];
  isEmailAllowed(email: string, hostedDomain?: string | null): boolean;
}

export function createEmailAccess(
  domainSetting: string | undefined,
  emailSetting: string | undefined,
): EmailAccess {
  const domains = parseList(domainSetting)
    .map((domain) => domain.replace(/^@/, "").replace(/\.$/, ""))
    .filter(Boolean);
  const exceptions = new Set(parseList(emailSetting));
  const domainConfigured = (domainSetting ?? "").trim() !== "";

  function isEmailAllowed(email: string, hostedDomain?: string | null): boolean {
    const normalized = email.trim();
    // Non-ASCII addresses are rejected outright: toLowerCase() maps some Unicode letters to
    // ASCII ones (e.g. the Kelvin sign to "k"), which could make a foreign domain compare equal.
    if (!ASCII_EMAIL.test(normalized)) return false;
    const lower = normalized.toLowerCase();
    if (exceptions.has(lower)) return true;
    if (!domainConfigured) return true;

    const at = lower.lastIndexOf("@");
    if (at < 0) return false;
    const domain = lower.slice(at + 1);
    return domains.includes(domain) && (hostedDomain ?? "").trim().toLowerCase() === domain;
  }

  return { domains, isEmailAllowed };
}

const access = createEmailAccess(process.env.ALLOWED_EMAIL_DOMAIN, process.env.ALLOWED_EMAILS);

export const isEmailAllowed = access.isEmailAllowed;

/** "@a.com or @b.com", for sign-in page copy. */
export function describeAllowedDomains(): string {
  return access.domains.map((domain) => `@${domain}`).join(" or ");
}
