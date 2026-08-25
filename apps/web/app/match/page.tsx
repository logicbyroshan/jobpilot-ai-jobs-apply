"use client";

import React, { useState, useEffect } from "react";
import {
  Target,
  Filter,
  DollarSign,
  MapPin,
  CheckCircle2,
  XCircle,
  Sparkles,
  Send,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { api } from "@/lib/api";
import { MatchItem } from "@/lib/types";

export default function MatchOpportunitiesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const [minScore, setMinScore] = useState<number>(75);
  const [recalculating, setRecalculating] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applySuccessNotice, setApplySuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadMatches() {
      try {
        const data = await api.getMatches();
        setMatches(data);
        if (data.length > 0) {
          setSelectedMatch(data[0]);
        }
      } catch (err) {
        console.error("Failed to load matches:", err);
      }
    }
    loadMatches();
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const data = await api.recalculateMatches();
      setMatches(data);
      if (data.length > 0) {
        setSelectedMatch(data[0]);
      }
    } catch (err) {
      console.error("Recalculation error:", err);
    } finally {
      setRecalculating(false);
    }
  };

  const handleCreateApplication = async (jobId: string, title: string) => {
    setApplyingId(jobId);
    try {
      await api.createApplication({
        job_id: jobId,
        tailored_role_title: title,
        notes: "Automated tailored application generated via Match Radar.",
      });
      setApplySuccessNotice(`Application drafted & tailored for ${title}!`);
      setTimeout(() => setApplySuccessNotice(null), 4000);
    } catch (err) {
      console.error("Apply error:", err);
    } finally {
      setApplyingId(null);
    }
  };

  const filteredMatches = matches.filter((m) => m.overall_score >= minScore);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="badge badge-cyan">Loop Stage 2</span>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Opportunity Scoring Engine</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em" }}>
            MATCH — Multi-Dimensional Opportunity Radar
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
            Real-time multi-dimensional scoring evaluating technical fit, system seniority, and verified skill alignment.
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="btn btn-primary"
          style={{ fontSize: "13px" }}
        >
          <RefreshCw
            size={15}
            style={{ animation: recalculating ? "spin 1s linear infinite" : "none" }}
          />
          <span>{recalculating ? "Re-scoring Radar..." : "Recalculate AI Match Scores"}</span>
        </button>
      </div>

      {/* Success Notification */}
      {applySuccessNotice && (
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
          <span>{applySuccessNotice}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>
            Minimum Match Score:
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            {[60, 75, 85, 90].map((sc) => (
              <button
                key={sc}
                onClick={() => setMinScore(sc)}
                className={`btn btn-sm ${minScore === sc ? "btn-primary" : "btn-secondary"}`}
              >
                {sc}%+
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: "12.5px", color: "var(--text-dim)" }}>
          Showing <span style={{ color: "#ffffff", fontWeight: 700 }}>{filteredMatches.length}</span> of{" "}
          {matches.length} calibrated roles
        </div>
      </div>

      {/* 2-Column Split: Matches List + Detail Inspector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Left Column: Job Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredMatches.map((m) => {
            const isSelected = selectedMatch?.id === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMatch(m)}
                className="card card-interactive"
                style={{
                  border: isSelected ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                  background: isSelected ? "rgba(99, 102, 241, 0.1)" : "var(--bg-card)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{m.job.title}</h3>
                    <div style={{ fontSize: "13px", color: "var(--accent-cyan)", fontWeight: 600 }}>
                      {m.job.company.name}
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: m.overall_score >= 90 ? "rgba(16, 185, 129, 0.2)" : "rgba(6, 182, 212, 0.2)",
                      color: m.overall_score >= 90 ? "#34d399" : "#22d3ee",
                      fontWeight: 700,
                      fontSize: "13px",
                    }}
                  >
                    {m.overall_score.toFixed(1)}%
                  </span>
                </div>

                <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--text-dim)", marginBottom: "10px" }}>
                  <span>📍 {m.job.location}</span>
                  <span>💰 ${(m.job.salary_max ? m.job.salary_max / 1000 : 220).toFixed(0)}k Max</span>
                  <span>👔 {m.job.seniority || "Senior"}</span>
                </div>

                {/* Score Breakdown Bars */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "10px" }}>
                  <div>
                    <div style={{ fontSize: "10.5px", color: "var(--text-dim)" }}>Technical</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#e2e8f0" }}>{m.technical_fit.toFixed(0)}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10.5px", color: "var(--text-dim)" }}>Experience</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#e2e8f0" }}>{m.experience_fit.toFixed(0)}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10.5px", color: "var(--text-dim)" }}>Preference</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#e2e8f0" }}>{m.preference_fit.toFixed(0)}%</div>
                  </div>
                </div>

                {/* Skills tags */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {m.matched_skills_json.map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: "11px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "rgba(16, 185, 129, 0.1)",
                        color: "#34d399",
                        fontWeight: 500,
                      }}
                    >
                      ✓ {s}
                    </span>
                  ))}
                  {m.missing_skills_json.map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: "11px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "rgba(244, 63, 94, 0.1)",
                        color: "#fb7185",
                        fontWeight: 500,
                      }}
                    >
                      ✗ {s}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Opportunity Inspector */}
        {selectedMatch && (
          <div className="card" style={{ position: "sticky", top: "84px", height: "fit-content" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <span className="badge badge-emerald" style={{ marginBottom: "6px" }}>
                  {selectedMatch.recommendation_category}
                </span>
                <h2 style={{ fontSize: "20px", fontWeight: 800 }}>{selectedMatch.job.title}</h2>
                <div style={{ fontSize: "14px", color: "var(--accent-cyan)", fontWeight: 600 }}>
                  {selectedMatch.job.company.name} • {selectedMatch.job.location}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-emerald)" }}>
                  {selectedMatch.overall_score.toFixed(1)}%
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>AI Calibrated Fit</div>
              </div>
            </div>

            {/* AI Fit Explanation */}
            <div
              style={{
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(99, 102, 241, 0.08)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                fontSize: "13px",
                color: "#c7d2fe",
                lineHeight: 1.5,
                marginBottom: "16px",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={14} /> AI Recommendation Rationale
              </div>
              {selectedMatch.explanation ||
                "Exceptional technical alignment across Python, Go, and PostgreSQL distributed systems. Verified commit evidence strongly reinforces performance scalability expectations."}
            </div>

            {/* Responsibilities */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                Key Responsibilities
              </div>
              <ul style={{ paddingLeft: "18px", fontSize: "13px", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "4px" }}>
                {selectedMatch.job.responsibilities_json.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
              <button
                onClick={() => handleCreateApplication(selectedMatch.job.id, selectedMatch.job.title)}
                disabled={applyingId === selectedMatch.job.id}
                className="btn btn-primary"
                style={{ flex: 1, fontSize: "13.5px" }}
              >
                <Send size={15} />
                <span>{applyingId === selectedMatch.job.id ? "Drafting Application..." : "Create Tailored Application"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
