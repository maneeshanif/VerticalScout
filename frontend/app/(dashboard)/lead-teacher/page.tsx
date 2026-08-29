"use client";

import React, { useEffect, useState } from "react";
import { User, Member, SystemStats } from "@/types";
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
} from "lucide-react";
import Link from "next/link";

export default function LeadTeacherDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<any | null>(null);
  const [queryingAi, setQueryingAi] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, membersRes] = await Promise.all([
          fetchWithAuth("/users"),
          fetchWithAuth("/members"),
        ]);
        if (usersRes.ok) setUsers(await usersRes.json());
        if (membersRes.ok) setMembers(await membersRes.json());
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

  const eliteUsers = users.filter((u) => u.role === "elite_user");

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
            Monitor all assigned Elite Assistant Teachers, review collected members, and query platform analytics via AI.
          </p>
        </div>
        <Link href="/lead-teacher/leaderboard">
          <Button variant="outline" className="gap-1.5 font-semibold">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            View Teacher Leaderboard
          </Button>
        </Link>
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
                Ask questions like &ldquo;Which Elite User has poor performance?&rdquo; or &ldquo;Who collected the most authentic candidates?&rdquo;
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

      {/* Elite Users Supervision Table */}
      <Card>
        <CardHeader className="p-4 sm:p-5 border-b bg-muted/15">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Assistant Teachers (Elite Users) Under Oversight
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : eliteUsers.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No Elite Users currently registered in the platform.
            </div>
          ) : (
            eliteUsers.map((user) => {
              const userMembers = members.filter((m) => m.elite_user_id === user.id);
              return (
                <div key={user.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10">
                  <div className="space-y-0.5">
                    <div className="font-bold text-sm text-foreground flex items-center gap-2">
                      <span>{user.full_name}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {user.batch ? `Shift: ${user.batch}` : "No Shift"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="text-right">
                      <span className="font-bold text-foreground block text-sm">{userMembers.length}</span>
                      <span className="text-muted-foreground text-[11px]">Members</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
