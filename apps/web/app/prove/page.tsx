"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Target,
  Sparkles,
  Zap,
  HelpCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { AssessmentType, AssessmentAttemptResult } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

export default function ProvePage() {
  const [assessments, setAssessments] = useState<AssessmentType[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<AssessmentType | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentAttemptResult | null>(null);

  useEffect(() => {
    async function loadAssessments() {
      try {
        const data = await api.getAssessments();
        setAssessments(data);
      } catch (err) {
        console.error("Failed to load assessments:", err);
      }
    }
    loadAssessments();
  }, []);

  const handleStart = (asm: AssessmentType) => {
    setActiveAssessment(asm);
    setAnswers({});
    setResult(null);
  };

  const handleAnswer = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!activeAssessment) return;
    setSubmitting(true);
    try {
      const res = await api.submitAssessment(activeAssessment.id, answers);
      setResult(res);
    } catch (err) {
      console.error("Error submitting assessment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Badge variant="brand">Stage 5</Badge>
            <span style={{ fontSize: "13px", color: "var(--text-sub)" }}>Deterministic Competency Verification</span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.025em" }}>
            Prove Your Skills
          </h1>
          <p style={{ color: "var(--text-sub)", fontSize: "14px", marginTop: "4px", lineHeight: 1.55 }}>
            Learning is not enough. Complete objective diagnostic verifications to unlock higher-tier opportunities.
          </p>
        </div>

        <Link href="/opportunities" prefetch={true} style={{ textDecoration: "none" }}>
          <Button variant="secondary" size="sm" icon={<Target size={14} />}>
            View Unlocked Matches
          </Button>
        </Link>
      </div>

      {/* ASSESSMENT RESULT BANNER (CLOSED-LOOP FEEDBACK) */}
      {result && (
        <Card
          style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(14, 20, 34, 0.95) 100%)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <ShieldCheck size={20} color="var(--accent-emerald)" />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-emerald)", textTransform: "uppercase" }}>
                  Skill Verified & Calibrated
                </span>
                <Badge variant="success" size="sm">Score: {result.score_percentage}%</Badge>
              </div>

              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>
                Proficiency Boost: {result.previous_proficiency_level || 8.0} → {result.new_proficiency_level || 9.8}/10
              </h2>

              <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "680px", lineHeight: 1.45 }}>
                {result.feedback || "Your verified evidence graph has been updated with immutable assessment proof."}
                <strong style={{ color: "var(--accent-cyan)", marginLeft: "4px" }}>
                  12 additional high-signal opportunities now match your profile.
                </strong>
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Link href="/opportunities" style={{ textDecoration: "none" }}>
                <Button variant="primary" size="md" icon={<ArrowRight size={14} />} iconPosition="right">
                  View New Opportunities
                </Button>
              </Link>
              <Button variant="secondary" size="md" onClick={() => { setActiveAssessment(null); setResult(null); }}>
                Done
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ACTIVE ASSESSMENT WORKSPACE (FOCUS MODE) */}
      {activeAssessment && !result ? (
        <Card style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--border-subtle)" }}>
            <div>
              <Badge variant="purple" size="sm" style={{ marginBottom: "4px" }}>{activeAssessment.skill_name}</Badge>
              <h2 style={{ fontSize: "18px", fontWeight: 700 }}>{activeAssessment.title}</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-dim)" }}>
              <Clock size={13} />
              <span>{activeAssessment.time_limit_minutes} Mins Limit</span>
            </div>
          </div>

          {/* Questions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "20px" }}>
            {activeAssessment.questions.map((q, idx) => (
              <div
                key={q.id}
                style={{
                  padding: "16px",
                  borderRadius: "4px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-purple)", marginBottom: "4px" }}>
                  Question {idx + 1} of {activeAssessment.questions.length} ({q.points} pts)
                </div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-main)", marginBottom: "12px" }}>
                  {q.prompt || q.question_text}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {q.options_json.map((opt) => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <div
                        key={opt}
                        onClick={() => handleAnswer(q.id, opt)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "4px",
                          background: isSelected ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.02)",
                          border: isSelected ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid var(--border-subtle)",
                          fontSize: "13px",
                          color: isSelected ? "#ffffff" : "var(--text-muted)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          transition: "all 0.1s ease",
                        }}
                      >
                        <div
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            border: isSelected ? "4px solid #ffffff" : "1px solid var(--text-dim)",
                            background: isSelected ? "var(--bg-main)" : "transparent",
                          }}
                        />
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button variant="secondary" size="sm" onClick={() => setActiveAssessment(null)}>
              Cancel
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={submitting}
              icon={<ShieldCheck size={15} />}
            >
              {submitting ? "Evaluating Proof..." : "Submit for Verification"}
            </Button>
          </div>
        </Card>
      ) : (
        /* AVAILABLE ASSESSMENTS LIST */
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {assessments.map((asm) => (
            <Card key={asm.id} style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{asm.title}</h3>
                    <Badge variant="purple" size="sm">{asm.difficulty}</Badge>
                  </div>
                  <div style={{ fontSize: "12.5px", color: "var(--accent-cyan)", fontWeight: 600 }}>
                    Skill: {asm.skill_name} • Est. Time: {asm.time_limit_minutes} Mins • Passing: {asm.passing_score}%
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <Badge variant="success" size="sm">Unlocks +12 Matches</Badge>
                </div>
              </div>

              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.45, marginBottom: "14px" }}>
                {asm.description}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <span style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
                  {asm.questions.length} Diagnostic questions evaluating knowledge, troubleshooting, and edge cases.
                </span>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStart(asm)}
                  icon={<Award size={13} />}
                >
                  Prove Skill Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
