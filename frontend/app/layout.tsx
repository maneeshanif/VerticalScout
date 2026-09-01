import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "VerticalGate — Venture Domain Qualification Engine",
  description: "AI-Powered startup vertical qualification for 110 student scouts. 3 Launch Rules, 6 Selling Screens, 8 Fatal-Flaw Tests.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAFAF7] text-[#1A1F2E] antialiased flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
