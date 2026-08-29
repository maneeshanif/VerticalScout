"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Member, Evaluation, EvaluationFullResult } from "@/types";
import { fetchWithAuth } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Target,
  ListOrdered,
  BookOpen,
  Zap,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

export default function MemberDetailPage() {
  const { id } = useParams();
  const [member, setMember] = useState<Member | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadData = async () => {
    try {
      setLoading(true);
      const [memberRes, evalsRes] = await Promise.all([
        fetchWithAuth(`/members/${id}`),
        fetchWithAuth(`/evaluations/${id}`),
      ]);

      if (memberRes.ok) {
        const memberData = await memberRes.json();
        setMember(memberData);
      } else {
        router.push("/elite");
      }

      if (evalsRes.ok) {
        const evalsData = await evalsRes.json();
        setEvaluations(evalsData);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load candidate details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    setError(null);

    try {
      const res = await fetchWithAuth(`/evaluations/${id}/run`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Evaluation failed");
      }

      await loadData();
    } catch (err: any) {
      setError(err.message || "Evaluation encountered an error");
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!member) return null;

  const latestEvaluation = evaluations.length > 0 ? evaluations[0] : null;
  const result: EvaluationFullResult | null = latestEvaluation?.full_result || null;

  const getOutcomeBadge = (outcome?: string | null) => {
    switch (outcome) {
      case "eligible":
        return (
          <Badge variant="success" className="text-sm px-3 py-1 gap-1.5 font-bold shadow-sm">
            <CheckCircle2 className="h-4 w-4" />
            Eligible Vertical (Next Round)
          </Badge>
        );
      case "service_domain":
        return (
          <Badge variant="warning" className="text-sm px-3 py-1 gap-1.5 font-bold shadow-sm">
            <Clock className="h-4 w-4" />
            Service Domain
          </Badge>
        );
      case "parked":
        return (
          <Badge variant="parked" className="text-sm px-3 py-1 gap-1.5 font-bold shadow-sm">
            <AlertCircle className="h-4 w-4" />
            Parked Domain
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-sm px-3 py-1 border-dashed">
            Pending Evaluation
          </Badge>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/elite">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Scouting List
          </Button>
        </Link>

        {getOutcomeBadge(latestEvaluation?.outcome)}
      </div>

      {/* Candidate Profile Overview Card */}
      <Card className="border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/15 border-b p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-primary mb-1">
                Candidate Member Record #{member.id}
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold">{member.name}</CardTitle>
              <CardDescription className="text-sm font-medium text-foreground/90 mt-1 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-primary" />
                <span>{member.domain}</span>
              </CardDescription>
            </div>

            <Button
              onClick={handleRunEvaluation}
              disabled={evaluating}
              size="lg"
              className="font-bold shadow-md shadow-primary/20 gap-2 shrink-0"
            >
              {evaluating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running AI Agent...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  {latestEvaluation ? "Re-Run Evaluation" : "Run AI Domain Evaluation"}
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5 md:p-6 grid sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-xs text-muted-foreground font-semibold block uppercase">Experience Track Record</span>
            <span className="font-semibold text-foreground text-sm">{member.experience}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold block uppercase">Contact Details</span>
            <span className="font-semibold text-foreground text-sm">{member.phone}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold block uppercase">Collected At</span>
            <span className="font-semibold text-foreground text-sm">
              {new Date(member.created_at).toLocaleDateString()}
            </span>
          </div>

          {member.description && (
            <div className="sm:col-span-3 pt-3 border-t text-xs sm:text-sm">
              <span className="text-xs text-muted-foreground font-semibold block uppercase mb-1">Context Notes</span>
              <p className="text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border">
                {member.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Stream / Progress Banner */}
      {evaluating && (
        <Card className="border-primary/40 bg-primary/5 p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
            <div className="text-sm font-medium text-primary">
              Executing OpenAI Agents SDK pipeline (Choosing Your Vertical Framework)...
            </div>
          </div>
        </Card>
      )}

      {error && (
        <div className="p-4 rounded-xl text-sm font-medium bg-destructive/15 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {/* AI Evaluation Report (Choosing Your Vertical) */}
      {result ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Executive Summary */}
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span>Choosing Your Vertical &bull; Final Decision</span>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  Engine: {latestEvaluation?.provider_used || "Agents SDK"}
                </Badge>
              </div>
              <CardTitle className="text-xl font-extrabold mt-2">
                Executive Outcome: {result.outcome.toUpperCase()}
              </CardTitle>
              <CardDescription className="text-sm font-medium text-foreground/90 mt-1">
                {result.summary}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 md:p-6 space-y-4">
              <div className="bg-card p-4 rounded-xl border border-border/80 space-y-2">
                <div className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Outcome Justification</div>
                <p className="text-sm leading-relaxed text-foreground">{result.outcome_reason}</p>
              </div>

              {result.beachhead_recommendation && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-1">
                  <div className="font-bold text-xs uppercase text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <Target className="h-4 w-4" />
                    Recommended Beachhead Slice
                  </div>
                  <p className="text-sm text-emerald-950 dark:text-emerald-100 font-medium">
                    {result.beachhead_recommendation}
                  </p>
                </div>
              )}

              {/* Suitability Pros & Cons */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {result.why_suitable && (
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1.5">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase block">
                      Why Suitable
                    </span>
                    <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">
                      {result.why_suitable}
                    </p>
                  </div>
                )}

                {result.why_not_suitable && (
                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 space-y-1.5">
                    <span className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase block">
                      Friction & Risk Factors
                    </span>
                    <p className="text-xs sm:text-sm text-rose-900 dark:text-rose-200 leading-relaxed">
                      {result.why_not_suitable}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Selling Ease Screen (6 Questions) */}
          <Card>
            <CardHeader className="border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <ListOrdered className="h-5 w-5 text-primary" />
                    Step 2: Selling Ease Screen (6 Criteria)
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Scored 0-10 with verifiable observable evidence. Minimum required average: 6.0/10
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-primary">{result.screen_average.toFixed(1)}/10</div>
                  <Badge variant={result.screen_passed ? "success" : "destructive"} className="text-[10px]">
                    {result.screen_passed ? "Screen Passed" : "Screen Failed"}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 divide-y">
              {result.screen_questions?.map((sq, i) => (
                <div key={i} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 sm:max-w-[75%]">
                    <div className="font-semibold text-xs sm:text-sm text-foreground">{sq.question}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      &ldquo;{sq.evidence}&rdquo;
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0">
                    <div className="font-mono text-base font-extrabold text-foreground">{sq.score}/10</div>
                    <Badge variant={sq.score >= 6 ? "success" : sq.score >= 4 ? "warning" : "destructive"} className="text-[10px]">
                      {sq.score >= 6 ? "Strong" : sq.score >= 4 ? "Friction" : "Blocker"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Step 3: The Eight Tests */}
          <Card>
            <CardHeader className="border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Step 3: The Eight Tests
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Pass = 1.0, Partial = 0.5, Fail = 0. Required &ge; 6.5/8.0 (Test 3 Fail ends evaluation)
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-primary">{result.tests_total.toFixed(1)}/8.0</div>
                  <Badge variant={result.tests_passed ? "success" : "destructive"} className="text-[10px]">
                    {result.tests_passed ? "Tests Passed" : "Tests Failed"}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 divide-y">
              {result.eight_tests?.map((t) => (
                <div key={t.test_number} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 sm:max-w-[75%]">
                    <div className="font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-muted text-[11px] font-bold flex items-center justify-center shrink-0">
                        {t.test_number}
                      </span>
                      <span>{t.test_name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-7 italic">
                      &ldquo;{t.evidence}&rdquo;
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between pl-7 sm:pl-0 shrink-0">
                    <div className="font-mono text-sm font-bold text-foreground">Score: {t.score}</div>
                    <Badge variant={t.result === "Pass" ? "success" : t.result === "Partial" ? "warning" : "destructive"} className="text-[10px]">
                      {t.result}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actionable Next Steps & Improvements */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-4 sm:p-5 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Improvement Areas & Gaps
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-0 space-y-2">
                <ul className="list-disc pl-4 space-y-1 text-xs sm:text-sm text-muted-foreground">
                  {result.improvement_areas?.map((area, i) => (
                    <li key={i} className="leading-relaxed">{area}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-5 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-primary" />
                  Recommended Next Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-0 space-y-2">
                <ul className="list-decimal pl-4 space-y-1 text-xs sm:text-sm text-muted-foreground">
                  {result.next_actions?.map((action, i) => (
                    <li key={i} className="leading-relaxed">{action}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center flex flex-col items-center justify-center gap-3 border-dashed">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base">Evaluation Not Yet Generated</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
              Trigger the AI Agent to run the complete 3-Rules, 5-Steps, and 8-Tests analysis on this candidate domain.
            </p>
          </div>
          <Button onClick={handleRunEvaluation} disabled={evaluating} className="mt-2 font-semibold gap-1.5">
            {evaluating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-amber-300" />}
            Execute AI Domain Evaluation
          </Button>
        </Card>
      )}
    </div>
  );
}
