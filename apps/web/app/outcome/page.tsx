"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Repeat,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { FunnelAnalytics } from "@/lib/types";

export default function OutcomeFunnelPage() {
  const [funnel, setFunnel] = useState<FunnelAnalytics | null>(null);

  useEffect(() => {
    async function loadFunnel() {
      try {
        const data = await api.getFunnelAnalytics();
        setFunnel(data);
      } catch (err) {
        console.error("Failed to load funnel:", err);
      }
    }
    loadFunnel();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="badge badge-primary">Loop Stage 7</span>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Conversion Analytics & Closed-Loop Feedback</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em" }}>
            OUTCOME — Conversion Funnel & Strategic Feedback Loop
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
            Tracks drop-offs across screening, technical rounds, and offer stages to continuously improve the KNOW and IMPROVE recommendations.
          </p>
        </div>

        <Link href="/" className="btn btn-primary" style={{ fontSize: "13px" }}>
          <Compass size={15} />
          <span>Return to Career Operating Loop</span>
        </Link>
      </div>

      {/* Funnel Conversion Visualizer */}
      <div className="card">
        <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
          End-to-End Application Conversion Funnel
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {funnel?.stages.map((stg, idx) => {
            const widthPct = Math.max(15, 100 - idx * 18);
            return (
              <div key={stg.stage}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", marginBottom: "6px" }}>
                  <span style={{ fontWeight: 600, color: "#ffffff" }}>{stg.stage}</span>
                  <span style={{ color: "var(--text-muted)" }}>
                    <strong style={{ color: "#ffffff" }}>{stg.count}</strong> candidates (
                    <span style={{ color: "var(--accent-emerald)" }}>{stg.conversion_rate_percentage}% conversion</span>)
                  </span>
                </div>
                <div className="progress-bar-bg" style={{ height: "12px" }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${widthPct}%`,
                      background: "linear-gradient(90deg, #6366f1 0%, #06b6d4 50%, #10b981 100%)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Closed-Loop AI Insights Box */}
      <div className="grid-2">
        {/* Primary Bottleneck Diagnostic */}
        <div
          className="card"
          style={{
            background: "rgba(244, 63, 94, 0.06)",
            border: "1px solid rgba(244, 63, 94, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <AlertTriangle size={20} color="var(--accent-rose)" />
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--accent-rose)" }}>
              Identified Funnel Bottleneck
            </h3>
          </div>
          <p style={{ fontSize: "13.5px", color: "var(--text-main)", lineHeight: 1.6 }}>
            {funnel?.primary_bottleneck ||
              "Recruiter initial screen response rate was lower on infrastructure roles prior to completing hands-on Kubernetes verification assessments."}
          </p>
        </div>

        {/* Strategic Feedback Recommendation */}
        <div
          className="card"
          style={{
            background: "rgba(16, 185, 129, 0.06)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Repeat size={20} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#34d399" }}>
              Closed-Loop Feedback Action
            </h3>
          </div>
          <p style={{ fontSize: "13.5px", color: "var(--text-main)", lineHeight: 1.6 }}>
            {funnel?.strategic_recommendation ||
              "Outcome data indicates high interview conversion (+60%) when System Design and Distributed Consensus evidence is cited on tailored application resumes."}
          </p>
        </div>
      </div>

      {/* Lifecycle Timeline */}
      <div className="card">
        <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
          Recent Conversion Lifecycle Events
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {funnel?.recent_events.map((ev) => (
            <div
              key={ev.id}
              style={{
                padding: "12px 16px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <CheckCircle2 size={18} color="var(--accent-emerald)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>{ev.event_type}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>{ev.notes}</div>
                </div>
              </div>

              <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                {new Date(ev.occurred_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
