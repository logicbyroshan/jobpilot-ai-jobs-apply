"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  Sliders,
  FileCheck,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  FileText,
  Save,
} from "lucide-react";
import { api } from "@/lib/api";
import { ApplicationItem, ApplicationPolicyType } from "@/lib/types";

export default function ApplyPipelinePage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [policy, setPolicy] = useState<ApplicationPolicyType | null>(null);
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [activeTab, setActiveTab] = useState<"pipeline" | "policy">("pipeline");
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [policySavedNotice, setPolicySavedNotice] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [apps, pol] = await Promise.all([
          api.getApplications(),
          api.getApplicationPolicy(),
        ]);
        setApplications(apps);
        setPolicy(pol);
        if (apps.length > 0) {
          setSelectedApp(apps[0]);
        }
      } catch (err) {
        console.error("Failed to load APPLY data:", err);
      }
    }
    loadData();
  }, []);

  const handleSavePolicy = async () => {
    if (!policy) return;
    setSavingPolicy(true);
    try {
      const updated = await api.updateApplicationPolicy(policy);
      setPolicy(updated);
      setPolicySavedNotice(true);
      setTimeout(() => setPolicySavedNotice(false), 3000);
    } catch (err) {
      console.error("Failed to save policy:", err);
    } finally {
      setSavingPolicy(false);
    }
  };

  const stages = [
    { key: "SUBMITTED", label: "Submitted", color: "var(--accent-cyan)" },
    { key: "RECRUITER_RESPONSE", label: "Recruiter Screen", color: "var(--accent-primary)" },
    { key: "INTERVIEW", label: "Interview", color: "var(--accent-amber)" },
    { key: "TECHNICAL_ROUND", label: "Technical Round", color: "#a855f7" },
    { key: "OFFER", label: "Offer Received", color: "var(--accent-emerald)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="badge badge-rose">Loop Stage 6</span>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Autonomous Application Execution</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em" }}>
            APPLY — Application Pipeline & Tailored Artifacts
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
            Autonomous and assisted submission workflows with customized cover letters, resume provenance citations, and governance guardrails.
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`btn ${activeTab === "pipeline" ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "13px" }}
          >
            Pipeline ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab("policy")}
            className={`btn ${activeTab === "policy" ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "13px" }}
          >
            <Sliders size={15} />
            <span>Autonomous Policy</span>
          </button>
        </div>
      </div>

      {activeTab === "pipeline" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
          {/* Applications List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {applications.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className="card card-interactive"
                  style={{
                    border: isSelected ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                    background: isSelected ? "rgba(99, 102, 241, 0.1)" : "var(--bg-card)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{app.job.title}</h3>
                      <div style={{ fontSize: "13px", color: "var(--accent-cyan)", fontWeight: 600 }}>
                        {app.job.company.name} • {app.job.location}
                      </div>
                    </div>
                    <span
                      className="badge"
                      style={{
                        background:
                          app.status === "OFFER"
                            ? "rgba(16, 185, 129, 0.2)"
                            : app.status === "INTERVIEW"
                            ? "rgba(245, 158, 11, 0.2)"
                            : "rgba(99, 102, 241, 0.2)",
                        color:
                          app.status === "OFFER"
                            ? "#34d399"
                            : app.status === "INTERVIEW"
                            ? "#fbbf24"
                            : "#a5b4fc",
                        fontWeight: 700,
                      }}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-dim)", marginTop: "10px" }}>
                    <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                    <span>Match at Apply: {app.match_score_at_application || 92}%</span>
                    <span>{app.artifacts.length} Tailored Artifacts</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Application Artifact Viewer */}
          {selectedApp && (
            <div className="card" style={{ position: "sticky", top: "84px", height: "fit-content" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700 }}>{selectedApp.job.title}</h3>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {selectedApp.job.company.name}
                  </div>
                </div>
                <span className="badge badge-emerald">Status: {selectedApp.status}</span>
              </div>

              {/* Artifacts list */}
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "10px" }}>
                Generated Tailored Artifacts ({selectedApp.artifacts.length})
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {selectedApp.artifacts.map((art) => (
                  <div
                    key={art.id}
                    style={{
                      padding: "14px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <FileText size={16} color="var(--accent-primary)" />
                      <span style={{ fontWeight: 600, fontSize: "14px", color: "#ffffff" }}>{art.title}</span>
                    </div>

                    {art.content_text && (
                      <p style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "8px" }}>
                        {art.content_text}
                      </p>
                    )}

                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {art.provenance_sources_json.map((p) => (
                        <span
                          key={p}
                          style={{
                            fontSize: "10px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: "rgba(99, 102, 241, 0.15)",
                            color: "#a5b4fc",
                          }}
                        >
                          Source: {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Autonomous Policy Settings */}
      {activeTab === "policy" && policy && (
        <div className="card" style={{ maxWidth: "800px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Autonomous Policy & Governance</h2>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Control safety boundaries, submission approval requirements, and matching score thresholds.
              </div>
            </div>
            {policySavedNotice && (
              <span className="badge badge-emerald">Policy Saved & Active!</span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Mode Select */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                Execution Mode
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {(["MANUAL", "ASSISTED", "AUTONOMOUS"] as const).map((m) => (
                  <div
                    key={m}
                    onClick={() => setPolicy({ ...policy, mode: m })}
                    style={{
                      padding: "16px",
                      borderRadius: "var(--radius-sm)",
                      background: policy.mode === m ? "rgba(99, 102, 241, 0.15)" : "rgba(255, 255, 255, 0.02)",
                      border: policy.mode === m ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "14px", color: policy.mode === m ? "#ffffff" : "var(--text-muted)" }}>
                      {m}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "4px" }}>
                      {m === "MANUAL"
                        ? "User initiates all steps"
                        : m === "ASSISTED"
                        ? "AI prepares, user confirms"
                        : "Full background execution"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Application Limit */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>
                  Daily Application Limit
                </label>
                <span style={{ fontWeight: 700, color: "#ffffff" }}>
                  {policy.daily_application_limit} Applications / Day
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={policy.daily_application_limit}
                onChange={(e) => setPolicy({ ...policy, daily_application_limit: parseInt(e.target.value) })}
                style={{ width: "100%", accentColor: "var(--accent-primary)" }}
              />
            </div>

            {/* Min Match Score */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>
                  Minimum Match Score Threshold
                </label>
                <span style={{ fontWeight: 700, color: "var(--accent-emerald)" }}>
                  {policy.min_match_score}%
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                value={policy.min_match_score}
                onChange={(e) => setPolicy({ ...policy, min_match_score: parseFloat(e.target.value) })}
                style={{ width: "100%", accentColor: "var(--accent-emerald)" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
              <button
                onClick={handleSavePolicy}
                disabled={savingPolicy}
                className="btn btn-primary"
                style={{ fontSize: "13.5px" }}
              >
                <Save size={15} />
                <span>{savingPolicy ? "Saving Policy..." : "Update Policy Guardrails"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
