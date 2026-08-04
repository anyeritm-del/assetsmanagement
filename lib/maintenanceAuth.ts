import { auth } from "@/auth";
import { getUserByEmail } from "./repositories/users";

// Administrator/Owner can always resolve maintenance work; everyone else needs the
// can_manage_maintenance flag on their Users row. No matching User row (e.g. signed in but never
// added to the Users directory) fails closed -- not authorized.
export async function canManageMaintenance(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.email) return false;

  const user = await getUserByEmail(session.user.email);
  if (!user) return false;

  return user.level === "administrator" || user.level === "owner" || user.can_manage_maintenance;
}
