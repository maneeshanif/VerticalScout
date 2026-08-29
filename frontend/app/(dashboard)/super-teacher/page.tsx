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
  Shield,
  Layers,
  Crown,
} from "lucide-react";

export default function SuperTeacherPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<any | null>(null);
  const [queryingAi, setQueryingAi] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, statsRes] = await Promise.all([
          fetchWithAuth("/users"),
          fetchWithAuth("/admin/stats"),
        ]);
        if (usersRes.ok) setUsers(await usersRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
      } catch (e) {
        console.error("Failed to load Super Teacher data", e);
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

  const leadTeachers = users.filter((u) => u.role === "lead_teacher");
  const eliteUsers = users.filter((u) => u.role === "elite_user");

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
          <Crown className="h-4 w-4" />
          <span>Super Teacher Global Supervision</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">Cohort Hierarchy & Global Oversight</h1>
        <p className="text-sm text-muted-foreground">
          High-level institutional monitoring across all 8-10 Lead Teachers and ~110 Assistant Teachers.
        </p>
      </div>

      {/* Global Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Lead Teachers</div>
          <div className="text-2xl font-black text-foreground mt-1">{leadTeachers.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Elite Users</div>
          <div className="text-2xl font-black text-foreground mt-1">{eliteUsers.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Collected Members</div>
          <div className="text-2xl font-black text-foreground mt-1">{stats?.total_members || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Evaluations Run</div>
          <div className="text-2xl font-black text-primary mt-1">{stats?.total_evaluations || 0}</div>
        </Card>
      </div>

      {/* Super AI Query Interface */}
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-background to-background shadow-md">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Institutional AI Insights</CardTitle>
              <CardDescription className="text-xs">
                Query overall system performance: &ldquo;Which Lead Teacher&apos;s batch has the most eligible domains?&rdquo;
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          <form onSubmit={handleAskAi} className="flex gap-2">
            <Input
              placeholder="e.g. Compare performance between Morning and Evening shifts across all Lead Teachers."
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              className="bg-card text-sm h-10"
            />
            <Button type="submit" disabled={queryingAi || !aiQuestion.trim()} className="font-semibold gap-1.5 shrink-0">
              {queryingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-amber-300" />}
              Analyze with AI
            </Button>
          </form>

          {aiAnswer && (
            <div className="p-4 rounded-xl border bg-card/80 backdrop-blur space-y-2 animate-in fade-in">
              <div className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Super Teacher Intelligence</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{aiAnswer.answer}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Teachers Table */}
      <Card>
        <CardHeader className="p-4 sm:p-5 border-b bg-muted/15">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            Lead Teachers Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : leadTeachers.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No Lead Teachers registered yet.
            </div>
          ) : (
            leadTeachers.map((teacher) => (
              <div key={teacher.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-muted/10">
                <div>
                  <div className="font-bold text-sm text-foreground">{teacher.full_name}</div>
                  <div className="text-xs text-muted-foreground">{teacher.email}</div>
                </div>
                <Badge variant="outline" className="capitalize text-xs">
                  {teacher.batch ? `Shift: ${teacher.batch}` : "No Shift"}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
