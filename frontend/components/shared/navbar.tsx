"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  User as UserIcon,
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
} from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "super_teacher":
        return "warning";
      case "lead_teacher":
        return "default";
      default:
        return "secondary";
    }
  };

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const getDashboardLink = () => {
    switch (user.role) {
      case "super_admin":
        return "/admin";
      case "super_teacher":
        return "/super-teacher";
      case "lead_teacher":
        return "/lead-teacher";
      case "elite_user":
      default:
        return "/elite";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href={getDashboardLink()} className="flex items-center gap-2 font-bold text-lg text-primary tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Compass className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline-block font-extrabold tracking-tight">
              Vertical<span className="text-foreground">Gate</span>
            </span>
          </Link>
          <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize font-medium text-xs">
            {formatRole(user.role)}
          </Badge>
          {user.batch && (
            <Badge variant="outline" className="capitalize text-xs font-normal border-primary/30 text-primary hidden md:inline-flex">
              Shift: {user.batch}
            </Badge>
          )}
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5">
          {/* Universal Candidate/Member Navigation for ALL ROLES */}
          <Link href="/elite">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Users className="h-4 w-4" />
              {user.role === "elite_user" ? "My Candidates" : "All Candidates"}
            </Button>
          </Link>

          <Link href="/elite/members/new">
            <Button variant="ghost" size="sm" className="gap-1.5 text-primary">
              <Plus className="h-4 w-4" />
              Add Candidate
            </Button>
          </Link>

          <Link href="/elite/leaderboard">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Trophy className="h-4 w-4 text-amber-500" />
              Leaderboard
            </Button>
          </Link>

          {/* Role specific portals */}
          {user.role === "lead_teacher" && (
            <Link href="/lead-teacher">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <GraduationCap className="h-4 w-4" />
                Teacher Portal
              </Button>
            </Link>
          )}

          {user.role === "super_teacher" && (
            <Link href="/super-teacher">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <GraduationCap className="h-4 w-4" />
                Super Oversight
              </Button>
            </Link>
          )}

          {user.role === "super_admin" && (
            <>
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Shield className="h-4 w-4" />
                  Admin HQ
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Sliders className="h-4 w-4" />
                  Users & Roles
                </Button>
              </Link>
            </>
          )}

          <div className="h-4 w-[1px] bg-border mx-1" />

          <div className="flex items-center gap-2 pl-2">
            <div className="text-right text-xs">
              <div className="font-semibold leading-tight">{user.full_name}</div>
              <div className="text-muted-foreground truncate max-w-[140px]">{user.email}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} title="Sign Out" className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </nav>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b">
            <div>
              <div className="font-semibold text-sm">{user.full_name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
            {user.batch && <Badge variant="outline">Shift: {user.batch}</Badge>}
          </div>

          <div className="grid gap-1.5">
            <Link href="/elite" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                {user.role === "elite_user" ? "My Candidates" : "All Candidates"}
              </Button>
            </Link>

            <Link href="/elite/members/new" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="default" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                Add New Candidate
              </Button>
            </Link>

            <Link href="/elite/leaderboard" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Leaderboard
              </Button>
            </Link>

            {user.role === "lead_teacher" && (
              <Link href="/lead-teacher" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Assigned Elite Users & AI
                </Button>
              </Link>
            )}

            {user.role === "super_teacher" && (
              <Link href="/super-teacher" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Super Teacher Dashboard
                </Button>
              </Link>
            )}

            {user.role === "super_admin" && (
              <>
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Overview & Stats
                  </Button>
                </Link>
                <Link href="/admin/users" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Sliders className="h-4 w-4" />
                    Manage Users & Roles
                  </Button>
                </Link>
              </>
            )}

            <Button variant="destructive" className="w-full justify-start gap-2 mt-2" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
