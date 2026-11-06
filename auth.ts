import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isEmailAllowed } from "@/lib/emailAccess";

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
      return isEmailAllowed(profile.email, typeof profile.hd === "string" ? profile.hd : null);
    },
    authorized({ auth: session }) {
      return !!session?.user;
    },
  },
});
