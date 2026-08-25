"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ExternalLink,
  Zap,
  Play,
  ArrowRight,
  Flame,
} from "lucide-react";
import { api } from "@/lib/api";
import { LearningPlanType, ResourceItem } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Checkbox } from "../components/ui/Checkbox";

export default function ImprovePage() {
  const [plans, setPlans] = useState<LearningPlanType[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [sprintCompleted, setSprintCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadImproveData() {
      try {
        const [plansData, resData] = await Promise.all([
          api.getLearningPlans(),
          api.getResources(),
        ]);
        setPlans(plansData);
        setResources(resData);
      } catch (err) {
        console.error("Failed to load Improve data:", err);
      }
    }
    loadImproveData();
  }, []);

  const handleToggleItem = async (planId: string, itemId: string) => {
    try {
      const updatedPlan = await api.togglePlanItem(planId, itemId);
      setPlans((prev) => prev.map((p) => (p.id === planId ? updatedPlan : p)));
    } catch (err) {
      console.error("Error toggling learning plan item:", err);
    }
  };

  const toggleSprintStep = (stepKey: string) => {
    setSprintCompleted((prev) => ({ ...prev, [stepKey]: !prev[stepKey] }));
  };

  const currentPlan = plans[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="brand">Stage 4</Badge>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Personalized Action Blueprints</span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>
            Improve — Practical Pathway Execution
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
            JobPilot turns your diagnostic gaps into daily focus tasks, practical labs, and verified evidence projects.
          </p>
        </div>

        <Link href="/prove" style={{ textDecoration: "none" }}>
          <Button variant="primary" size="sm" icon={<Award size={13} />}>
            Verify Skills in Stage 5
          </Button>
        </Link>
      </div>

      {/* 1. CURRENT MISSION HERO CARD */}
      <Card
        style={{
          background: "linear-gradient(135deg, rgba(225, 29, 72, 0.06) 0%, rgba(14, 20, 34, 0.95) 100%)",
          border: "1px solid rgba(225, 29, 72, 0.25)",
          padding: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px", marginBottom: "14px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Badge variant="brand" size="sm">Active Mission</Badge>
              <span style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>Target: 3 Weeks • 24 Hours Total</span>
            </div>

            <h2 style={{ fontSize: "18px", fontWeight: 700 }}>
              {currentPlan?.title || "Master GPU Triton Serving & Distributed Model Architecture"}
            </h2>

            <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "2px" }}>
              Closing deficit: <strong>Level {currentPlan?.current_level || 4.1} → Target {currentPlan?.target_level || 7.5}</strong> (Unlocks 12 higher-tier positions)
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--accent-primary)" }}>
              {currentPlan?.progress_percentage || 35}%
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Mission Progress</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${currentPlan?.progress_percentage || 35}%`, background: "var(--accent-primary)" }}
          />
        </div>
      </Card>

      {/* 2. TODAY'S FOCUS DAILY SPRINT */}
      <Card style={{ borderLeft: "3px solid var(--accent-cyan)", padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Flame size={16} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Today&apos;s Focus Sprint (35 Mins Total)</h3>
          </div>
          <Badge variant="cyan" size="sm">Daily Goal</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Step 1 */}
          <div
            onClick={() => toggleSprintStep("step1")}
            style={{
              padding: "10px 12px",
              borderRadius: "4px",
              background: sprintCompleted["step1"] ? "rgba(16, 185, 129, 0.06)" : "var(--bg-elevated)",
              border: sprintCompleted["step1"] ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
            }}
          >
            <Checkbox checked={!!sprintCompleted["step1"]} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 600, textDecoration: sprintCompleted["step1"] ? "line-through" : "none" }}>
                1. Read: Triton Dynamic Batching & Queue Delays (20 mins)
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
                Understand max_queue_delay_microseconds scheduling tradeoffs.
              </div>
            </div>
            <Badge variant="neutral" size="sm">Read</Badge>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => toggleSprintStep("step2")}
            style={{
              padding: "10px 12px",
              borderRadius: "4px",
              background: sprintCompleted["step2"] ? "rgba(16, 185, 129, 0.06)" : "var(--bg-elevated)",
              border: sprintCompleted["step2"] ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
            }}
          >
            <Checkbox checked={!!sprintCompleted["step2"]} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 600, textDecoration: sprintCompleted["step2"] ? "line-through" : "none" }}>
                2. Practice: Configure config.pbtxt for Llama-3 (10 mins)
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
                Define tensor inputs, outputs, and multi-instance concurrency limits.
              </div>
            </div>
            <Badge variant="neutral" size="sm">Lab</Badge>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => toggleSprintStep("step3")}
            style={{
              padding: "10px 12px",
              borderRadius: "4px",
              background: sprintCompleted["step3"] ? "rgba(16, 185, 129, 0.06)" : "var(--bg-elevated)",
              border: sprintCompleted["step3"] ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
            }}
          >
            <Checkbox checked={!!sprintCompleted["step3"]} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 600, textDecoration: sprintCompleted["step3"] ? "line-through" : "none" }}>
                3. Reflect: Document Memory Footprint & GPU Saturation (5 mins)
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
                Summarize throughput gains ready to mention in technical interviews.
              </div>
            </div>
            <Badge variant="neutral" size="sm">Review</Badge>
          </div>
        </div>
      </Card>

      {/* 3. STRUCTURED MILESTONE CHECKLIST & CURATED LITERATURE */}
      <div className="grid-2">
        {/* Milestone Checklist */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Milestone Checklist</h3>
            <span style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
              {currentPlan?.items.filter((i) => i.is_completed).length || 0} of {currentPlan?.items.length || 4} Completed
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {currentPlan?.items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleItem(currentPlan.id, item.id)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "4px",
                  background: item.is_completed ? "rgba(16, 185, 129, 0.05)" : "var(--bg-elevated)",
                  border: item.is_completed ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                }}
              >
                <Checkbox checked={item.is_completed} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: item.is_completed ? "var(--text-dim)" : "var(--text-main)", textDecoration: item.is_completed ? "line-through" : "none" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                    {item.item_type} • Est. {item.duration_minutes || item.estimated_minutes || 45} mins
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Curated Literature & Rationale */}
        <Card>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px" }}>
            Recommended Curated Resources
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {resources.map((res) => (
              <div
                key={res.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: "4px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>{res.title}</span>
                  <Badge variant="neutral" size="sm">{res.resource_type}</Badge>
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--accent-cyan)" }}>
                  <strong>Why JobPilot recommends this:</strong> {res.recommendation_reason || "Essential foundational documentation for Triton scheduling."}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
