"use client";

import React, { useEffect, useState } from "react";
import { User, UserRole } from "@/types";
import { fetchWithAuth } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Shield, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadUsers = async () => {
    try {
      const res = await fetchWithAuth("/users");
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    setUpdatingId(userId);
    try {
      const res = await fetchWithAuth(`/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        await loadUsers();
      }
    } catch (e) {
      console.error("Failed to update role", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    setUpdatingId(userId);
    try {
      const res = await fetchWithAuth(`/admin/users/${userId}/toggle-active?is_active=${!currentActive}`, {
        method: "PATCH",
      });
      if (res.ok) {
        await loadUsers();
      }
    } catch (e) {
      console.error("Failed to toggle status", e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin HQ
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">System User & Role Management</h1>
        <p className="text-sm text-muted-foreground">
          View all registered accounts, change role hierarchies, and activate or suspend platform access.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/15 border-b p-4 sm:p-5">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            All Registered System Users ({users.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 divide-y">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No users registered.
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 text-sm"
              >
                <div className="space-y-1">
                  <div className="font-bold text-foreground flex items-center gap-2">
                    <span>{user.full_name}</span>
                    {!user.is_active && (
                      <Badge variant="destructive" className="text-[10px]">Suspended</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.email} &bull; Joined {new Date(user.created_at).toLocaleDateString()}
                    {user.batch && <span className="capitalize"> &bull; Shift: {user.batch}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <select
                    value={user.role}
                    disabled={updatingId === user.id}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                    className="h-9 rounded-md border border-input bg-background px-2 py-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="elite_user">Elite User</option>
                    <option value="lead_teacher">Lead Teacher</option>
                    <option value="super_teacher">Super Teacher</option>
                    <option value="super_admin">Super Admin</option>
                  </select>

                  <Button
                    variant={user.is_active ? "outline" : "default"}
                    size="sm"
                    disabled={updatingId === user.id}
                    onClick={() => handleToggleActive(user.id, user.is_active)}
                    className="text-xs h-9"
                  >
                    {user.is_active ? "Suspend" : "Activate"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
