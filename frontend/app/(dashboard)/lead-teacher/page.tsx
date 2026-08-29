"use client";

import React, { useEffect, useState } from "react";
import { User, Member, Evaluation } from "@/types";
import { fetchWithAuth } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  GraduationCap,
  Users,
  Search,
  Sparkles,
  Bot,
  Loader2,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Shield,
  Layers,
  ChevronDown,
  ChevronRight,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function LeadTeacherDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [evaluations, setEvaluations] = useState<Record<number, Evaluation>>({});
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<any | null>(null);
  const [queryingAi, setQueryingAi] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, membersRes, evalsRes] = await Promise.all([
          fetchWithAuth("/users"),
          fetchWithAuth("/members"),
          fetchWithAuth("/evaluations"),
        ]);
        if (usersRes.ok) setUsers(await usersRes.json());
        if (membersRes.ok) setMembers(await membersRes.json());
        if (evalsRes.ok) {
          const evalsData: Evaluation[] = await evalsRes.json();
          const map: Record<number, Evaluation> = {};
          evalsData.forEach((ev) => {
            if (!map[ev.member_id] || new Date(ev.created_at) > new Date(map[ev.member_id].created_at)) {
              map[ev.member_id] = ev;
            }
          });
          setEvaluations(map);
        }
      } catch (e) {
        console.error("Failed to load Lead Teacher data", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setQueryingAi(true);
    setAiAnswer(null);

    try {
      const res = await fetchWithAuth("/ai/query", {
        method: "POST",
        body: JSON.stringify({ question: aiQuestion }),
      });
      if (res.ok) {
        setAiAnswer(await res.json());
      }
    } catch (e) {
      console.error("AI query failed", e);
    } finally {
      setQueryingAi(false);
    }
  };

  const getOutcomeBadge = (outcome?: string | null) => {
    switch (outcome) {
      case "eligible":
        return (
          <Badge variant="success" className="gap-1 font-semibold text-[10px]">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Eligible
          </Badge>
        );
      case "service_domain":
        return (
          <Badge variant="warning" className="gap-1 font-semibold text-[10px]">
            <Clock className="h-2.5 w-2.5" />
            Service
          </Badge>
        );
      case "parked":
        return (
          <Badge variant="parked" className="gap-1 font-semibold text-[10px]">
            <AlertCircle className="h-2.5 w-2.5" />
            Parked
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground border-dashed text-[10px]">
            Pending
          </Badge>
        );
    }
  };

  const eliteUsers = users.filter((u) => u.role === "elite_user");
  const filteredUsers = eliteUsers.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.batch && u.batch.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
            <GraduationCap className="h-4 w-4" />
            <span>Lead Teacher Supervision</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">Cohort Oversight Portal</h1>
          <p className="text-sm text-muted-foreground">
            Inspect individual assistant teachers, drill into their collected candidate members, and review full AI evaluation reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/elite">
            <Button variant="default" className="gap-1.5 font-semibold">
              <Users className="h-4 w-4" />
              All Candidates Registry
            </Button>
          </Link>
          <Link href="/lead-teacher/leaderboard">
            <Button variant="outline" className="gap-1.5 font-semibold">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              Teacher Leaderboard
            </Button>
          </Link>
        </div>
      </div>

      {/* AI Assistant Data Query Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background shadow-md">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Ask Cohort AI Assistant</CardTitle>
              <CardDescription className="text-xs">
                Query cohort analytics: &ldquo;Which Elite User collected the most eligible domains?&rdquo; or &ldquo;Summarize Morning batch activity.&rdquo;
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          <form onSubmit={handleAskAi} className="flex gap-2">
            <Input
              placeholder="e.g. Which Elite users in the Morning batch have the lowest evaluation conversion rate?"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              className="bg-card text-sm h-10"
            />
            <Button type="submit" disabled={queryingAi || !aiQuestion.trim()} className="font-semibold gap-1.5 shrink-0">
              {queryingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-amber-300" />}
              Query AI
            </Button>
          </form>

          {aiAnswer && (
            <div className="p-4 rounded-xl border bg-card/80 backdrop-blur space-y-2 animate-in fade-in">
              <div className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Insight</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{aiAnswer.answer}</p>
              {aiAnswer.suggestions && aiAnswer.suggestions.length > 0 && (
                <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                  <span className="font-semibold text-foreground block">Suggested Actions:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {aiAnswer.suggestions.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cohort Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Supervised Elite Users</div>
          <div className="text-2xl font-black text-foreground mt-1">{eliteUsers.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Total Members Collected</div>
          <div className="text-2xl font-black text-foreground mt-1">{members.length}</div>
        </Card>
        <Card className="p-4 col-span-2 sm:col-span-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Avg Members per Elite</div>
          <div className="text-2xl font-black text-primary mt-1">
            {eliteUsers.length > 0 ? (members.length / eliteUsers.length).toFixed(1) : 0}
          </div>
        </Card>
      </div>

      {/* Search Input for Elite Users */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter Elite Users by name, email, or shift (Morning/Afternoon/Evening)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card text-sm h-10 shadow-sm"
        />
      </div>

      {/* Elite Users Accordion / Detailed Drill-down */}
      <Card className="border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b bg-muted/15">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Assistant Teachers & Candidate Details ({filteredUsers.length})</span>
            </div>
            <span className="text-xs font-normal text-muted-foreground">Click any teacher to inspect their members</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No Assistant Teachers match your search criteria.
            </div>
          ) : (
            filteredUsers.map((user) => {
              const userMembers = members.filter((m) => m.elite_user_id === user.id);
              const isExpanded = expandedUser === user.id;

              return (
                <div key={user.id} className="transition-colors">
                  {/* Teacher Summary Row */}
                  <div
                    onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-muted/15 ${
                      isExpanded ? "bg-muted/20 border-b" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {user.full_name.charAt(0)}
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-sm text-foreground flex items-center gap-2">
                          <span>{user.full_name}</span>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {user.batch ? `Shift: ${user.batch}` : "No Shift"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium self-end sm:self-center">
                      <div className="text-right">
                        <span className="font-bold text-foreground block text-sm">{userMembers.length}</span>
                        <span className="text-muted-foreground text-[11px]">Candidates</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Members List for this Elite User */}
                  {isExpanded && (
                    <div className="bg-muted/5 p-4 sm:p-5 space-y-3 animate-in fade-in duration-200">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                        <span>Candidate Profiles Scouted by {user.full_name}</span>
                        <span>{userMembers.length} total</span>
                      </div>

                      {userMembers.length === 0 ? (
                        <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                          This assistant teacher has not collected any candidate profiles yet.
                        </div>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-3">
                          {userMembers.map((m) => {
                            const ev = evaluations[m.id];
                            return (
                              <Card key={m.id} className="p-4 bg-card border-border/80 hover:border-primary/50 transition-all flex flex-col justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <div className="font-bold text-sm text-foreground">{m.name}</div>
                                      <div className="text-xs font-medium text-primary flex items-center gap-1 mt-0.5">
                                        <Briefcase className="h-3 w-3" />
                                        <span>{m.domain}</span>
                                      </div>
                                    </div>
                                    {getOutcomeBadge(ev?.outcome)}
                                  </div>

                                  <div className="text-xs text-muted-foreground line-clamp-2">
                                    <strong>Exp:</strong> {m.experience}
                                  </div>

                                  {ev && (
                                    <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t text-muted-foreground">
                                      <span>Screen: {ev.screen_score?.toFixed(1) || "0.0"}/10</span>
                                      <span>Tests: {ev.tests_score?.toFixed(1) || "0.0"}/8.0</span>
                                    </div>
                                  )}
                                </div>

                                <div className="pt-3 mt-3 border-t flex items-center justify-between">
                                  <span className="text-[11px] text-muted-foreground">Tel: {m.phone}</span>
                                  <Link href={`/elite/members/${m.id}`}>
                                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 font-semibold text-primary">
                                      <span>View Report</span>
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </Link>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
