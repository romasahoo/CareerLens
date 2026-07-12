"use client";

import { signIn } from "next-auth/react";
import { Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState(null, "", "/login");
    }
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(circle at 50% -20%, #1e3a8a 0%, #0f172a 60%, #020617 100%)",
      padding: 24,
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Optional mesh background effects */}
      <div style={{
        position: "absolute", top: "10%", left: "15%", width: 300, height: 300,
        background: "#3b82f6", borderRadius: "50%", filter: "blur(120px)", opacity: 0.15, pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "15%", width: 300, height: 300,
        background: "#8b5cf6", borderRadius: "50%", filter: "blur(120px)", opacity: 0.15, pointerEvents: "none"
      }} />

      <div style={{
        position: "relative",
        background: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 24,
        padding: "48px 40px",
        width: "100%",
        maxWidth: 420,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        textAlign: "center"
      }}>
        <div style={{
          width: 56, height: 56,
          margin: "0 auto 24px",
          background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
          borderRadius: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px rgba(37,99,235,0.4)"
        }}>
          <Zap size={28} color="#fff" fill="#fff" />
        </div>
        
        <h1 style={{
          fontWeight: 800, fontSize: 28, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 8px"
        }}>
          Welcome Back
        </h1>
        <p style={{ color: "#94A3B8", fontSize: 15, margin: "0 0 40px", lineHeight: 1.5 }}>
          Sign in to save your searches and get customized job notifications.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <button
            onClick={() => signIn("github", { callbackUrl })}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              width: "100%", height: 52, borderRadius: 12,
              background: "#1E293B", color: "#fff", border: "1px solid #334155",
              fontWeight: 600, fontSize: 15, cursor: "pointer",
              transition: "all 0.2s ease", fontFamily: "inherit"
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#0F172A"; (e.currentTarget as HTMLElement).style.borderColor = "#475569"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#1E293B"; (e.currentTarget as HTMLElement).style.borderColor = "#334155"; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>

          <button
            onClick={() => signIn("google", { callbackUrl })}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              width: "100%", height: 52, borderRadius: 12,
              background: "#fff", color: "#0F172A", border: "1px solid #E4E8F0",
              fontWeight: 600, fontSize: 15, cursor: "pointer",
              transition: "all 0.2s ease", fontFamily: "inherit"
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F8FAFC"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0f172a" }}></div>}>
      <LoginContent />
    </Suspense>
  );
}
