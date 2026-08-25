"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  ChevronLeft,
  BookOpen,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { GapItem } from "@/lib/types";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { Card } from "@/app/components/ui/Card";

export default function GapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gapId = params?.id as string;

  const [gap, setGap] = useState<GapItem | null>(null);

  useEffect(() => {
    async function loadGap() {
      try {
        const data = await api.getGap(gapId);
        setGap(data);
      } catch (err) {
        console.error("Failed to load gap:", err);
      }
    }
    loadGap();
  }, [gapId]);

  if (!gap) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading gap diagnostics...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Back Link */}
      <Link
        href="/gaps"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "var(--text-muted)",
          fontSize: "13px",
          textDecoration: "none",
          width: "fit-content",
        }}
      >
        <ChevronLeft size={15} />
        <span>Back to Gaps</span>
      </Link>

      {/* Main Diagnostic Header */}
      <Card style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Badge variant="brand" size="sm">Deficit Diagnostic</Badge>
              <Badge variant="warning" size="sm">{gap.priority} Priority</Badge>
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 700 }}>{gap.title}</h1>
            <div style={{ fontSize: "13px", color: "var(--accent-amber)", marginTop: "4px", fontWeight: 600 }}>
              Career Impact: {gap.expected_impact || "Required by 74% of target roles • Blocking 12 high-signal matches"}
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Link href="/improve" style={{ textDecoration: "none" }}>
              <Button variant="primary" size="md" icon={<BookOpen size={14} />}>
                Start Improvement Plan
              </Button>
            </Link>
          </div>
        </div>

        {/* Capability Metric Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", background: "var(--bg-elevated)", padding: "14px", borderRadius: "4px", border: "1px solid var(--border-subtle)" }}>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase" }}>Current Capability</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-main)", marginTop: "2px" }}>
              {gap.current_level} / 10
            </div>
          </div>
          <div style={{ borderLeft: "1px solid var(--border-subtle)", paddingLeft: "12px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase" }}>Target Capability</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--accent-emerald)", marginTop: "2px" }}>
              {gap.target_level} / 10
            </div>
          </div>
          <div style={{ borderLeft: "1px solid var(--border-subtle)", paddingLeft: "12px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase" }}>Est. Effort</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--accent-cyan)", marginTop: "2px" }}>
              {gap.estimated_effort_hours || 24} Hours
            </div>
          </div>
        </div>
      </Card>

      {/* WHAT WE KNOW (Strong vs Missing) */}
      <div className="grid-2">
        <Card style={{ borderLeft: "3px solid var(--accent-emerald)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <CheckCircle2 size={16} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Existing Strengths Noted</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", color: "var(--text-muted)" }}>
            <div>✓ High concurrency Go and Python runtime mastery.</div>
            <div>✓ Solid understanding of asynchronous microservice request-response loops.</div>
            <div>✓ Verified experience building low-latency storage primitives.</div>
          </div>
        </Card>

        <Card style={{ borderLeft: "3px solid var(--accent-amber)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <AlertTriangle size={16} color="var(--accent-amber)" />
            <h3 style={{ fontSize: "15px", fontWeight: 700 }}>What Is Missing & Needs Work</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", color: "var(--text-muted)" }}>
            <div>! Practical experience configuring Triton C++ dynamic batching.</div>
            <div>! Multi-GPU KV-cache sharing and vLLM PagedAttention operator deployment.</div>
            <div>! Verified benchmark proof of CUDA kernel throughput.</div>
          </div>
        </Card>
      </div>

      {/* WHAT TO DO (4-Phase Action Plan) */}
      <Card>
        <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}>
          Recommended 4-Phase Resolution Plan
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          <div style={{ padding: "12px", borderRadius: "4px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>Phase 1: Learn</div>
            <div style={{ fontSize: "13.5px", fontWeight: 700, margin: "4px 0 2px" }}>Fundamentals</div>
            <p style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: 1.35 }}>
              Read Triton architecture docs and dynamic scheduler algorithms.
            </p>
          </div>

          <div style={{ padding: "12px", borderRadius: "4px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-emerald)", textTransform: "uppercase" }}>Phase 2: Practice</div>
            <div style={{ fontSize: "13.5px", fontWeight: 700, margin: "4px 0 2px" }}>Architecture Lab</div>
            <p style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: 1.35 }}>
              Deploy a local Triton container with dynamic batching.
            </p>
          </div>

          <div style={{ padding: "12px", borderRadius: "4px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase" }}>Phase 3: Build</div>
            <div style={{ fontSize: "13.5px", fontWeight: 700, margin: "4px 0 2px" }}>GitHub Artifact</div>
            <p style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: 1.35 }}>
              Publish a verified benchmarking repo with reproducible latency metrics.
            </p>
          </div>

          <div style={{ padding: "12px", borderRadius: "4px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#fda4af", textTransform: "uppercase" }}>Phase 4: Prove</div>
            <div style={{ fontSize: "13.5px", fontWeight: 700, margin: "4px 0 2px" }}>Stage 5 Verification</div>
            <p style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: 1.35 }}>
              Pass the Stage 5 diagnostic assessment to calibrate verified level.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
