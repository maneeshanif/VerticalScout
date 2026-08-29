"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Compass, Loader2 } from "lucide-react";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if ((user.role === "elite_user" || user.role === "lead_teacher") && !user.batch) {
        router.push("/select-batch");
      } else {
        switch (user.role) {
          case "super_admin":
            router.push("/admin");
            break;
          case "super_teacher":
            router.push("/super-teacher");
            break;
          case "lead_teacher":
            router.push("/lead-teacher");
            break;
          case "elite_user":
          default:
            router.push("/elite");
            break;
        }
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md animate-pulse">
          <Compass className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">VerticalGate</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Routing to role workspace...</span>
        </div>
      </div>
    </div>
  );
}
