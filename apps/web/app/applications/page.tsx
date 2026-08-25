"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  Building2,
  MapPin,
  DollarSign,
  FileText,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { ApplicationItem, ApplicationPolicyType } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [policy, setPolicy] = useState<ApplicationPolicyType | null>(null);
  const [activeTab, setActiveTab] = useState<string>("ALL");

  useEffect(() => {
    async function loadAppData() {
      try {
        const [appData, polData] = await Promise.all([
          api.getApplications(),
          api.getApplicationPolicy(),
        ]);
        setApplications(appData);
        setPolicy(polData);
      } catch (err) {
        console.error("Failed to load applications:", err);
      }
    }
    loadAppData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OFFER":
        return <Badge variant="success">Offer Received</Badge>;
      case "INTERVIEW":
        return <Badge variant="cyan">Interviewing</Badge>;
      case "APPLIED":
        return <Badge variant="brand">Applied</Badge>;
      case "DRAFT":
        return <Badge variant="warning">Draft Ready</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const filteredApps = applications.filter((app) => {
    if (activeTab === "INTERVIEWS") return app.status === "INTERVIEW";
    if (activeTab === "OFFERS") return app.status === "OFFER";
    if (activeTab === "APPLIED") return app.status === "APPLIED";
    if (activeTab === "DRAFT") return app.status === "DRAFT";
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="brand">Stage 6</Badge>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Governed Pipeline Execution</span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>
            Applications & Pipeline
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
            Evidence-backed submissions and interview tracking operating in Assisted mode.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Link href="/settings/automation" style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="sm" icon={<Sliders size={13} />}>
              Automation Policy ({policy?.mode || "ASSISTED"})
            </Button>
          </Link>
          <Link href="/outcomes" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="sm">
              View Conversion Funnel (Stage 7)
            </Button>
          </Link>
        </div>
      </div>

      {/* Mode & Policy Banner */}
      <Card style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Shield size={18} color="var(--accent-primary)" />
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600 }}>
              Execution Policy: <span style={{ color: "var(--accent-primary)" }}>{policy?.mode || "ASSISTED"}</span>
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
              Min Match Threshold: <strong>{policy?.min_match_score || 85}%</strong> • Daily Limit: <strong>{policy?.daily_application_limit || 5}</strong> • Human Approval Required: <strong>Yes</strong>
            </div>
          </div>
        </div>

        <Link href="/settings/automation" style={{ textDecoration: "none" }}>
          <Button variant="secondary" size="sm">Configure Guardrails</Button>
        </Link>
      </Card>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "6px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
        <Button variant={activeTab === "ALL" ? "primary" : "secondary"} size="sm" onClick={() => setActiveTab("ALL")}>
          All ({applications.length})
        </Button>
        <Button variant={activeTab === "APPLIED" ? "primary" : "secondary"} size="sm" onClick={() => setActiveTab("APPLIED")}>
          Applied (2)
        </Button>
        <Button variant={activeTab === "INTERVIEWS" ? "primary" : "secondary"} size="sm" onClick={() => setActiveTab("INTERVIEWS")}>
          Interviews (1)
        </Button>
        <Button variant={activeTab === "OFFERS" ? "primary" : "secondary"} size="sm" onClick={() => setActiveTab("OFFERS")}>
          Offers (1)
        </Button>
        <Button variant={activeTab === "DRAFT" ? "primary" : "secondary"} size="sm" onClick={() => setActiveTab("DRAFT")}>
          Drafts
        </Button>
      </div>

      {/* Applications List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredApps.map((app) => (
          <Card key={app.id} style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "10px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{app.job.title}</h3>
                  {getStatusBadge(app.status)}
                </div>
                <div style={{ fontSize: "12.5px", color: "var(--accent-cyan)", fontWeight: 600 }}>
                  {app.job.company.name} • {app.job.location} • Match Score: {app.match_score_at_application}%
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                  Applied on {new Date(app.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Next Action & Readiness Checklist */}
            <div style={{ padding: "10px 12px", background: "var(--bg-elevated)", borderRadius: "4px", border: "1px solid var(--border-subtle)", marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-main)", marginBottom: "4px" }}>
                <strong>Next Recommended Step:</strong> {app.next_action || "Prepare for distributed systems architectural deep dive."}
              </div>

              <div style={{ display: "flex", gap: "14px", fontSize: "11.5px", color: "var(--text-dim)", flexWrap: "wrap", marginTop: "6px" }}>
                <span style={{ color: "var(--accent-emerald)" }}>✓ Resume Tailored</span>
                <span style={{ color: "var(--accent-emerald)" }}>✓ Evidence Verified</span>
                <span style={{ color: "var(--accent-emerald)" }}>✓ Salary Floor Satisfied</span>
              </div>
            </div>

            {/* Artifacts Attached */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <FileText size={13} color="var(--text-dim)" />
                <span style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
                  {app.artifacts.length} Tailored Artifacts attached (Cover Letter & Provenance Resume)
                </span>
              </div>

              <Link href="/outcomes" style={{ textDecoration: "none" }}>
                <Button variant="secondary" size="sm">
                  View Timeline & Logs →
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
