import { cookies } from "next/headers";
import { auth } from "@/auth";
import { SELECTED_PROPERTY_COOKIE } from "./constants";
import { listActiveProperties } from "./repositories/properties";
import { getUserByEmail } from "./repositories/users";
import type { Property } from "./types";

export interface SelectedPropertyContext {
  properties: Property[];
  selected: Property | null;
}

export async function getSelectedPropertyContext(): Promise<SelectedPropertyContext> {
  const properties = await listActiveProperties();

  // Property admin is locked to their one assigned hotel -- the property switcher only ever
  // shows/selects that property, regardless of what's in the cookie.
  const session = await auth();
  if (session?.user?.email) {
    const currentUser = await getUserByEmail(session.user.email);
    if (currentUser?.level === "property_admin" && currentUser.assigned_property_id) {
      const assigned = properties.find((property) => property.id === currentUser.assigned_property_id);
      return { properties: assigned ? [assigned] : [], selected: assigned ?? null };
    }
  }

  const cookieStore = await cookies();
  const selectedId = cookieStore.get(SELECTED_PROPERTY_COOKIE)?.value;
  const selected = properties.find((property) => property.id === selectedId) ?? properties[0] ?? null;
  return { properties, selected };
}
