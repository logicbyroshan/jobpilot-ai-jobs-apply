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
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Shield,
  Zap,
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
      name: "1. KNOW",
      title: "Identity & Provenance",
      description: "Aggregates GitHub commits, verified repositories, resume history & skill evidence.",
      metrics: `${profile?.summary_json?.verified_skills || 8} Verified Skills`,
      status: "Verified",
      icon: UserCheck,
      color: "#818cf8",
      link: "/know",
    },
    {
      id: "MATCH",
      name: "2. MATCH",
      title: "Opportunity Scoring",
      description: "Multi-dimensional scoring: Technical fit, seniority match, preference alignment.",
      metrics: `${matches.length} Opportunities`,
      status: "93.5% Top Fit",
      icon: Target,
      color: "#06b6d4",
      link: "/match",
    },
    {
      id: "GAP",
      name: "3. GAP",
      title: "Skill & Evidence Gap Analysis",
      description: "Identifies technical deficits preventing candidate from closing top tier offers.",
      metrics: `${gaps.length} Actionable Gaps`,
      status: "1 Critical",
      icon: Sparkles,
      color: "#f59e0b",
      link: "/gap",
    },
    {
      id: "IMPROVE",
      name: "4. IMPROVE",
      title: "Curated Learning Pathways",
      description: "Step-by-step technical blueprints with high-ROI books, courses, and hands-on projects.",
      metrics: `${plans.length} Active Plan`,
      status: `${plans[0]?.progress_percentage || 45}% Progress`,
      icon: BookOpen,
      color: "#10b981",
      link: "/improve",
    },
    {
      id: "PROVE",
      name: "5. PROVE",
      title: "Diagnostic Assessments",
      description: "Hands-on quizzes & scenarios that scientifically boost verified skill confidence.",
      metrics: "2 Proving Quizzes",
      status: "Ready",
      icon: Award,
      color: "#a855f7",
      link: "/prove",
    },
    {
      id: "APPLY",
      name: "6. APPLY",
      title: "Autonomous & Assisted Apply",
      description: "Automated tailored artifact generation, resume tailoring, and controlled submissions.",
      metrics: `${applications.length} Applications`,
      status: "Assisted Policy",
      icon: Send,
      color: "#ec4899",
      link: "/apply",
    },
    {
      id: "OUTCOME",
      name: "7. OUTCOME",
      title: "Funnel & Bottlenecks",
      description: "Full funnel tracking from screening to offers, diagnosing stage drop-offs.",
      metrics: `${funnel?.offers || 1} Offer Received`,
      status: "16.7% Offer Rate",
      icon: TrendingUp,
      color: "#3b82f6",
      link: "/outcome",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Hero Welcome Banner */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.25)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "250px",
            height: "250px",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span className="badge badge-primary">AI Career Operating System</span>
              <span className="badge badge-emerald" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span className="pulse-dot" style={{ background: "var(--accent-emerald)" }} />
                Active Feedback Loop
              </span>
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px", letterSpacing: "-0.03em" }}>
              Welcome back, {profile?.full_name || "Alex Chen"}
            </h1>
            <p style={{ color: "var(--text-muted)", maxWidth: "720px", fontSize: "14.5px" }}>
              JobPilot is continuously orchestrating your career operating loop: diagnosing skill deficits, curating learning paths, proving competence via interactive assessments, and aligning high-signal opportunities.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="btn btn-primary"
              style={{ fontSize: "13.5px" }}
            >
              <RefreshCw
                size={16}
                style={{ animation: recalculating ? "spin 1s linear infinite" : "none" }}
              />
              <span>{recalculating ? "Re-scoring..." : "Recalculate AI Match Scores"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8-Stage Operating Loop Interactive Visualizer */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em" }}>
              Closed-Loop Career Engine
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700 }}>
              The 8-Stage Autonomous Career Loop
            </h2>
          </div>
          <div style={{ fontSize: "12.5px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>Click any node to inspect real-time state</span>
          </div>
        </div>

        {/* Stages Chain */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          {stages.map((stg) => {
            const isSelected = activeStage === stg.id;
            const Icon = stg.icon;
            return (
              <div
                key={stg.id}
                onClick={() => setActiveStage(stg.id)}
                style={{
                  padding: "16px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: isSelected
                    ? "rgba(99, 102, 241, 0.15)"
                    : "rgba(255, 255, 255, 0.03)",
                  border: isSelected
                    ? `1px solid ${stg.color}`
                    : "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Icon size={20} color={stg.color} />
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: stg.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {stg.status}
                  </span>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: isSelected ? "#ffffff" : "var(--text-main)" }}>
                  {stg.name}
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
                  {stg.metrics}
                </div>
              </div>
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
                background: "rgba(10, 15, 30, 0.6)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: `rgba(${parseInt(sel.color.slice(1, 3), 16)}, ${parseInt(sel.color.slice(3, 5), 16)}, ${parseInt(sel.color.slice(5, 7), 16)}, 0.15)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={24} color={sel.color} />
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                    Stage {sel.name}: {sel.title}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {sel.description}
                  </div>
                </div>
              </div>

              <Link href={sel.link} className="btn btn-secondary" style={{ fontSize: "13px", gap: "6px" }}>
                <span>Open {sel.name.split(". ")[1]} Stage</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          );
        })()}
      </div>

      {/* Top 3 High-Impact Radar Columns */}
      <div className="grid-3">
        {/* MATCH Column */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Target size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Top Opportunity Matches</h3>
            </div>
            <Link href="/match" style={{ fontSize: "12px", color: "var(--accent-cyan)", fontWeight: 600 }}>
              View All ({matches.length})
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {matches.slice(0, 3).map((match) => (
              <div
                key={match.id}
                style={{
                  padding: "14px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>{match.job.title}</div>
                  <span
                    className="badge"
                    style={{
                      background: match.overall_score >= 90 ? "rgba(16, 185, 129, 0.15)" : "rgba(6, 182, 212, 0.15)",
                      color: match.overall_score >= 90 ? "#34d399" : "#22d3ee",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {match.overall_score.toFixed(1)}% Match
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: "8px" }}>
                  {match.job.company.name} • {match.job.location} • ${((match.job.salary_max || 200000) / 1000).toFixed(0)}k
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {match.matched_skills_json.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: "11px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "rgba(99, 102, 241, 0.1)",
                        color: "#a5b4fc",
                      }}
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GAP & IMPROVE Column */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} color="var(--accent-amber)" />
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Critical Skill Gaps</h3>
            </div>
            <Link href="/gap" style={{ fontSize: "12px", color: "var(--accent-amber)", fontWeight: 600 }}>
              View Gaps ({gaps.length})
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {gaps.slice(0, 3).map((gap) => (
              <div
                key={gap.id}
                style={{
                  padding: "14px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                  <div style={{ fontWeight: 600, fontSize: "13.5px" }}>{gap.title}</div>
                  <span
                    className={`badge ${gap.priority === "CRITICAL" ? "badge-rose" : "badge-amber"}`}
                    style={{ fontSize: "10.5px" }}
                  >
                    {gap.priority}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: "8px" }}>
                  Current Level: <span style={{ color: "#ffffff" }}>{gap.current_level}/10</span> → Target:{" "}
                  <span style={{ color: "var(--accent-emerald)" }}>{gap.target_level}/10</span>
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                  {gap.expected_impact}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OUTCOME & FUNNEL Column */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={18} color="var(--accent-emerald)" />
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Conversion Funnel</h3>
            </div>
            <Link href="/outcome" style={{ fontSize: "12px", color: "var(--accent-emerald)", fontWeight: 600 }}>
              Deep Dive
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>{applications.length}</div>
                <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Applications</div>
              </div>
              <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--accent-cyan)" }}>
                  {funnel?.interviews || 2}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Interviews</div>
              </div>
              <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--accent-emerald)" }}>
                  {funnel?.offers || 1}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Offers</div>
              </div>
            </div>

            {/* Bottleneck Diagnostic */}
            <div
              style={{
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(244, 63, 94, 0.08)",
                border: "1px solid rgba(244, 63, 94, 0.2)",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-rose)", textTransform: "uppercase", marginBottom: "4px" }}>
                AI Diagnostic Feedback
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                {funnel?.primary_bottleneck || "Candidate screening pass-rate increased by 40% after Kubernetes Proving Assessment submission."}
              </div>
            </div>

            <Link href="/prove" className="btn btn-primary" style={{ width: "100%", fontSize: "13px", marginTop: "4px" }}>
              <Award size={15} />
              <span>Prove Next Skill Assessment</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
