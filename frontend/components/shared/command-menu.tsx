"use client";

import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Users,
  Trophy,
  Plus,
  BarChart3,
  Shield,
  Search,
  Bot,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 p-4 animate-in fade-in-0 duration-150">
      <div className="relative w-full max-w-xl bg-card rounded-xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <Command className="w-full">
          <div className="flex items-center border-b border-border px-3.5">
            <Search className="h-4 w-4 text-muted-foreground shrink-0 mr-2.5" />
            <Command.Input
              placeholder="Type a command or search workspace... (ESC to exit)"
              className="w-full h-12 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none border-none focus:ring-0"
              autoFocus
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 text-sm text-foreground">
            <Command.Empty className="py-6 text-center text-xs text-muted-foreground">
              No matching commands or surfaces found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-2 py-1.5">
              <Command.Item
                onSelect={() => runCommand(() => router.push("/elite"))}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-muted text-xs font-medium text-foreground"
              >
                <Users className="h-4 w-4 text-primary" />
                <span>Candidate Registry & Workspace</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push("/elite/members/new"))}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-muted text-xs font-medium text-foreground"
              >
                <Plus className="h-4 w-4 text-emerald-600" />
                <span>Add New Candidate (+ Intake)</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push("/elite/leaderboard"))}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-muted text-xs font-medium text-foreground"
              >
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>Cohort & Global Leaderboard</span>
              </Command.Item>
            </Command.Group>

            {(user?.role === "super_teacher" || user?.role === "super_admin") && (
              <Command.Group heading="Executive Oversight" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-2 py-1.5 mt-2">
                <Command.Item
                  onSelect={() => runCommand(() => router.push("/super-teacher"))}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-muted text-xs font-medium text-foreground"
                >
                  <BarChart3 className="h-4 w-4 text-violet-600" />
                  <span>Super Teacher Venture Readiness Console</span>
                </Command.Item>
              </Command.Group>
            )}

            {user?.role === "lead_teacher" && (
              <Command.Group heading="Shift Management" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-2 py-1.5 mt-2">
                <Command.Item
                  onSelect={() => runCommand(() => router.push("/lead-teacher"))}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-muted text-xs font-medium text-foreground"
                >
                  <GraduationCap className="h-4 w-4 text-teal-600" />
                  <span>Lead Teacher Shift Dashboard</span>
                </Command.Item>
              </Command.Group>
            )}

            {user?.role === "super_admin" && (
              <Command.Group heading="Administration" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-2 py-1.5 mt-2">
                <Command.Item
                  onSelect={() => runCommand(() => router.push("/admin"))}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-muted text-xs font-medium text-foreground"
                >
                  <Shield className="h-4 w-4 text-rose-600" />
                  <span>Super Admin HQ & Rate Limits</span>
                </Command.Item>
              </Command.Group>
            )}
          </Command.List>

          <div className="flex items-center justify-between border-t border-border px-3.5 py-2 text-[11px] text-muted-foreground bg-muted/30">
            <span>Navigate with <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">↓</kbd></span>
            <span>Select with <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">↵</kbd></span>
          </div>
        </Command>
      </div>
    </div>
  );
}
