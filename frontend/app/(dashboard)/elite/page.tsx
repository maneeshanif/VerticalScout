"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Member, Evaluation, BatchType } from "@/types";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { QuickIntakeDialog } from "@/components/shared/quick-intake-dialog";
import { CommandMenu } from "@/components/shared/command-menu";
import NumberFlow from "@number-flow/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Users, Plus, Search, Sparkles, CheckCircle2, AlertCircle,
  Clock, Briefcase, Flame, ChevronRight, TrendingUp, Trash2,
  Shield, ArrowUpRight, Bot, Target, Sun, Sunset, Moon,
  Filter, LayoutGrid, List as ListIcon, RefreshCw, Loader2
} from "lucide-react";

export default function EliteDashboardPage() {
  const { user, updateBatch } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [evaluations, setEvaluations] = useState<Record<number, Evaluation>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [evaluatingMemberId, setEvaluatingMemberId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
      toast.error("Failed to load candidate registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleMemberCreated = (newMember: Member) => {
    setMembers((prev) => [newMember, ...prev]);
  };

  const handleRunEvaluation = async (e: React.MouseEvent, memberId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setEvaluatingMemberId(memberId);
    toast.info("Triggering AI Domain Evaluation...");

    try {
      const res = await fetchWithAuth(`/evaluations/${memberId}/run`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Evaluation failed to run.");
      }

      const evalData: Evaluation = await res.json();
      setEvaluations((prev) => ({ ...prev, [memberId]: evalData }));
      toast.success(
        `Evaluation Complete: ${evalData.outcome === "eligible" ? "Eligible (Good to Go) 🎉" : evalData.outcome === "service_domain" ? "Service Domain" : "Parked"}`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to complete evaluation.");
    } finally {
      setEvaluatingMemberId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Permanently delete candidate "${name}"?`)) return;
    const res = await fetchWithAuth(`/members/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMembers((p) => p.filter((m) => m.id !== id));
      toast.success(`Candidate "${name}" deleted.`);
    } else {
      toast.error("Failed to delete candidate.");
    }
  };

  const filtered = members.filter((m) => {
    const ev = evaluations[m.id];
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.domain.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search);

    if (!matchesSearch) return false;

    if (statusFilter === "eligible") return ev?.outcome === "eligible";
    if (statusFilter === "service_domain") return ev?.outcome === "service_domain";
    if (statusFilter === "parked") return ev?.outcome === "parked";
    if (statusFilter === "pending") return !ev || ev.status === "pending" || ev.status === "failed";
    return true;
  });

  const evaluatedCount = Object.keys(evaluations).length;
  const eligibleCount = Object.values(evaluations).filter((e) => e.outcome === "eligible").length;
  const isTeacherOrAdmin = user && user.role !== "elite_user";

  const getOutcomeConfig = (outcome?: string | null) => {
    switch (outcome) {
      case "eligible":
        return { label: "Eligible (Good to Go)", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
      case "service_domain":
        return { label: "Service Domain", color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" };
      case "parked":
        return { label: "Parked", color: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-400" };
      default:
        return { label: "Pending Evaluation", color: "bg-primary/5 text-primary border-primary/20 border-dashed", dot: "bg-primary/40" };
    }
  };

  const getBatchIcon = (b?: string | null) => {
    if (b === "morning") return <Sun className="h-3.5 w-3.5 text-amber-500" />;
    if (b === "afternoon") return <Sunset className="h-3.5 w-3.5 text-orange-500" />;
    if (b === "evening") return <Moon className="h-3.5 w-3.5 text-indigo-500" />;
    return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6 sm:space-y-7 max-w-7xl mx-auto pb-12">
      <CommandMenu />
      <QuickIntakeDialog
        open={intakeOpen}
        onOpenChange={setIntakeOpen}
        onMemberCreated={handleMemberCreated}
      />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
            {isTeacherOrAdmin ? (
              <>
                <Shield className="h-3.5 w-3.5" />
                <span>Supervisory Registry · {user?.role?.replace(/_/g, " ")}</span>
              </>
            ) : (
              <>
                <Target className="h-3.5 w-3.5" />
                <span>Scout Terminal · Assistant Teacher</span>
              </>
            )}
            {user?.batch && (
              <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-[11px] font-mono text-foreground font-semibold">
                {getBatchIcon(user.batch)}
                <span className="capitalize">{user.batch} Shift</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {isTeacherOrAdmin ? "Candidate Registry & Analysis" : "Venture Scout Workspace"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            {isTeacherOrAdmin
              ? "Comprehensive overview of all collected student candidates, domain evaluations, and venture eligibility."
              : "Collect candidate profiles during your active shift and run rigorous AI domain evaluations using the 5-step / 8-test framework."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="h-9 text-xs gap-1.5"
            title="Refresh registry"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Link href="/elite/leaderboard">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
              <span>Leaderboards</span>
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={() => setIntakeOpen(true)}
            className="gap-1.5 h-9 text-xs font-semibold shadow-sm shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            <span>+ Fast Intake</span>
          </Button>
        </div>
      </div>

      {/* ── KPI Stat Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card rounded-xl border border-border/80 p-4 sm:p-5 flex items-center gap-4 shadow-sm hover:border-primary/30 transition-all">
          <div className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-extrabold text-foreground tabular-nums">
              <NumberFlow value={members.length} />
            </div>
            <div className="text-xs text-muted-foreground font-medium truncate">
              {isTeacherOrAdmin ? "Total Candidates" : "My Candidates"}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border/80 p-4 sm:p-5 flex items-center gap-4 shadow-sm hover:border-violet-500/30 transition-all">
          <div className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0 bg-violet-100 text-violet-600">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-extrabold text-foreground tabular-nums">
              <NumberFlow value={evaluatedCount} />
            </div>
            <div className="text-xs text-muted-foreground font-medium truncate">AI Evaluated</div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border/80 p-4 sm:p-5 flex items-center gap-4 shadow-sm hover:border-emerald-500/30 transition-all">
          <div className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-extrabold text-foreground tabular-nums text-emerald-600">
              <NumberFlow value={eligibleCount} />
            </div>
            <div className="text-xs text-muted-foreground font-medium truncate">Good to Go Verticals</div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border/80 p-4 sm:p-5 flex items-center gap-4 shadow-sm hover:border-amber-500/30 transition-all">
          <div className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0 bg-amber-100 text-amber-600">
            <Flame className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-extrabold text-foreground tabular-nums">
              <NumberFlow
                value={members.length > 0 ? (evaluatedCount / members.length) : 0}
                format={{ style: "percent" }}
              />
            </div>
            <div className="text-xs text-muted-foreground font-medium truncate">Evaluation Throughput</div>
          </div>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidate by name, domain, or phone... (⌘K for quick switcher)"
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

          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-9 w-9 p-0"
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-9 w-9 p-0"
              title="List View"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground font-medium shrink-0 flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" /> Filter:
          </span>
          {[
            { id: "all", label: "All Candidates", count: members.length },
            { id: "eligible", label: "Eligible (Good to Go)", count: eligibleCount },
            { id: "service_domain", label: "Service Domain", count: Object.values(evaluations).filter((e) => e.outcome === "service_domain").length },
            { id: "parked", label: "Parked", count: Object.values(evaluations).filter((e) => e.outcome === "parked").length },
            { id: "pending", label: "Pending Analysis", count: members.length - evaluatedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "px-3 py-1 rounded-full font-medium transition-all shrink-0 flex items-center gap-1.5 border",
                statusFilter === tab.id
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-card text-muted-foreground border-border/80 hover:border-foreground/40 hover:text-foreground"
              )}
            >
              <span>{tab.label}</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                statusFilter === tab.id ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Candidate Feed / Grid ── */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 rounded-xl bg-card border border-border/80 animate-pulse p-5 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-16 bg-muted/40 rounded mt-4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center bg-card rounded-xl border border-dashed border-border/80">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">
              {search || statusFilter !== "all" ? "No matching candidates found" : "No candidates registered yet"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {search || statusFilter !== "all"
                ? "Try clearing your filters or search keyword to see all candidates."
                : "Start collecting student domain concepts during your shift."}
            </p>
          </div>
          {search || statusFilter !== "all" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSearch(""); setStatusFilter("all"); }}
              className="text-xs"
            >
              Reset Filters
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setIntakeOpen(true)}
              className="gap-1.5 mt-1 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              + Fast Candidate Intake
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member) => {
            const ev = evaluations[member.id];
            const oc = getOutcomeConfig(ev?.outcome);
            const isEvaluatingThis = evaluatingMemberId === member.id;

            return (
              <div
                key={member.id}
                className="group relative bg-card rounded-xl border border-border/80 overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-200 flex flex-col h-full"
              >
                {/* Top Accent Strip */}
                <div
                  className={cn(
                    "h-1.5 w-full transition-all",
                    ev?.outcome === "eligible"
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                      : ev?.outcome === "service_domain"
                      ? "bg-gradient-to-r from-amber-400 to-amber-600"
                      : ev?.outcome === "parked"
                      ? "bg-slate-400"
                      : "bg-primary/20"
                  )}
                />

                <div className="p-5 flex-1 flex flex-col gap-3.5">
                  {/* Title & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <Link href={`/elite/members/${member.id}`}>
                        <h3 className="font-bold text-[15px] text-foreground group-hover:text-primary transition-colors leading-tight truncate">
                          {member.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Briefcase className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                        <span className="font-medium text-foreground/80 truncate">{member.domain}</span>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "flex items-center gap-1.5 text-[11px] font-semibold border rounded-full px-2.5 py-1 shrink-0 whitespace-nowrap",
                        oc.color
                      )}
                    >
                      <div className={cn("h-1.5 w-1.5 rounded-full", oc.dot)} />
                      {oc.label}
                    </div>
                  </div>

                  {/* Experience & Contact Grid */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs pt-3 border-t border-border/60">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">
                        Experience
                      </div>
                      <div className="font-medium text-foreground truncate">{member.experience}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">
                        Phone
                      </div>
                      <div className="font-medium text-foreground font-mono text-[11px]">{member.phone}</div>
                    </div>
                  </div>

                  {/* Description / notes snippet */}
                  {member.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded-lg italic">
                      "{member.description}"
                    </p>
                  )}

                  {/* Score strip if evaluated */}
                  {ev?.screen_score != null && (
                    <div className="mt-auto flex items-center justify-between text-[11px] font-mono text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 border border-border/40">
                      <span>Screen: <strong className="text-foreground">{ev.screen_score.toFixed(1)}</strong>/10</span>
                      <span className="text-border">|</span>
                      <span>Tests: <strong className="text-foreground">{ev.tests_score?.toFixed(1) ?? "0.0"}</strong>/8</span>
                      {ev.full_result?.beachhead_recommendation && (
                        <span className="text-[10px] text-emerald-600 font-sans font-semibold truncate max-w-[90px]" title={ev.full_result.beachhead_recommendation}>
                          🎯 {ev.full_result.beachhead_recommendation}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-border/60 bg-muted/15 gap-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/elite/members/${member.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-primary px-2.5 gap-1 hover:bg-primary/10">
                        <span>{ev ? "View Dossier" : "Open Profile"}</span>
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </Link>

                    {!ev && (
                      <Button
                        size="sm"
                        variant="default"
                        disabled={isEvaluatingThis}
                        onClick={(e) => handleRunEvaluation(e, member.id)}
                        className="h-8 text-xs font-semibold gap-1 shadow-sm"
                      >
                        {isEvaluatingThis ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Evaluating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 text-amber-300" />
                            Run AI
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, member.id, member.name)}
                    className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete candidate"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-card rounded-xl border border-border/80 shadow-sm overflow-hidden divide-y divide-border/60">
          {filtered.map((member) => {
            const ev = evaluations[member.id];
            const oc = getOutcomeConfig(ev?.outcome);
            const isEvaluatingThis = evaluatingMemberId === member.id;

            return (
              <div key={member.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Link href={`/elite/members/${member.id}`} className="font-bold text-foreground hover:text-primary text-sm sm:text-base">
                      {member.name}
                    </Link>
                    <div className={cn("flex items-center gap-1.5 text-[11px] font-semibold border rounded-full px-2.5 py-0.5", oc.color)}>
                      <div className={cn("h-1.5 w-1.5 rounded-full", oc.dot)} />
                      {oc.label}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{member.domain}</span>
                    <span>·</span>
                    <span>{member.experience}</span>
                    <span>·</span>
                    <span className="font-mono text-[11px]">{member.phone}</span>
                  </div>
                </div>

                {/* Score & actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {ev?.screen_score != null && (
                    <div className="text-right hidden md:block">
                      <div className="text-xs font-mono font-bold text-foreground">
                        S: {ev.screen_score.toFixed(1)} | T: {ev.tests_score?.toFixed(1) ?? "0.0"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Screen & Tests</div>
                    </div>
                  )}

                  {!ev && (
                    <Button
                      size="sm"
                      disabled={isEvaluatingThis}
                      onClick={(e) => handleRunEvaluation(e, member.id)}
                      className="h-8 text-xs font-semibold gap-1"
                    >
                      {isEvaluatingThis ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      Run AI
                    </Button>
                  )}

                  <Link href={`/elite/members/${member.id}`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      View
                    </Button>
                  </Link>

                  <button
                    onClick={(e) => handleDelete(e, member.id, member.name)}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
