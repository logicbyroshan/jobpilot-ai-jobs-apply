"use client";

import React, { useState, useEffect } from "react";
import {
  FolderGit2,
  Github,
  Linkedin,
  FileText,
  Globe,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { api } from "@/lib/api";
import { SourceItem } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

export default function SourcesPage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadSources() {
      try {
        const data = await api.getSources();
        setSources(data);
      } catch (err) {
        console.error("Failed to load sources:", err);
      }
    }
    loadSources();
  }, []);

  const handleSyncSource = async (id: string, name: string) => {
    setSyncingId(id);
    try {
      await api.syncSource(id);
      const updated = await api.getSources();
      setSources(updated);
      setSyncNotice(`Successfully synchronized and analyzed "${name}"!`);
      setTimeout(() => setSyncNotice(null), 4000);
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setSyncingId(null);
    }
  };

  const getSourceIcon = (type: string = "") => {
    const t = (type || "").toLowerCase();
    if (t.includes("github")) return <Github size={22} color="#ffffff" />;
    if (t.includes("linkedin")) return <Linkedin size={22} color="#0077b5" />;
    if (t.includes("resume")) return <FileText size={22} color="var(--cyan)" />;
    return <Globe size={22} color="var(--cyan)" />;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="neutral">Data Integrations</Badge>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Identity Provenance Hub</span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>
            Your Sources
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
            JobPilot continuously builds your professional identity graph from the trusted sources you connect.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => handleSyncSource(sources[0]?.id || "src-1", "All Connected Sources")}
          disabled={!!syncingId}
          icon={
            <RefreshCw
              size={13}
              style={{ animation: syncingId ? "spin 0.8s linear infinite" : "none" }}
            />
          }
        >
          {syncingId ? "Ingesting..." : "Sync All Sources"}
        </Button>
      </div>

      {/* Sync Success Alert */}
      {syncNotice && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "4px",
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
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Sources Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {(sources || []).map((src) => (
          <Card
            key={src.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              padding: "16px 20px",
            }}
          >
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "4px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {getSourceIcon(src.source_type)}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700 }}>{src.display_name}</h3>
                  <Badge variant={src.status === "CONNECTED" ? "success" : "neutral"} size="sm">
                    {src.status}
                  </Badge>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                  {src.source_url || "Verified document archive"} • Ingested <strong>{src.items_ingested_count || 12} items</strong> • Last synced: {new Date(src.last_synced_at || Date.now()).toLocaleTimeString()}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleSyncSource(src.id, src.display_name)}
                disabled={syncingId === src.id}
                icon={
                  <RefreshCw
                    size={12}
                    style={{ animation: syncingId === src.id ? "spin 0.8s linear infinite" : "none" }}
                  />
                }
              >
                {syncingId === src.id ? "Syncing..." : "Sync Now"}
              </Button>
            </div>
          </Card>
        ))}

        {/* Additional Available Providers Card */}
        <Card style={{ padding: "16px 20px", background: "rgba(255, 255, 255, 0.01)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>Connect Additional Portfolios & Code Platforms</div>
              <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                Import GitLab, Bitbucket, personal blogs, or patent registries.
              </div>
            </div>

            <Button variant="secondary" size="sm" icon={<Plus size={13} />}>
              Add Custom Source
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
