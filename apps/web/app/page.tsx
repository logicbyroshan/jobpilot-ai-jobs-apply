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
  ExternalLink,
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
  const [activeStage, setActiveStage] = useState<string>("MATCH");
  const [recalculating, setRecalculating] = useState(false);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
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
    {
      id: "KNOW",
      num: "1",
      name: "KNOW",
      title: "Identity & Provenance",
      description: "Aggregates GitHub commits, verified repositories, resume history, and skill evidence.",
      metrics: `${profile?.summary_json?.verified_skills || 8} Verified Skills`,
      badge: { text: "Verified", variant: "brand" as const },
      icon: UserCheck,
      link: "/know",
    },
    {
      id: "MATCH",
      num: "2",
      name: "MATCH",
      title: "Opportunity Radar",
      description: "Multi-dimensional scoring across technical capability, seniority, and preferences.",
      metrics: `${matches.length} Opportunities`,
      badge: { text: "94% Top Fit", variant: "cyan" as const },
      icon: Target,
      link: "/match",
    },
    {
      id: "GAP",
      num: "3",
      name: "GAP",
      title: "Competency Diagnostics",
      description: "Identifies technical deficits preventing candidate from closing top tier offers.",
      metrics: `${gaps.length} Actionable Gaps`,
      badge: { text: "1 Critical", variant: "warning" as const },
      icon: Sparkles,
      link: "/gap",
    },
    {
      id: "IMPROVE",
      num: "4",
      name: "IMPROVE",
      title: "Learning Pathways",
      description: "Step-by-step blueprints with high-signal literature, code tutorials, and architectures.",
      metrics: `${plans.length} Active Plan`,
      badge: { text: "3/5 Done", variant: "success" as const },
      icon: BookOpen,
      link: "/improve",
    },
    {
      id: "PROVE",
      num: "5",
      name: "PROVE",
      title: "Skill Verification",
      description: "Deterministic technical evaluations with instant skill evidence credentialing.",
      metrics: "3 Assessments",
      badge: { text: "+1.8 Boost", variant: "purple" as const },
      icon: Award,
      link: "/prove",
    },
    {
      id: "APPLY",
      num: "6",
      name: "APPLY",
      title: "Governed Submissions",
      description: "Automated tailored artifact generation, resume tailoring, and policy guardrails.",
      metrics: `${applications.length} Submissions`,
      badge: { text: "2 Active", variant: "brand" as const },
      icon: Send,
      link: "/apply",
    },
    {
      id: "OUTCOME",
      num: "7",
      name: "OUTCOME",
      title: "Funnel Analytics",
      description: "Full funnel tracking from screening to offers, diagnosing stage drop-offs.",
      metrics: `${funnel?.offers || 1} Offer`,
      badge: { text: "16.7% Rate", variant: "neutral" as const },
      icon: TrendingUp,
      link: "/outcome",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Sleek Top Banner Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          paddingBottom: "8px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="brand">Career Operating System</Badge>
            <Badge variant="success" dot>Loop Active</Badge>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700 }}>
            Welcome back, {profile?.full_name || "Alex Chen"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginTop: "2px" }}>
            {profile?.headline || "Staff Distributed Systems & Infrastructure Architect • Ex-Stripe"}
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={handleRecalculate}
          disabled={recalculating}
          icon={
            <RefreshCw
              size={14}
              style={{ animation: recalculating ? "spin 0.8s linear infinite" : "none" }}
            />
          }
        >
          {recalculating ? "Recalculating..." : "Recalculate Match Scores"}
        </Button>
      </div>

      {/* Closed-Loop Operating Engine Stepper */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em" }}>
              Closed-Loop Workflow
            </div>
            <h2 style={{ fontSize: "17px", fontWeight: 700 }}>Operating Loop Stages</h2>
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>
            Select any stage to inspect state
          </span>
        </div>

        {/* Horizontal Stage Stepper Strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          {stages.map((stg) => {
            const isSelected = activeStage === stg.id;
            const Icon = stg.icon;

            return (
              <button
                key={stg.id}
                onClick={() => setActiveStage(stg.id)}
                style={{
                  padding: "12px 10px",
                  borderRadius: "var(--radius-sm)",
                  background: isSelected ? "var(--bg-elevated)" : "rgba(255, 255, 255, 0.02)",
                  border: isSelected ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.12s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: isSelected ? "var(--accent-primary)" : "var(--text-dim)" }}>
                    {stg.num}. {stg.name}
                  </span>
                  <Icon size={14} color={isSelected ? "var(--accent-primary)" : "var(--text-dim)"} />
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {stg.metrics}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Drawer */}
        {(() => {
          const sel = stages.find((s) => s.id === activeStage);
          if (!sel) return null;
          const Icon = sel.icon;

          return (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "16px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} color="var(--accent-primary)" />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14.5px", fontWeight: 700, color: "#ffffff" }}>
                      Stage {sel.num}: {sel.title}
                    </span>
                    <Badge variant={sel.badge.variant} size="sm">{sel.badge.text}</Badge>
                  </div>
                  <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {sel.description}
                  </div>
                </div>
              </div>

              <Link href={sel.link} style={{ textDecoration: "none" }}>
                <Button variant="primary" size="sm" icon={<ChevronRight size={14} />} iconPosition="right">
                  Open Stage Workspace
                </Button>
              </Link>
            </div>
          );
        })()}
      </Card>

      {/* 3 Balanced Summary Columns */}
      <div className="grid-3">
        {/* Top Matches */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Target size={16} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Top Opportunity Matches</h3>
            </div>
            <Link href="/match" style={{ fontSize: "12px", color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
              View All
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {matches.slice(0, 2).map((m) => (
              <div
                key={m.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 600 }}>{m.job.title}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {m.job.company.name} • {m.job.location}
                    </div>
                  </div>
                  <Badge variant="cyan" size="sm">{m.overall_score.toFixed(0)}% Match</Badge>
                </div>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "8px" }}>
                  {m.matched_skills_json.slice(0, 2).map((s) => (
                    <span key={s} style={{ fontSize: "11px", color: "#34d399" }}>✓ {s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Critical Skill Gaps */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={16} color="var(--accent-amber)" />
              <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Critical Skill Gaps</h3>
            </div>
            <Link href="/gap" style={{ fontSize: "12px", color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
              Diagnostics
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {gaps.slice(0, 2).map((g) => (
              <div
                key={g.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                  <div style={{ fontSize: "13.5px", fontWeight: 600 }}>{g.title}</div>
                  <Badge variant={g.priority === "CRITICAL" ? "brand" : "warning"} size="sm">{g.priority}</Badge>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Level {g.current_level} → Target {g.target_level} (Delta: +{(g.target_level - g.current_level).toFixed(1)})
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TrendingUp size={16} color="var(--accent-emerald)" />
              <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Conversion Funnel</h3>
            </div>
            <Link href="/outcome" style={{ fontSize: "12px", color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
              Deep Dive
            </Link>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
            <div style={{ flex: 1, padding: "10px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>{funnel?.applied || 2}</div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Submissions</div>
            </div>
            <div style={{ flex: 1, padding: "10px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent-cyan)" }}>{funnel?.interviews || 4}</div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Interviews</div>
            </div>
            <div style={{ flex: 1, padding: "10px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent-emerald)" }}>{funnel?.offers || 1}</div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Offers</div>
            </div>
          </div>

          <Link href="/prove" style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="sm" style={{ width: "100%" }} icon={<Award size={14} color="var(--accent-primary)" />}>
              Verify Next Skill in Stage 5
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
