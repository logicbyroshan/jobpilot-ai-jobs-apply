"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Mail, Lock, Zap, Github, Linkedin } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithGitHub, loginWithLinkedIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle GitHub/LinkedIn OAuth Callback code if redirected back from OAuth provider
  useEffect(() => {
    const code = searchParams?.get("code");
    const error = searchParams?.get("error");

    if (error) {
      setErrorMessage(`Authentication canceled or failed: ${error}`);
      return;
    }

    if (code) {
      setIsLoading(true);
      loginWithGitHub(code).then((res) => {
        setIsLoading(false);
        if (res.success) {
          router.push("/");
        } else {
          setErrorMessage(res.error || "Failed to complete GitHub sign-in.");
        }
      });
    }
  }, [searchParams, loginWithGitHub, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      router.push("/");
    } else {
      setErrorMessage(res.error || "Invalid credentials. Please try again.");
    }
  };

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const authData = await api.getGitHubAuthorizeUrl();
      if (authData?.client_id_configured && authData.authorization_url) {
        window.location.href = authData.authorization_url;
        return;
      }
    } catch (e) {
      console.warn("Using local GitHub profile login", e);
    }

    const res = await loginWithGitHub();
    setIsLoading(false);
    if (res.success) {
      router.push("/");
    }
  };

  const handleLinkedInSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await loginWithLinkedIn();
    setIsLoading(false);
    if (res.success) {
      router.push("/");
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const res = await login("alex.chen@jobpilot.dev", "MasterPassword2026!");
    setIsLoading(false);

    if (res.success) {
      router.push("/");
    } else {
      setErrorMessage(res.error || "Demo login error.");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "420px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "14px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "8px",
              background: "#131929",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "5px",
            }}
          >
            <img src="/logo-dark.png" alt="JobPilot" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 800, fontSize: "17px", letterSpacing: "-0.02em" }}>
              <span style={{ color: "#f8fafc" }}>Job</span>
              <span style={{ color: "var(--accent-primary)" }}>Pilot</span>
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Career OS
            </div>
          </div>
        </Link>
        <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px", color: "var(--text-main)" }}>Sign in to your account</h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Access your closed-loop career operating system
        </p>
      </div>

      {/* Auth Card */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "24px",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              background: "rgba(225, 29, 72, 0.1)",
              border: "1px solid rgba(225, 29, 72, 0.25)",
              color: "#fda4af",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* 2 Primary Social OAuth Providers: GitHub & LinkedIn */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
          {/* GitHub OAuth */}
          <Button
            type="button"
            variant="secondary"
            onClick={handleGitHubSignIn}
            disabled={isLoading}
            style={{ width: "100%", justifyContent: "center", height: "40px" }}
            icon={<Github size={16} color="#ffffff" />}
          >
            Continue with GitHub
          </Button>

          {/* LinkedIn OAuth */}
          <Button
            type="button"
            variant="secondary"
            onClick={handleLinkedInSignIn}
            disabled={isLoading}
            style={{ width: "100%", justifyContent: "center", height: "40px" }}
            icon={<Linkedin size={16} color="#0a66c2" />}
          >
            Continue with LinkedIn
          </Button>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
          <span style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            or with email
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex.chen@jobpilot.dev"
            leftIcon={<Mail size={15} />}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            leftIcon={<Lock size={15} />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            style={{ width: "100%", marginTop: "4px" }}
          >
            Sign In
          </Button>
        </form>

        {/* 1-Click Demo Fast Track */}
        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleDemoLogin}
            disabled={isLoading}
            style={{ width: "100%", fontSize: "12.5px" }}
            icon={<Zap size={14} color="var(--accent-amber)" />}
          >
            1-Click Demo Login (Staff Engineer)
          </Button>
        </div>
      </div>

      {/* Footer Link */}
      <div style={{ textAlign: "center", marginTop: "18px" }}>
        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Don&apos;t have an account?{" "}
        </span>
        <Link
          href="/register"
          style={{ fontSize: "13px", color: "var(--text-main)", fontWeight: 600, textDecoration: "underline" }}
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading authentication...</div>}>
      <LoginForm />
    </Suspense>
  );
}
