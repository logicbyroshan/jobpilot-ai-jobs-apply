"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Target,
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
  ChevronRight,
  Filter,
} from "lucide-react";
import { api } from "@/lib/api";
import { MatchItem } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { SearchBar } from "../components/ui/SearchBar";

export default function OpportunitiesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFit, setSelectedFit] = useState<string>("ALL");
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadMatches() {
      try {
        const data = await api.getMatches();
        setMatches(data);
      } catch (err) {
        console.error("Failed to load opportunities:", err);
      }
    }
    loadMatches();
  }, []);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedJobs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredMatches = matches.filter((m) => {
    const matchesSearch =
      m.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.job.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.job.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFit === "STRONG") return matchesSearch && m.overall_score >= 90;
    if (selectedFit === "GOOD") return matchesSearch && m.overall_score >= 80 && m.overall_score < 90;
    return matchesSearch;
  });

  return (
    <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Badge variant="brand">Stage 2</Badge>
            <span style={{ fontSize: "13px", color: "var(--text-sub)" }}>Calibrated Opportunity Radar</span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.025em" }}>
            Opportunities For You
          </h1>
          <p style={{ color: "var(--text-sub)", fontSize: "14px", marginTop: "4px", lineHeight: 1.55 }}>
            Ranked by how accurately roles align with your verified skills, career direction, and evidence graph.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Link href="/gaps" prefetch={true} style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="sm" icon={<Sparkles size={14} color="var(--accent-amber)" />}>
              View Blocking Gaps
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Fit Filters */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: "260px" }}>
          <SearchBar
            placeholder="Search by role title, company, or tech stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          <Button
            variant={selectedFit === "ALL" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSelectedFit("ALL")}
          >
            All Matches ({matches.length})
          </Button>
          <Button
            variant={selectedFit === "STRONG" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSelectedFit("STRONG")}
          >
            Strong Fit (&ge;90%)
          </Button>
          <Button
            variant={selectedFit === "GOOD" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSelectedFit("GOOD")}
          >
            Good Fit (80-89%)
          </Button>
        </div>
      </div>

      {/* Opportunities List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredMatches.map((m) => {
          const isSaved = !!savedJobs[m.id];
          return (
            <Card key={m.id} style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "6px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      color: "var(--text-main)",
                      fontSize: "14px",
                      flexShrink: 0,
                    }}
                  >
                    {m.job.company.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <h2 style={{ fontSize: "16px", fontWeight: 700 }}>{m.job.title}</h2>
                      <Badge variant={m.overall_score >= 90 ? "success" : "cyan"} size="sm">
                        {m.overall_score.toFixed(0)}% Match
                      </Badge>
                    </div>

                    <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--text-dim)", marginTop: "4px", flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Building2 size={12} /> {m.job.company.name}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={12} /> {m.job.location}
                      </span>
                      {m.job.salary_min && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--accent-emerald)" }}>
                          <DollarSign size={12} /> ${m.job.salary_min.toLocaleString()} - ${m.job.salary_max?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Match Score Matrix */}
                <div style={{ display: "flex", gap: "8px", background: "var(--bg-elevated)", padding: "6px 10px", borderRadius: "4px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ textAlign: "center", padding: "0 6px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Tech Fit</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-cyan)" }}>{m.technical_fit.toFixed(0)}%</div>
                  </div>
                  <div style={{ width: "1px", background: "var(--border-subtle)" }} />
                  <div style={{ textAlign: "center", padding: "0 6px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Exp Fit</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-emerald)" }}>{m.experience_fit.toFixed(0)}%</div>
                  </div>
                </div>
              </div>

              {/* Rationale & Why Matched */}
              <div style={{ padding: "10px 12px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "4px", border: "1px solid var(--border-subtle)", marginBottom: "12px" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  <strong style={{ color: "var(--text-main)" }}>Why this matches you:</strong> {m.explanation || m.why_matched}
                </div>
              </div>

              {/* Verified Matched Skills vs Gaps */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-dim)", fontWeight: 600 }}>Strengths:</span>
                  {m.matched_skills_json?.slice(0, 3).map((sk) => (
                    <Badge key={sk} variant="success" size="sm">✓ {sk}</Badge>
                  ))}

                  {m.missing_skills_json?.length > 0 && (
                    <>
                      <span style={{ fontSize: "11px", color: "var(--text-dim)", fontWeight: 600, marginLeft: "6px" }}>Gap:</span>
                      {m.missing_skills_json.slice(0, 1).map((sk) => (
                        <Badge key={sk} variant="warning" size="sm">! {sk}</Badge>
                      ))}
                    </>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    onClick={(e) => toggleSave(m.id, e)}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "4px",
                      padding: "6px 8px",
                      color: isSaved ? "var(--accent-amber)" : "var(--text-dim)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                    }}
                  >
                    <Bookmark size={13} fill={isSaved ? "var(--accent-amber)" : "none"} />
                    <span>{isSaved ? "Saved" : "Save"}</span>
                  </button>

                  <Link href={`/opportunities/${m.job.id}`} style={{ textDecoration: "none" }}>
                    <Button variant="primary" size="sm" icon={<ArrowRight size={13} />} iconPosition="right">
                      View Opportunity
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
