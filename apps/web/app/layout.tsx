import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "JobPilot — AI Career Operating System",
  description:
    "An AI-powered closed-loop career operating system: KNOW → MATCH → GAP → IMPROVE → PROVE → APPLY → OUTCOME → KNOW.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="dark">
        <AuthProvider>
          <div className="app-container">
            <Sidebar />
            <div className="main-content">
              <Topbar />
              <main className="page-body">{children}</main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
