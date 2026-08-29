"use client";

import React, { useEffect, useState } from "react";
import { EliteLeaderboardEntry } from "@/types";
import { fetchWithAuth } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Flame, Users, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EliteLeaderboardPage() {
  const [entries, setEntries] = useState<EliteLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchWithAuth("/leaderboard/elite");
        if (res.ok) {
          const data = await res.json();
          setEntries(data);
        }
      } catch (e) {
        console.error("Failed to load leaderboard", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="h-8 w-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-amber-500/30">
          1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="h-8 w-8 rounded-full bg-slate-400 text-white flex items-center justify-center font-extrabold text-sm shadow-md">
          2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="h-8 w-8 rounded-full bg-amber-700 text-white flex items-center justify-center font-extrabold text-sm shadow-md">
          3
        </div>
      );
    }
    return (
      <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs">
        {rank}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/elite">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <Badge variant="outline" className="gap-1 text-xs">
          <Flame className="h-3.5 w-3.5 text-amber-500" />
          Live Cohort Rankings
        </Badge>
      </div>

      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mb-1">
          <Trophy className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Elite User Leaderboard</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Rankings computed from collected member candidates, AI evaluations conducted, and authentic eligible verticals unlocked.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : entries.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground border-dashed">
          No rankings recorded yet. Add and evaluate candidates to get on the leaderboard!
        </Card>
      ) : (
        <Card className="border-border/80 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/15 border-b p-4 sm:p-5">
            <div className="grid grid-cols-12 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
              <div className="col-span-6 sm:col-span-5">Assistant Teacher</div>
              <div className="col-span-2 text-center hidden sm:block">Collected</div>
              <div className="col-span-2 text-center hidden sm:block">Eligible</div>
              <div className="col-span-4 sm:col-span-2 text-right">Points</div>
            </div>
          </CardHeader>

          <CardContent className="p-0 divide-y">
            {entries.map((entry) => (
              <div
                key={entry.user_id}
                className="grid grid-cols-12 items-center p-4 sm:p-5 hover:bg-muted/20 transition-colors text-sm"
              >
                <div className="col-span-2 sm:col-span-1 flex justify-center">
                  {getRankBadge(entry.rank)}
                </div>

                <div className="col-span-6 sm:col-span-5 space-y-0.5">
                  <div className="font-bold text-foreground flex items-center gap-2">
                    <span>{entry.full_name}</span>
                    {entry.rank === 1 && (
                      <Medal className="h-4 w-4 text-amber-500 inline shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 capitalize">
                    {entry.batch ? `Shift: ${entry.batch}` : "Shift Unassigned"}
                    <span className="sm:hidden">&bull; {entry.total_members} members</span>
                  </div>
                </div>

                <div className="col-span-2 text-center font-mono font-medium hidden sm:block">
                  {entry.total_members}
                </div>

                <div className="col-span-2 text-center font-mono font-semibold text-emerald-600 hidden sm:block">
                  {entry.eligible_members}
                </div>

                <div className="col-span-4 sm:col-span-2 text-right font-mono font-black text-primary text-base">
                  {entry.score.toFixed(0)} <span className="text-xs font-normal text-muted-foreground">pts</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
