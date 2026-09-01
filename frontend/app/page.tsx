"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Compass, ArrowRight, ArrowUpRight, ShieldCheck,
  Users, GraduationCap, Crown, CheckCircle2, XCircle,
  ChevronRight,
} from "lucide-react";

/* ── Design tokens ── */
const T = {
  moss:     "#0D3B2E",
  mossMid:  "#164D3C",
  mossLt:   "#E8F5F0",
  mossBd:   "#C8E6DC",
  ember:    "#FF6B35",
  emberLt:  "#FFF0EB",
  emberBd:  "#FFCAB5",
  cloud:    "#F7F8FC",
  white:    "#FFFFFF",
  ink:      "#1B2B4B",
  inkLight: "#3D4F6E",
  muted:    "#7280A0",
  border:   "#E2E8F0",
  SYNE:     "'Syne', system-ui, sans-serif",
  INTER:    "'Inter', system-ui, sans-serif",
};

/* ── 3D tilt card wrapper ── */
function TiltCard({ children, className = "", style = {} }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number>(0);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      ref.current.style.transform =
        `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 10}deg) scale3d(1.02,1.02,1.02)`;
    });
  }, []);

  const handleLeave = useCallback(() => {
    cancelAnimationFrame(frame.current);
    if (ref.current) {
      ref.current.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
    }
  }, []);

  return (
    <div ref={ref} className={className} style={{
      ...style,
      transition: "transform 0.12s ease-out",
      transformStyle: "preserve-3d",
      willChange: "transform",
    }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}

/* ── Animated counter ── */
function Counter({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let n = 0;
      const step = Math.ceil(target / 50);
      const id = setInterval(() => {
        n = Math.min(n + step, target);
        setVal(n);
        if (n >= target) clearInterval(id);
      }, 24);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref} className="tabnum">{val}</span>;
}

/* ── Section reveal wrapper ── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

/* ── Data ── */
const COMPARISONS = [
  { dim: "Contract Value",
    bad:  { label: "$10 – $60 / mo",      note: "Commodity pricing. Buyers treat you as a replaceable utility." },
    good: { label: "$600 – $6,000 / mo",  note: "Tied to direct revenue or mandatory regulatory compliance." } },
  { dim: "Switching Cost",
    bad:  { label: "Zero lock-in",            note: "Any clone can replicate features in weeks." },
    good: { label: "Deep ERP & workflow lock", note: "Impossible to replace without full domain re-training." } },
  { dim: "Market Penetration",
    bad:  { label: "< 2% of TAM",            note: "Losing the CAC battle against VC-funded incumbents." },
    good: { label: "40 – 70% niche dominance", note: "Word-of-mouth inside tight trade associations." } },
  { dim: "Gross Margin",
    bad:  { label: "40 – 55% + high churn",       note: "Constant treadmill of customer replacement." },
    good: { label: "70 – 85% + embedded fintech", note: "Payments, insurance, lending at 3× expansion ARR." } },
];

const FATAL_TESTS = [
  { n: 1, name: "Commodity Wrapper Trap",     desc: "Thin LLM wrapper with no proprietary domain data.", hard: false },
  { n: 2, name: "TAM Reality Check",          desc: "Niche too small (<$10M ARR) or too wide to defend.", hard: false },
  { n: 3, name: "Expert Availability",        desc: "No accredited domain practitioner on the founding team.", hard: true },
  { n: 4, name: "Workflow Integration Depth", desc: "Cannot hook into industry ERP, hardware, or state filings.", hard: false },
  { n: 5, name: "Pain Urgency",               desc: "No direct revenue loss, legal penalty, or shutdown risk.", hard: false },
  { n: 6, name: "Budget Authority Access",    desc: "Cannot reach the economic buyer within 3 steps.", hard: false },
  { n: 7, name: "Sales Cycle Velocity",       desc: "Pilot LOI cannot close within 30–60 days.", hard: false },
  { n: 8, name: "Embedded Expansion Moat",   desc: "No path to fintech payments, lending, or insurance post lock-in.", hard: false },
];

const ROLES = [
  { title: "Assistant Teachers", count: "~110", label: "Field Scouts",      href: "/elite",         Icon: Users,         color: T.moss,    colorLt: T.mossLt },
  { title: "Lead Teachers",      count: "8–10",  label: "Shift Supervisors", href: "/lead-teacher",  Icon: GraduationCap, color: "#3563E9", colorLt: "#EEF4FF" },
  { title: "Super Teachers",     count: "~5",    label: "Venture Directors", href: "/super-teacher", Icon: Crown,         color: T.ember,   colorLt: T.emberLt },
  { title: "Super Admin",        count: "1",     label: "Platform Owner",    href: "/admin",         Icon: ShieldCheck,   color: "#7C3AED", colorLt: "#F5F0FF" },
];

/* ── Page ── */
export default function HomePage() {
  const { user } = useAuth();
  const [activeDim, setActiveDim] = useState(0);
  const [activeTest, setActiveTest] = useState(2);
  const gsapDone = useRef(false);

  /* GSAP: hero text stagger on load */
  useEffect(() => {
    if (gsapDone.current) return;
    gsapDone.current = true;
    import("gsap").then(({ gsap }) =>
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        /* Hero stagger character by character */
        gsap.to(".hero-char", {
          y: 0, opacity: 1, stagger: 0.02, duration: 0.6,
          ease: "power3.out", delay: 0.1,
        });
        gsap.to(".hero-char-2", {
          y: 0, opacity: 1, stagger: 0.02, duration: 0.6,
          ease: "power3.out", delay: 0.5,
        });
        gsap.from(".hero-line-fade", {
          y: 30, opacity: 0, stagger: 0.1, duration: 0.8,
          ease: "power3.out", delay: 0.9,
        });
        /* Scroll-triggered section cards */
        gsap.utils.toArray<HTMLElement>(".gsap-card").forEach((el, i) => {
          gsap.from(el, {
            y: 32, opacity: 0, duration: 0.7, ease: "power3.out",
            delay: (i % 4) * 0.06,
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });
        /* Metric counters strip */
        gsap.from(".stat-block", {
          y: 20, opacity: 0, stagger: 0.1, duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: ".stat-strip", start: "top 88%", once: true },
        });
      })
    );
  }, []);

  const dashUrl = () => {
    if (!user) return "/login";
    if (user.role === "super_admin") return "/admin";
    if (user.role === "super_teacher") return "/super-teacher";
    if (user.role === "lead_teacher") return "/lead-teacher";
    return "/elite";
  };

  return (
    <div style={{ background: T.cloud, color: T.ink, fontFamily: T.INTER }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: T.cloud + "F2", backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ height: 36, width: 36, borderRadius: 8, background: T.moss,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Compass style={{ height: 18, width: 18, color: "#fff" }} />
            </div>
            <div>
              <div style={{ fontFamily: T.SYNE, fontWeight: 800, fontSize: 16, color: T.ink, letterSpacing: "-0.03em" }}>
                Vertical<span style={{ color: T.moss }}>Gate</span>
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted }}>Panaversity</div>
            </div>
          </Link>

          <div className="desktop-nav-links" style={{ display: "flex", alignItems: "center", gap: "clamp(12px, 2vw, 28px)", flexWrap: "wrap", justifyContent: "flex-end" }}>
            {[["#comparison","Matrix"],["#tests","8 Gates"],["#roles","Roles"]].map(([h,l]) => (
              <a key={h} href={h} style={{ fontSize: 13, fontWeight: 500, color: T.muted,
                textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = T.moss)}
                onMouseLeave={(e) => (e.currentTarget.style.color = T.muted)}>
                {l}
              </a>
            ))}
            {user ? (
              <Link href={dashUrl()} style={{ textDecoration: "none" }}>
                <button style={{ display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 24px", borderRadius: 9999, border: "none", cursor: "pointer",
                  background: T.moss, color: "#fff", fontFamily: T.INTER, fontWeight: 600, fontSize: 13,
                  boxShadow: `0 4px 14px ${T.moss}35` }}>
                  Workspace <ArrowRight style={{ height: 14, width: 14 }} />
                </button>
              </Link>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <Link href="/login" style={{ textDecoration: "none" }}>
                  <button style={{ padding: "10px 24px", borderRadius: 9999, border: `1px solid ${T.border}`,
                    cursor: "pointer", background: "transparent", color: T.ink, fontFamily: T.INTER, fontWeight: 500, fontSize: 13 }}>
                    Sign In
                  </button>
                </Link>
                <Link href="/register" style={{ textDecoration: "none" }}>
                  <button style={{ padding: "10px 24px", borderRadius: 9999, border: "none",
                    cursor: "pointer", background: T.moss, color: "#fff", fontFamily: T.INTER, fontWeight: 600, fontSize: 13,
                    boxShadow: `0 4px 12px ${T.moss}30` }}>
                    Scout Intake
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO: full-bleed split ── */}
      <section style={{ maxWidth: 1320, margin: "24px auto 80px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", overflow: "hidden", borderRadius: 24, boxShadow: "0 24px 80px rgba(13, 59, 46, 0.08)", background: T.mossLt }}>
        {/* LEFT: Deep Moss panel */}
        <div className="hero-panel" style={{ background: T.moss, padding: "clamp(4rem, 6vw, 6rem) clamp(2rem, 6vw, 5rem)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 32 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.18)",
              fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.7)", marginBottom: 28 }}>
              <span style={{ height: 6, width: 6, borderRadius: "50%", background: "#4EEDB5", display: "inline-block" }} />
              110 Scout Teachers · Live
            </div>

            <h1 style={{ fontFamily: T.SYNE, fontWeight: 800, fontSize: "clamp(2.4rem, 4vw, 3.75rem)",
              letterSpacing: "-0.04em", lineHeight: 1.05, color: "#fff", margin: 0 }}
              >
              {"Stop building".split("").map((c,i)=><span key={i} className="hero-char" style={{display:"inline-block", opacity:0, transform:"translateY(15px)"}}>{c===" "?"\u00A0":c}</span>)}<br />
              {"commodity".split("").map((c,i)=><span key={i} className="hero-char" style={{display:"inline-block", opacity:0, transform:"translateY(15px)"}}>{c===" "?"\u00A0":c}</span>)}<br />
              {"software.".split("").map((c,i)=><span key={i} className="hero-char" style={{display:"inline-block", opacity:0, transform:"translateY(15px)"}}>{c===" "?"\u00A0":c}</span>)}
            </h1>
            <h1 style={{ fontFamily: T.SYNE, fontWeight: 800, fontSize: "clamp(2.4rem, 4vw, 3.75rem)",
              letterSpacing: "-0.04em", lineHeight: 1.05, color: T.ember, margin: "4px 0 0 0" }}
              >
              {"Own a vertical".split("").map((c,i)=><span key={i} className="hero-char-2" style={{display:"inline-block", opacity:0, transform:"translateY(15px)"}}>{c===" "?"\u00A0":c}</span>)}<br />{"monopoly.".split("").map((c,i)=><span key={i} className="hero-char-2" style={{display:"inline-block", opacity:0, transform:"translateY(15px)"}}>{c===" "?"\u00A0":c}</span>)}
            </h1>
          </div>

          <p className="hero-line-fade" style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.65)", maxWidth: 400, margin: 0 }}>
            VerticalGate qualifies startup domains against <strong style={{ color: "#fff" }}>3 Launch Rules</strong>,{" "}
            <strong style={{ color: "#fff" }}>6 Selling Screens</strong>, and{" "}
            <strong style={{ color: "#fff" }}>8 Fatal-Flaw Tests</strong> — before a line of code is written.
          </p>

          <div className="hero-line-fade" style={{ display: "flex", gap: 12 }}>
            <Link href={dashUrl()} style={{ textDecoration: "none" }}>
              <button style={{ display: "flex", alignItems: "center", gap: 8,
                padding: "14px 28px", borderRadius: 9999, border: "none", cursor: "pointer",
                background: T.ember, color: "#fff", fontFamily: T.INTER, fontWeight: 700, fontSize: 14,
                boxShadow: `0 6px 24px ${T.ember}40` }}>
                {user ? "Open Workspace" : "Begin Screening"} <ArrowRight style={{ height: 16, width: 16 }} />
              </button>
            </Link>
            <a href="#comparison" style={{ textDecoration: "none" }}>
              <button style={{ display: "flex", alignItems: "center", gap: 8,
                padding: "14px 28px", borderRadius: 9999, cursor: "pointer",
                background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(255,255,255,0.18)", fontFamily: T.INTER, fontWeight: 500, fontSize: 14 }}>
                Vertical vs Horizontal
              </button>
            </a>
          </div>

          {/* Stats */}
          <div className="stat-strip hero-line" style={{ display: "flex", gap: "clamp(20px, 4vw, 40px)", paddingTop: 24, flexWrap: "wrap",
            borderTop: "1px solid rgba(255,255,255,0.12)" }}>
            {[{ n: 110, l: "Scout Teachers" }, { n: 8, l: "Fatal Tests" }, { n: 3, l: "Daily Shifts" }].map((m) => (
              <div key={m.l} className="stat-block">
                <div style={{ fontFamily: T.SYNE, fontWeight: 800, fontSize: "2rem", color: "#fff", lineHeight: 1 }}>
                  <Counter target={m.n} />
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{m.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: 3D Dossier card */}
        <div style={{ background: T.cloud, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(2rem, 5vw, 3rem) clamp(1rem, 5vw, 2.5rem)" }}>
          <TiltCard style={{ width: "100%", maxWidth: 420 }}>
            <div style={{ background: T.white, borderRadius: 12, border: `1px solid ${T.border}`,
              boxShadow: "0 24px 80px rgba(27,43,75,0.12), 0 4px 12px rgba(27,43,75,0.06)",
              padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                paddingBottom: 16, borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ height: 8, width: 8, borderRadius: "50%", background: T.moss, display: "inline-block" }} />
                  <span style={{ fontFamily: T.SYNE, fontWeight: 700, fontSize: 11,
                    textTransform: "uppercase", letterSpacing: "0.08em", color: T.moss }}>
                    Dossier #48
                  </span>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700,
                  background: T.mossLt, color: T.moss, border: `1px solid ${T.mossBd}` }}>
                  <CheckCircle2 style={{ height: 12, width: 12 }} /> Eligible
                </span>
              </div>

              {/* Domain */}
              <div>
                <div style={{ fontFamily: T.SYNE, fontWeight: 700, fontSize: 15, color: T.ink, lineHeight: 1.4 }}>
                  Dental Implant Inventory & OSHA Sterilization AI
                </div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>
                  Dr. Sarah Vance · 8 Yrs Orthodontic Practice Owner
                </div>
              </div>

              {/* Scores */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Selling-Ease", val: "8.8", of: "/10",  color: T.moss },
                  { label: "Fatal-Flaw",   val: "7.4", of: "/8.0", color: T.ember },
                ].map((s) => (
                  <div key={s.label} style={{ padding: "14px 16px", borderRadius: 8,
                    background: T.cloud, border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.muted }}>{s.label}</div>
                    <div style={{ fontFamily: T.SYNE, fontWeight: 800, fontSize: 22, color: s.color, marginTop: 4 }}>
                      {s.val}<span style={{ fontSize: 12, fontWeight: 400, color: T.muted }}>{s.of}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Test 3 */}
              <div style={{ padding: "14px 16px", borderRadius: 8, background: T.mossLt, border: `1px solid ${T.mossBd}` }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <CheckCircle2 style={{ height: 15, width: 15, color: T.moss, flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.moss }}>Test 3 — Expert Override: PASSED</div>
                    <div style={{ fontSize: 12, color: "#1A5C47", marginTop: 3 }}>
                      Board-certified dental advisors confirmed. Mandatory state sterilization tracking active.
                    </div>
                  </div>
                </div>
              </div>

              {/* Beachhead */}
              <div style={{ padding: "12px 14px", borderRadius: 8, background: T.emberLt, border: `1px solid ${T.emberBd}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.ember, marginBottom: 4 }}>
                  Beachhead Slice
                </div>
                <div style={{ fontSize: 12, color: "#7A3520" }}>
                  Private multi-chair cosmetic dental practices in Texas with 3+ operatories.
                </div>
              </div>

              {/* 3D float label */}
              <div style={{ position: "absolute", top: -10, right: -10, padding: "4px 10px",
                borderRadius: 4, background: T.ember, color: "#fff",
                fontSize: 10, fontWeight: 700, boxShadow: "0 4px 12px rgba(255,107,53,0.4)",
                transform: "translateZ(30px)" }}>
                LIVE DEMO
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ── COMPARISON MATRIX ── */}
      <section id="comparison" style={{ background: T.white, borderTop: `1px solid ${T.border}`, padding: "96px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }}>
          <Reveal>
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.moss, marginBottom: 12 }}>
                Strategic Divergence
              </div>
              <h2 style={{ fontFamily: T.SYNE, fontWeight: 800, fontSize: "clamp(2rem, 3.5vw, 3rem)",
                letterSpacing: "-0.03em", color: T.ink, margin: 0 }}>
                Why Vertical SaaS Crushes<br />Horizontal Tools
              </h2>
            </div>
          </Reveal>

          {/* Dimension tabs */}
          <Reveal delay={0.1}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
              {COMPARISONS.map((c, i) => (
                <button key={c.dim} onClick={() => setActiveDim(i)} style={{
                  padding: "8px 18px", borderRadius: 6, border: `1px solid ${activeDim === i ? T.moss : T.border}`,
                  cursor: "pointer", fontFamily: T.INTER, fontWeight: 600, fontSize: 13,
                  background: activeDim === i ? T.moss : T.cloud, color: activeDim === i ? "#fff" : T.muted,
                  transition: "all 0.15s",
                }}>
                  {c.dim}
                </button>
              ))}
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            <Reveal delay={0.1}>
              <div className="gsap-card" style={{ padding: "36px", borderRadius: 10, border: `1px solid ${T.emberBd}`,
                background: T.emberLt, display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                    color: T.ember }}>Horizontal Trap</span>
                  <XCircle style={{ height: 18, width: 18, color: T.ember }} />
                </div>
                <div>
                  <div style={{ fontFamily: T.SYNE, fontWeight: 800, fontSize: 22, color: T.ember }}>
                    {COMPARISONS[activeDim].bad.label}
                  </div>
                  <p style={{ fontSize: 14, color: "#7A3520", marginTop: 8, lineHeight: 1.6 }}>
                    {COMPARISONS[activeDim].bad.note}
                  </p>
                </div>
                <code style={{ fontSize: 12, fontWeight: 700, padding: "10px 14px", borderRadius: 6,
                  background: "#FDE8E0", color: T.ember }}>
                  Generic SaaS → Commodity → High churn → Value trap
                </code>
              </div>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="gsap-card" style={{ padding: "36px", borderRadius: 10, border: `1px solid ${T.mossBd}`,
                background: T.mossLt, display: "flex", flexDirection: "column", gap: 20,
                boxShadow: `0 12px 40px ${T.moss}12` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.moss }}>Vertical Monopoly</span>
                  <CheckCircle2 style={{ height: 18, width: 18, color: T.moss }} />
                </div>
                <div>
                  <div style={{ fontFamily: T.SYNE, fontWeight: 800, fontSize: 22, color: T.moss }}>
                    {COMPARISONS[activeDim].good.label}
                  </div>
                  <p style={{ fontSize: 14, color: "#0A3D2E", marginTop: 8, lineHeight: 1.6 }}>
                    {COMPARISONS[activeDim].good.note}
                  </p>
                </div>
                <code style={{ fontSize: 12, fontWeight: 700, padding: "10px 14px", borderRadius: 6,
                  background: "#D4EDE7", color: "#0A4337" }}>
                  Vertical lock-in → Premium pricing → 0.5% churn → 130% NRR
                </code>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 8 FATAL TESTS ── */}
      <section id="tests" style={{ background: T.cloud, borderTop: `1px solid ${T.border}`, padding: "96px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }}>
          <Reveal>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 40 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.moss, marginBottom: 12 }}>
                  Gatekeeper Logic
                </div>
                <h2 style={{ fontFamily: T.SYNE, fontWeight: 800, fontSize: "clamp(2rem, 3.5vw, 3rem)",
                  letterSpacing: "-0.03em", color: T.ink, margin: 0 }}>
                  8 Fatal-Flaw Screening Gates
                </h2>
              </div>
              <div style={{ padding: "14px 20px", borderRadius: 8, border: `1px solid ${T.emberBd}`,
                background: T.emberLt, fontSize: 13, color: "#7A3520", maxWidth: 300 }}>
                <strong>Test 3</strong> is a <strong>hard stop</strong> — no domain expert means parked, regardless of all other scores.
              </div>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 20 }}>
            {FATAL_TESTS.map((t, i) => (
              <button key={t.n} onClick={() => setActiveTest(i)} className="gsap-card" style={{
                padding: "18px 20px", borderRadius: 8, border: `1px solid ${activeTest === i ? (t.hard ? T.moss : "#9CA3AF") : T.border}`,
                cursor: "pointer", textAlign: "left", fontFamily: T.INTER, transition: "all 0.15s",
                background: activeTest === i ? (t.hard ? T.mossLt : "#F8F8FA") : T.white,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    color: activeTest === i ? (t.hard ? T.moss : T.ink) : T.muted }}>
                    Gate 0{t.n}
                  </span>
                  {t.hard && (
                    <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 3,
                      background: T.moss, color: "#fff" }}>OVERRIDE</span>
                  )}
                </div>
                <div style={{ fontFamily: T.SYNE, fontWeight: 700, fontSize: 13, color: activeTest === i ? (t.hard ? T.moss : T.ink) : T.ink, marginBottom: 6 }}>
                  {t.name}
                </div>
                <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, margin: 0 }}>{t.desc}</p>
              </button>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16,
              padding: "20px 24px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.white }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.moss, marginBottom: 4 }}>
                  Inspecting: Gate 0{FATAL_TESTS[activeTest].n} — {FATAL_TESTS[activeTest].name}
                </div>
                <p style={{ fontSize: 14, color: T.inkLight, margin: 0 }}>{FATAL_TESTS[activeTest].desc}</p>
              </div>
              <Link href={dashUrl()} style={{ textDecoration: "none" }}>
                <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 6,
                  border: "none", cursor: "pointer", background: T.moss, color: "#fff",
                  fontFamily: T.INTER, fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" }}>
                  Run in Workspace <ChevronRight style={{ height: 14, width: 14 }} />
                </button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" style={{ background: T.white, borderTop: `1px solid ${T.border}`, padding: "96px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }}>
          <Reveal>
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.moss, marginBottom: 12 }}>
                Institutional Structure
              </div>
              <h2 style={{ fontFamily: T.SYNE, fontWeight: 800, fontSize: "clamp(2rem, 3.5vw, 3rem)",
                letterSpacing: "-0.03em", color: T.ink, margin: 0 }}>
                Multi-Tier Cohort Ecosystem
              </h2>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
            {ROLES.map(({ title, count, label, href, Icon, color, colorLt }) => (
              <Reveal key={title} delay={0.05}>
                <div className="gsap-card" style={{ padding: "24px", borderRadius: 10, border: `1px solid ${T.border}`,
                  background: T.white, display: "flex", flexDirection: "column", gap: 16,
                  transition: "box-shadow 0.2s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 32px rgba(27,43,75,0.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
                  <div style={{ height: 44, width: 44, borderRadius: 8, background: colorLt,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon style={{ height: 20, width: 20, color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color, marginBottom: 4 }}>
                      {label} · {count}
                    </div>
                    <div style={{ fontFamily: T.SYNE, fontWeight: 700, fontSize: 15, color: T.ink }}>{title}</div>
                  </div>
                  <Link href={href} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700,
                      paddingTop: 12, borderTop: `1px solid ${T.border}`, color }}>
                      {href} <ArrowUpRight style={{ height: 13, width: 13 }} />
                    </div>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: T.cloud, borderTop: `1px solid ${T.border}`, padding: "80px 0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 2rem", textAlign: "center" }}>
          <Reveal>
            <div style={{ padding: "clamp(32px, 6vw, 64px) clamp(24px, 5vw, 48px)", borderRadius: 12, background: T.moss }}>
              <h2 style={{ fontFamily: T.SYNE, fontWeight: 800, fontSize: "clamp(1.8rem,3vw,2.75rem)",
                letterSpacing: "-0.03em", color: "#fff", margin: "0 0 16px 0" }}>
                Ready to qualify defensible vertical ventures?
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", marginBottom: 28 }}>
                Join 110 assistant teachers across morning, afternoon, and evening shifts.
              </p>
              <Link href={dashUrl()} style={{ textDecoration: "none" }}>
                <button style={{ display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "14px 32px", borderRadius: 6, border: "none", cursor: "pointer",
                  background: T.ember, color: "#fff", fontFamily: T.INTER, fontWeight: 700, fontSize: 15,
                  boxShadow: `0 8px 32px ${T.ember}40` }}>
                  {user ? "Open Your Workspace" : "Enter VerticalGate"}
                  <ArrowRight style={{ height: 16, width: 16 }} />
                </button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${T.border}`, padding: "28px 0", background: T.cloud }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem",
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Compass style={{ height: 16, width: 16, color: T.moss }} />
            <span style={{ fontFamily: T.SYNE, fontWeight: 700, fontSize: 14, color: T.ink }}>VerticalGate</span>
            <span style={{ color: T.muted }}>·</span>
            <span style={{ fontSize: 13, color: T.muted }}>Panaversity Agent Factory</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[["#comparison","Matrix"],["#tests","Fatal Tests"],["#roles","Roles"],["/login","Sign In"]].map(([h,l]) => (
              <a key={h} href={h} style={{ fontSize: 13, color: T.muted, textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
