import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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

        try {
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
        } catch (err) {
          console.error("[Auth] authorize error:", err);
          return null;
        }
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
    ...authConfig.callbacks,
    // Node-runtime JWT callback: loads plan info from the DB at sign-in.
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as { id?: string }).id;
        // Load plan/subscription info once, at sign-in (Node runtime).
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { planId: true, subscriptionStatus: true },
          });
          if (dbUser) {
            token.planId = dbUser.planId;
            token.subscriptionStatus = dbUser.subscriptionStatus;
          }
        } catch (err) {
          console.error("[Auth] jwt plan load error:", err);
        }
      }

      if (trigger === "update" && session?.planId) {
        token.planId = session.planId;
        token.subscriptionStatus = session.subscriptionStatus;
      }

      return token;
    },
  },
});
