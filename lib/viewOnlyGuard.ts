import { auth } from "@/auth";
import { getUserByEmail } from "./repositories/users";

// Fails OPEN by design: most signed-in users are never added to the Users directory at all (sign-
// in is gated purely by ALLOWED_EMAIL_DOMAIN/ALLOWED_EMAILS, not by having a Users row), and they
// keep full access as before. Only an EXPLICIT level of "view_only" on a matching Users row blocks
// mutations -- this mirrors how "property_admin"/assigned_property_id only restricts when set.
export async function isViewOnly(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.email) return false;
  const user = await getUserByEmail(session.user.email);
  return user?.level === "view_only";
}

export interface MutationGuardResult {
  success: boolean;
  error?: string;
}

// Call at the top of every mutating server action (create/update/delete/decide). Read-only
// actions (list/get) and view-context actions (e.g. setSelectedProperty) don't need this.
// Shaped like ActionResult so callers can `return guard;` directly on failure.
export async function assertCanMutate(): Promise<MutationGuardResult> {
  if (await isViewOnly()) {
    return { success: false, error: "Your account is view-only and can't make changes" };
  }
  return { success: true };
}
