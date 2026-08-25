"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Github,
  Linkedin,
  FileText,
  GitBranch,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  FolderGit2,
  Plus,
} from "lucide-react";
import { api } from "@/lib/api";
import { UserProfile, SourceItem, SkillEvidenceItem } from "@/lib/types";

export default function KnowIdentityPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [skills, setSkills] = useState<SkillEvidenceItem[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"skills" | "sources" | "experience">("skills");

  useEffect(() => {
    async function loadData() {
      try {
        const [p, s, sk] = await Promise.all([
          api.getProfile(),
          api.getSources(),
          api.getSkillsProfile(),
        ]);
        setProfile(p);
        setSources(s);
        setSkills(sk);
      } catch (err) {
        console.error("Failed to load KNOW data:", err);
      }
    }
    loadData();
  }, []);

  const handleSyncSource = async (id: string) => {
    setSyncingId(id);
    try {
      await api.syncSource(id);
      const updatedSources = await api.getSources();
      const updatedSkills = await api.getSkillsProfile();
      setSources(updatedSources);
      setSkills(updatedSkills);
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="badge badge-primary">Loop Stage 1</span>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Identity & Provenance</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em" }}>
            KNOW — Professional Identity & Evidence Graph
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
            Continuous ingestion and multi-source verification connecting GitHub commits, work experience, resume artifacts, and skills.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => handleSyncSource(sources[0]?.id || "src1")}
            disabled={!!syncingId}
            className="btn btn-primary"
            style={{ fontSize: "13px" }}
          >
            <RefreshCw
              size={15}
              style={{ animation: syncingId ? "spin 1s linear infinite" : "none" }}
            />
            <span>{syncingId ? "Syncing Graph..." : "Resync Ingestion Graph"}</span>
          </button>
        </div>
      </div>

      {/* Identity Summary Card */}
      <div className="card" style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: 800,
            color: "#ffffff",
            flexShrink: 0,
            boxShadow: "0 8px 24px rgba(99, 102, 241, 0.35)",
          }}
        >
          AC
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700 }}>{profile?.full_name || "Alex Chen"}</h2>
            <span className="badge badge-emerald">
              <ShieldCheck size={13} />
              Verified Identity
            </span>
          </div>
          <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px" }}>
            {profile?.headline || "Staff Distributed Systems & Infrastructure Architect • Ex-Stripe"}
          </div>
          <div style={{ display: "flex", gap: "16px", fontSize: "12.5px", color: "var(--text-dim)" }}>
            <span>💼 {profile?.years_of_experience || 8}+ Years Experience</span>
            <span>📍 San Francisco, CA (Remote)</span>
            <span>📊 Profile Confidence: {(profile?.profile_confidence || 0.94) * 100}%</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("skills")}
          className={`btn ${activeTab === "skills" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "13px" }}
        >
          Verified Skills ({skills.length})
        </button>
        <button
          onClick={() => setActiveTab("sources")}
          className={`btn ${activeTab === "sources" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "13px" }}
        >
          Connected Sources ({sources.length})
        </button>
        <button
          onClick={() => setActiveTab("experience")}
          className={`btn ${activeTab === "experience" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "13px" }}
        >
          Work & Projects ({profile?.experiences.length || 0})
        </button>
      </div>

      {/* Skills Tab Content */}
      {activeTab === "skills" && (
        <div className="grid-2">
          {skills.map((skill) => (
            <div key={skill.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700 }}>{skill.skill_name}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>{skill.category}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    className={`badge ${
                      skill.strength === "STRONG"
                        ? "badge-emerald"
                        : skill.strength === "MODERATE"
                        ? "badge-cyan"
                        : "badge-amber"
                    }`}
                  >
                    {skill.strength}
                  </span>
                  <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "4px" }}>
                    Level: {skill.proficiency_estimate}/10
                  </div>
                </div>
              </div>

              {/* Progress Level */}
              <div className="progress-bar-bg" style={{ marginBottom: "14px" }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${skill.proficiency_estimate * 10}%`,
                    background:
                      skill.proficiency_estimate >= 8
                        ? "linear-gradient(90deg, #10b981, #06b6d4)"
                        : "linear-gradient(90deg, #f59e0b, #6366f1)",
                  }}
                />
              </div>

              {/* Evidence Provenance Items */}
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px" }}>
                Verified Evidence Items ({skill.evidence_items.length}):
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {skill.evidence_items.map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      padding: "8px 10px",
                      background: "rgba(255, 255, 255, 0.02)",
                      borderRadius: "6px",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: "#e2e8f0" }}>{ev.title}</span>
                      <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{ev.description}</div>
                    </div>
                    <span
                      style={{
                        fontSize: "10.5px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "rgba(99, 102, 241, 0.15)",
                        color: "#a5b4fc",
                        fontWeight: 600,
                      }}
                    >
                      {ev.source_type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sources Tab Content */}
      {activeTab === "sources" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {sources.map((src) => (
            <div
              key={src.id}
              className="card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {src.source_type.includes("github") ? (
                    <Github size={22} color="#ffffff" />
                  ) : src.source_type.includes("linkedin") ? (
                    <Linkedin size={22} color="#0077b5" />
                  ) : (
                    <FileText size={22} color="#a855f7" />
                  )}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{src.display_name}</h3>
                    <span className="badge badge-emerald" style={{ fontSize: "10.5px" }}>
                      Connected
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                    {src.source_url || "Uploaded profile document"} • Last synced: {new Date(src.last_synced_at || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button
                  onClick={() => handleSyncSource(src.id)}
                  disabled={syncingId === src.id}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "12px" }}
                >
                  <RefreshCw
                    size={14}
                    style={{ animation: syncingId === src.id ? "spin 1s linear infinite" : "none" }}
                  />
                  <span>{syncingId === src.id ? "Syncing..." : "Sync Source"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Experience Tab Content */}
      {activeTab === "experience" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {profile?.experiences.map((exp) => (
            <div key={exp.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 700 }}>{exp.title}</h3>
                  <div style={{ fontSize: "13px", color: "var(--accent-cyan)", fontWeight: 600 }}>
                    {exp.company_name} • {exp.location}
                  </div>
                </div>
                <span className="badge badge-subtle">
                  {exp.start_date} — {exp.is_current ? "Present" : exp.end_date}
                </span>
              </div>
              <p style={{ fontSize: "13.5px", color: "var(--text-muted)", marginBottom: "12px", lineHeight: 1.5 }}>
                {exp.description}
              </p>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {exp.technologies_json.map((tech) => (
                  <span
                    key={tech}
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: "rgba(99, 102, 241, 0.1)",
                      color: "#a5b4fc",
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
