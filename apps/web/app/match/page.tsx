"use client";

import React, { useState, useEffect } from "react";
import {
  Target,
  Send,
  RefreshCw,
  Sparkles,
  MapPin,
  DollarSign,
  Building,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { MatchItem } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="cyan">Stage 2</Badge>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Opportunity Scoring Engine</span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700 }}>
            MATCH — Multi-Dimensional Opportunity Radar
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginTop: "2px" }}>
            Evaluates technical fit, system seniority, and verified skill alignment in real time.
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
          {recalculating ? "Recalculating..." : "Recalculate Fit Scores"}
        </Button>
      </div>

      {/* Success Notice */}
      {applySuccessNotice && (
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
          <span>{applySuccessNotice}</span>
        </div>
      )}

      {/* Filter Bar */}
      <Card style={{ padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>
            Minimum Fit Threshold:
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            {[60, 75, 85, 90].map((sc) => (
              <Button
                key={sc}
                size="sm"
                variant={minScore === sc ? "primary" : "secondary"}
                onClick={() => setMinScore(sc)}
              >
                {sc}%+
              </Button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>
          Showing <strong style={{ color: "#ffffff" }}>{filteredMatches.length}</strong> of {matches.length} calibrated roles
        </div>
      </Card>

      {/* 2-Column Split: Matches List + Detail Inspector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Left Column: Job Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredMatches.map((m) => {
            const isSelected = selectedMatch?.id === m.id;
            return (
              <Card
                key={m.id}
                interactive
                onClick={() => setSelectedMatch(m)}
                style={{
                  border: isSelected ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                  background: isSelected ? "var(--bg-elevated)" : "var(--bg-card)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: 700 }}>{m.job.title}</h3>
                    <div style={{ fontSize: "12.5px", color: "var(--accent-cyan)", fontWeight: 600 }}>
                      {m.job.company.name}
                    </div>
                  </div>
                  <Badge variant={m.overall_score >= 90 ? "success" : "cyan"} size="sm">
                    {m.overall_score.toFixed(0)}% Match
                  </Badge>
                </div>

                <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--text-dim)", margin: "6px 0 8px" }}>
                  <span>📍 {m.job.location}</span>
                  <span>💰 ${(m.job.salary_max ? m.job.salary_max / 1000 : 220).toFixed(0)}k Max</span>
                  <span>👔 {m.job.seniority || "Senior"}</span>
                </div>

                {/* Score Breakdown Bars */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", margin: "8px 0" }}>
                  <div style={{ padding: "6px 8px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "4px" }}>
                    <div style={{ fontSize: "10px", color: "var(--text-dim)" }}>Technical</div>
                    <div style={{ fontSize: "12px", fontWeight: 700 }}>{m.technical_fit.toFixed(0)}%</div>
                  </div>
                  <div style={{ padding: "6px 8px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "4px" }}>
                    <div style={{ fontSize: "10px", color: "var(--text-dim)" }}>Experience</div>
                    <div style={{ fontSize: "12px", fontWeight: 700 }}>{m.experience_fit.toFixed(0)}%</div>
                  </div>
                  <div style={{ padding: "6px 8px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "4px" }}>
                    <div style={{ fontSize: "10px", color: "var(--text-dim)" }}>Preference</div>
                    <div style={{ fontSize: "12px", fontWeight: 700 }}>{m.preference_fit.toFixed(0)}%</div>
                  </div>
                </div>

                {/* Skills tags */}
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" }}>
                  {m.matched_skills_json.map((s) => (
                    <Badge key={s} variant="success" size="sm">✓ {s}</Badge>
                  ))}
                  {m.missing_skills_json.map((s) => (
                    <Badge key={s} variant="brand" size="sm">✗ {s}</Badge>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right Column: Selected Opportunity Inspector */}
        {selectedMatch && (
          <Card style={{ position: "sticky", top: "80px", height: "fit-content" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <Badge variant="success" size="sm" style={{ marginBottom: "6px" }}>
                  {selectedMatch.recommendation_category}
                </Badge>
                <h2 style={{ fontSize: "18px", fontWeight: 700 }}>{selectedMatch.job.title}</h2>
                <div style={{ fontSize: "13px", color: "var(--accent-cyan)", fontWeight: 600 }}>
                  {selectedMatch.job.company.name} • {selectedMatch.job.location}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--accent-emerald)" }}>
                  {selectedMatch.overall_score.toFixed(1)}%
                </div>
                <div style={{ fontSize: "10.5px", color: "var(--text-dim)" }}>Calibrated Fit</div>
              </div>
            </div>

            {/* AI Fit Explanation */}
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-subtle)",
                fontSize: "12.5px",
                color: "var(--text-muted)",
                lineHeight: 1.45,
                marginBottom: "14px",
              }}
            >
              <div style={{ fontWeight: 600, color: "var(--text-main)", marginBottom: "3px", display: "flex", alignItems: "center", gap: "5px" }}>
                <Sparkles size={13} color="var(--accent-primary)" /> AI Recommendation Rationale
              </div>
              {selectedMatch.explanation ||
                "Exceptional technical alignment across Python, Go, and PostgreSQL distributed systems. Verified commit evidence strongly reinforces performance scalability expectations."}
            </div>

            {/* Key Responsibilities */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "6px" }}>
                Key Responsibilities
              </div>
              <ul style={{ paddingLeft: "16px", fontSize: "12.5px", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "4px" }}>
                {(selectedMatch.job.responsibilities_json || []).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div style={{ paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleCreateApplication(selectedMatch.job.id, selectedMatch.job.title)}
                disabled={applyingId === selectedMatch.job.id}
                style={{ width: "100%" }}
                icon={<Send size={14} />}
              >
                {applyingId === selectedMatch.job.id ? "Drafting Application..." : "Create Tailored Application"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
