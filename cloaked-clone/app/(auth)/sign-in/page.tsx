"use client";

import React, { useState, useTransition } from "react";
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";
import Link from "next/link";
import { signInAction } from "@/app/actions/auth";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    startTransition(async () => {
      const result = await signInAction(email, password);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A14] mb-1 font-serif">Welcome back</h1>
      <p className="text-[#1A1A14]/50 text-sm mb-8">
        Sign in to your Shield account to continue your protection.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#1A1A14] mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A14]/30" />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E0D5] rounded-xl text-[#1A1A14] placeholder-[#1A1A14]/30 outline-none focus:border-[#1A1A14] transition-colors text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-[#1A1A14]">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-[#F97316] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A14]/30" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full pl-10 pr-10 py-3 bg-white border border-[#E5E0D5] rounded-xl text-[#1A1A14] placeholder-[#1A1A14]/30 outline-none focus:border-[#1A1A14] transition-colors text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1A1A14]/30 hover:text-[#1A1A14]/60"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#1A1A14] text-white py-3 rounded-xl font-semibold hover:bg-black transition-colors disabled:opacity-50 text-sm mt-2"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E0D5]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-[#E8E3D9] text-[#1A1A14]/40">or</span>
          </div>
        </div>

        <p className="text-center text-sm text-[#1A1A14]/50">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-[#F97316] font-medium hover:underline">
            Start free
          </Link>
        </p>
      </form>

      <div className="mt-8 bg-white border border-[#E5E0D5] rounded-xl p-4 flex items-center gap-3">
        <Shield className="w-5 h-5 text-[#F97316] flex-shrink-0" />
        <p className="text-xs text-[#1A1A14]/50">
          Your connection is encrypted. We use industry-standard security to protect your account.
        </p>
      </div>
    </div>
  );
}
