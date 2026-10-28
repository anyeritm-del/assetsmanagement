import { existsSync } from "node:fs";
import { rootCertificates } from "node:tls";
import { defineConfig } from "drizzle-kit";
import { CLOUDFLARE_ORIGIN_CA_RSA_ROOT } from "./lib/db/cloudflareOriginCa";

// drizzle-kit runs outside Next.js, so .env.local isn't loaded for us.
if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

// Same TLS rules as lib/db/client.ts: always verify, trusting the Cloudflare Origin CA that the
// Sumopod pooler uses. Credentials are split out of the URL because a URL `sslmode` would
// override the `ssl` object.
const url = new URL(process.env.DATABASE_URL ?? "postgres://localhost/postgres");

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    host: url.hostname,
    port: Number(url.port || 5432),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    ssl:
      url.searchParams.get("sslmode") === "disable"
        ? false
        : { rejectUnauthorized: true, ca: [...rootCertificates, CLOUDFLARE_ORIGIN_CA_RSA_ROOT] },
  },
  strict: true,
  verbose: true,
});
