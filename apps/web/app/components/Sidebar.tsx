"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  UserCheck,
  Target,
  Sparkles,
  BookOpen,
  Award,
  Send,
  TrendingUp,
  Activity,
  Layers,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  loopStage: string;
  tag?: string;
}

const navItems: NavItem[] = [
  {
    name: "Career Loop",
    href: "/",
    icon: Compass,
    loopStage: "OVERVIEW",
  },
  {
    name: "Identity & Sources",
    href: "/know",
    icon: UserCheck,
    loopStage: "KNOW",
    tag: "8 verified",
  },
  {
    name: "Opportunity Match",
    href: "/match",
    icon: Target,
    loopStage: "MATCH",
    tag: "6 active",
  },
  {
    name: "Gaps & Diagnostics",
    href: "/gap",
    icon: Sparkles,
    loopStage: "GAP",
    tag: "3 open",
  },
  {
    name: "Learning Plans",
    href: "/improve",
    icon: BookOpen,
    loopStage: "IMPROVE",
  },
  {
    name: "Assessment & Proving",
    href: "/prove",
    icon: Award,
    loopStage: "PROVE",
    tag: "2 ready",
  },
  {
    name: "Application Pipeline",
    href: "/apply",
    icon: Send,
    loopStage: "APPLY",
    tag: "Policy active",
  },
  {
    name: "Outcome & Funnel",
    href: "/outcome",
    icon: TrendingUp,
    loopStage: "OUTCOME",
    tag: "+15% fit",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "5px",
              boxShadow: "0 0 16px rgba(229, 30, 37, 0.2)",
              flexShrink: 0,
            }}
          >
            <img
              src="/logo-dark.png"
              alt="JobPilot Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "17px", letterSpacing: "-0.03em", display: "flex", alignItems: "center", gap: "1px" }}>
              <span style={{ color: "var(--text-main)" }}>Job</span>
              <span style={{ color: "#ef4444" }}>Pilot</span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
              Career OS v1.0
            </div>
          </div>
        </Link>
      </div>

      {/* Loop Stages Navigation */}
      <div style={{ padding: "16px 12px", flex: 1, overflowY: "auto" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-dim)",
            padding: "8px 12px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Operating Loop</span>
          <span style={{ fontSize: "10px", color: "var(--accent-emerald)", display: "flex", alignItems: "center", gap: "4px" }}>
            <span className="pulse-dot" style={{ background: "var(--accent-emerald)" }}></span>
            LIVE
          </span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "13.5px",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#ffffff" : "var(--text-muted)",
                  background: isActive
                    ? "linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 100%)"
                    : "transparent",
                  borderLeft: isActive ? "3px solid var(--accent-primary)" : "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Icon
                    size={18}
                    color={isActive ? "var(--accent-primary)" : "var(--text-dim)"}
                    style={{ flexShrink: 0 }}
                  />
                  <span>{item.name}</span>
                </div>
                {item.tag && (
                  <span
                    style={{
                      fontSize: "10px",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      background: isActive ? "rgba(99, 102, 241, 0.3)" : "rgba(255, 255, 255, 0.06)",
                      color: isActive ? "#c7d2fe" : "var(--text-dim)",
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

      {/* Autonomous Policy Status */}
      <div
        style={{
          padding: "16px",
          margin: "12px",
          borderRadius: "var(--radius-md)",
          background: "rgba(15, 23, 42, 0.8)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Autonomous Mode
          </span>
          <span className="badge badge-emerald" style={{ padding: "2px 8px", fontSize: "10px" }}>
            ASSISTED
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.4 }}>
          Auto-evaluating matches &gt;90%. User confirmation on submission.
        </div>
      </div>
    </aside>
  );
}
