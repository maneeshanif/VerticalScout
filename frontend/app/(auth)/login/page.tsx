"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { API_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Compass, Loader2, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to authenticate");
      }
      const tokens = await res.json();
      await login(tokens);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (brand/hero) ── */}
      <div className="hidden lg:flex lg:w-[52%] relative bg-gradient-to-br from-primary via-indigo-700 to-violet-800 flex-col justify-between p-12 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 -left-16 h-96 w-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-1/4 right-0 h-64 w-64 rounded-full bg-violet-300 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur border border-white/20">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">VerticalGate</span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-xs text-white/80 font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              AI-Powered Vertical Evaluation
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Scout the Right<br />Vertical, Every Time.
            </h1>
            <p className="text-white/70 text-base leading-relaxed max-w-sm">
              Evaluate candidate domain suitability using the proven 5-Step, 3-Rule, and 8-Test Choosing Your Vertical framework — powered by Gemini AI.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              "6-Criteria Selling Ease Screen",
              "Eight Tests with evidence scoring",
              "Beachhead slice recommendation",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5 text-sm text-white/80">
                <div className="h-5 w-5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Footer quote */}
        <div className="relative border-t border-white/15 pt-6">
          <p className="text-xs text-white/50 leading-relaxed">
            "The goal is to find a vertical where you can build a repeatable, scalable system."
          </p>
          <p className="text-xs text-white/30 mt-1">— Choosing Your Vertical Framework</p>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-sm space-y-7">
          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
              <Compass className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-extrabold">
              Vertical<span className="text-primary">Gate</span>
            </h1>
          </div>

          {/* Form header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive text-sm animate-in fade-in">
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
                Email address
              </label>
              <Input
                type="email"
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-background/80 text-sm border-border/80 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-background/80 text-sm border-border/80 focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold shadow-md shadow-primary/20 text-sm"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline underline-offset-4">
              Register here
            </Link>
          </p>

          {/* Role context */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-muted/50 border border-border/60 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Supports Super Admin, Super Teacher, Lead Teacher, and Elite users. Shift is prompted after first login.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
