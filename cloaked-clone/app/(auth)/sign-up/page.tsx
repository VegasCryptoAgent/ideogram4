"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Check,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  Shield,
  ChevronRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const STEPS = ["Account", "Personal Info", "Verify Email"];

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  verificationCode: string;
}

export default function SignUpPage() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    verificationCode: "",
  });

  const update = (field: keyof FormData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const passwordStrength = () => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strengthColors = ["bg-red-500", "bg-amber-500", "bg-yellow-500", "bg-green-500"];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strength = passwordStrength();

  const handleNext = async () => {
    if (step === 0) {
      // Validate step 1
      if (!formData.email || !formData.password || formData.password !== formData.confirmPassword) return;
      setStep(1);
    } else if (step === 1) {
      if (!formData.firstName || !formData.lastName) return;
      setLoading(true);
      // Simulate sending verification email
      await new Promise((r) => setTimeout(r, 1000));
      setLoading(false);
      setCodeSent(true);
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    // Redirect to dashboard
    window.location.href = "/dashboard";
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
        <p className="text-white/50 text-sm">
          Start your 14-day free trial. No credit card required.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((stepName, i) => (
          <React.Fragment key={stepName}>
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step
                    ? "bg-green-500 text-white"
                    : i === step
                    ? "bg-violet-600 text-white ring-2 ring-violet-400/30"
                    : "bg-white/10 text-white/30"
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-xs hidden sm:block ${
                  i === step ? "text-white font-medium" : "text-white/30"
                }`}
              >
                {stepName}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px ${i < step ? "bg-green-500/50" : "bg-white/10"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 0: Account */}
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="email">Email address</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => update("password", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i < strength ? strengthColors[strength - 1] : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/40">{strengthLabels[strength - 1] || "Enter password"}</p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  className={`pl-10 pr-10 ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? "border-red-500/50"
                      : ""
                  }`}
                  value={formData.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            <Button
              className="w-full mt-2"
              onClick={handleNext}
              disabled={
                !formData.email ||
                !formData.password ||
                formData.password !== formData.confirmPassword ||
                strength < 2
              }
            >
              Continue <ChevronRight className="ml-1 w-4 h-4" />
            </Button>

            <p className="text-center text-sm text-white/40">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-violet-400 hover:text-violet-300">
                Sign in
              </Link>
            </p>
          </motion.div>
        )}

        {/* STEP 1: Personal Info */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Privacy notice */}
            <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-4 flex gap-3">
              <Shield className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-violet-300 mb-1">Why we need this</p>
                <p className="text-xs text-white/50 leading-relaxed">
                  We use your name, DOB, and phone number only to search for your listings on data broker sites. This information is encrypted with AES-256 and never sold or shared.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    id="firstName"
                    placeholder="Jane"
                    className="pl-10"
                    value={formData.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Smith"
                  className="mt-1.5"
                  value={formData.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dob">Date of birth</Label>
              <div className="relative mt-1.5">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="dob"
                  type="date"
                  className="pl-10"
                  value={formData.dateOfBirth}
                  onChange={(e) => update("dateOfBirth", e.target.value)}
                />
              </div>
              <p className="text-xs text-white/30 mt-1">Used to accurately identify your listings</p>
            </div>

            <div>
              <Label htmlFor="phone">Primary phone number</Label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="pl-10"
                  value={formData.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
              <div className="flex items-start gap-2 mt-1.5">
                <Info className="w-3.5 h-3.5 text-white/30 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-white/30 leading-relaxed">
                  Used only to find your listings on data broker sites. We will not call or text you from this number for marketing purposes.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleNext}
                disabled={!formData.firstName || !formData.lastName || loading}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Continue <ChevronRight className="ml-1 w-4 h-4" /></>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Verify Email */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-violet-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Check your email</h3>
              <p className="text-white/50 text-sm">
                We sent a 6-digit code to{" "}
                <strong className="text-white">{formData.email}</strong>
              </p>
            </div>

            <div>
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                placeholder="000000"
                maxLength={6}
                className="mt-1.5 text-center text-2xl font-bold tracking-widest"
                value={formData.verificationCode}
                onChange={(e) => update("verificationCode", e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={formData.verificationCode.length !== 6 || loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Verify & Start Protection"
              )}
            </Button>

            <div className="text-center">
              <button className="text-sm text-white/40 hover:text-white/70">
                Didn't receive a code?{" "}
                <span className="text-violet-400">Resend</span>
              </button>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-white/40 text-center leading-relaxed">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-violet-400">Terms of Service</a> and{" "}
                <a href="#" className="text-violet-400">Privacy Policy</a>.
                Your data is encrypted and never sold.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
