"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Target,
  Building2,
  MapPin,
  DollarSign,
  Sparkles,
  Bookmark,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { MatchItem } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
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
    const title = m.job?.title || "";
    const company = m.job?.company?.name || "";
    const location = m.job?.location || "";
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFit === "STRONG") return matchesSearch && (m.overall_score || 0) >= 90;
    if (selectedFit === "GOOD") return matchesSearch && (m.overall_score || 0) >= 80 && (m.overall_score || 0) < 90;
    return matchesSearch;
  });

  return (
    <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "22px", width: "100%" }}>
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
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center", width: "100%" }}>
        <div style={{ flex: 1, minWidth: "280px" }}>
          <SearchBar
            placeholder="Search by role title, company, or tech stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
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

      {/* Opportunities Full-Width List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%" }}>
        {filteredMatches.map((m) => {
          const isSaved = !!savedJobs[m.id];
          return (
            <div
              key={m.id}
              className="ui-card ui-card-hover"
              style={{
                padding: "20px 24px",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px", marginBottom: "14px" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "8px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      color: "#ffffff",
                      fontSize: "15px",
                      flexShrink: 0,
                    }}
                  >
                    {(m.job?.company?.name || "CO").slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <h2 style={{ fontSize: "17.5px", fontWeight: 700, color: "#ffffff" }}>{m.job?.title || "Target Role"}</h2>
                      <Badge variant={(m.overall_score || 0) >= 90 ? "success" : "cyan"} size="sm">
                        {(m.overall_score || 0).toFixed(0)}% Match
                      </Badge>
                    </div>

                    <div style={{ display: "flex", gap: "14px", fontSize: "13.5px", color: "var(--text-sub)", marginTop: "6px", flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <Building2 size={14} color="var(--text-muted)" /> {m.job?.company?.name || "Company"}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <MapPin size={14} color="var(--text-muted)" /> {m.job?.location || "Remote"}
                      </span>
                      {m.job?.salary_min && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--accent-emerald)", fontWeight: 700 }}>
                          <DollarSign size={14} /> ${m.job.salary_min.toLocaleString()} - ${m.job.salary_max?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Match Score Matrix */}
                <div style={{ display: "flex", gap: "10px", background: "var(--bg-elevated)", padding: "8px 14px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ textAlign: "center", padding: "0 8px" }}>
                    <div style={{ fontSize: "11.5px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Tech Fit</div>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--accent-cyan)" }}>{m.technical_fit.toFixed(0)}%</div>
                  </div>
                  <div style={{ width: "1px", background: "var(--border-subtle)" }} />
                  <div style={{ textAlign: "center", padding: "0 8px" }}>
                    <div style={{ fontSize: "11.5px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>Exp Fit</div>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--accent-emerald)" }}>{m.experience_fit.toFixed(0)}%</div>
                  </div>
                </div>
              </div>

              {/* Rationale & Why Matched */}
              <div style={{ padding: "12px 16px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "6px", border: "1px solid var(--border-subtle)", marginBottom: "14px" }}>
                <div style={{ fontSize: "13.5px", color: "var(--text-sub)", lineHeight: 1.5 }}>
                  <strong style={{ color: "#ffffff" }}>Why this matches you:</strong> {m.explanation || m.why_matched}
                </div>
              </div>

              {/* Verified Matched Skills vs Gaps */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-dim)", fontWeight: 700 }}>Strengths:</span>
                  {m.matched_skills_json?.slice(0, 3).map((sk) => (
                    <Badge key={sk} variant="success" size="sm">✓ {sk}</Badge>
                  ))}

                  {m.missing_skills_json?.length > 0 && (
                    <>
                      <span style={{ fontSize: "12px", color: "var(--text-dim)", fontWeight: 700, marginLeft: "6px" }}>Gap:</span>
                      {m.missing_skills_json.slice(0, 1).map((sk) => (
                        <Badge key={sk} variant="warning" size="sm">! {sk}</Badge>
                      ))}
                    </>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    onClick={(e) => toggleSave(m.id, e)}
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      padding: "7px 12px",
                      color: isSaved ? "var(--accent-amber)" : "var(--text-sub)",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Bookmark size={14} fill={isSaved ? "var(--accent-amber)" : "none"} />
                    <span>{isSaved ? "Saved" : "Save"}</span>
                  </button>

                  <Link href={`/opportunities/${m.job.id}`} prefetch={true} style={{ textDecoration: "none" }}>
                    <Button variant="primary" size="md" icon={<ArrowRight size={14} />} iconPosition="right">
                      View Opportunity
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
