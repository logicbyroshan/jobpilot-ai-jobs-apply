"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  UserCheck,
  Target,
  Sparkles,
  BookOpen,
  Award,
  Send,
  TrendingUp,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  UserProfile,
  MatchItem,
  GapItem,
  LearningPlanType,
  ApplicationItem,
  FunnelAnalytics,
} from "@/lib/types";
import { Button } from "./components/ui/Button";
import { Badge } from "./components/ui/Badge";
import { Card } from "./components/ui/Card";

export default function DashboardOverviewPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [gaps, setGaps] = useState<GapItem[]>([]);
  const [plans, setPlans] = useState<LearningPlanType[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [funnel, setFunnel] = useState<FunnelAnalytics | null>(null);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [profData, matchData, gapData, planData, appData, funData] = await Promise.all([
          api.getProfile(),
          api.getMatches(),
          api.getGaps(),
          api.getLearningPlans(),
          api.getApplications(),
          api.getFunnelAnalytics(),
        ]);
        setProfile(profData);
        setMatches(matchData);
        setGaps(gapData);
        setPlans(planData);
        setApplications(appData);
        setFunnel(funData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    }
    loadData();
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const updatedMatches = await api.recalculateMatches();
      setMatches(updatedMatches);
    } catch (err) {
      console.error("Error recalculating matches:", err);
    } finally {
      setRecalculating(false);
    }
  };

  const stages = [
    { num: "1", name: "Identity", href: "/know", tag: "8 Verified", icon: UserCheck, desc: "Skills & Experience Graph" },
    { num: "2", name: "Matching", href: "/match", tag: "94% Fit", icon: Target, desc: "Calibrated Opportunities" },
    { num: "3", name: "Skill Gaps", href: "/gap", tag: "1 Critical", icon: Sparkles, desc: "Deficit Diagnostics" },
    { num: "4", name: "Learning", href: "/improve", tag: "Active", icon: BookOpen, desc: "Step-by-step Pathways" },
    { num: "5", name: "Proving", href: "/prove", tag: "+1.8 Boost", icon: Award, desc: "Verified Assessments" },
    { num: "6", name: "Apply", href: "/apply", tag: "2 Active", icon: Send, desc: "Automated Submissions" },
    { num: "7", name: "Outcomes", href: "/outcome", tag: "1 Offer", icon: TrendingUp, desc: "Funnel Conversion Loop" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
            <Badge variant="brand">Autonomous Career OS</Badge>
            <Badge variant="success" dot>Loop Live</Badge>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>
            Welcome back, {profile?.full_name || "Alex Chen"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            {profile?.headline || "Staff Distributed Systems & Infrastructure Architect • Ex-Stripe"}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleRecalculate}
          disabled={recalculating}
          icon={
            <RefreshCw
              size={13}
              style={{ animation: recalculating ? "spin 0.8s linear infinite" : "none" }}
            />
          }
        >
          {recalculating ? "Recalculating..." : "Recalculate Match Scores"}
        </Button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid-4">
        <Card style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>
            Profile Confidence
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, marginTop: "2px" }}>94.2%</div>
          <div style={{ fontSize: "11.5px", color: "var(--accent-emerald)", marginTop: "2px" }}>8 Verified Skills</div>
        </Card>

        <Card style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>
            Top Job Match
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--accent-cyan)", marginTop: "2px" }}>95% Fit</div>
          <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>Anthropic • SF</div>
        </Card>

        <Card style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>
            Critical Skill Gaps
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--accent-amber)", marginTop: "2px" }}>1 Open</div>
          <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>GPU Triton Serving</div>
        </Card>

        <Card style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>
            Pipeline Status
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--accent-primary)", marginTop: "2px" }}>2 Active</div>
          <div style={{ fontSize: "11.5px", color: "var(--accent-emerald)", marginTop: "2px" }}>1 Offer Received</div>
        </Card>
      </div>

      {/* 7-Stage Operating Loop Pipeline */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h2 style={{ fontSize: "15px", fontWeight: 700 }}>Career Operating Lifecycle</h2>
            <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>
              Continuous feedback loop from identity calibration to job offer outcomes
            </div>
          </div>
          <Badge variant="neutral">7 Stages Connected</Badge>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
          {stages.map((stg) => {
            const Icon = stg.icon;
            return (
              <Link
                key={stg.num}
                href={stg.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px 10px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  textDecoration: "none",
                  transition: "all 0.1s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-primary)" }}>
                    {stg.num}. {stg.name}
                  </span>
                  <Icon size={13} color="var(--text-dim)" />
                </div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-main)", marginBottom: "2px" }}>
                  {stg.tag}
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-dim)", lineHeight: 1.3 }}>
                  {stg.desc}
                </div>
              </Link>
            );
          })}
        </div>
      </Card>

      {/* 3 Main Summary Columns */}
      <div className="grid-3">
        {/* Top Matches */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Top Job Matches</h3>
            <Link href="/match" style={{ fontSize: "11.5px", color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
              View All →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {matches.slice(0, 2).map((m) => (
              <div
                key={m.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>{m.job.title}</div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
                      {m.job.company.name} • {m.job.location}
                    </div>
                  </div>
                  <Badge variant="cyan" size="sm">{m.overall_score.toFixed(0)}% Match</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Critical Skill Gaps */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Critical Skill Gaps</h3>
            <Link href="/gap" style={{ fontSize: "11.5px", color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
              Diagnostics →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {gaps.slice(0, 2).map((g) => (
              <div
                key={g.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>{g.title}</div>
                  <Badge variant={g.priority === "CRITICAL" ? "brand" : "warning"} size="sm">{g.priority}</Badge>
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "3px" }}>
                  Level {g.current_level} → Target {g.target_level}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Applications & Funnel */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Conversion Funnel</h3>
            <Link href="/outcome" style={{ fontSize: "11.5px", color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
              Details →
            </Link>
          </div>

          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <div style={{ flex: 1, padding: "8px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: 700 }}>{funnel?.applied || 2}</div>
              <div style={{ fontSize: "10.5px", color: "var(--text-dim)" }}>Applied</div>
            </div>
            <div style={{ flex: 1, padding: "8px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--accent-cyan)" }}>{funnel?.interviews || 4}</div>
              <div style={{ fontSize: "10.5px", color: "var(--text-dim)" }}>Interviews</div>
            </div>
            <div style={{ flex: 1, padding: "8px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--accent-emerald)" }}>{funnel?.offers || 1}</div>
              <div style={{ fontSize: "10.5px", color: "var(--text-dim)" }}>Offers</div>
            </div>
          </div>

          <Link href="/prove" style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="sm" style={{ width: "100%" }} icon={<Award size={13} color="var(--accent-primary)" />}>
              Verify Next Skill in Stage 5
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
