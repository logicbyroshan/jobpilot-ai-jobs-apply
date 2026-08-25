"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Github,
  Linkedin,
  FileText,
  RefreshCw,
  ShieldCheck,
  Briefcase,
  Building,
} from "lucide-react";
import { api } from "@/lib/api";
import { UserProfile, SourceItem, SkillEvidenceItem } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="brand">Stage 1</Badge>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Identity & Provenance</span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700 }}>
            KNOW — Professional Identity & Evidence Graph
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginTop: "2px" }}>
            Multi-source ingestion connecting GitHub commits, verified repos, and experience evidence.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={() => handleSyncSource(sources[0]?.id || "src1")}
          disabled={!!syncingId}
          icon={
            <RefreshCw
              size={14}
              style={{ animation: syncingId ? "spin 0.8s linear infinite" : "none" }}
            />
          }
        >
          {syncingId ? "Syncing..." : "Resync Ingestion Graph"}
        </Button>
      </div>

      {/* Identity Summary Card */}
      <Card style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "12px",
            background: "var(--accent-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontWeight: 800,
            color: "#ffffff",
            flexShrink: 0,
          }}
        >
          AC
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700 }}>{profile?.full_name || "Alex Chen"}</h2>
            <Badge variant="success" dot>Verified</Badge>
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px" }}>
            {profile?.headline || "Staff Distributed Systems & Infrastructure Architect • Ex-Stripe"}
          </div>
          <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--text-dim)", flexWrap: "wrap" }}>
            <span>💼 {profile?.years_of_experience || 8}+ YOE</span>
            <span>📍 San Francisco, CA (Remote)</span>
            <span>📊 Profile Confidence: {(profile?.profile_confidence || 0.94) * 100}%</span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px" }}>
        <Button
          variant={activeTab === "skills" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setActiveTab("skills")}
        >
          Verified Skills ({skills.length})
        </Button>
        <Button
          variant={activeTab === "sources" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setActiveTab("sources")}
        >
          Connected Sources ({sources.length})
        </Button>
        <Button
          variant={activeTab === "experience" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setActiveTab("experience")}
        >
          Experience ({profile?.experiences.length || 0})
        </Button>
      </div>

      {/* Skills Tab Content */}
      {activeTab === "skills" && (
        <div className="grid-2">
          {skills.map((skill) => (
            <Card key={skill.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700 }}>{skill.skill_name}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>{skill.category}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Badge variant={skill.strength === "STRONG" ? "success" : "cyan"} size="sm">
                    {skill.strength}
                  </Badge>
                  <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>
                    Level: {skill.proficiency_estimate}/10
                  </div>
                </div>
              </div>

              {/* Progress Level */}
              <div className="progress-bar-bg" style={{ marginBottom: "12px" }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${skill.proficiency_estimate * 10}%`,
                    background: "var(--accent-primary)",
                  }}
                />
              </div>

              {/* Evidence Provenance Items */}
              <div style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>
                Verified Evidence ({skill.evidence_items.length}):
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
                      <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{ev.title}</span>
                      <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{ev.description}</div>
                    </div>
                    <Badge variant="neutral" size="sm">{ev.source_type}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Sources Tab Content */}
      {activeTab === "sources" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {sources.map((src) => (
            <Card
              key={src.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    background: "var(--bg-elevated)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {src.source_type.includes("github") ? (
                    <Github size={20} color="#ffffff" />
                  ) : src.source_type.includes("linkedin") ? (
                    <Linkedin size={20} color="#0077b5" />
                  ) : (
                    <FileText size={20} color="var(--accent-primary)" />
                  )}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 600 }}>{src.display_name}</h3>
                    <Badge variant="success" size="sm">Connected</Badge>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                    {src.source_url || "Uploaded profile document"} • Last synced: {new Date(src.last_synced_at || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleSyncSource(src.id)}
                disabled={syncingId === src.id}
                icon={
                  <RefreshCw
                    size={12}
                    style={{ animation: syncingId === src.id ? "spin 0.8s linear infinite" : "none" }}
                  />
                }
              >
                {syncingId === src.id ? "Syncing..." : "Sync Source"}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Experience Tab Content */}
      {activeTab === "experience" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {profile?.experiences.map((exp) => (
            <Card key={exp.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{exp.title}</h3>
                  <div style={{ fontSize: "12.5px", color: "var(--accent-cyan)", fontWeight: 600 }}>
                    {exp.company_name} • {exp.location}
                  </div>
                </div>
                <Badge variant="neutral" size="sm">
                  {exp.start_date} — {exp.is_current ? "Present" : exp.end_date}
                </Badge>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "10px", lineHeight: 1.5 }}>
                {exp.description}
              </p>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {exp.technologies_json.map((tech) => (
                  <Badge key={tech} variant="neutral" size="sm">{tech}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
