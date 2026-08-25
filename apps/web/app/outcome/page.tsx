"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Compass,
} from "lucide-react";
import { api } from "@/lib/api";
import { FunnelAnalytics } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="brand">Stage 7</Badge>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Conversion Analytics & Closed Loop</span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700 }}>
            OUTCOME — Conversion Funnel & Strategic Feedback Loop
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginTop: "2px" }}>
            Tracks drop-offs across stages to continuously update KNOW and IMPROVE recommendations.
          </p>
        </div>

        <Link href="/" style={{ textDecoration: "none" }}>
          <Button variant="secondary" size="md" icon={<Compass size={14} />}>
            Return to Career Loop
          </Button>
        </Link>
      </div>

      {/* Funnel Conversion Visualizer */}
      <Card>
        <h2 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "16px" }}>
          End-to-End Application Conversion Funnel
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {funnel?.stages.map((stg, idx) => {
            const widthPct = Math.max(15, 100 - idx * 18);
            return (
              <div key={stg.stage}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{stg.stage}</span>
                  <span style={{ color: "var(--text-muted)" }}>
                    <strong style={{ color: "#ffffff" }}>{stg.count}</strong> candidates (
                    <span style={{ color: "var(--accent-emerald)" }}>{stg.conversion_rate_percentage}% conversion</span>)
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${widthPct}%`,
                      background: "var(--accent-primary)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Closed-Loop AI Insights Box */}
      <div className="grid-2">
        {/* Primary Bottleneck Diagnostic */}
        <Card style={{ background: "rgba(225, 29, 72, 0.04)", border: "1px solid rgba(225, 29, 72, 0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <AlertTriangle size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Primary Detected Bottleneck</h3>
          </div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#fda4af", marginBottom: "4px" }}>
            {funnel?.bottleneck_summary?.primary_bottleneck_stage || "TECHNICAL_ROUND"}
          </div>
          <p style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.45 }}>
            {funnel?.bottleneck_summary?.bottleneck_reason ||
              "Drop-off observed between recruiter screen and architectural system design rounds."}
          </p>
        </Card>

        {/* Adaptive Closed-Loop Strategy */}
        <Card style={{ background: "rgba(16, 185, 129, 0.04)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Sparkles size={18} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Adaptive Loop Recommendations</h3>
          </div>
          <p style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.45, marginBottom: "12px" }}>
            {funnel?.bottleneck_summary?.actionable_recommendation ||
              "Complete the distributed transactions & consensus assessment in Stage 5 to calibrate proof evidence."}
          </p>
          <Link href="/improve" style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="sm">
              Open Recommended Pathways
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
