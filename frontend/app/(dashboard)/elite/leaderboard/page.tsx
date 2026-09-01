"use client";

import React, { useEffect, useState } from "react";
import { EliteLeaderboardEntry, TeacherLeaderboardEntry, BatchType } from "@/types";
import { fetchWithAuth } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import NumberFlow from "@number-flow/react";
import { TableVirtuoso } from "react-virtuoso";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Medal,
  Flame,
  Users,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Search,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  Award,
  Crown,
  GraduationCap,
  TrendingUp,
  Filter,
} from "lucide-react";
import Link from "next/link";

export default function LeaderboardPage() {
  const [eliteEntries, setEliteEntries] = useState<EliteLeaderboardEntry[]>([]);
  const [teacherEntries, setTeacherEntries] = useState<TeacherLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"global" | "morning" | "afternoon" | "evening" | "teachers">("global");

  const loadData = async () => {
    try {
      setLoading(true);
      const [eliteRes, teacherRes] = await Promise.all([
        fetchWithAuth("/leaderboard/elite"),
        fetchWithAuth("/leaderboard/teachers"),
      ]);
      if (eliteRes.ok) setEliteEntries(await eliteRes.json());
      if (teacherRes.ok) setTeacherEntries(await teacherRes.json());
    } catch (e) {
      console.error("Failed to load leaderboards", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFilteredEliteEntries = () => {
    let list = eliteEntries;
    if (activeTab !== "global" && activeTab !== "teachers") {
      list = list.filter((e) => e.batch?.toLowerCase() === activeTab);
    }
    if (search.trim()) {
      list = list.filter((e) =>
        e.full_name.toLowerCase().includes(search.toLowerCase()) ||
        e.batch?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  };

  const getFilteredTeacherEntries = () => {
    let list = teacherEntries;
    if (search.trim()) {
      list = list.filter((e) =>
        e.full_name.toLowerCase().includes(search.toLowerCase()) ||
        e.batch?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  };

  const currentEliteList = getFilteredEliteEntries();
  const currentTeacherList = getFilteredTeacherEntries();

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-amber-500/30">
          🥇 1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-400 to-slate-300 text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-slate-400/30">
          🥈 2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-700 to-amber-600 text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-amber-700/30">
          🥉 3
        </div>
      );
    }
    return (
      <div className="h-7 w-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs font-mono">
        {rank}
      </div>
    );
  };

  const getBatchIcon = (b?: string | null) => {
    if (b === "morning") return <Sun className="h-3 w-3 text-amber-500" />;
    if (b === "afternoon") return <Sunset className="h-3 w-3 text-orange-500" />;
    if (b === "evening") return <Moon className="h-3 w-3 text-indigo-500" />;
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/elite">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground text-xs">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
        <Badge variant="outline" className="gap-1.5 text-xs font-semibold px-3 py-1 self-start sm:self-auto">
          <Flame className="h-3.5 w-3.5 text-amber-500" />
          <span>Live Institutional Rankings</span>
        </Badge>
      </div>

      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 mb-1">
          <Trophy className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Multi-Tier Cohort Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
          Public rankings across all ~110 Assistant Teachers (Elite Users), Shift Timings (Morning, Afternoon, Evening), and Lead Teachers.
        </p>
      </div>

      {/* ── Tabs & Search Bar ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: "global", label: "Global Elite (~110)" },
              { id: "morning", label: "Morning Shift" },
              { id: "afternoon", label: "Afternoon Shift" },
              { id: "evening", label: "Evening Shift" },
              { id: "teachers", label: "Lead Teachers & Shifts" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 border",
                  activeTab === tab.id
                    ? "bg-foreground text-background border-foreground shadow-sm"
                    : "bg-card text-muted-foreground border-border/80 hover:text-foreground hover:border-foreground/30"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search teacher or shift..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-card"
            />
          </div>
        </div>

        {/* ── Top 3 Podium Highlights (if viewing elite or teacher tabs) ── */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeTab === "teachers" ? (
              currentTeacherList.slice(0, 3).map((t, idx) => (
                <div
                  key={t.teacher_id}
                  className={cn(
                    "bg-card rounded-xl border p-4 text-center space-y-2 relative overflow-hidden shadow-sm",
                    idx === 0 ? "border-amber-400 bg-amber-50/20" : "border-border/80"
                  )}
                >
                  <div className="text-2xl">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</div>
                  <div className="font-bold text-sm text-foreground truncate">{t.full_name}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    {getBatchIcon(t.batch)}
                    <span className="capitalize">{t.batch || "All"} Shift</span>
                  </div>
                  <div className="pt-2 border-t text-xs font-mono font-bold text-primary flex items-center justify-center gap-2">
                    <span>{t.total_eligible} Eligible</span>
                    <span>·</span>
                    <span>{t.total_members} Members</span>
                  </div>
                </div>
              ))
            ) : (
              currentEliteList.slice(0, 3).map((e, idx) => (
                <div
                  key={e.user_id}
                  className={cn(
                    "bg-card rounded-xl border p-4 text-center space-y-2 relative overflow-hidden shadow-sm",
                    idx === 0 ? "border-amber-400 bg-amber-50/20" : "border-border/80"
                  )}
                >
                  <div className="text-2xl">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</div>
                  <div className="font-bold text-sm text-foreground truncate">{e.full_name}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    {getBatchIcon(e.batch)}
                    <span className="capitalize">{e.batch || "General"} Shift</span>
                  </div>
                  <div className="pt-2 border-t text-xs font-mono font-bold text-emerald-600 flex items-center justify-center gap-2">
                    <span>{e.eligible_members} Good to Go</span>
                    <span className="text-border">·</span>
                    <span className="text-foreground">{e.total_members} Total</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Main Leaderboard Table ── */}
        {loading ? (
          <div className="flex justify-center p-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : activeTab === "teachers" ? (
          /* Lead Teachers Leaderboard */
          currentTeacherList.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground border-dashed">
              No Lead Teacher performance data matching current filters.
            </Card>
          ) : (
            <Card className="border-border/80 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/15 border-b p-4">
                <div className="grid grid-cols-12 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
                  <div className="col-span-5 sm:col-span-4">Lead Teacher</div>
                  <div className="col-span-2 hidden sm:block">Shift Batch</div>
                  <div className="col-span-2 text-center">Active Elites</div>
                  <div className="col-span-2 sm:col-span-2 text-center">Eligible Verticals</div>
                  <div className="col-span-3 sm:col-span-1 text-right">Score</div>
                </div>
              </CardHeader>
              <CardContent className="p-0 divide-y">
                {currentTeacherList.map((t) => (
                  <div
                    key={t.teacher_id}
                    className="grid grid-cols-12 items-center p-4 text-xs sm:text-sm hover:bg-muted/20 transition-colors"
                  >
                    <div className="col-span-2 sm:col-span-1 flex justify-center">
                      {getRankBadge(t.rank)}
                    </div>
                    <div className="col-span-5 sm:col-span-4 font-bold text-foreground truncate pr-2">
                      {t.full_name}
                    </div>
                    <div className="col-span-2 hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                      {getBatchIcon(t.batch)}
                      <span className="capitalize">{t.batch || "General"}</span>
                    </div>
                    <div className="col-span-2 text-center font-mono font-medium">
                      <NumberFlow value={t.total_elites} />
                    </div>
                    <div className="col-span-2 sm:col-span-2 text-center font-mono font-bold text-emerald-600">
                      <NumberFlow value={t.total_eligible} />
                    </div>
                    <div className="col-span-3 sm:col-span-1 text-right font-mono font-extrabold text-primary">
                      {t.score.toFixed(1)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        ) : (
          /* Elite Users Leaderboard */
          currentEliteList.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground border-dashed">
              No Assistant Teacher entries matching current filters.
            </Card>
          ) : (
            <Card className="border-border/80 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/15 border-b p-4">
                <div className="grid grid-cols-12 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
                  <div className="col-span-5 sm:col-span-4">Assistant Teacher</div>
                  <div className="col-span-2 hidden sm:block">Shift Batch</div>
                  <div className="col-span-2 text-center">Collected</div>
                  <div className="col-span-2 sm:col-span-2 text-center">Good to Go</div>
                  <div className="col-span-3 sm:col-span-1 text-right">Score</div>
                </div>
              </CardHeader>
              <CardContent className="p-0 divide-y">
                {currentEliteList.map((e) => (
                  <div
                    key={e.user_id}
                    className="grid grid-cols-12 items-center p-4 text-xs sm:text-sm hover:bg-muted/20 transition-colors"
                  >
                    <div className="col-span-2 sm:col-span-1 flex justify-center">
                      {getRankBadge(e.rank)}
                    </div>
                    <div className="col-span-5 sm:col-span-4 font-bold text-foreground truncate pr-2">
                      {e.full_name}
                    </div>
                    <div className="col-span-2 hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                      {getBatchIcon(e.batch)}
                      <span className="capitalize">{e.batch || "General"}</span>
                    </div>
                    <div className="col-span-2 text-center font-mono font-medium">
                      <NumberFlow value={e.total_members} />
                    </div>
                    <div className="col-span-2 sm:col-span-2 text-center font-mono font-bold text-emerald-600">
                      <NumberFlow value={e.eligible_members} />
                    </div>
                    <div className="col-span-3 sm:col-span-1 text-right font-mono font-extrabold text-primary">
                      {e.score.toFixed(1)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
