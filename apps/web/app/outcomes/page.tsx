"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  BookOpen,
  Target,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { FunnelAnalytics } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

export default function OutcomesPage() {
  const [funnel, setFunnel] = useState<FunnelAnalytics | null>(null);

  useEffect(() => {
    async function loadFunnel() {
      try {
        const data = await api.getFunnelAnalytics();
        setFunnel(data);
      } catch (err) {
        console.error("Failed to load outcomes:", err);
      }
    }
    loadFunnel();
  }, []);

  const stages = [
    { label: "Submitted Applications", count: 18, rate: "100%", color: "var(--accent-primary)" },
    { label: "Recruiter Responses", count: 6, rate: "33.3%", color: "var(--accent-cyan)" },
    { label: "Technical Interviews", count: 4, rate: "22.2%", color: "var(--accent-amber)" },
    { label: "Final Rounds", count: 2, rate: "11.1%", color: "var(--accent-purple)" },
    { label: "Offers Received", count: 1, rate: "5.5%", color: "var(--accent-emerald)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="brand">Stage 7</Badge>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Strategic Feedback & Funnel Analytics</span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>
            What&apos;s Happening With Your Career?
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
            End-to-end conversion diagnostics feeding real interview outcomes back into your skill gap priorities.
          </p>
        </div>

        <Link href="/gaps" style={{ textDecoration: "none" }}>
          <Button variant="primary" size="sm" icon={<Sparkles size={13} />}>
            Address Diagnostic Bottleneck (Stage 3)
          </Button>
        </Link>
      </div>

      {/* 1. STRATEGIC BOTTLENECK DIAGNOSTIC (CLOSED LOOP BACK TO GAP) */}
      <Card
        style={{
          background: "linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(14, 20, 34, 0.95) 100%)",
          border: "1px solid rgba(6, 182, 212, 0.3)",
          padding: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "6px",
                background: "var(--accent-cyan)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Sparkles size={20} color="#090d16" />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", color: "var(--accent-cyan)", letterSpacing: "0.06em" }}>
                  Primary Career Bottleneck Identified
                </span>
                <Badge variant="cyan" size="sm">High Impact Loop</Badge>
              </div>

              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>
                Technical Interview Conversion Drop-off
              </h2>

              <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "680px", lineHeight: 1.45 }}>
                {funnel?.bottleneck_summary?.bottleneck_reason ||
                  "Your resume profile generates interviews at a strong 33% response rate. However, your primary drop-off occurs during live GPU infrastructure and Triton dynamic batching technical rounds."}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Link href="/improve" style={{ textDecoration: "none" }}>
              <Button variant="primary" size="md" icon={<ArrowRight size={14} />} iconPosition="right">
                Improve Technical Interviews
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 2. CONVERSION FUNNEL METRICS BAR */}
      <Card style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "14px" }}>
          Full Lifecycle Conversion Funnel
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
          {stages.map((stg) => (
            <div
              key={stg.label}
              style={{
                padding: "14px 12px",
                borderRadius: "4px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "24px", fontWeight: 800, color: stg.color, marginBottom: "2px" }}>
                {stg.count}
              </div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>
                {stg.label}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                Conversion: <strong>{stg.rate}</strong>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. RECENT OUTCOME EVENTS & NEXT STEPS */}
      <div className="grid-2">
        <Card>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px" }}>
            Interview Status History
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ padding: "10px 12px", borderRadius: "4px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>Anthropic — Staff Infra Architect</span>
                <Badge variant="cyan" size="sm">Technical Round</Badge>
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "2px" }}>
                Scheduled for Thursday 2:00 PM PST • Focus: Raft state replication
              </div>
            </div>

            <div style={{ padding: "10px 12px", borderRadius: "4px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>Datadog — Principal Distributed Systems</span>
                <Badge variant="success" size="sm">Offer Extended</Badge>
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "2px" }}>
                Base $240,000 + Equity • Review compensation package in Stage 6
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px" }}>
            Self-Optimizing Career Feedback
          </h3>

          <p style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.45, marginBottom: "14px" }}>
            Every interview outcome, assessment score, and application response automatically recalculates your
            fit scores across all 6 stages of the JobPilot loop.
          </p>

          <Link href="/know" style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="sm" style={{ width: "100%" }}>
              Review Calibrated Identity Graph (Stage 1) →
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
