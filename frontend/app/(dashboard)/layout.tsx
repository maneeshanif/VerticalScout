"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if ((user.role === "elite_user" || user.role === "lead_teacher") && !user.batch) {
        router.push("/select-batch");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container py-6 max-w-7xl">
        {children}
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        VerticalGate &bull; Elite Assistant Teacher Domain Scouting Platform &bull; Choosing Your Vertical Framework
      </footer>
    </div>
  );
}
