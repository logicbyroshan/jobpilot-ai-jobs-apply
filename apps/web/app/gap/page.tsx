"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { GapItem } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

export default function GapDiagnosticsPage() {
  const [gaps, setGaps] = useState<GapItem[]>([]);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [planNotice, setPlanNotice] = useState<string | null>(null);

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

  const handleGeneratePlan = async (gapId: string, title: string) => {
    setGeneratingId(gapId);
    try {
      await api.generateLearningPlan(gapId);
      setPlanNotice(`Curated Learning Plan generated for "${title}"!`);
      setTimeout(() => setPlanNotice(null), 4000);
    } catch (err) {
      console.error("Plan generation error:", err);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="warning">Stage 3</Badge>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Diagnostic Gap Analysis</span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700 }}>
            GAP — Competence & Evidence Diagnostics
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginTop: "2px" }}>
            Identifies technical deficits preventing candidate from closing top-tier offers.
          </p>
        </div>

        <Link href="/improve" style={{ textDecoration: "none" }}>
          <Button variant="secondary" size="md" icon={<BookOpen size={14} />}>
            View Active Pathways
          </Button>
        </Link>
      </div>

      {/* Plan Generated Notice */}
      {planNotice && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-sm)",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            color: "#34d399",
            fontSize: "13px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2 size={16} />
          <span>{planNotice}</span>
        </div>
      )}

      {/* Gaps List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {gaps.map((gap) => {
          const delta = (gap.target_level - gap.current_level).toFixed(1);
          return (
            <Card key={gap.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                    <Badge variant={gap.priority === "CRITICAL" ? "brand" : "warning"} size="sm">
                      {gap.priority} PRIORITY
                    </Badge>
                    <Badge variant="neutral" size="sm">{gap.gap_type}</Badge>
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{gap.title}</h3>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "13.5px", fontWeight: 700 }}>
                    Level {gap.current_level} <span style={{ color: "var(--text-dim)" }}>→</span> Target {gap.target_level}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--accent-primary)", fontWeight: 600 }}>
                    +{delta} Proficiency Required
                  </div>
                </div>
              </div>

              {/* Rationale */}
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "12.5px",
                  color: "var(--text-muted)",
                  lineHeight: 1.45,
                  marginBottom: "12px",
                }}
              >
                {gap.rationale || "Core architecture requirement for senior infrastructure positions."}
              </div>

              {/* Footer Action */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                  Estimated Time to Close: <strong>{gap.estimated_hours_to_close || 12} hours</strong>
                </span>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleGeneratePlan(gap.id, gap.title)}
                  disabled={generatingId === gap.id}
                  icon={<ArrowRight size={13} />}
                  iconPosition="right"
                >
                  {generatingId === gap.id ? "Curating Plan..." : "Generate 5-Step Learning Plan"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
