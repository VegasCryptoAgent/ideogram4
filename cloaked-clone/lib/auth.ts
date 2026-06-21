import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // PrismaAdapter is intentionally omitted: JWT strategy + CredentialsProvider
  // don't need it and it causes silent sign-in failures.
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    // Google OAuth is optional — only included when env vars are present
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }

      // Refresh plan/subscription info when session is updated
      if (trigger === "update" && session?.planId) {
        token.planId = session.planId;
        token.subscriptionStatus = session.subscriptionStatus;
      }

      // On initial sign-in, load plan from database
      if (token.id && !token.planId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { planId: true, subscriptionStatus: true },
        });
        if (dbUser) {
          token.planId = dbUser.planId;
          token.subscriptionStatus = dbUser.subscriptionStatus;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        // Expose plan info to client session
        (session.user as typeof session.user & { planId?: string; subscriptionStatus?: string }).planId =
          token.planId as string | undefined;
        (session.user as typeof session.user & { planId?: string; subscriptionStatus?: string }).subscriptionStatus =
          token.subscriptionStatus as string | undefined;
      }
      return session;
    },
  },
});
