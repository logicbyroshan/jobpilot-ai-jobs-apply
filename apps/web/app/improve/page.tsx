"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  ExternalLink,
  Award,
  BookMarked,
  Video,
  FileCode,
  GraduationCap,
} from "lucide-react";
import { api } from "@/lib/api";
import { LearningPlanType, ResourceItem } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Checkbox } from "../components/ui/Checkbox";

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
        return <BookMarked size={14} color="var(--accent-cyan)" />;
      case "WATCH":
        return <Video size={14} color="var(--accent-amber)" />;
      case "BUILD":
      case "PRACTICE":
        return <FileCode size={14} color="var(--accent-emerald)" />;
      case "PROVE":
        return <Award size={14} color="var(--accent-primary)" />;
      default:
        return <GraduationCap size={14} color="var(--text-muted)" />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="success">Stage 4</Badge>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Curated Learning Pathways</span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700 }}>
            IMPROVE — High-Signal Skill Acquisition
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginTop: "2px" }}>
            Personalized, gap-targeted plans linking engineering resources and hands-on milestones.
          </p>
        </div>

        <Link href="/prove" style={{ textDecoration: "none" }}>
          <Button variant="primary" size="md" icon={<Award size={14} />}>
            Proceed to Proving (Stage 5)
          </Button>
        </Link>
      </div>

      {/* Active Learning Plans */}
      {plans.map((plan) => (
        <Card key={plan.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                <h2 style={{ fontSize: "17px", fontWeight: 700 }}>{plan.title}</h2>
                <Badge variant={plan.status === "COMPLETED" ? "success" : "brand"} size="sm">
                  {plan.status}
                </Badge>
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                Targeting: <strong style={{ color: "var(--text-main)" }}>{plan.target_gap_title}</strong>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 700 }}>
                {plan.progress_percentage}% Completed
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                Est. {plan.estimated_total_hours} Hours
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar-bg" style={{ marginBottom: "16px" }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${plan.progress_percentage}%`,
                background: "var(--accent-primary)",
              }}
            />
          </div>

          {/* Milestones / Checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {plan.items.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  background: item.is_completed ? "rgba(16, 185, 129, 0.04)" : "rgba(255, 255, 255, 0.02)",
                  border: item.is_completed ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Checkbox
                    checked={item.is_completed}
                    onChange={() => handleToggleItem(plan.id, item.id)}
                    disabled={togglingId === item.id}
                  />
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: item.is_completed ? "var(--text-muted)" : "var(--text-main)", textDecoration: item.is_completed ? "line-through" : "none" }}>
                      {idx + 1}. {item.title}
                    </div>
                    {item.description && (
                      <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>{item.description}</div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {getItemIcon(item.item_type)}
                    <Badge variant="neutral" size="sm">{item.item_type}</Badge>
                  </div>
                  {item.resource_url && (
                    <a
                      href={item.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--accent-primary)", display: "flex", alignItems: "center" }}
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Curated Literature Library */}
      <div>
        <h2 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "12px" }}>
          Curated Engineering Resources Library
        </h2>
        <div className="grid-3">
          {resources.map((res) => (
            <Card key={res.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <Badge variant="neutral" size="sm">{res.resource_type}</Badge>
                <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>⏱ {res.estimated_minutes}m</span>
              </div>
              <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>{res.title}</h3>
              <div style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: "8px" }}>
                {res.topic_tag} • {res.difficulty}
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px", lineHeight: 1.4 }}>
                {res.summary_text}
              </p>
              {res.external_url && (
                <a
                  href={res.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "12.5px", color: "var(--accent-primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span>Open Resource</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
