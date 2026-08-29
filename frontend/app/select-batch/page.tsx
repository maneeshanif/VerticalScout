"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BatchType } from "@/types";
import { Sun, CloudSun, Sunset, Loader2, CheckCircle2 } from "lucide-react";

export default function SelectBatchPage() {
  const { user, updateBatch } = useAuth();
  const [selectedBatch, setSelectedBatch] = useState<BatchType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleConfirm = async () => {
    if (!selectedBatch) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateBatch(selectedBatch);
      if (user?.role === "lead_teacher") {
        router.push("/lead-teacher");
      } else {
        router.push("/elite");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update batch shift.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-background via-slate-50/50 to-slate-100/80 dark:from-background dark:to-slate-950">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Select Working Shift</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{user?.full_name}</span>. Please choose your assigned batch shift to unlock your dashboard.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg text-xs font-medium bg-destructive/15 text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Morning */}
          <Card
            onClick={() => setSelectedBatch("morning")}
            className={`cursor-pointer transition-all border-2 text-center p-4 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:shadow-md ${
              selectedBatch === "morning"
                ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                : "border-border"
            }`}
          >
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Sun className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-sm">Morning Shift</div>
              <div className="text-xs text-muted-foreground">08:00 - 13:00</div>
            </div>
            {selectedBatch === "morning" && (
              <CheckCircle2 className="h-5 w-5 text-primary animate-in zoom-in" />
            )}
          </Card>

          {/* Afternoon */}
          <Card
            onClick={() => setSelectedBatch("afternoon")}
            className={`cursor-pointer transition-all border-2 text-center p-4 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:shadow-md ${
              selectedBatch === "afternoon"
                ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                : "border-border"
            }`}
          >
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <CloudSun className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-sm">Afternoon Shift</div>
              <div className="text-xs text-muted-foreground">13:00 - 18:00</div>
            </div>
            {selectedBatch === "afternoon" && (
              <CheckCircle2 className="h-5 w-5 text-primary animate-in zoom-in" />
            )}
          </Card>

          {/* Evening */}
          <Card
            onClick={() => setSelectedBatch("evening")}
            className={`cursor-pointer transition-all border-2 text-center p-4 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:shadow-md ${
              selectedBatch === "evening"
                ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                : "border-border"
            }`}
          >
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Sunset className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-sm">Evening Shift</div>
              <div className="text-xs text-muted-foreground">18:00 - 23:00</div>
            </div>
            {selectedBatch === "evening" && (
              <CheckCircle2 className="h-5 w-5 text-primary animate-in zoom-in" />
            )}
          </Card>
        </div>

        <Button
          onClick={handleConfirm}
          disabled={!selectedBatch || submitting}
          className="w-full font-semibold h-11"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Activating Session...
            </>
          ) : (
            "Proceed to Workspace"
          )}
        </Button>
      </div>
    </div>
  );
}
