"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { API_URL } from "@/lib/api";
import { Compass, ArrowRight, Eye, EyeOff } from "lucide-react";

const V = { viridian: "#0E5C4A", viridianLt: "#E6F3EF", ink: "#1A1F2E", muted: "#6E7280", border: "#E8E5DF", canvas: "#FAFAF7" };
const BG = "'Bricolage Grotesque', system-ui, sans-serif";
const SF = "'DM Sans', system-ui, sans-serif";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(API_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        let errorMsg = "Invalid email or password";
        if (data.detail) {
          errorMsg = Array.isArray(data.detail) ? data.detail[0].msg : data.detail;
        }
        throw new Error(errorMsg);
      }
      
      const tokens = await res.json();
      const user = await login({ access_token: tokens.access_token, refresh_token: tokens.refresh_token });
      
      if (!user) {
        // Fallback fetch directly if state update was still resolving
        const meRes = await fetch(API_URL + "/auth/me", {
          headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        if (meRes.ok) {
          const directUser = await meRes.json();
          redirectForRole(directUser);
          return;
        }
        throw new Error("Unable to load user profile. Please try again.");
      }
      
      redirectForRole(user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const redirectForRole = (u: any) => {
    if (!u || !u.role) {
      router.push("/elite");
      return;
    }
    if (u.role === "super_admin") {
      router.push("/admin");
    } else if (u.role === "super_teacher") {
      router.push("/super-teacher");
    } else if (u.role === "lead_teacher") {
      if (!u.batch) router.push("/select-batch");
      else router.push("/lead-teacher");
    } else {
      if (!u.batch) router.push("/select-batch");
      else router.push("/elite");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ fontFamily: SF, background: V.canvas }}>
      {/* LEFT brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-8 sm:p-12 lg:p-16" style={{ background: V.viridian }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center">
            <Compass className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-black text-lg" style={{ fontFamily: BG }}>VerticalGate</span>
        </Link>
        <div className="space-y-6">
          <h2 className="text-4xl font-black text-white leading-tight" style={{ fontFamily: BG, letterSpacing: "-0.03em" }}>
            Domain-grade qualification intelligence for venture scouts.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Screening startup verticals against 3 Launch Rules, 6 Selling Screens, and 8 Fatal-Flaw Tests before a line of code ships.
          </p>
          <div className="flex gap-6 pt-2">
            {[{ n: "110", l: "Scout Teachers" }, { n: "8", l: "Fatal Tests" }, { n: "3", l: "Daily Shifts" }].map((m) => (
              <div key={m.l}>
                <div className="text-2xl font-black text-white" style={{ fontFamily: BG }}>{m.n}</div>
                <div className="text-xs text-white/60">{m.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-white/40 text-xs">Panaversity Agent Factory</div>
      </div>
      {/* RIGHT form */}
      <div className="flex flex-col items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: V.viridian }}>
              <Compass className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-base" style={{ fontFamily: BG, color: V.ink }}>VerticalGate</span>
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ fontFamily: BG, color: V.ink, letterSpacing: "-0.03em" }}>Sign in to your workspace</h1>
            <p className="text-sm mt-1.5" style={{ color: V.muted }}>Access your scouting dashboard and candidate dossiers.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: V.ink }}>Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all"
                style={{ background: "#FFFFFF", borderColor: V.border, color: V.ink }}
                onFocus={(e) => { e.target.style.borderColor = V.viridian; e.target.style.boxShadow = "0 0 0 3px #E6F3EF"; }}
                onBlur={(e) => { e.target.style.borderColor = V.border; e.target.style.boxShadow = "none"; }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: V.ink }}>Password</label>
              <div className="relative">
                <input type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all pr-10"
                  style={{ background: "#FFFFFF", borderColor: V.border, color: V.ink }}
                  onFocus={(e) => { e.target.style.borderColor = V.viridian; e.target.style.boxShadow = "0 0 0 3px #E6F3EF"; }}
                  onBlur={(e) => { e.target.style.borderColor = V.border; e.target.style.boxShadow = "none"; }} />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: V.muted }}>
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="px-4 py-3 rounded-lg border text-sm" style={{ background: "#FBF0EC", borderColor: "#F0C8B8", color: "#7A3520" }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
              style={{ background: V.viridian, boxShadow: "0 4px 16px #0E5C4A30" }}>
              {loading ? "Signing In…" : <><span>Sign In to Workspace</span><ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
          <div className="text-center text-sm" style={{ color: V.muted }}>
            No account? <Link href="/register" className="font-semibold hover:underline" style={{ color: V.viridian }}>Request Scout Access</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
