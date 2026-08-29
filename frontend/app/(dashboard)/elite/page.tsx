"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Member, Evaluation } from "@/types";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Users, Plus, Search, Sparkles, CheckCircle2, AlertCircle,
  Clock, Briefcase, Flame, ChevronRight, TrendingUp, Trash2,
  Shield, ArrowUpRight, Bot, Target,
} from "lucide-react";

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) => (
  <div className="bg-card rounded-xl border border-border/80 p-4 sm:p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", color)}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0">
      <div className="text-2xl font-extrabold text-foreground tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground font-medium truncate">{label}</div>
    </div>
  </div>
);

export default function EliteDashboardPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [evaluations, setEvaluations] = useState<Record<number, Evaluation>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [membersRes, evalsRes] = await Promise.all([
        fetchWithAuth("/members"),
        fetchWithAuth("/evaluations"),
      ]);
      if (membersRes.ok) setMembers(await membersRes.json());
      if (evalsRes.ok) {
        const evalsData: Evaluation[] = await evalsRes.json();
        const evalsMap: Record<number, Evaluation> = {};
        evalsData.forEach((ev) => {
          if (!evalsMap[ev.member_id] || new Date(ev.created_at) > new Date(evalsMap[ev.member_id].created_at)) {
            evalsMap[ev.member_id] = ev;
          }
        });
        setEvaluations(evalsMap);
      }
    } catch (err) {
      console.error("Failed to load", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (e: React.MouseEvent, id: number, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await fetchWithAuth(`/members/${id}`, { method: "DELETE" });
    if (res.ok) setMembers((p) => p.filter((m) => m.id !== id));
  };

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.domain.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search)
  );

  const evaluatedCount = Object.keys(evaluations).length;
  const eligibleCount = Object.values(evaluations).filter((e) => e.outcome === "eligible").length;
  const isTeacherOrAdmin = user && user.role !== "elite_user";

  const getOutcomeConfig = (outcome?: string | null) => {
    switch (outcome) {
      case "eligible":    return { label: "Eligible", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
      case "service_domain": return { label: "Service", color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" };
      case "parked":      return { label: "Parked", color: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" };
      default:            return { label: "Pending", color: "bg-primary/6 text-primary border-primary/20 border-dashed", dot: "bg-primary/40" };
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
            {isTeacherOrAdmin ? (
              <><Shield className="h-3 w-3" /><span>Platform Registry · {user?.role?.replace(/_/g, " ")}</span></>
            ) : (
              <><Target className="h-3 w-3" /><span>My Workspace</span></>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {isTeacherOrAdmin ? "Candidate Registry" : "Scouting Workspace"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            {isTeacherOrAdmin
              ? "Review, edit, and run AI evaluations across all candidates in the cohort."
              : "Collect candidate details and run AI-powered vertical evaluations."}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/elite/leaderboard">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs hidden sm:inline-flex">
              <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
              Leaderboard
            </Button>
          </Link>
          <Link href="/elite/members/new">
            <Button size="sm" className="gap-1.5 h-9 text-xs font-semibold shadow-sm shadow-primary/20">
              <Plus className="h-3.5 w-3.5" />
              Add Candidate
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Users} label={isTeacherOrAdmin ? "Total Candidates" : "My Candidates"} value={members.length} color="bg-primary/10 text-primary" />
        <StatCard icon={Bot} label="AI Evaluated" value={evaluatedCount} color="bg-violet-100 text-violet-600" />
        <StatCard icon={CheckCircle2} label="Eligible Verticals" value={eligibleCount} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={Flame} label="Evaluation Rate" value={members.length > 0 ? `${Math.round((evaluatedCount / members.length) * 100)}%` : "0%"} color="bg-amber-100 text-amber-600" />
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, domain, or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 bg-card border-border/80 text-sm shadow-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Candidate grid ── */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted/40 shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-base">
              {search ? "No results found" : "No candidates yet"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {search
                ? "Try a different name, domain, or phone number."
                : "Start scouting by adding your first candidate profile."}
            </p>
          </div>
          {!search && (
            <Link href="/elite/members/new">
              <Button size="sm" className="gap-1.5 mt-1">
                <Plus className="h-3.5 w-3.5" />
                Add First Candidate
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
            <span><span className="font-semibold text-foreground">{filtered.length}</span> candidate{filtered.length !== 1 ? "s" : ""}{search ? " found" : ""}</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((member) => {
              const ev = evaluations[member.id];
              const oc = getOutcomeConfig(ev?.outcome);
              return (
                <Link key={member.id} href={`/elite/members/${member.id}`}>
                  <div className="group relative bg-card rounded-xl border border-border/80 overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/8 transition-all duration-200 cursor-pointer flex flex-col h-full">
                    {/* Card top accent bar */}
                    <div className={cn(
                      "h-1 w-full transition-all",
                      ev?.outcome === "eligible" ? "bg-gradient-to-r from-emerald-400 to-emerald-500" :
                      ev?.outcome === "service_domain" ? "bg-gradient-to-r from-amber-400 to-amber-500" :
                      ev?.outcome === "parked" ? "bg-slate-300" :
                      "bg-gradient-to-r from-primary/30 to-violet-400/30"
                    )} />

                    <div className="p-5 flex-1 flex flex-col gap-3.5">
                      {/* Name & outcome badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <h3 className="font-bold text-[15px] text-foreground group-hover:text-primary transition-colors leading-tight truncate">
                            {member.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Briefcase className="h-3 w-3 shrink-0 text-primary/60" />
                            <span className="font-medium text-foreground/80 truncate">{member.domain}</span>
                          </div>
                        </div>
                        <div className={cn(
                          "flex items-center gap-1.5 text-[11px] font-semibold border rounded-full px-2 py-1 shrink-0 whitespace-nowrap",
                          oc.color
                        )}>
                          <div className={cn("h-1.5 w-1.5 rounded-full", oc.dot)} />
                          {oc.label}
                        </div>
                      </div>

                      {/* Experience + contact */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs pt-3 border-t border-border/60">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 mb-0.5">Experience</div>
                          <div className="font-medium text-foreground/90 line-clamp-1">{member.experience}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 mb-0.5">Contact</div>
                          <div className="font-medium text-foreground/90">{member.phone}</div>
                        </div>
                      </div>

                      {/* Scores */}
                      {ev?.screen_score != null && (
                        <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                          <span>Screen <span className="font-bold text-foreground">{ev.screen_score.toFixed(1)}</span>/10</span>
                          <span className="text-border">·</span>
                          <span>Tests <span className="font-bold text-foreground">{ev.tests_score?.toFixed(1) ?? "0.0"}</span>/8</span>
                        </div>
                      )}
                    </div>

                    {/* Card footer */}
                    <div className="flex items-center justify-between px-5 py-3 border-t border-border/60 bg-muted/20">
                      <span className="text-xs font-semibold text-primary flex items-center gap-1">
                        {ev ? "View Report" : "Run Evaluation"}
                        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, member.id, member.name)}
                        className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete candidate"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
