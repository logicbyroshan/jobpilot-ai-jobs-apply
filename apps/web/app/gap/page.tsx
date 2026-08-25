"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  AlertCircle,
  TrendingUp,
  Clock,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { GapItem } from "@/lib/types";

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
      setPlanNotice(`Curated Learning Plan successfully generated for "${title}"!`);
      setTimeout(() => setPlanNotice(null), 4000);
    } catch (err) {
      console.error("Plan generation error:", err);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="badge badge-amber">Loop Stage 3</span>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Diagnostic AI Gap Analysis</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em" }}>
            GAP — Competence & Evidence Diagnostics
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
            Uncovers the exact architectural gaps, unverified competencies, and seniority deficits preventing offer conversion.
          </p>
        </div>

        <Link href="/improve" className="btn btn-secondary" style={{ fontSize: "13px" }}>
          <BookOpen size={15} />
          <span>View Active Learning Pathways</span>
        </Link>
      </div>

      {/* Plan Generated Notice */}
      {planNotice && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-sm)",
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#34d399",
            fontSize: "13.5px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2 size={18} />
          <span>{planNotice}</span>
        </div>
      )}

      {/* Gaps Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {gaps.map((gap) => {
          const delta = (gap.target_level - gap.current_level).toFixed(1);
          return (
            <div key={gap.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 700 }}>{gap.title}</h3>
                    <span
                      className={`badge ${
                        gap.priority === "CRITICAL"
                          ? "badge-rose"
                          : gap.priority === "HIGH"
                          ? "badge-amber"
                          : "badge-cyan"
                      }`}
                    >
                      {gap.priority} PRIORITY
                    </span>
                    <span className="badge badge-subtle">{gap.gap_type}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "800px", lineHeight: 1.5 }}>
                    {gap.rationale}
                  </div>
                </div>

                <button
                  onClick={() => handleGeneratePlan(gap.id, gap.title)}
                  disabled={generatingId === gap.id}
                  className="btn btn-primary"
                  style={{ fontSize: "13px", gap: "6px" }}
                >
                  <Sparkles size={14} />
                  <span>{generatingId === gap.id ? "Synthesizing Plan..." : "Generate Learning Plan"}</span>
                </button>
              </div>

              {/* Metrics & Level Differential */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr 1fr",
                  gap: "16px",
                  padding: "14px 16px",
                  background: "rgba(255, 255, 255, 0.02)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                    <span style={{ color: "var(--text-dim)" }}>
                      Current Level: <strong style={{ color: "#ffffff" }}>{gap.current_level}/10</strong>
                    </span>
                    <span style={{ color: "var(--accent-emerald)" }}>
                      Target Level: <strong>{gap.target_level}/10 (+{delta})</strong>
                    </span>
                  </div>
                  <div className="progress-bar-bg" style={{ height: "10px" }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${gap.target_level * 10}%`,
                        background: "linear-gradient(90deg, #f59e0b 0%, #10b981 100%)",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Clock size={16} color="var(--accent-cyan)" />
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Est. Study Effort</div>
                    <div style={{ fontSize: "13.5px", fontWeight: 700 }}>
                      {gap.estimated_effort_hours || 20} Hours
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <TrendingUp size={16} color="var(--accent-emerald)" />
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Expected Match Boost</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#34d399" }}>
                      {gap.expected_impact || "+15% Match Gain"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
