import { auth } from "@/auth";
import { getUserByEmail } from "./repositories/users";
import type { User } from "./types";

export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  return getUserByEmail(session.user.email);
}
