import { cookies } from "next/headers";
import { SELECTED_PROPERTY_COOKIE } from "./constants";
import { listActiveProperties } from "./repositories/properties";
import type { Property } from "./types";

export interface SelectedPropertyContext {
  properties: Property[];
  selected: Property | null;
}

export async function getSelectedPropertyContext(): Promise<SelectedPropertyContext> {
  const cookieStore = await cookies();
  const selectedId = cookieStore.get(SELECTED_PROPERTY_COOKIE)?.value;
  const properties = await listActiveProperties();
  const selected = properties.find((property) => property.id === selectedId) ?? properties[0] ?? null;
  return { properties, selected };
}
