"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandaloneRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/landing" ||
    pathname === "/onboarding" ||
    pathname?.includes("/prove/") && pathname?.endsWith("/take");

  if (isStandaloneRoute) {
    return <div className="auth-fullscreen-layout">{children}</div>;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <main className="page-body">{children}</main>
      </div>
    </div>
  );
}
