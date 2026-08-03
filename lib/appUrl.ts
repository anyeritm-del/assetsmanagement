export function getAppUrl(): string {
  return process.env.AUTH_URL ?? "http://localhost:3000";
}
