"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { api } from "@/lib/api";
import { AssessmentType, AssessmentAttemptResult } from "@/lib/types";

export default function ProveAssessmentsPage() {
  const [assessments, setAssessments] = useState<AssessmentType[]>([]);
  const [selectedAsm, setSelectedAsm] = useState<AssessmentType | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<AssessmentAttemptResult | null>(null);

  useEffect(() => {
    async function loadAssessments() {
      try {
        const list = await api.getAssessments();
        setAssessments(list);
        if (list.length > 0) {
          const detail = await api.getAssessment(list[0].id);
          setSelectedAsm(detail);
        }
      } catch (err) {
        console.error("Failed to load assessments:", err);
      }
    }
    loadAssessments();
  }, []);

  const handleSelectAssessment = async (asm: AssessmentType) => {
    try {
      const detail = await api.getAssessment(asm.id);
      setSelectedAsm(detail);
      setAnswers({});
      setResult(null);
    } catch (err) {
      console.error("Failed to load assessment detail:", err);
    }
  };

  const handleOptionSelect = (qId: string, optionChar: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionChar }));
  };

  const handleSubmitAssessment = async () => {
    if (!selectedAsm) return;
    setEvaluating(true);
    try {
      const res = await api.submitAssessment(selectedAsm.id, answers);
      setResult(res);
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="badge badge-primary">Loop Stage 5</span>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Assessment & Proving Engine</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em" }}>
            PROVE — Practical Competence Verification
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
            Scientific scenario and knowledge evaluations that generate tamper-proof evidence items, boosting skill proficiency scores in real-time.
          </p>
        </div>
      </div>

      {/* Available Assessments Carousel */}
      <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "4px" }}>
        {assessments.map((asm) => {
          const isSelected = selectedAsm?.id === asm.id;
          return (
            <button
              key={asm.id}
              onClick={() => {
                setSelectedAsm(asm);
                setResult(null);
                setAnswers({});
              }}
              className="card card-interactive"
              style={{
                minWidth: "300px",
                textAlign: "left",
                border: isSelected ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                background: isSelected ? "rgba(239, 68, 68, 0.15)" : "var(--bg-card)",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span className="badge badge-cyan" style={{ fontSize: "10.5px" }}>
                  {asm.difficulty}
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                  ⏱ {asm.time_limit_minutes} Mins
                </span>
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>{asm.title}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Passing: {asm.passing_score}% • {asm.questions?.length || 4} Questions
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Assessment Interactive Workspace */}
      {selectedAsm && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 800 }}>{selectedAsm.title}</h2>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                {selectedAsm.description || "Answer all diagnostic questions to calibrate technical evidence."}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span className="badge badge-emerald">Passing: {selectedAsm.passing_score}%</span>
            </div>
          </div>

          {/* Results Display */}
          {result && (
            <div
              style={{
                padding: "20px",
                borderRadius: "var(--radius-sm)",
                background: result.passed ? "rgba(16, 185, 129, 0.1)" : "rgba(244, 63, 94, 0.1)",
                border: result.passed ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(244, 63, 94, 0.3)",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {result.passed ? (
                    <ShieldCheck size={28} color="var(--accent-emerald)" />
                  ) : (
                    <AlertTriangle size={28} color="var(--accent-rose)" />
                  )}
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 700 }}>
                      {result.passed ? "Assessment Passed! Verified Skill Boost Calibrated" : "Assessment Complete — Room for Improvement"}
                    </h3>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      Score Achieved: <strong style={{ color: "#ffffff" }}>{result.score_percentage}%</strong> (Passing: {selectedAsm.passing_score}%)
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setResult(null)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "12px", gap: "6px" }}
                >
                  <RotateCcw size={14} />
                  <span>Retake Assessment</span>
                </button>
              </div>

              {result.skill_boost_applied && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "rgba(16, 185, 129, 0.2)",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                    color: "#34d399",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Zap size={16} />
                  <span>
                    Proficiency boost applied! Verified level updated to {result.new_proficiency_level}/10 across your KNOW identity graph.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Questions List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {selectedAsm.questions?.map((q, idx) => {
              const currentAns = answers[q.id];
              const evalItem = result?.evaluations?.find((e) => e.question_id === q.id);

              return (
                <div
                  key={q.id}
                  style={{
                    padding: "18px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ fontSize: "15px", fontWeight: 600, lineHeight: 1.4 }}>
                      <span style={{ color: "var(--accent-primary)", marginRight: "8px" }}>Q{idx + 1}.</span>
                      {q.prompt}
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-dim)", flexShrink: 0 }}>
                      {q.points} Points
                    </span>
                  </div>

                  {/* Options */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                    {q.options_json?.map((opt) => {
                      const optionChar = opt.charAt(0);
                      const isSelected = currentAns === optionChar;

                      return (
                        <div
                          key={opt}
                          onClick={() => !result && handleOptionSelect(q.id, optionChar)}
                          style={{
                            padding: "10px 14px",
                            borderRadius: "6px",
                            background: isSelected ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.03)",
                            border: isSelected ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                            fontSize: "13.5px",
                            cursor: result ? "default" : "pointer",
                            color: isSelected ? "#ffffff" : "var(--text-muted)",
                            transition: "all 0.15s ease",
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
                        padding: "10px 14px",
                        borderRadius: "6px",
                        background: evalItem.is_correct ? "rgba(16, 185, 129, 0.08)" : "rgba(244, 63, 94, 0.08)",
                        border: evalItem.is_correct ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(244, 63, 94, 0.2)",
                        fontSize: "12.5px",
                        color: evalItem.is_correct ? "#34d399" : "#fb7185",
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
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button
                onClick={handleSubmitAssessment}
                disabled={evaluating || Object.keys(answers).length === 0}
                className="btn btn-primary btn-lg"
                style={{ fontSize: "14.5px" }}
              >
                <Award size={18} />
                <span>{evaluating ? "Evaluating Submission..." : "Submit for Verification & Skill Boost"}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
