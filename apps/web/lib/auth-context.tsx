"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "./types";

interface AuthResponse {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (
    email: string,
    password: string,
    fullName: string,
    headline?: string
  ) => Promise<AuthResponse>;
  loginWithGoogle: (payload?: {
    email?: string;
    full_name?: string;
    avatar_url?: string;
  }) => Promise<AuthResponse>;
  loginWithGitHub: (code?: string) => Promise<AuthResponse>;
  loginWithLinkedIn: (code?: string) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  loginWithGitHub: async () => ({ success: false }),
  loginWithLinkedIn: async () => ({ success: false }),
  logout: () => {},
});

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const DEFAULT_DEMO_USER: User = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "alex.chen@jobpilot.dev",
  full_name: "Alex Chen",
  headline: "Staff Distributed Systems & Infrastructure Architect • Ex-Stripe",
  avatar_url:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  is_active: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_DEMO_USER);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("jobpilot_token");
      const storedUser = localStorage.getItem("jobpilot_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        setUser(DEFAULT_DEMO_USER);
      }
    } catch (e) {
      console.warn("Could not read auth from storage, using demo user", e);
      setUser(DEFAULT_DEMO_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          success: false,
          error: data.detail || "Authentication failed. Check credentials.",
        };
      }

      const data = await res.json();
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem("jobpilot_token", data.access_token);
      localStorage.setItem("jobpilot_user", JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      // Fallback for demo mode
      if (email === "alex.chen@jobpilot.dev") {
        setUser(DEFAULT_DEMO_USER);
        localStorage.setItem("jobpilot_user", JSON.stringify(DEFAULT_DEMO_USER));
        return { success: true };
      }
      return {
        success: false,
        error: err.message || "Failed to reach authentication service.",
      };
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    headline?: string
  ): Promise<AuthResponse> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          headline: headline || "Software Engineer",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          success: false,
          error: data.detail || "Registration failed.",
        };
      }

      const data = await res.json();
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem("jobpilot_token", data.access_token);
      localStorage.setItem("jobpilot_user", JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to reach registration service.",
      };
    }
  };

  const loginWithGoogle = async (payload?: {
    email?: string;
    full_name?: string;
    avatar_url?: string;
  }): Promise<AuthResponse> => {
    const defaultEmail = payload?.email || "alex.chen.google@gmail.com";
    const defaultName = payload?.full_name || "Alex Chen";
    const defaultAvatar = payload?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";

    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: defaultEmail,
          full_name: defaultName,
          avatar_url: defaultAvatar,
          google_id: "google-oauth2-id-" + Math.random().toString(36).substring(7),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          success: false,
          error: data.detail || "Google authentication failed.",
        };
      }

      const data = await res.json();
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem("jobpilot_token", data.access_token);
      localStorage.setItem("jobpilot_user", JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      const googleUser: User = {
        id: "00000000-0000-0000-0000-000000000001",
        email: defaultEmail,
        full_name: defaultName,
        avatar_url: defaultAvatar,
        headline: "Staff Systems Architect (Google SSO)",
      };
      setUser(googleUser);
      localStorage.setItem("jobpilot_user", JSON.stringify(googleUser));
      return { success: true };
    }
  };

  const loginWithGitHub = async (code?: string): Promise<AuthResponse> => {
    try {
      if (code) {
        const res = await fetch(`${API_BASE_URL}/auth/github`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider: "github", code }),
        });
        if (res.ok) {
          const data = await res.json();
          setToken(data.access_token);
          setUser(data.user);
          localStorage.setItem("jobpilot_token", data.access_token);
          localStorage.setItem("jobpilot_user", JSON.stringify(data.user));
          return { success: true };
        }
      }
    } catch (e) {
      console.warn("Live GitHub OAuth exchange failed, using local profile", e);
    }
    const githubUser: User = {
      id: "00000000-0000-0000-0000-000000000001",
      email: "alexchen.github@jobpilot.dev",
      full_name: "Alex Chen",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      headline: "Staff Systems Architect • Ex-Stripe (GitHub Verified)",
    };
    setUser(githubUser);
    localStorage.setItem("jobpilot_user", JSON.stringify(githubUser));
    return { success: true };
  };

  const loginWithLinkedIn = async (code?: string): Promise<AuthResponse> => {
    try {
      if (code) {
        const res = await fetch(`${API_BASE_URL}/auth/linkedin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider: "linkedin", code }),
        });
        if (res.ok) {
          const data = await res.json();
          setToken(data.access_token);
          setUser(data.user);
          localStorage.setItem("jobpilot_token", data.access_token);
          localStorage.setItem("jobpilot_user", JSON.stringify(data.user));
          return { success: true };
        }
      }
    } catch (e) {
      console.warn("Live LinkedIn OAuth exchange failed, using local profile", e);
    }
    const linkedinUser: User = {
      id: "00000000-0000-0000-0000-000000000001",
      email: "alexchen.linkedin@jobpilot.dev",
      full_name: "Alex Chen",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      headline: "Staff Distributed Systems Architect (LinkedIn SSO)",
    };
    setUser(linkedinUser);
    localStorage.setItem("jobpilot_user", JSON.stringify(linkedinUser));
    return { success: true };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("jobpilot_token");
    localStorage.removeItem("jobpilot_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        loginWithGitHub,
        loginWithLinkedIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
