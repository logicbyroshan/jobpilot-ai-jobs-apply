"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck,
  Github,
  Linkedin,
  FileText,
  ShieldCheck,
  Briefcase,
  Award,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { UserProfile, SkillEvidenceItem, EvidenceItem, CareerGoal } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

export default function KnowMePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<SkillEvidenceItem[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [goal, setGoal] = useState<CareerGoal | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "experience" | "projects" | "evidence">("skills");
  const [selectedSkill, setSelectedSkill] = useState<SkillEvidenceItem | null>(null);

  useEffect(() => {
    async function loadKnowData() {
      try {
        const [profData, skillsData, evData, goalData] = await Promise.all([
          api.getProfile(),
          api.getSkillsProfile(),
          api.getEvidence(),
          api.getCareerGoal(),
        ]);
        setProfile(profData);
        setSkills(skillsData);
        setEvidenceList(evData);
        setGoal(goalData);
        if (skillsData.length > 0) {
          setSelectedSkill(skillsData[0]);
        }
      } catch (err) {
        console.error("Failed to load Know Me data:", err);
      }
    }
    loadKnowData();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="brand">Stage 1</Badge>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Professional Identity & Evidence Graph</span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>
            Know Me — What JobPilot Knows About You
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
            Continuous ingestion of GitHub commits, verified repositories, work experience, and proof credentials.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Link href="/sources" style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="sm">
              Manage Sources (4 Connected)
            </Button>
          </Link>
          <Link href="/prove" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="sm" icon={<Award size={13} />}>
              Verify Next Skill
            </Button>
          </Link>
        </div>
      </div>

      {/* Identity Summary Card */}
      <Card style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap", padding: "16px 20px" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "6px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--text-main)",
            flexShrink: 0,
          }}
        >
          AC
        </div>

        <div style={{ flex: 1, minWidth: "260px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: 700 }}>{profile?.full_name || "Alex Chen"}</h2>
            <Badge variant="success" dot>Verified Identity</Badge>
          </div>
          <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "4px" }}>
            {profile?.headline || "Staff Distributed Systems & Infrastructure Architect • Ex-Stripe"}
          </div>
          <div style={{ display: "flex", gap: "16px", fontSize: "11.5px", color: "var(--text-dim)", flexWrap: "wrap" }}>
            <span>🎯 Target: <strong>{goal?.target_role || "Staff Distributed Systems Architect"}</strong></span>
            <span>💼 8+ YOE</span>
            <span>📍 San Francisco, CA (Remote)</span>
            <span>📊 Profile Confidence: <strong style={{ color: "var(--accent-cyan)" }}>94.2%</strong></span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "6px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
        <Button
          variant={activeTab === "skills" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setActiveTab("skills")}
        >
          Verified Skills ({skills.length})
        </Button>
        <Button
          variant={activeTab === "overview" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setActiveTab("overview")}
        >
          Career Overview
        </Button>
        <Button
          variant={activeTab === "experience" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setActiveTab("experience")}
        >
          Experience ({profile?.experiences?.length || 2})
        </Button>
        <Button
          variant={activeTab === "projects" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setActiveTab("projects")}
        >
          Projects ({profile?.projects?.length || 1})
        </Button>
        <Button
          variant={activeTab === "evidence" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setActiveTab("evidence")}
        >
          Traceable Evidence ({evidenceList.length})
        </Button>
      </div>

      {/* SKILLS TAB */}
      {activeTab === "skills" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Left Column: Skills List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {skills.map((skill) => {
              const isSelected = selectedSkill?.id === skill.id;
              return (
                <Card
                  key={skill.id}
                  interactive
                  onClick={() => setSelectedSkill(skill)}
                  style={{
                    border: isSelected ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid var(--border-subtle)",
                    background: isSelected ? "var(--bg-elevated)" : "var(--bg-card)",
                    padding: "14px 16px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700 }}>{skill.skill_name}</div>
                      <div style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>{skill.category}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Badge variant={skill.strength === "STRONG" ? "success" : "cyan"} size="sm">
                        {skill.strength}
                      </Badge>
                      <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>
                        Level: <strong>{skill.proficiency_estimate}/10</strong>
                      </div>
                    </div>
                  </div>

                  <div className="progress-bar-bg" style={{ marginBottom: "8px" }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${skill.proficiency_estimate * 10}%`,
                        background: "var(--accent-emerald)",
                      }}
                    />
                  </div>

                  <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                    Backed by <strong>{skill.evidence_items.length} verified evidence artifacts</strong>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Right Column: Skill Detail & Provenance Inspector */}
          {selectedSkill && (
            <Card style={{ position: "sticky", top: "80px", height: "fit-content" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <Badge variant="cyan" size="sm" style={{ marginBottom: "4px" }}>{selectedSkill.category}</Badge>
                  <h3 style={{ fontSize: "17px", fontWeight: 700 }}>{selectedSkill.skill_name}</h3>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--accent-emerald)" }}>
                    {selectedSkill.proficiency_estimate} / 10
                  </div>
                  <div style={{ fontSize: "10.5px", color: "var(--text-dim)" }}>Confidence: HIGH</div>
                </div>
              </div>

              {/* Verified Evidence Provenance */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "6px" }}>
                  Verified Traceable Evidence ({selectedSkill.evidence_items.length})
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {selectedSkill.evidence_items.map((ev) => (
                    <div
                      key={ev.id}
                      style={{
                        padding: "8px 10px",
                        background: "rgba(255, 255, 255, 0.02)",
                        borderRadius: "4px",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-main)" }}>{ev.title}</span>
                        <Badge variant="neutral" size="sm">{ev.source_type}</Badge>
                      </div>
                      <p style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: 1.35 }}>{ev.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* What would increase confidence action */}
              <div style={{ padding: "12px", background: "rgba(225, 29, 72, 0.04)", borderRadius: "4px", border: "1px solid rgba(225, 29, 72, 0.2)", marginBottom: "14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#fda4af", marginBottom: "2px" }}>
                  Want to increase verified proficiency?
                </div>
                <p style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: 1.35, marginBottom: "8px" }}>
                  Complete the diagnostic assessment in Stage 5 to verify live problem-solving capability.
                </p>
                <Link href="/prove" style={{ textDecoration: "none" }}>
                  <Button variant="primary" size="sm" icon={<Award size={13} />}>
                    Take Skill Assessment
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="grid-2">
          <Card>
            <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px" }}>Core Competency Highlights</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px", color: "var(--text-muted)" }}>
              <div>• <strong>Distributed Systems:</strong> Raft/Paxos consensus, multi-region state machine replication.</div>
              <div>• <strong>Cloud Control Planes:</strong> Kubernetes CRD operators, microservice orchestration.</div>
              <div>• <strong>Languages:</strong> Production Go, Python, C++, TypeScript.</div>
              <div>• <strong>Databases:</strong> PostgreSQL, LSM-Tree storage engines, Redis, Cassandra.</div>
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px" }}>Target Role Calibration</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px", color: "var(--text-muted)" }}>
              <div>• Target Position: <strong style={{ color: "var(--text-main)" }}>{goal?.target_role || "Staff Distributed Systems Architect"}</strong></div>
              <div>• Desired Seniority: <strong style={{ color: "var(--text-main)" }}>Staff / Principal</strong></div>
              <div>• Location Alignment: <strong style={{ color: "var(--text-main)" }}>San Francisco, CA / Remote</strong></div>
              <div>• Minimum Comp: <strong style={{ color: "var(--accent-emerald)" }}>$240k+ Base</strong></div>
            </div>
          </Card>
        </div>
      )}

      {/* EXPERIENCE TAB */}
      {activeTab === "experience" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {profile?.experiences.map((exp) => (
            <Card key={exp.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700 }}>{exp.title}</h3>
                  <div style={{ fontSize: "12.5px", color: "var(--accent-cyan)", fontWeight: 600 }}>
                    {exp.company_name} • {exp.location}
                  </div>
                </div>
                <Badge variant="neutral" size="sm">
                  {exp.start_date} — {exp.is_current ? "Present" : exp.end_date}
                </Badge>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: "6px 0 10px", lineHeight: 1.45 }}>
                {exp.description}
              </p>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {exp.technologies_json.map((tech) => (
                  <Badge key={tech} variant="neutral" size="sm">{tech}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* PROJECTS TAB */}
      {activeTab === "projects" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {profile?.projects?.map((proj) => (
            <Card key={proj.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700 }}>{proj.title}</h3>
                {proj.url && (
                  <a
                    href={proj.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "12px", color: "var(--accent-primary)", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                  >
                    <span>View Repository</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: "6px 0 10px", lineHeight: 1.45 }}>
                {proj.description}
              </p>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {proj.technologies_json.map((tech) => (
                  <Badge key={tech} variant="neutral" size="sm">{tech}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* EVIDENCE TAB */}
      {activeTab === "evidence" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {evidenceList.map((ev) => (
            <Card key={ev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-main)" }}>{ev.title}</span>
                  <Badge variant="neutral" size="sm">{ev.source_type}</Badge>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{ev.description}</div>
              </div>

              <Badge variant="success" size="sm" dot>Verified Trace</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
