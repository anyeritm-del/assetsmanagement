import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const allowedDomain = (process.env.ALLOWED_EMAIL_DOMAIN ?? "").toLowerCase();

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
      if (!allowedDomain) return true;
      return profile.email.toLowerCase().endsWith(`@${allowedDomain}`);
    },
    authorized({ auth: session }) {
      return !!session?.user;
    },
  },
});
