"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  Sliders,
  CheckCircle2,
  Building,
  Save,
  Shield,
} from "lucide-react";
import { api } from "@/lib/api";
import { ApplicationItem, ApplicationPolicyType } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Checkbox } from "../components/ui/Checkbox";

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="brand">Stage 6</Badge>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Autonomous Application Execution</span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700 }}>
            APPLY — Governed Pipeline & Tailored Artifacts
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginTop: "2px" }}>
            Automated submission workflows with tailored resumes, cover letters, and policy controls.
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: "flex", gap: "6px" }}>
          <Button
            variant={activeTab === "pipeline" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("pipeline")}
          >
            Submissions ({applications.length})
          </Button>
          <Button
            variant={activeTab === "policy" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("policy")}
            icon={<Sliders size={13} />}
          >
            Policy Guardrails
          </Button>
        </div>
      </div>

      {/* Policy Saved Notice */}
      {policySavedNotice && (
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
          <span>Application policy guardrails successfully updated!</span>
        </div>
      )}

      {/* PIPELINE TAB */}
      {activeTab === "pipeline" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Applications List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {applications.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <Card
                  key={app.id}
                  interactive
                  onClick={() => setSelectedApp(app)}
                  style={{
                    border: isSelected ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                    background: isSelected ? "var(--bg-elevated)" : "var(--bg-card)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                    <div>
                      <h3 style={{ fontSize: "15px", fontWeight: 700 }}>{app.tailored_role_title}</h3>
                      <div style={{ fontSize: "12.5px", color: "var(--accent-cyan)", fontWeight: 600 }}>
                        {app.job?.company?.name || "Target Employer"} • {app.job?.location || "Remote"}
                      </div>
                    </div>
                    <Badge variant={app.status === "OFFER" ? "success" : "brand"} size="sm">
                      {app.status}
                    </Badge>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-dim)", marginTop: "8px" }}>
                    <span>Match at Apply: <strong>{app.match_score_at_application}%</strong></span>
                    <span>Artifacts: {app.artifacts?.length || 1}</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Selected Application Details */}
          {selectedApp && (
            <Card style={{ position: "sticky", top: "80px", height: "fit-content" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div>
                  <Badge variant="brand" size="sm" style={{ marginBottom: "6px" }}>{selectedApp.status}</Badge>
                  <h2 style={{ fontSize: "18px", fontWeight: 700 }}>{selectedApp.tailored_role_title}</h2>
                  <div style={{ fontSize: "13px", color: "var(--accent-cyan)", fontWeight: 600 }}>
                    {selectedApp.job?.company?.name} • {selectedApp.job?.location}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--accent-emerald)" }}>
                    {selectedApp.match_score_at_application}%
                  </div>
                  <div style={{ fontSize: "10.5px", color: "var(--text-dim)" }}>Initial Score</div>
                </div>
              </div>

              {/* Artifacts Kit */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "8px" }}>
                  Generated Tailored Artifacts ({selectedApp.artifacts?.length || 0})
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedApp.artifacts?.map((art) => (
                    <div
                      key={art.id}
                      style={{
                        padding: "12px",
                        background: "rgba(255, 255, 255, 0.02)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600 }}>{art.title}</span>
                        <Badge variant="neutral" size="sm">{art.artifact_type}</Badge>
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                        {art.content_text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* POLICY TAB */}
      {activeTab === "policy" && policy && (
        <Card style={{ maxWidth: "600px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Shield size={18} color="var(--accent-primary)" />
            <h2 style={{ fontSize: "17px", fontWeight: 700 }}>Autonomous Policy & Guardrails</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "6px" }}>
                Execution Mode
              </label>
              <select
                value={policy.mode}
                onChange={(e) => setPolicy({ ...policy, mode: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", fontSize: "13.5px" }}
              >
                <option value="ASSISTED">Assisted (Review Required Before Submission)</option>
                <option value="AUTONOMOUS">Autonomous (Auto-Submit When Criteria Met)</option>
                <option value="MANUAL">Manual Only</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "6px" }}>
                Daily Application Limit
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={policy.daily_application_limit}
                onChange={(e) => setPolicy({ ...policy, daily_application_limit: parseInt(e.target.value) || 1 })}
                style={{ width: "100%", padding: "8px 12px", fontSize: "13.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "6px" }}>
                Minimum Match Score Threshold (%)
              </label>
              <input
                type="number"
                min="50"
                max="99"
                value={policy.min_match_score}
                onChange={(e) => setPolicy({ ...policy, min_match_score: parseFloat(e.target.value) || 75 })}
                style={{ width: "100%", padding: "8px 12px", fontSize: "13.5px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
              <Checkbox
                checked={!!policy.require_user_review}
                onChange={(checked) => setPolicy({ ...policy, require_user_review: checked })}
                label="Require manual confirmation before sending external applications"
              />
              <Checkbox
                checked={!!policy.auto_tailor_resume}
                onChange={(checked) => setPolicy({ ...policy, auto_tailor_resume: checked })}
                label="Automatically generate evidence-backed tailored resume kits"
              />
              <Checkbox
                checked={!!policy.auto_generate_cover_letter}
                onChange={(checked) => setPolicy({ ...policy, auto_generate_cover_letter: checked })}
                label="Automatically draft role-specific provenance cover letters"
              />
            </div>

            <div style={{ paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
              <Button
                variant="primary"
                size="md"
                onClick={handleSavePolicy}
                loading={savingPolicy}
                icon={<Save size={14} />}
              >
                Save Policy Changes
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
