"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  ShieldCheck,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";
import { AssessmentType, AssessmentAttemptResult } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

export default function ProveAssessmentsPage() {
  const [assessments, setAssessments] = useState<AssessmentType[]>([]);
  const [selectedAsm, setSelectedAsm] = useState<AssessmentType | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<AssessmentAttemptResult | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getAssessments();
        setAssessments(data);
        if (data.length > 0) {
          setSelectedAsm(data[0]);
        }
      } catch (err) {
        console.error("Failed to load assessments:", err);
      }
    }
    loadData();
  }, []);

  const handleSelectAssessment = (asm: AssessmentType) => {
    setSelectedAsm(asm);
    setAnswers({});
    setResult(null);
  };

  const handleOptionSelect = (questionId: string, optionKey: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmitAssessment = async () => {
    if (!selectedAsm) return;
    setEvaluating(true);
    try {
      const res = await api.submitAssessment(selectedAsm.id, answers);
      setResult(res);
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="purple">Stage 5</Badge>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Skill Verification & Credentialing</span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700 }}>
            PROVE — Diagnostic Scenario Assessments
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginTop: "2px" }}>
            Pass deterministic technical evaluations to instantly boost verified skill proficiency and recalculate match fit.
          </p>
        </div>
      </div>

      {/* Assessment Selector Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
        {assessments.map((asm) => {
          const isSelected = selectedAsm?.id === asm.id;
          return (
            <Card
              key={asm.id}
              interactive
              onClick={() => handleSelectAssessment(asm)}
              style={{
                border: isSelected ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                background: isSelected ? "var(--bg-elevated)" : "var(--bg-card)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <Badge variant="cyan" size="sm">{asm.difficulty}</Badge>
                <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>⏱ {asm.time_limit_minutes} Mins</span>
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "2px" }}>{asm.title}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Passing: {asm.passing_score}% • {asm.questions?.length || 4} Questions
              </div>
            </Card>
          );
        })}
      </div>

      {/* Active Assessment Interactive Workspace */}
      {selectedAsm && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700 }}>{selectedAsm.title}</h2>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                {selectedAsm.description || "Answer all diagnostic questions to calibrate technical evidence."}
              </div>
            </div>
            <Badge variant="success">Passing: {selectedAsm.passing_score}%</Badge>
          </div>

          {/* Results Feedback Alert */}
          {result && (
            <div
              style={{
                padding: "16px",
                borderRadius: "var(--radius-sm)",
                background: result.passed ? "rgba(16, 185, 129, 0.08)" : "rgba(225, 29, 72, 0.08)",
                border: result.passed ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid rgba(225, 29, 72, 0.25)",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {result.passed ? (
                    <ShieldCheck size={24} color="var(--accent-emerald)" />
                  ) : (
                    <AlertTriangle size={24} color="var(--accent-primary)" />
                  )}
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700 }}>
                      {result.passed ? "Assessment Passed! Verified Skill Boost Calibrated" : "Assessment Complete — Review Feedback Below"}
                    </h3>
                    <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                      Score Achieved: <strong style={{ color: "#ffffff" }}>{result.score_percentage}%</strong> (Passing: {selectedAsm.passing_score}%)
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setResult(null)}
                  icon={<RotateCcw size={13} />}
                >
                  Retake
                </Button>
              </div>

              {result.skill_boost_applied && (
                <div
                  style={{
                    padding: "8px 12px",
                    background: "rgba(16, 185, 129, 0.15)",
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: "#34d399",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Zap size={14} />
                  <span>
                    Proficiency boost applied! Verified level updated to {result.new_proficiency_level}/10 across your KNOW identity graph.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Questions List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {selectedAsm.questions?.map((q, idx) => {
              const currentAns = answers[q.id];
              const evalItem = result?.evaluations?.find((e) => e.question_id === q.id);

              return (
                <div
                  key={q.id}
                  style={{
                    padding: "16px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.4 }}>
                      <span style={{ color: "var(--accent-primary)", marginRight: "6px" }}>Q{idx + 1}.</span>
                      {q.prompt}
                    </div>
                    <span style={{ fontSize: "11.5px", color: "var(--text-dim)", flexShrink: 0 }}>
                      {q.points} Points
                    </span>
                  </div>

                  {/* Options */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
                    {q.options_json?.map((opt) => {
                      const optionChar = opt.charAt(0);
                      const isSelected = currentAns === optionChar;

                      return (
                        <div
                          key={opt}
                          onClick={() => !result && handleOptionSelect(q.id, optionChar)}
                          style={{
                            padding: "9px 12px",
                            borderRadius: "var(--radius-sm)",
                            background: isSelected ? "rgba(225, 29, 72, 0.12)" : "rgba(255, 255, 255, 0.02)",
                            border: isSelected ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                            fontSize: "13px",
                            cursor: result ? "default" : "pointer",
                            color: isSelected ? "#ffffff" : "var(--text-muted)",
                            transition: "all 0.12s ease",
                          }}
                        >
                          {opt}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {evalItem && evalItem.explanation && (
                    <div
                      style={{
                        padding: "8px 12px",
                        borderRadius: "4px",
                        background: evalItem.is_correct ? "rgba(16, 185, 129, 0.06)" : "rgba(225, 29, 72, 0.06)",
                        border: evalItem.is_correct ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(225, 29, 72, 0.2)",
                        fontSize: "12px",
                        color: evalItem.is_correct ? "#34d399" : "#fda4af",
                      }}
                    >
                      <strong>{evalItem.is_correct ? "✓ Correct" : "✗ Incorrect"}:</strong> {evalItem.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Action */}
          {!result && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmitAssessment}
                disabled={evaluating || Object.keys(answers).length === 0}
                loading={evaluating}
                icon={<Award size={15} />}
              >
                Submit for Skill Verification
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
