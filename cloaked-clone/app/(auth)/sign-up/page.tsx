"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Check, Mail, Lock, User, Phone, Calendar, Shield, ChevronRight, Info } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const STEPS = ["Account", "Personal Info", "Done"];

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
  });

  const update = (field: keyof FormData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const passwordStrength = () => {
    const p = formData.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength = passwordStrength();
  const strengthColors = ["bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-green-500"];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

  const handleNext = async () => {
    setError("");
    if (step === 0) {
      if (!formData.email || !formData.password) { setError("Please fill in all fields."); return; }
      if (formData.password !== formData.confirmPassword) { setError("Passwords do not match."); return; }
      if (strength < 2) { setError("Please use a stronger password."); return; }
      setStep(1);
    } else if (step === 1) {
      if (!formData.firstName || !formData.lastName) { setError("First and last name are required."); return; }
      setLoading(true);
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            dateOfBirth: formData.dateOfBirth || undefined,
            phone: formData.phone || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Registration failed."); setLoading(false); return; }
        // Auto sign-in
        await signIn("credentials", { email: formData.email, password: formData.password, redirect: false });
        setStep(2);
      } catch {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  };

  // Input class helper
  const input = "w-full py-3 bg-white border border-[#E5E0D5] rounded-xl text-[#1A1A14] placeholder-[#1A1A14]/30 outline-none focus:border-[#1A1A14] transition-colors text-sm";

  return (
    <div>
      {/* Header */}
      <h1 className="text-2xl font-bold text-[#1A1A14] mb-1 font-serif">Create your account</h1>
      <p className="text-[#1A1A14]/50 text-sm mb-8">
        Start free — no credit card required.
      </p>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((name, i) => (
          <React.Fragment key={name}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? "bg-green-500 text-white" :
                i === step ? "bg-[#1A1A14] text-white" :
                "bg-[#E5E0D5] text-[#1A1A14]/40"
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? "text-[#1A1A14] font-medium" : "text-[#1A1A14]/35"}`}>
                {name}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px ${i < step ? "bg-green-400" : "bg-[#D4CFC5]"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Account */}
        {step === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A14] mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A14]/30" />
                <input type="email" placeholder="you@example.com" value={formData.email} onChange={e => update("email", e.target.value)} className={`${input} pl-10`} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A14] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A14]/30" />
                <input type={showPassword ? "text" : "password"} placeholder="Create a strong password" value={formData.password} onChange={e => update("password", e.target.value)} className={`${input} pl-10 pr-10`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1A1A14]/30 hover:text-[#1A1A14]/60">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColors[strength - 1] : "bg-[#E5E0D5]"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-[#1A1A14]/40">{strengthLabels[strength - 1] || ""}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A14] mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A14]/30" />
                <input type={showConfirm ? "text" : "password"} placeholder="Repeat your password" value={formData.confirmPassword} onChange={e => update("confirmPassword", e.target.value)}
                  className={`${input} pl-10 pr-10 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? "border-red-300" : ""}`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1A1A14]/30 hover:text-[#1A1A14]/60">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{error}</div>}

            <button onClick={handleNext} className="w-full bg-[#1A1A14] text-white py-3 rounded-xl font-semibold hover:bg-black transition-colors text-sm flex items-center justify-center gap-1 mt-2">
              Continue <ChevronRight className="w-4 h-4" />
            </button>

            <p className="text-center text-sm text-[#1A1A14]/50">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-[#F97316] font-medium hover:underline">Sign in</Link>
            </p>
          </motion.div>
        )}

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="space-y-4">
            <div className="bg-[#FDEEDE] border border-[#F97316]/20 rounded-xl p-4 flex gap-3">
              <Shield className="w-5 h-5 text-[#F97316] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#1A1A14] mb-1">Why we need this</p>
                <p className="text-xs text-[#1A1A14]/60 leading-relaxed">
                  We use your name and phone only to search for your listings on data broker sites. This info is AES-256 encrypted and never sold or shared.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1A1A14] mb-1.5">First name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A14]/30" />
                  <input placeholder="Jane" value={formData.firstName} onChange={e => update("firstName", e.target.value)} className={`${input} pl-10`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A14] mb-1.5">Last name</label>
                <input placeholder="Smith" value={formData.lastName} onChange={e => update("lastName", e.target.value)} className={`${input} px-4`} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A14] mb-1.5">Date of birth <span className="text-[#1A1A14]/35 font-normal">(optional)</span></label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A14]/30" />
                <input type="date" value={formData.dateOfBirth} onChange={e => update("dateOfBirth", e.target.value)} className={`${input} pl-10`} />
              </div>
              <p className="text-xs text-[#1A1A14]/35 mt-1">Helps us accurately identify your listings</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A14] mb-1.5">Phone number <span className="text-[#1A1A14]/35 font-normal">(optional)</span></label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A14]/30" />
                <input type="tel" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={e => update("phone", e.target.value)} className={`${input} pl-10`} />
              </div>
              <div className="flex items-start gap-1.5 mt-1">
                <Info className="w-3.5 h-3.5 text-[#1A1A14]/30 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#1A1A14]/35 leading-relaxed">Used only to search data broker sites. We will never call or text you for marketing.</p>
              </div>
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{error}</div>}

            <div className="flex gap-3">
              <button onClick={() => { setError(""); setStep(0); }} className="flex-1 py-3 rounded-xl font-semibold border border-[#D4CFC5] text-[#1A1A14] hover:bg-white transition-colors text-sm">
                Back
              </button>
              <button onClick={handleNext} disabled={!formData.firstName || !formData.lastName || loading}
                className="flex-1 bg-[#1A1A14] text-white py-3 rounded-xl font-semibold hover:bg-black transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-1">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Create account</span><ChevronRight className="w-4 h-4" /></>}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Done */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A14] mb-2 font-serif">You're all set!</h2>
            <p className="text-[#1A1A14]/55 text-sm mb-8 leading-relaxed">
              Your Shield account has been created. We'll start scanning for your data right away.
            </p>
            <button onClick={() => router.push("/dashboard")}
              className="w-full bg-[#F97316] text-white py-3 rounded-xl font-semibold hover:bg-[#EA6B0F] transition-colors text-sm">
              Go to Dashboard →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
