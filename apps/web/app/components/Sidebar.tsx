"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCheck,
  Target,
  Sparkles,
  BookOpen,
  Award,
  Send,
  TrendingUp,
} from "lucide-react";
import { Badge } from "./ui/Badge";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  tag?: string;
  stageNumber?: string;
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Identity & Skills",
    href: "/know",
    icon: UserCheck,
    tag: "Verified",
    stageNumber: "1",
  },
  {
    name: "Job Matching",
    href: "/match",
    icon: Target,
    tag: "94% Fit",
    stageNumber: "2",
  },
  {
    name: "Skill Gaps",
    href: "/gap",
    icon: Sparkles,
    tag: "1 Critical",
    stageNumber: "3",
  },
  {
    name: "Learning Paths",
    href: "/improve",
    icon: BookOpen,
    tag: "Active",
    stageNumber: "4",
  },
  {
    name: "Skill Assessments",
    href: "/prove",
    icon: Award,
    tag: "+1.8",
    stageNumber: "5",
  },
  {
    name: "Applications & Policy",
    href: "/apply",
    icon: Send,
    tag: "2 Active",
    stageNumber: "6",
  },
  {
    name: "Funnel & Analytics",
    href: "/outcome",
    icon: TrendingUp,
    tag: "1 Offer",
    stageNumber: "7",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Brand Header — Exact 60px height matching topbar */}
      <div
        style={{
          height: "60px",
          padding: "0 18px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
              flexShrink: 0,
            }}
          >
            <img
              src="/logo-dark.png"
              alt="JobPilot"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "15px", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "1px", lineHeight: 1.2 }}>
              <span style={{ color: "var(--text-main)" }}>Job</span>
              <span style={{ color: "var(--accent-primary)" }}>Pilot</span>
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Career OS
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div style={{ padding: "12px 10px", flex: 1, overflowY: "auto" }}>
        <div
          style={{
            fontSize: "10.5px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--text-dim)",
            padding: "4px 10px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Lifecycle Stages</span>
          <span style={{ fontSize: "10px", color: "var(--accent-emerald)", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--accent-emerald)" }} />
            Live
          </span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "13px",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#ffffff" : "var(--text-muted)",
                  background: isActive ? "var(--bg-elevated)" : "transparent",
                  borderLeft: isActive ? "2px solid var(--accent-primary)" : "2px solid transparent",
                  transition: "all 0.1s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <Icon
                    size={16}
                    color={isActive ? "var(--accent-primary)" : "var(--text-dim)"}
                    style={{ flexShrink: 0 }}
                  />
                  <span>{item.name}</span>
                </div>
                {item.tag && (
                  <span
                    style={{
                      fontSize: "10px",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      background: isActive ? "rgba(225, 29, 72, 0.18)" : "rgba(255, 255, 255, 0.05)",
                      color: isActive ? "#fda4af" : "var(--text-dim)",
                      fontWeight: 600,
                    }}
                  >
                    {item.tag}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mode Footer Badge */}
      <div
        style={{
          padding: "12px 14px",
          margin: "10px",
          borderRadius: "var(--radius-sm)",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase" }}>
            Autonomy Mode
          </span>
          <Badge variant="success" size="sm">Assisted</Badge>
        </div>
        <div style={{ fontSize: "11.5px", color: "var(--text-dim)", lineHeight: 1.35 }}>
          Auto-matching &gt;90%. User confirmation on submit.
        </div>
      </div>
    </aside>
  );
}
