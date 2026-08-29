"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Compass, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
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
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
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
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-background via-slate-50/50 to-slate-100/80 dark:from-background dark:to-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Compass className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Vertical<span className="text-primary">Gate</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Elite Member Scouting & AI-Powered Vertical Evaluation Engine
          </p>
        </div>

        <Card className="border-border/80 shadow-lg shadow-slate-200/50 dark:shadow-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold">Sign in</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Enter your registered credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg text-xs font-medium bg-destructive/15 text-destructive border border-destructive/20 animate-in fade-in">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Email address</label>
                <Input
                  type="email"
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground/80">Password</label>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background text-sm"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              <Button type="submit" className="w-full font-medium" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center text-xs text-muted-foreground pt-1">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                  Register here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Quick Role Context Guide */}
        <div className="rounded-xl border bg-card/60 backdrop-blur p-4 text-xs text-muted-foreground space-y-2">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Role-Based Access Control</span>
          </div>
          <p>
            Supports Super Admin, Super Teacher, Lead Teacher, and ~110 Elite Users.
            Shifts & batches are prompted upon successful login.
          </p>
        </div>
      </div>
    </div>
  );
}
