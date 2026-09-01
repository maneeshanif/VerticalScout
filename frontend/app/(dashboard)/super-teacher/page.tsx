"use client";

import React, { useEffect, useState } from "react";
import { User, Member, Evaluation, SystemStats, TeacherLeaderboardEntry } from "@/types";
import { fetchWithAuth } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import NumberFlow from "@number-flow/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  Users,
  Search,
  Sparkles,
  Bot,
  Loader2,
  TrendingUp,
  Shield,
  Layers,
  Crown,
  Target,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ChevronRight,
  Send,
  HelpCircle,
  ArrowUpRight,
  Sun,
  Sunset,
  Moon,
  BarChart3,
  Award,
} from "lucide-react";
import Link from "next/link";

export default function SuperTeacherPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [teacherRanks, setTeacherRanks] = useState<TeacherLeaderboardEntry[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  // AI Query Console State
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<any | null>(null);
  const [queryingAi, setQueryingAi] = useState(false);

  // Filter state for Verticals Tracker
  const [verticalSearch, setVerticalSearch] = useState("");
  const [selectedShift, setSelectedShift] = useState<string>("all");

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, membersRes, evalsRes, teachersRes, statsRes] = await Promise.all([
        fetchWithAuth("/users"),
        fetchWithAuth("/members"),
        fetchWithAuth("/evaluations"),
        fetchWithAuth("/leaderboard/teachers"),
        fetchWithAuth("/admin/stats"),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (membersRes.ok) setMembers(await membersRes.json());
      if (evalsRes.ok) setEvaluations(await evalsRes.json());
      if (teachersRes.ok) setTeacherRanks(await teachersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (e) {
      console.error("Failed to load Super Teacher data", e);
      toast.error("Failed to load institutional overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAskAi = async (questionToAsk?: string) => {
    const q = questionToAsk || aiQuestion;
    if (!q.trim()) return;
    setQueryingAi(true);
    setAiAnswer(null);

    try {
      const res = await fetchWithAuth("/ai/query", {
        method: "POST",
        body: JSON.stringify({ question: q.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "AI query service error");
      }

      const data = await res.json();
      setAiAnswer(data);
      toast.success("AI Query answered");
    } catch (e: any) {
      toast.error(e.message || "Failed to process AI query");
    } finally {
      setQueryingAi(false);
    }
  };

  const leadTeachers = users.filter((u) => u.role === "lead_teacher");
  const superTeachers = users.filter((u) => u.role === "super_teacher");
  const eliteUsers = users.filter((u) => u.role === "elite_user");

  // Map member to its evaluation
  const memberEvalMap: Record<number, Evaluation> = {};
  evaluations.forEach((ev) => {
    if (!memberEvalMap[ev.member_id] || new Date(ev.created_at) > new Date(memberEvalMap[ev.member_id].created_at)) {
      memberEvalMap[ev.member_id] = ev;
    }
  });

  const eligibleMembers = members.filter((m) => memberEvalMap[m.id]?.outcome === "eligible");
  const serviceMembers = members.filter((m) => memberEvalMap[m.id]?.outcome === "service_domain");
  const parkedMembers = members.filter((m) => memberEvalMap[m.id]?.outcome === "parked");

  // Chart data: Morning vs Afternoon vs Evening
  const chartData = [
    {
      shift: "Morning",
      Candidates: members.filter((m) => users.find((u) => u.id === m.elite_user_id)?.batch === "morning").length,
      Evaluated: members.filter((m) => users.find((u) => u.id === m.elite_user_id)?.batch === "morning" && memberEvalMap[m.id]).length,
      Eligible: members.filter((m) => users.find((u) => u.id === m.elite_user_id)?.batch === "morning" && memberEvalMap[m.id]?.outcome === "eligible").length,
    },
    {
      shift: "Afternoon",
      Candidates: members.filter((m) => users.find((u) => u.id === m.elite_user_id)?.batch === "afternoon").length,
      Evaluated: members.filter((m) => users.find((u) => u.id === m.elite_user_id)?.batch === "afternoon" && memberEvalMap[m.id]).length,
      Eligible: members.filter((m) => users.find((u) => u.id === m.elite_user_id)?.batch === "afternoon" && memberEvalMap[m.id]?.outcome === "eligible").length,
    },
    {
      shift: "Evening",
      Candidates: members.filter((m) => users.find((u) => u.id === m.elite_user_id)?.batch === "evening").length,
      Evaluated: members.filter((m) => users.find((u) => u.id === m.elite_user_id)?.batch === "evening" && memberEvalMap[m.id]).length,
      Eligible: members.filter((m) => users.find((u) => u.id === m.elite_user_id)?.batch === "evening" && memberEvalMap[m.id]?.outcome === "eligible").length,
    },
  ];

  const filteredEligible = eligibleMembers.filter((m) => {
    const eliteUser = users.find((u) => u.id === m.elite_user_id);
    const matchesShift = selectedShift === "all" || eliteUser?.batch === selectedShift;
    const matchesSearch =
      m.name.toLowerCase().includes(verticalSearch.toLowerCase()) ||
      m.domain.toLowerCase().includes(verticalSearch.toLowerCase()) ||
      memberEvalMap[m.id]?.full_result?.beachhead_recommendation?.toLowerCase().includes(verticalSearch.toLowerCase());
    return matchesShift && (verticalSearch ? matchesSearch : true);
  });

  const getBatchIcon = (b?: string | null) => {
    if (b === "morning") return <Sun className="h-3.5 w-3.5 text-amber-500" />;
    if (b === "afternoon") return <Sunset className="h-3.5 w-3.5 text-orange-500" />;
    if (b === "evening") return <Moon className="h-3.5 w-3.5 text-indigo-500" />;
    return null;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-widest">
            <Crown className="h-4 w-4" />
            <span>Super Teacher Council &bull; Global Venture Supervision</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Institutional Oversight & Venture Readiness
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Cross-shift intelligence across ~5 Super Teachers, 8–10 Lead Teachers, ~110 Assistant Teachers, and all qualifying candidate verticals.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/elite/leaderboard">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
              <span>Full Leaderboards</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ── KPI Summary Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-card rounded-xl border border-border/80 p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Super Teachers
          </div>
          <div className="text-2xl font-extrabold text-foreground mt-1 tabular-nums">
            <NumberFlow value={superTeachers.length || 5} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Council Oversight</div>
        </div>

        <div className="bg-card rounded-xl border border-border/80 p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Lead Teachers
          </div>
          <div className="text-2xl font-extrabold text-foreground mt-1 tabular-nums">
            <NumberFlow value={leadTeachers.length} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">3 Active Shift Batches</div>
        </div>

        <div className="bg-card rounded-xl border border-border/80 p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Assistant Teachers
          </div>
          <div className="text-2xl font-extrabold text-foreground mt-1 tabular-nums">
            <NumberFlow value={eliteUsers.length} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Field Scouting Agents</div>
        </div>

        <div className="bg-card rounded-xl border border-border/80 p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Total Candidates
          </div>
          <div className="text-2xl font-extrabold text-foreground mt-1 tabular-nums">
            <NumberFlow value={members.length} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {evaluations.length} AI Analyzed
          </div>
        </div>

        <div className="bg-card rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
            <Award className="h-3.5 w-3.5" /> Good to Go
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            <NumberFlow value={eligibleMembers.length} />
          </div>
          <div className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
            {members.length > 0 ? `${Math.round((eligibleMembers.length / members.length) * 100)}% Venture Rate` : "0%"}
          </div>
        </div>
      </div>

      {/* ── Shift Breakdown Chart & Lead Teacher Leaderboard ── */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Recharts Shift Performance Visual */}
        <div className="lg:col-span-7 bg-card rounded-xl border border-border/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Shift Performance Breakdown
              </h3>
              <p className="text-xs text-muted-foreground">
                Comparison of Intake, Evaluations, and Qualified Verticals across Morning, Afternoon, and Evening shifts.
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
                <XAxis dataKey="shift" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Bar dataKey="Candidates" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Evaluated" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Eligible" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Teacher Shift Standings */}
        <div className="lg:col-span-5 bg-card rounded-xl border border-border/80 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Lead Teacher Standings
              </h3>
              <Link href="/elite/leaderboard" className="text-xs text-primary font-semibold hover:underline">
                View Full
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ranked by active Assistant Teachers and verified qualified verticals.
            </p>
          </div>

          <div className="divide-y divide-border/60 max-h-60 overflow-y-auto">
            {teacherRanks.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No teacher rankings available.
              </div>
            ) : (
              teacherRanks.map((t) => (
                <div key={t.teacher_id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-5 w-5 rounded-full bg-muted font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                      {t.rank}
                    </span>
                    <span className="font-bold text-foreground truncate">{t.full_name}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">({t.batch || "General"})</span>
                  </div>
                  <div className="font-mono text-right shrink-0">
                    <span className="font-bold text-emerald-600">{t.total_eligible} Eligible</span>
                    <span className="text-muted-foreground text-[10px] ml-1.5">({t.total_members} c.)</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Formula: Elites &times; 1 + Members &times; 0.5 + Eligible &times; 2</span>
          </div>
        </div>
      </div>

      {/* ── "Good to Go" Verticals Tracker ── */}
      <div className="bg-card rounded-xl border border-border/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-600" />
                "Good to Go" Qualified Verticals Tracker
              </h3>
              <Badge variant="default" className="bg-emerald-600 text-white font-mono text-xs">
                {filteredEligible.length} Qualified
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              All candidates that passed the 3 Launch Rules, Screen Average &ge; 6.0, and 8 Fatal-Flaw Tests &ge; 6.5.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs">
              {["all", "morning", "afternoon", "evening"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedShift(s)}
                  className={cn(
                    "px-2.5 py-1 rounded-md capitalize font-semibold transition-all",
                    selectedShift === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search domain or beachhead..."
                value={verticalSearch}
                onChange={(e) => setVerticalSearch(e.target.value)}
                className="pl-8 h-8 text-xs w-48 bg-card"
              />
            </div>
          </div>
        </div>

        {filteredEligible.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
            No qualified "Good to Go" verticals match the current shift or search criteria.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {filteredEligible.map((m) => {
              const ev = memberEvalMap[m.id];
              const eliteUser = users.find((u) => u.id === m.elite_user_id);

              return (
                <Link key={m.id} href={`/elite/members/${m.id}`}>
                  <div className="bg-card rounded-xl border border-emerald-200 dark:border-emerald-800 p-4 space-y-3 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-full">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <span className="font-bold text-sm text-foreground hover:text-primary transition-colors block truncate">
                            {m.name}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 truncate font-medium">
                            <Briefcase className="h-3 w-3 text-emerald-600 shrink-0" />
                            {m.domain}
                          </span>
                        </div>
                        <Badge variant="default" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono text-[10px] shrink-0 border-emerald-300">
                          S: {ev?.screen_score?.toFixed(1)} | T: {ev?.tests_score?.toFixed(1)}
                        </Badge>
                      </div>

                      {ev?.full_result?.beachhead_recommendation && (
                        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200/60 text-xs">
                          <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
                            🎯 Beachhead Entry
                          </span>
                          <span className="text-foreground font-medium line-clamp-2">
                            {ev.full_result.beachhead_recommendation}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t text-[11px] text-muted-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        {getBatchIcon(eliteUser?.batch)}
                        <span>Scouted by: {eliteUser?.full_name || "Assistant Teacher"}</span>
                      </span>
                      <span className="text-primary font-semibold flex items-center gap-0.5">
                        Dossier <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Natural Language AI Data Query Console ── */}
      <div className="bg-card rounded-xl border border-border/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Bot className="h-4 w-4 text-violet-600" />
              Executive AI Data Query Console
            </h3>
            <p className="text-xs text-muted-foreground">
              Ask natural language intelligence queries about candidate data, shift performance, domain distribution, and venture conversion.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            Council Quota: Active
          </Badge>
        </div>

        {/* Suggested Quick Prompts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Suggested:
          </span>
          {[
            "Which shift has the highest proportion of eligible verticals?",
            "Which Assistant Teacher collected the most authentic domains?",
            "Summarize the common friction points in failed vertical evaluations",
            "Show domain distribution across morning vs afternoon shifts",
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                setAiQuestion(prompt);
                handleAskAi(prompt);
              }}
              className="bg-muted/40 hover:bg-muted border border-border/60 text-foreground px-2.5 py-1 rounded-lg shrink-0 text-[11px] transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Query Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskAi();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Input
              placeholder="Ask anything about candidate datasets, shift trends, or vertical viability..."
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              disabled={queryingAi}
              className="h-10 text-xs bg-card"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={queryingAi || !aiQuestion.trim()}
            className="h-10 px-4 gap-1.5 font-semibold"
          >
            {queryingAi ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Querying...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Ask AI</span>
              </>
            )}
          </Button>
        </form>

        {/* AI Answer Card */}
        {aiAnswer && (
          <div className="bg-muted/20 border border-border/80 rounded-xl p-5 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-primary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> AI Response
              </span>
              <span className="font-mono text-[10px]">Model: {aiAnswer.model_used || "Agent Router"}</span>
            </div>
            <div className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap font-medium">
              {aiAnswer.answer || JSON.stringify(aiAnswer)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
