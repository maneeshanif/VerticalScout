"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Sparkles, UserPlus } from "lucide-react";
import Link from "next/link";

export default function NewMemberPage() {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [experience, setExperience] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetchWithAuth("/members", {
        method: "POST",
        body: JSON.stringify({
          name,
          domain,
          experience,
          phone,
          description: description || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to create candidate record");
      }

      const created = await res.json();
      // Directly navigate to member detail to allow 1-click evaluation
      router.push(`/elite/members/${created.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to save candidate member.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/elite">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="border-border/90 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <UserPlus className="h-4 w-4" />
            <span>Candidate Scouting Entry</span>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-extrabold">Add New Student / Domain Candidate</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Record the normal student’s professional details. Once submitted, you can run the &ldquo;Choosing Your Vertical&rdquo; evaluation.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg text-xs font-medium bg-destructive/15 text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Full Name *</label>
                <Input
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Phone / WhatsApp *</label>
                <Input
                  placeholder="e.g. +1 555-019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80">Professional Domain / Body of Work *</label>
              <Input
                placeholder="e.g. Corporate Credit Assessment for Mid-Sized Logistics"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Tip: Narrow down to a specific body of professional work with recognizable repeatable tasks rather than an entire broad industry.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80">Years of Experience & Track Record *</label>
              <Input
                placeholder="e.g. 5+ years reviewing corporate loan applications"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80">Candidate / Domain Context (Optional)</label>
              <textarea
                rows={3}
                placeholder="Specific regulations, existing daily workflow, supervisor approval cycle, typical failure rates..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t p-4 sm:p-6 bg-muted/10">
            <Link href="/elite">
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </Link>

            <Button type="submit" disabled={submitting} className="font-semibold gap-1.5">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Save & Open Evaluation
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
