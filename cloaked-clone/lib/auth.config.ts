import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js configuration.
 *
 * This file MUST NOT import Prisma, bcrypt, or any other Node-only module,
 * because it is loaded by the Edge middleware. The credentials provider's
 * `authorize` implementation (which needs bcrypt + Prisma) lives in
 * `lib/auth.ts`, which is only used by the Node-runtime API route.
 */
export const authConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  // Real providers are added in lib/auth.ts (Node runtime).
  providers: [],
  callbacks: {
    // Edge-safe JWT handling — only copies fields already on the token/user.
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as { id?: string }).id;
      }
      if (trigger === "update" && session?.planId) {
        token.planId = session.planId;
        token.subscriptionStatus = session.subscriptionStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as typeof session.user & { planId?: string; subscriptionStatus?: string }).planId =
          token.planId as string | undefined;
        (session.user as typeof session.user & { planId?: string; subscriptionStatus?: string }).subscriptionStatus =
          token.subscriptionStatus as string | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
