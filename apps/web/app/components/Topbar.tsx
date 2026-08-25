"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RefreshCw, Search, Zap, LogOut, User, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Topbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleGlobalSync = async () => {
    setSyncing(true);
    setSyncNotice("Syncing live identity & jobs from 3 connected sources...");
    setTimeout(() => {
      setSyncing(false);
      setSyncNotice("System synced. 8 verified skills & 6 opportunities updated.");
      setTimeout(() => setSyncNotice(null), 4000);
    }, 1200);
  };

  const getInitials = (name?: string) => {
    if (!name) return "JP";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="topbar">
      {/* Search / Context */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "360px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-full)",
            padding: "6px 14px",
            width: "100%",
          }}
        >
          <Search size={16} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="Search skills, opportunities, assessments..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-main)",
              fontSize: "13px",
              width: "100%",
              fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      {/* Sync Status Banner (if active) */}
      {syncNotice && (
        <div
          style={{
            fontSize: "12px",
            color: "#818cf8",
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            padding: "4px 12px",
            borderRadius: "var(--radius-full)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <Zap size={14} />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* User Status and Quick Action */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative" }}>
        <button
          onClick={handleGlobalSync}
          disabled={syncing}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: "12px", gap: "6px" }}
          title="Run instant data sync across GitHub, Resume, and Job aggregators"
        >
          <RefreshCw
            size={14}
            style={{
              animation: syncing ? "spin 1s linear infinite" : "none",
            }}
          />
          <span>{syncing ? "Syncing Sources..." : "Sync Pipeline"}</span>
        </button>

        {/* User Pill / Login Link */}
        {isAuthenticated && user ? (
          <div style={{ position: "relative" }}>
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "4px 10px 4px 6px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--border-subtle)",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#ffffff",
                  }}
                >
                  {getInitials(user.full_name)}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "12.5px", fontWeight: 600, lineHeight: 1.2 }}>
                  {user.full_name}
                </span>
                <span style={{ fontSize: "10px", color: "var(--accent-cyan)", fontWeight: 500 }}>
                  {user.headline || "Software Engineer"}
                </span>
              </div>
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div
                className="glass-card"
                style={{
                  position: "absolute",
                  top: "42px",
                  right: "0",
                  width: "220px",
                  padding: "12px",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                  zIndex: 1000,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ padding: "4px 8px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{user.full_name}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
                  {user.auth_provider === "google" && (
                    <span style={{ fontSize: "10px", color: "#34A853", background: "rgba(52, 168, 83, 0.15)", padding: "2px 6px", borderRadius: "4px", marginTop: "4px", display: "inline-block" }}>
                      ✓ Google SSO
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "8px 10px",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "6px",
                    color: "#f87171",
                    fontSize: "12px",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="btn btn-primary btn-sm"
            style={{ fontSize: "12px", gap: "6px", textDecoration: "none" }}
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </Link>
        )}
      </div>
      <style jsx global>{`
        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </header>
  );
}
