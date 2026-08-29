"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Member, Evaluation } from "@/types";
import { fetchWithAuth } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  Plus,
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Briefcase,
  Layers,
  Flame,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function EliteDashboardPage() {
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

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
      }

      if (evalsRes.ok) {
        const evalsData: Evaluation[] = await evalsRes.json();
        const evalsMap: Record<number, Evaluation> = {};
        evalsData.forEach((ev) => {
          // Keep latest evaluation per member
          if (!evalsMap[ev.member_id] || new Date(ev.created_at) > new Date(evalsMap[ev.member_id].created_at)) {
            evalsMap[ev.member_id] = ev;
          }
        });
        setEvaluations(evalsMap);
      }
    } catch (err) {
      console.error("Failed to load members or evaluations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.domain.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search)
  );

  const evaluatedCount = Object.keys(evaluations).length;
  const eligibleCount = Object.values(evaluations).filter((e) => e.outcome === "eligible").length;

  const getOutcomeBadge = (outcome?: string | null) => {
    switch (outcome) {
      case "eligible":
        return (
          <Badge variant="success" className="gap-1 font-semibold">
            <CheckCircle2 className="h-3 w-3" />
            Eligible Vertical
          </Badge>
        );
      case "service_domain":
        return (
          <Badge variant="warning" className="gap-1 font-semibold">
            <Clock className="h-3 w-3" />
            Service Domain
          </Badge>
        );
      case "parked":
        return (
          <Badge variant="parked" className="gap-1 font-semibold">
            <AlertCircle className="h-3 w-3" />
            Parked
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground border-dashed">
            Not Evaluated
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Scouting Workspace</h1>
          <p className="text-sm text-muted-foreground">
            Collect candidate details, run 5-Step / 8-Test AI evaluations, and monitor beachhead viability.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/elite/members/new">
            <Button className="font-semibold shadow-sm gap-1.5 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </Link>
          <Link href="/elite/leaderboard">
            <Button variant="outline" className="gap-1.5 hidden sm:inline-flex">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              Leaderboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold">{members.length}</div>
            <div className="text-xs text-muted-foreground">Collected Members</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold">{evaluatedCount}</div>
            <div className="text-xs text-muted-foreground">Evaluated with AI</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold">{eligibleCount}</div>
            <div className="text-xs text-muted-foreground">Eligible Verticals</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold">
              {members.length > 0 ? `${Math.round((evaluatedCount / members.length) * 100)}%` : "0%"}
            </div>
            <div className="text-xs text-muted-foreground">Completion Rate</div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter candidate by name, domain, experience or phone number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card text-sm h-10 shadow-sm"
        />
      </div>

      {/* Members Grid / List */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-44 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center gap-3 border-dashed">
          <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
            <Users className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base">No candidate members found</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
              {search ? "No members match your search criteria." : "Start scouting by adding your first student/candidate profile."}
            </p>
          </div>
          {!search && (
            <Link href="/elite/members/new">
              <Button size="sm" className="gap-1.5 mt-2">
                <Plus className="h-4 w-4" />
                Add First Candidate
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const ev = evaluations[member.id];
            return (
              <Link key={member.id} href={`/elite/members/${member.id}`}>
                <Card className="h-full hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer border-border/80">
                  <CardHeader className="p-4 sm:p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <CardTitle className="text-base group-hover:text-primary transition-colors flex items-center gap-1.5">
                          {member.name}
                        </CardTitle>
                        <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5 text-primary/70" />
                          <span className="font-semibold text-foreground/90">{member.domain}</span>
                        </div>
                      </div>
                      {getOutcomeBadge(ev?.outcome)}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-5 pt-0 space-y-2.5 text-xs text-muted-foreground flex-1">
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                      <div>
                        <span className="text-muted-foreground/80 block text-[10px] uppercase font-semibold">Experience</span>
                        <span className="font-medium text-foreground">{member.experience}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground/80 block text-[10px] uppercase font-semibold">Contact</span>
                        <span className="font-medium text-foreground">{member.phone}</span>
                      </div>
                    </div>

                    {ev?.screen_score !== undefined && ev?.screen_score !== null && (
                      <div className="pt-2 border-t flex items-center justify-between font-mono text-[11px]">
                        <span className="text-muted-foreground">Screen: {ev.screen_score.toFixed(1)}/10</span>
                        <span className="text-muted-foreground">Tests: {ev.tests_score?.toFixed(1) || 0}/8.0</span>
                      </div>
                    )}
                  </CardContent>

                  <div className="px-4 sm:px-5 py-3 border-t bg-muted/20 flex items-center justify-between text-xs font-semibold text-primary">
                    <span>{ev ? "View Evaluation Report" : "Run AI Domain Evaluation"}</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
