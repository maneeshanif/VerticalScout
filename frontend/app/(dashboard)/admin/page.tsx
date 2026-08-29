"use client";

import React, { useEffect, useState } from "react";
import { SystemStats } from "@/types";
import { fetchWithAuth } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Users,
  Layers,
  Sparkles,
  Bot,
  Sliders,
  CheckCircle2,
  Loader2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [rateLimits, setRateLimits] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, limitsRes] = await Promise.all([
          fetchWithAuth("/admin/stats"),
          fetchWithAuth("/admin/rate-limits"),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (limitsRes.ok) setRateLimits(await limitsRes.json());
      } catch (e) {
        console.error("Failed to load admin stats", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-destructive uppercase tracking-wider">
            <Shield className="h-4 w-4" />
            <span>Super Admin Headquarters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">Platform Control Center</h1>
          <p className="text-sm text-muted-foreground">
            System-wide visibility, role management, AI execution rate limits, and full database CRUD oversight.
          </p>
        </div>
        <Link href="/admin/users">
          <Button className="font-semibold gap-2">
            <Users className="h-4 w-4" />
            Manage Users & Roles
          </Button>
        </Link>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Registered Users</div>
          <div className="text-2xl font-black text-foreground mt-1">{stats?.total_users || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Active Elite Users</div>
          <div className="text-2xl font-black text-foreground mt-1">{stats?.elite_users || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Collected Members</div>
          <div className="text-2xl font-black text-foreground mt-1">{stats?.total_members || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Total AI Evaluations</div>
          <div className="text-2xl font-black text-primary mt-1">{stats?.total_evaluations || 0}</div>
        </Card>
      </div>

      {/* AI Rate Limits & Infrastructure Configuration */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-4 sm:p-5 border-b bg-muted/10">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              AI Agent Rate Limits
            </CardTitle>
            <CardDescription className="text-xs">
              Configured dynamically across role hierarchies to preserve API budget.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
              <div>
                <div className="font-semibold text-foreground">Elite Users Daily Limit</div>
                <div className="text-xs text-muted-foreground">Auto-resets at 00:00 UTC daily</div>
              </div>
              <Badge variant="default" className="font-mono text-xs">
                {rateLimits?.elite_ai_calls_per_day || 10} calls / day
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
              <div>
                <div className="font-semibold text-foreground">Lead Teacher Window Limit</div>
                <div className="text-xs text-muted-foreground">Rolling 30-minute window</div>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                {rateLimits?.lead_teacher_ai_calls_per_30_min || 5} calls / 30m
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-5 border-b bg-muted/10">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Bot className="h-4 w-4 text-emerald-600" />
              AI Provider Failover Architecture
            </CardTitle>
            <CardDescription className="text-xs">
              OpenAI Agents SDK + LiteLLM provider stack
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3 text-sm">
            <div className="p-3 rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
              <div className="font-bold text-xs text-emerald-800 dark:text-emerald-300 uppercase">Primary Engine</div>
              <div className="font-mono text-xs font-semibold text-emerald-950 dark:text-emerald-100 mt-0.5">
                Gemini 2.0 Flash (litellm/gemini/gemini-2.0-flash)
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-900 border-border">
              <div className="font-bold text-xs text-muted-foreground uppercase">Fallback Engine (Free Tier)</div>
              <div className="font-mono text-xs font-semibold text-foreground mt-0.5">
                OpenRouter Llama 3.1 8B (litellm/openrouter/...)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
