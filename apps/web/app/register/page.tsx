"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { User, Mail, Lock, Briefcase } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();

  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await register(
      email,
      password,
      fullName,
      headline || "Software Engineer"
    );

    setIsLoading(false);

    if (res.success) {
      router.push("/");
    } else {
      setErrorMessage(res.error || "Registration failed. Please try again.");
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const res = await loginWithGoogle({
      email: "new.engineer.google@gmail.com",
      full_name: fullName || "New Engineer",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    });
    setIsLoading(false);

    if (res.success) {
      router.push("/");
    } else {
      setErrorMessage(res.error || "Google sign-up failed.");
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      {/* Brand Header */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "14px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "#131929",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px",
            }}
          >
            <img src="/logo-dark.png" alt="JobPilot" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "-0.02em" }}>
              Job<span style={{ color: "var(--accent-primary)" }}>Pilot</span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Career OS
            </div>
          </div>
        </Link>
        <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>Create your account</h1>
        <p style={{ fontSize: "13.5px", color: "var(--text-muted)" }}>
          Join the closed-loop autonomous career platform
        </p>
      </div>

      {/* Auth Card */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "26px",
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

        {/* Google SSO Button */}
        <Button
          type="button"
          variant="secondary"
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          style={{ width: "100%", marginBottom: "16px" }}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          }
        >
          Sign up with Google
        </Button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
          <span style={{ fontSize: "11.5px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            or with email
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Input
            label="Full Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Alex Chen"
            leftIcon={<User size={15} />}
            required
          />

          <Input
            label="Professional Title"
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Staff Distributed Systems Architect"
            leftIcon={<Briefcase size={15} />}
          />

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
            label="Password (min. 6 characters)"
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
            style={{ width: "100%", marginTop: "6px" }}
          >
            Create Account
          </Button>
        </form>
      </div>

      {/* Footer Link */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Already have an account?{" "}
        </span>
        <Link
          href="/login"
          style={{ fontSize: "13px", color: "var(--accent-primary)", fontWeight: 600, textDecoration: "none" }}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
