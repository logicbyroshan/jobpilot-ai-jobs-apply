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
  ArrowRight,
  Zap,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  UserProfile,
  MatchItem,
  GapItem,
  LearningPlanType,
  ApplicationItem,
  FunnelAnalytics,
  CareerGoal,
  ActivityItem,
} from "@/lib/types";
import { Button } from "./components/ui/Button";
import { Badge } from "./components/ui/Badge";
import { Card } from "./components/ui/Card";

export default function OverviewPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goal, setGoal] = useState<CareerGoal | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [gaps, setGaps] = useState<GapItem[]>([]);
  const [plans, setPlans] = useState<LearningPlanType[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [funnel, setFunnel] = useState<FunnelAnalytics | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [profData, goalData, matchData, gapData, planData, appData, funData] = await Promise.all([
          api.getProfile(),
          api.getCareerGoal(),
          api.getMatches(),
          api.getGaps(),
          api.getLearningPlans(),
          api.getApplications(),
          api.getFunnelAnalytics(),
        ]);
        setProfile(profData);
        setGoal(goalData);
        setMatches(matchData);
        setGaps(gapData);
        setPlans(planData);
        setApplications(appData);
        setFunnel(funData);
        setActivities(api.getRecentActivities());
      } catch (err) {
        console.error("Error loading overview data:", err);
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
    { num: "1", name: "Know Me", href: "/know", tag: "8 Verified", icon: UserCheck, active: false },
    { num: "2", name: "Opportunities", href: "/opportunities", tag: "94% Top Fit", icon: Target, active: false },
    { num: "3", name: "Gaps", href: "/gaps", tag: "1 Blocker", icon: Sparkles, active: false },
    { num: "4", name: "Improve", href: "/improve", tag: "Today's Focus", icon: BookOpen, active: false },
    { num: "5", name: "Prove", href: "/prove", tag: "Ready", icon: Award, active: true },
    { num: "6", name: "Applications", href: "/applications", tag: "2 Active", icon: Send, active: false },
    { num: "7", name: "Outcomes", href: "/outcomes", tag: "1 Offer", icon: TrendingUp, active: false },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* 1. Header with Career Goal and Readiness */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "12px",
          paddingBottom: "4px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="brand">Autonomous Career OS</Badge>
            <Badge variant="success" dot>Loop Live</Badge>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>
            Good afternoon, {profile?.full_name || "Alex Chen"}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "2px", fontSize: "13px", color: "var(--text-muted)", flexWrap: "wrap" }}>
            <span>Targeting: <strong style={{ color: "var(--text-main)" }}>{goal?.target_role || "Staff Distributed Systems Architect"}</strong></span>
            <span>•</span>
            <span>Career Readiness: <strong style={{ color: "var(--accent-emerald)" }}>82%</strong></span>
            <span>•</span>
            <span>Profile Confidence: <strong style={{ color: "var(--accent-cyan)" }}>94.2%</strong></span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
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
            {recalculating ? "Recalculating..." : "Recalculate Fit"}
          </Button>
        </div>
      </div>

      {/* 2. PRIMARY "NEXT BEST ACTION" CARD */}
      <Card
        style={{
          background: "var(--bg-card)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          padding: "18px 20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "5px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Award size={18} color="var(--accent-purple)" />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                  Recommended Next Action
                </span>
                <Badge variant="purple" size="sm">⏱ 20 Mins</Badge>
              </div>

              <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>
                Prove Skill: Distributed Consensus & Raft Quorums
              </h2>

              <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "680px", lineHeight: 1.45 }}>
                <strong>Why this matters:</strong> Your knowledge improved in Stage 4, but JobPilot needs verified evidence.
                Passing this assessment verifies your level at <strong>9.8/10</strong> and unlocks <strong>12 higher-signal opportunities</strong>.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link href="/prove" style={{ textDecoration: "none" }}>
              <Button variant="primary" size="md" icon={<ArrowRight size={14} />} iconPosition="right">
                Start Assessment
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 3. CAREER JOURNEY LOOP STEPPER */}
      <Card style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)", letterSpacing: "0.05em" }}>
            Your Career Operating Journey
          </div>
          <span style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
            Current Stage: <strong style={{ color: "var(--text-main)" }}>Stage 5 (PROVE)</strong>
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
          {stages.map((stg) => {
            const Icon = stg.icon;
            return (
              <Link
                key={stg.num}
                href={stg.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "8px",
                  borderRadius: "4px",
                  background: stg.active ? "var(--bg-elevated)" : "rgba(255, 255, 255, 0.02)",
                  border: stg.active ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid var(--border-subtle)",
                  textDecoration: "none",
                  transition: "all 0.1s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "10.5px", fontWeight: 700, color: stg.active ? "var(--text-main)" : "var(--text-dim)" }}>
                    {stg.num}. {stg.name}
                  </span>
                  <Icon size={12} color={stg.active ? "var(--text-main)" : "var(--text-dim)"} />
                </div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: stg.active ? "var(--accent-emerald)" : "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {stg.tag}
                </div>
              </Link>
            );
          })}
        </div>
      </Card>

      {/* 4. OPPORTUNITIES + GAPS + STRATEGIC AI INSIGHT */}
      <div className="grid-3">
        {/* Recommended Opportunities */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Target size={15} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Top Recommended Matches</h3>
            </div>
            <Link href="/opportunities" style={{ fontSize: "11.5px", color: "var(--text-muted)", textDecoration: "none", fontWeight: 600 }}>
              View All ({matches.length}) →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {matches.slice(0, 2).map((m) => (
              <Link
                key={m.id}
                href="/opportunities"
                style={{
                  padding: "10px 12px",
                  borderRadius: "4px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>{m.job.title}</div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
                      {m.job.company.name} • {m.job.location}
                    </div>
                  </div>
                  <Badge variant={m.overall_score >= 90 ? "success" : "cyan"} size="sm">
                    {m.overall_score.toFixed(0)}% Match
                  </Badge>
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  <strong>Why:</strong> {m.why_matched || "Strong Go and consensus alignment"}
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Current Gaps Blockers */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={15} color="var(--accent-amber)" />
              <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Active Skill Deficits</h3>
            </div>
            <Link href="/gaps" style={{ fontSize: "11.5px", color: "var(--text-muted)", textDecoration: "none", fontWeight: 600 }}>
              Close Gaps ({gaps.length}) →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {gaps.slice(0, 2).map((g) => (
              <Link
                key={g.id}
                href="/gaps"
                style={{
                  padding: "10px 12px",
                  borderRadius: "4px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>{g.title}</div>
                  <Badge variant={g.priority === "CRITICAL" ? "brand" : "warning"} size="sm">{g.priority}</Badge>
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "2px" }}>
                  Level {g.current_level} → Target {g.target_level} (Impact: <strong>{g.expected_impact || "Blocks 74% of senior roles"}</strong>)
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Strategic Career AI Insight */}
        <Card style={{ background: "rgba(6, 182, 212, 0.03)", border: "1px solid rgba(6, 182, 212, 0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <Sparkles size={15} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Strategic Career Insight</h3>
          </div>

          <p style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.45, marginBottom: "12px" }}>
            &ldquo;Your profile is strong enough for senior backend roles. Your primary current bottleneck is verifying
            multi-tenant Kubernetes operators and Triton serving infrastructure.&rdquo;
          </p>

          <Link href="/improve" style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="sm" style={{ width: "100%" }}>
              Review Learning Blueprint
            </Button>
          </Link>
        </Card>
      </div>

      {/* 5. RECENT ACTIVITY TIMELINE */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Recent Career Operating Activities</h3>
          <span style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>Synchronized across 4 sources</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {activities.map((act) => (
            <div
              key={act.id}
              style={{
                padding: "8px 12px",
                borderRadius: "4px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Badge variant="neutral" size="sm">{act.stage}</Badge>
                <div>
                  <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-main)" }}>{act.title}</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "8px" }}>{act.description}</span>
                </div>
              </div>

              <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>{act.timestamp}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
