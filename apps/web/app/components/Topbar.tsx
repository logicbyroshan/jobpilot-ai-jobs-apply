"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Zap,
  LogIn,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { SearchBar } from "./ui/SearchBar";
import { Button } from "./ui/Button";

export function Topbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleGlobalSync = async () => {
    setSyncing(true);
    setSyncNotice(null);
    try {
      await api.syncSource("src-github");
      setSyncNotice("Pipeline synchronized");
      setTimeout(() => setSyncNotice(null), 3000);
    } catch (err) {
      console.error("Sync failed:", err);
      setSyncNotice("Sync failed");
      setTimeout(() => setSyncNotice(null), 3000);
    } finally {
      setSyncing(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="topbar">
      {/* Search Input */}
      <SearchBar placeholder="Search skills, companies, opportunities..." shortcut="⌘K" />

      {/* Sync Status Banner (if active) */}
      {syncNotice && (
        <div
          style={{
            fontSize: "12px",
            color: "#fda4af",
            background: "rgba(225, 29, 72, 0.1)",
            border: "1px solid rgba(225, 29, 72, 0.25)",
            padding: "3px 10px",
            borderRadius: "var(--radius-full)",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <Zap size={13} color="var(--accent-primary)" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* User Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleGlobalSync}
          disabled={syncing}
          icon={
            <RefreshCw
              size={13}
              style={{ animation: syncing ? "spin 0.8s linear infinite" : "none" }}
            />
          }
        >
          {syncing ? "Syncing..." : "Sync Pipeline"}
        </Button>

        {isAuthenticated && user ? (
          <div style={{ position: "relative" }}>
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "3px 8px 3px 4px",
                background: "var(--bg-elevated)",
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
                  style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "var(--accent-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#ffffff",
                  }}
                >
                  {getInitials(user.full_name)}
                </div>
              )}
              <span style={{ fontSize: "12.5px", fontWeight: 600 }}>{user.full_name}</span>
              <ChevronDown size={12} color="var(--text-dim)" />
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "36px",
                  right: "0",
                  width: "200px",
                  padding: "8px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-md)",
                  zIndex: 1000,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div style={{ padding: "6px 8px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "4px" }}>
                  <div style={{ fontSize: "12.5px", fontWeight: 600 }}>{user.full_name}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    width: "100%",
                    padding: "6px 8px",
                    background: "rgba(225, 29, 72, 0.08)",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    color: "#fda4af",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="sm" icon={<LogIn size={13} />}>
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
