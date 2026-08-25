"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  Award,
  Layers,
  Sparkles,
  Clock,
  BookMarked,
  Video,
  FileCode,
  GraduationCap,
} from "lucide-react";
import { api } from "@/lib/api";
import { LearningPlanType, ResourceItem } from "@/lib/types";

export default function ImproveLearningPage() {
  const [plans, setPlans] = useState<LearningPlanType[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [pl, res] = await Promise.all([
          api.getLearningPlans(),
          api.getResources(),
        ]);
        setPlans(pl);
        setResources(res);
      } catch (err) {
        console.error("Failed to load IMPROVE data:", err);
      }
    }
    loadData();
  }, []);

  const handleToggleItem = async (planId: string, itemId: string) => {
    setTogglingId(itemId);
    try {
      const updatedPlan = await api.togglePlanItem(planId, itemId);
      setPlans((prev) => prev.map((p) => (p.id === planId ? updatedPlan : p)));
    } catch (err) {
      console.error("Toggle error:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "READ":
        return <BookMarked size={16} color="var(--accent-cyan)" />;
      case "WATCH":
        return <Video size={16} color="var(--accent-amber)" />;
      case "BUILD":
      case "PRACTICE":
        return <FileCode size={16} color="var(--accent-emerald)" />;
      case "PROVE":
        return <Award size={16} color="#a855f7" />;
      default:
        return <GraduationCap size={16} color="var(--accent-primary)" />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="badge badge-emerald">Loop Stage 4</span>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Curated Learning Pathways</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em" }}>
            IMPROVE — High-Signal Skill Acquisition
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
            Personalized, gap-targeted learning plans linking authoritative engineering resources and hands-on milestones.
          </p>
        </div>

        <Link href="/prove" className="btn btn-primary" style={{ fontSize: "13px" }}>
          <Award size={15} />
          <span>Proceed to Proving & Assessments</span>
        </Link>
      </div>

      {/* Active Learning Plans */}
      {plans.map((plan) => (
        <div key={plan.id} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <h2 style={{ fontSize: "19px", fontWeight: 700 }}>{plan.title}</h2>
                <span className="badge badge-emerald">{plan.status}</span>
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-dim)" }}>
                Target Competency: <strong style={{ color: "#ffffff" }}>{plan.target_skill}</strong> • Level {plan.current_level} → {plan.target_level}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--accent-emerald)" }}>
                {plan.progress_percentage.toFixed(0)}%
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Milestones Completed</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar-bg" style={{ height: "8px", marginBottom: "20px" }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${plan.progress_percentage}%`,
                background: "linear-gradient(90deg, #10b981 0%, #06b6d4 100%)",
              }}
            />
          </div>

          {/* Checklist Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {plan.items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleItem(plan.id, item.id)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-sm)",
                  background: item.is_completed ? "rgba(16, 185, 129, 0.05)" : "rgba(255, 255, 255, 0.02)",
                  border: item.is_completed ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {item.is_completed ? (
                    <CheckCircle2 size={20} color="var(--accent-emerald)" />
                  ) : (
                    <Circle size={20} color="var(--text-dim)" />
                  )}
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        textDecoration: item.is_completed ? "line-through" : "none",
                        color: item.is_completed ? "var(--text-muted)" : "#ffffff",
                      }}
                    >
                      {item.title}
                    </div>
                    {item.resource && (
                      <div style={{ fontSize: "12px", color: "var(--accent-cyan)", marginTop: "2px" }}>
                        {item.resource.provider} • {item.resource.difficulty}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="badge badge-subtle" style={{ fontSize: "11px", gap: "4px" }}>
                    {getItemIcon(item.item_type)}
                    {item.item_type}
                  </span>
                  {item.estimated_minutes && (
                    <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                      {item.estimated_minutes} min
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Curated Resource Registry */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Curated Technical Resource Registry</h3>
            <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
              Vetted engineering books, video courses, official CNCF guides, and hands-on lab sandboxes.
            </div>
          </div>
        </div>

        <div className="grid-2">
          {resources.map((res) => (
            <div
              key={res.id}
              style={{
                padding: "16px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <h4 style={{ fontSize: "14.5px", fontWeight: 700 }}>{res.title}</h4>
                  <span className={`badge ${res.cost === "FREE" ? "badge-emerald" : "badge-amber"}`} style={{ fontSize: "10px" }}>
                    {res.cost}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--accent-cyan)", fontWeight: 600, marginBottom: "8px" }}>
                  {res.provider} • {res.resource_type} • {res.difficulty}
                </div>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {res.topics_json.map((top) => (
                    <span
                      key={top}
                      style={{
                        fontSize: "10.5px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "rgba(255, 255, 255, 0.05)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {top}
                    </span>
                  ))}
                </div>
              </div>

              <a
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ width: "fit-content", fontSize: "12px" }}
              >
                <span>Launch Resource</span>
                <ExternalLink size={13} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
