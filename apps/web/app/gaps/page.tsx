"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api";
import { GapItem } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

export default function GapsPage() {
  const [gaps, setGaps] = useState<GapItem[]>([]);

  useEffect(() => {
    async function loadGaps() {
      try {
        const data = await api.getGaps();
        setGaps(data);
      } catch (err) {
        console.error("Failed to load gaps:", err);
      }
    }
    loadGaps();
  }, []);

  const criticalGaps = gaps.filter((g) => g.priority === "CRITICAL");
  const highGaps = gaps.filter((g) => g.priority === "HIGH");
  const mediumGaps = gaps.filter((g) => g.priority !== "CRITICAL" && g.priority !== "HIGH");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="brand">Stage 3</Badge>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Deficit Impact Diagnostics</span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>
            Your Biggest Gaps
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
            Prioritized by career impact and blocked opportunities, not merely by the number of missing keywords.
          </p>
        </div>

        <Link href="/improve" style={{ textDecoration: "none" }}>
          <Button variant="primary" size="sm" icon={<BookOpen size={13} />}>
            Active Learning Blueprint (Stage 4)
          </Button>
        </Link>
      </div>

      {/* Critical Blockers Section */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <Badge variant="brand" size="sm">Critical Priority</Badge>
          <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
            Actively blocking top-tier compensation roles
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {criticalGaps.map((gap) => (
            <Card
              key={gap.id}
              style={{
                borderLeft: "3px solid var(--accent-primary)",
                padding: "18px 20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{gap.title}</h3>
                    <Badge variant="brand" size="sm">{gap.priority}</Badge>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--accent-amber)", fontWeight: 600 }}>
                    Impact: {gap.expected_impact || "Required by 74% of target roles • Blocking 12 high-signal matches"}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)" }}>
                    Level {gap.current_level} → <span style={{ color: "var(--accent-emerald)" }}>{gap.target_level} Target</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                    Est. Effort: {gap.estimated_effort_hours || gap.estimated_hours_to_close || 24} Hours
                  </div>
                </div>
              </div>

              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.45, marginBottom: "12px" }}>
                {gap.rationale}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <span style={{ fontSize: "11.5px", color: "var(--text-dim)", fontWeight: 600 }}>Missing:</span>
                  <Badge variant="neutral" size="sm">Triton Inference Server</Badge>
                  <Badge variant="neutral" size="sm">vLLM PagedAttention</Badge>
                  <Badge variant="neutral" size="sm">CUDA Kernel Optimization</Badge>
                </div>

                <Link href={`/gaps/${gap.id}`} style={{ textDecoration: "none" }}>
                  <Button variant="primary" size="sm" icon={<ArrowRight size={13} />} iconPosition="right">
                    Close This Gap
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* High & Medium Priority Gaps */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", marginTop: "10px" }}>
          <Badge variant="warning" size="sm">High & Medium Priority</Badge>
          <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>Secondary optimization opportunities</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[...highGaps, ...mediumGaps].map((gap) => (
            <Card key={gap.id} style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <h4 style={{ fontSize: "14.5px", fontWeight: 700 }}>{gap.title}</h4>
                <Badge variant="warning" size="sm">{gap.priority}</Badge>
              </div>

              <div style={{ fontSize: "11.5px", color: "var(--text-dim)", marginBottom: "8px" }}>
                Level {gap.current_level} → Target {gap.target_level}
              </div>

              <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4, marginBottom: "12px" }}>
                {gap.rationale}
              </p>

              <Link href={`/gaps/${gap.id}`} style={{ textDecoration: "none" }}>
                <Button variant="secondary" size="sm" style={{ width: "100%" }}>
                  Inspect Diagnostic Plan
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
