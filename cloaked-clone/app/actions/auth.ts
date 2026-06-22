"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function signInAction(
  email: string,
  password: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    console.error("[signInAction] error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
