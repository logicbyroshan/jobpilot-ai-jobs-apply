"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bookmark,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  Send,
  Award,
  Layers,
} from "lucide-react";
import { api } from "@/lib/api";
import { MatchItem, Job } from "@/lib/types";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { Card } from "@/app/components/ui/Card";

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [match, setMatch] = useState<MatchItem | null>(null);
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    async function loadOpportunity() {
      try {
        const matches = await api.getMatches();
        const found = matches.find((m) => m.job.id === jobId) || matches[0];
        setMatch(found);
        setJob(found.job);
      } catch (err) {
        console.error("Failed to load opportunity:", err);
      }
    }
    loadOpportunity();
  }, [jobId]);

  const handlePrepareApplication = async () => {
    setPreparing(true);
    try {
      if (job) {
        await api.createApplication({
          job_id: job.id,
          tailored_role_title: job.title,
          notes: "Prepared via Opportunity Intelligence deep dive.",
        });
        router.push("/applications");
      }
    } catch (err) {
      console.error("Prepare application error:", err);
    } finally {
      setPreparing(false);
    }
  };

  if (!job || !match) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading opportunity intelligence...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Back Link */}
      <Link
        href="/opportunities"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "var(--text-muted)",
          fontSize: "13px",
          textDecoration: "none",
          width: "fit-content",
        }}
      >
        <ChevronLeft size={15} />
        <span>Back to Opportunities</span>
      </Link>

      {/* Hero Opportunity Card */}
      <Card style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "6px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "var(--accent-primary)",
                fontSize: "18px",
                flexShrink: 0,
              }}
            >
              {(job.company?.name || "CO").slice(0, 2).toUpperCase()}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "20px", fontWeight: 700 }}>{job.title}</h1>
                <Badge variant={(match.overall_score || 0) >= 90 ? "success" : "cyan"} size="sm">
                  {(match.overall_score || 0).toFixed(0)}% Overall Fit
                </Badge>
              </div>

              <div style={{ display: "flex", gap: "14px", fontSize: "12.5px", color: "var(--text-dim)", marginTop: "4px", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Building2 size={13} /> {job.company?.name || "Company"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={13} /> {job.location || "Remote"}
                </span>
                {job.salary_min && (
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--accent-emerald)" }}>
                    <DollarSign size={13} /> ${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()} / yr
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              variant="primary"
              size="md"
              onClick={handlePrepareApplication}
              disabled={preparing}
              icon={<Send size={14} />}
            >
              {preparing ? "Tailoring..." : "Prepare Application"}
            </Button>
          </div>
        </div>

        {/* 4-Dimensional Fit Radar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", background: "var(--bg-elevated)", padding: "12px", borderRadius: "4px", border: "1px solid var(--border-subtle)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase" }}>Technical Fit</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--accent-cyan)", marginTop: "2px" }}>
              {(match.technical_fit || 0).toFixed(0)}%
            </div>
          </div>
          <div style={{ textAlign: "center", borderLeft: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase" }}>Experience Fit</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--accent-emerald)", marginTop: "2px" }}>
              {(match.experience_fit || 0).toFixed(0)}%
            </div>
          </div>
          <div style={{ textAlign: "center", borderLeft: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase" }}>Preference Fit</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--accent-primary)", marginTop: "2px" }}>
              {(match.preference_fit || 0).toFixed(0)}%
            </div>
          </div>
          <div style={{ textAlign: "center", borderLeft: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase" }}>Evidence Proof</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginTop: "2px" }}>
              {(match.evidence_confidence || 94).toFixed(0)}%
            </div>
          </div>
        </div>
      </Card>

      {/* WHY YOU MATCH & WHERE YOU ARE WEAK */}
      <div className="grid-2">
        {/* Why You Match */}
        <Card style={{ borderLeft: "3px solid var(--accent-emerald)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <CheckCircle2 size={16} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Why You Match</h3>
          </div>

          <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "12px", lineHeight: 1.45 }}>
            {match.explanation || "Strong technical and architectural alignment with deep evidence provenance."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {(match.matched_skills_json || []).map((sk) => (
              <div
                key={sk}
                style={{
                  padding: "8px 10px",
                  borderRadius: "4px",
                  background: "rgba(16, 185, 129, 0.05)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-main)" }}>✓ {sk}</span>
                <Badge variant="success" size="sm">Verified Proof</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Where You Are Weak / Gaps */}
        <Card style={{ borderLeft: "3px solid var(--accent-amber)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <AlertTriangle size={16} color="var(--accent-amber)" />
            <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Where You Are Weak</h3>
          </div>

          <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "12px", lineHeight: 1.45 }}>
            Identified competency deficits preventing top-tier compensation tier. Closing these unlocks full offer capability.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {match.missing_skills_json && match.missing_skills_json.length > 0 ? (
              match.missing_skills_json.map((sk) => (
                <div
                  key={sk}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "4px",
                    background: "rgba(245, 158, 11, 0.05)",
                    border: "1px solid rgba(245, 158, 11, 0.2)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>{sk}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Required by team • Level 3.0 → Target 6.5</div>
                  </div>
                  <Link href="/improve" style={{ textDecoration: "none" }}>
                    <Button variant="secondary" size="sm">
                      Close Gap in Improve →
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div style={{ fontSize: "12px", color: "var(--accent-emerald)" }}>
                No critical skill deficits detected for this role!
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Role Responsibilities & Requirements Matrix */}
      <Card>
        <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px" }}>Requirements vs Your Evidence Matrix</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {(job.responsibilities_json || [
            "Architect and lead scalable distributed systems with low latency SLAs.",
            "Collaborate with infrastructure and engineering teams on high-throughput services."
          ]).map((resp, i) => (
            <div
              key={i}
              style={{
                padding: "10px 12px",
                borderRadius: "4px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                fontSize: "12.5px",
                lineHeight: 1.4,
              }}
            >
              • {resp}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
