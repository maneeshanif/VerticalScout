"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types";
import { API_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Compass, Loader2, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("elite_user");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          role,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Registration failed");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAF7F2] dark:bg-[#0B121A]">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-[48%] relative bg-[#0D6E61] flex-col justify-between p-12 text-white overflow-hidden">
        {/* Logo */}
        <div className="relative">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 backdrop-blur border border-white/20">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-white font-bold text-xl tracking-tight">VerticalGate</span>
          </Link>
        </div>

        {/* Value Prop */}
        <div className="relative space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-[#A7F3D0] backdrop-blur border border-white/10">
            <span>Join 110 Active Field Scouts</span>
          </div>

          <h2 className="font-display text-3xl font-extrabold leading-snug">
            Scout, Screen, and Launch High-Margin Startups.
          </h2>

          <p className="text-sm text-[#D1FAE5] leading-relaxed">
            Create an account to join your assigned cohort shift. Collect student founder domain proposals and trigger AI evaluations.
          </p>

          <div className="space-y-3 pt-2 text-xs text-[#E6F4EA]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-[#A7F3D0] shrink-0" />
              <span>Real-time domain qualification against 8 fatal tests</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-[#A7F3D0] shrink-0" />
              <span>Shift leaderboard rankings across Morning, Afternoon, Evening</span>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="relative text-xs text-[#A7F3D0]/80">
          VerticalGate &bull; Panaversity AI Agent Factory
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-2">
            <div className="h-9 w-9 rounded-lg bg-[#0D6E61] text-white flex items-center justify-center">
              <Compass className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-lg text-[#141C24] dark:text-white">VerticalGate</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="font-display text-2xl font-bold text-[#141C24] dark:text-white">
              Create Scout Account
            </h1>
            <p className="text-xs text-[#706E6B] dark:text-[#8FA0B3]">
              Join the institutional vertical qualification network.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3.5 rounded-lg bg-[#FFF1F2] border border-[#FECDD3] text-xs font-bold text-[#BE123C] dark:bg-[#4C0519]/30 dark:border-[#881337] dark:text-[#FECDD3]"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#141C24] dark:text-white block">
                Full Name
              </label>
              <Input
                placeholder="e.g. Alex Rivera"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-10 text-sm bg-white dark:bg-[#14202D] border-[#E8E2D8] dark:border-[#233140] rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#141C24] dark:text-white block">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 text-sm bg-white dark:bg-[#14202D] border-[#E8E2D8] dark:border-[#233140] rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#141C24] dark:text-white block">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 text-sm bg-white dark:bg-[#14202D] border-[#E8E2D8] dark:border-[#233140] rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#141C24] dark:text-white block">
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="flex h-10 w-full rounded-lg border border-[#E8E2D8] bg-white px-3 py-2 text-xs font-semibold text-[#141C24] dark:border-[#233140] dark:bg-[#14202D] dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D6E61]"
              >
                <option value="elite_user">Assistant Teacher (Elite Scout)</option>
                <option value="lead_teacher">Lead Teacher (Shift Supervisor)</option>
                <option value="super_teacher">Super Teacher (Venture Director)</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-[#0D6E61] hover:bg-[#095248] text-white font-bold rounded-lg shadow-md shadow-[#0D6E61]/20 gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Account…</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-[#E8E2D8] dark:border-[#233140] text-center text-xs text-[#706E6B] dark:text-[#8FA0B3]">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#0D6E61] hover:underline dark:text-[#2DD4BF]">
              Sign In
            </Link>
            <span className="mx-2">&bull;</span>
            <Link href="/" className="hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
