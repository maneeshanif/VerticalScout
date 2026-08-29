"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole, BatchType } from "@/types";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (tokens: { access_token: string; refresh_token: string }) => Promise<void>;
  logout: () => void;
  updateBatch: (batch: BatchType) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const res = await fetchWithAuth("/auth/me");
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("vertical_access_token");
          localStorage.removeItem("vertical_refresh_token");
        }
      }
    } catch (err) {
      console.error("Failed to fetch user profile", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (tokens: { access_token: string; refresh_token: string }) => {
    localStorage.setItem("vertical_access_token", tokens.access_token);
    localStorage.setItem("vertical_refresh_token", tokens.refresh_token);
    await refreshUser();
  };

  const logout = () => {
    localStorage.removeItem("vertical_access_token");
    localStorage.removeItem("vertical_refresh_token");
    setUser(null);
    router.push("/login");
  };

  const updateBatch = async (batch: BatchType) => {
    const res = await fetchWithAuth("/users/me/batch", {
      method: "PATCH",
      body: JSON.stringify({ batch }),
    });
    if (res.ok) {
      const updated = await res.json();
      setUser(updated);
    } else {
      throw new Error("Failed to set batch selection");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateBatch, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
