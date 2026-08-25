import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "JobPilot — AI Career Operating System",
  description:
    "An AI-powered closed-loop career operating system: KNOW → MATCH → GAP → IMPROVE → PROVE → APPLY → OUTCOME → KNOW.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
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
