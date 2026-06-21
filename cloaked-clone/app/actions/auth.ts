"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function signInAction(email: string, password: string): Promise<{ error?: string }> {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
    return {};
  } catch (error) {
    // NextAuth throws a NEXT_REDIRECT on success — re-throw it so Next.js handles it
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    if (error instanceof AuthError) return { error: "Invalid email or password." };
    throw error;
  }
}
