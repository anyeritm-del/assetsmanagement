import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const allowedDomain = (process.env.ALLOWED_EMAIL_DOMAIN ?? "").toLowerCase();

// Comma-separated exceptions (e.g. personal accounts for admins/testers) allowed to sign in
// even though they're outside ALLOWED_EMAIL_DOMAIN.
const allowedEmails = new Set(
  (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.email || !profile.email_verified) return false;
      const email = profile.email.toLowerCase();
      if (allowedEmails.has(email)) return true;
      if (!allowedDomain) return true;
      return email.endsWith(`@${allowedDomain}`);
    },
    authorized({ auth: session }) {
      return !!session?.user;
    },
  },
});
