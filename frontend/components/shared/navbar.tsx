"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Compass,
  LogOut,
  Trophy,
  Shield,
  GraduationCap,
  Users,
  Menu,
  X,
  Plus,
  BarChart3,
  Sliders,
  ChevronRight,
  Sparkles,
  Home,
  UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  highlight?: boolean;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/elite",
    label: "Candidates",
    icon: Users,
    roles: ["elite_user", "lead_teacher", "super_teacher", "super_admin"],
  },
  {
    href: "/elite/members/new",
    label: "Add Candidate",
    icon: Plus,
    highlight: true,
    roles: ["elite_user", "lead_teacher", "super_teacher", "super_admin"],
  },
  {
    href: "/elite/leaderboard",
    label: "Leaderboard",
    icon: Trophy,
    roles: ["elite_user", "lead_teacher", "super_teacher", "super_admin"],
  },
  {
    href: "/lead-teacher",
    label: "Teacher Portal",
    icon: GraduationCap,
    roles: ["lead_teacher"],
  },
  {
    href: "/super-teacher",
    label: "Super Oversight",
    icon: BarChart3,
    roles: ["super_teacher"],
  },
  {
    href: "/admin",
    label: "Admin HQ",
    icon: Shield,
    roles: ["super_admin"],
  },
  {
    href: "/admin/users",
    label: "Users & Roles",
    icon: Sliders,
    roles: ["super_admin"],
  },
];

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-rose-500/15 text-rose-600 border-rose-200",
  super_teacher: "bg-amber-500/15 text-amber-700 border-amber-200",
  lead_teacher: "bg-indigo-500/15 text-indigo-700 border-indigo-200",
  elite_user: "bg-slate-500/10 text-slate-600 border-slate-200",
};

const formatRole = (role: string) =>
  role.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  const isActive = (href: string) => {
    if (href === "/elite" && pathname === "/elite") return true;
    if (href !== "/elite" && pathname?.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* ── Top header bar ── */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 shadow-sm shadow-black/[0.04]">
        <div className="container flex h-14 items-center justify-between gap-4 max-w-7xl mx-auto px-4 sm:px-6">
          {/* Brand */}
          <Link
            href={user.role === "super_admin" ? "/admin" : user.role === "lead_teacher" ? "/lead-teacher" : "/elite"}
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
              <Compass className="h-4.5 w-4.5" />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-foreground hidden sm:block">
              Vertical<span className="text-primary">Gate</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center max-w-xl">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              if (item.highlight) {
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      size="sm"
                      className="gap-1.5 h-8 text-xs font-semibold px-3 shadow-sm shadow-primary/20 ml-1"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              }
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                      active
                        ? "bg-primary/8 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", active && "text-primary")} />
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Role badge */}
            <div
              className={cn(
                "hidden sm:flex items-center gap-1.5 text-[11px] font-semibold border rounded-full px-2.5 py-1",
                ROLE_COLORS[user.role] || "bg-slate-100 text-slate-600 border-slate-200"
              )}
            >
              <span>{formatRole(user.role)}</span>
              {user.batch && (
                <>
                  <span className="text-current/40">·</span>
                  <span className="font-normal opacity-75 capitalize">{user.batch}</span>
                </>
              )}
            </div>

            {/* User + logout */}
            <div className="hidden sm:flex items-center gap-1 pl-1 border-l ml-1">
              <div className="flex flex-col text-right leading-tight pr-1.5">
                <span className="text-xs font-semibold text-foreground truncate max-w-[100px]">
                  {user.full_name.split(" ")[0]}
                </span>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted transition-colors"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div
            className="absolute top-14 left-0 right-0 bg-white border-b shadow-xl animate-in slide-in-from-top-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* User info */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b bg-muted/30">
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {user.full_name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold">{user.full_name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
              <div className={cn(
                "ml-auto text-[11px] font-semibold border rounded-full px-2 py-0.5",
                ROLE_COLORS[user.role] || "bg-slate-100 text-slate-600 border-slate-200"
              )}>
                {formatRole(user.role)}
              </div>
            </div>

            {/* Nav links */}
            <nav className="p-3 space-y-0.5">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      item.highlight
                        ? "bg-primary text-white shadow-sm"
                        : active
                        ? "bg-primary/8 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                    {active && !item.highlight && (
                      <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t">
              <button
                onClick={logout}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/8 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
