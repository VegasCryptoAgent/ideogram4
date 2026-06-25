"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Network error — still show success to prevent enumeration
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link
        href="/sign-in"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </Link>

      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Reset your password</h1>
              <p className="text-white/50 text-sm">
                Enter your email and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!email || loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-white/40 mt-6">
              Remember your password?{" "}
              <Link href="/sign-in" className="text-violet-400 hover:text-violet-300">
                Sign in
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-xl font-bold mb-3">Check your inbox</h2>
            <p className="text-white/50 text-sm mb-2">
              We sent a password reset link to
            </p>
            <p className="text-white font-medium mb-6">{email}</p>
            <p className="text-white/40 text-sm mb-8">
              The link will expire in 30 minutes. If you don't see it, check your spam folder.
            </p>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSent(false)}
              >
                Try a different email
              </Button>
              <Button className="w-full" asChild>
                <Link href="/sign-in">Back to Sign In</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
