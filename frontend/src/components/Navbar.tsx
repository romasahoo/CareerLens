"use client";
import { Search, Bell, Sun, Moon, ChevronDown, Zap } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit: () => void;
}

export default function Navbar({ searchQuery, onSearchChange, onSearchSubmit }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const [focused, setFocused] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (session) {
      const fetchNotifs = async () => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
          const res = await fetch(`${baseUrl}/api/notifications`, {
            headers: {
              "Authorization": `Bearer ${(session as any).provider}|${(session as any).accessToken}`
            }
          });
          if (res.ok) setNotifications(await res.json());
        } catch (e) {}
      };
      fetchNotifs();
    }
  }, [session]);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const dark = theme === "dark";

  const nav: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 100,
    height: 68,
    background: dark ? "rgba(10,17,32,0.95)" : "rgba(255,255,255,0.95)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: `1px solid ${dark ? "#1F2D45" : "#E4E8F0"}`,
    display: "flex",
    alignItems: "center",
    padding: "0 32px",
    gap: 20,
  };

  const inner: React.CSSProperties = {
    width: "100%",
    maxWidth: 1440,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: 20,
  };

  const iconBtn: React.CSSProperties = {
    width: 38,
    height: 38,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: `1.5px solid ${dark ? "#1F2D45" : "#E4E8F0"}`,
    borderRadius: 10,
    cursor: "pointer",
    color: dark ? "#94A3B8" : "#475569",
    transition: "all 0.15s ease",
    flexShrink: 0,
  };

  return (
    <header style={nav}>
      <div style={inner}>
        {/* Logo */}
        <a
          href="/"
          id="nav-logo"
          style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", flexShrink: 0 }}
        >
          <div style={{
            width: 34, height: 34,
            background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
          }}>
            <Zap size={17} color="#fff" fill="#fff" />
          </div>
          <span style={{
            fontWeight: 800, fontSize: 20, letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #2563EB, #7C3AED)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            CareerLens
          </span>
        </a>

        {/* Search bar */}
        <div style={{ flex: 1, maxWidth: 580, margin: "0 auto", position: "relative" }}>
          <Search size={17} style={{
            position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
            color: focused ? "#2563EB" : "#94A3B8", pointerEvents: "none", transition: "color 0.15s",
          }} />
          <input
            id="global-search"
            type="search"
            placeholder="Search Python, FastAPI, PostgreSQL jobs..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onSearchSubmit()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label="Search jobs"
            style={{
              width: "100%",
              height: 46,
              paddingLeft: 46,
              paddingRight: 110,
              border: `2px solid ${focused ? "#2563EB" : dark ? "#1F2D45" : "#E4E8F0"}`,
              borderRadius: 999,
              fontSize: 14,
              fontFamily: "inherit",
              fontWeight: 400,
              background: dark ? "#111827" : "#F8FAFC",
              color: dark ? "#E2E8F0" : "#0F172A",
              outline: "none",
              transition: "border-color 0.15s ease, box-shadow 0.15s ease",
              boxShadow: focused ? "0 0 0 4px rgba(37,99,235,0.12)" : "none",
            }}
          />
          <button
            onClick={onSearchSubmit}
            style={{
              position: "absolute", right: 5, top: "50%", transform: "translateY(-50%)",
              background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
              color: "#fff", border: "none", borderRadius: 999,
              padding: "8px 22px", fontWeight: 700, fontSize: 13, fontFamily: "inherit",
              cursor: "pointer", transition: "opacity 0.15s",
              boxShadow: "0 2px 8px rgba(37,99,235,0.4)",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            Search
          </button>
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <button
              id="nav-notifications"
              aria-label="Notifications"
              onClick={() => {
                if (!session) return alert("Please sign in to view notifications");
                setNotificationsOpen(!notificationsOpen);
              }}
              style={{ ...iconBtn }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark ? "#1F2D45" : "#F0F4FF"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: 7, right: 7,
                  width: 7, height: 7, borderRadius: "50%", background: "#EF4444",
                  border: `2px solid ${dark ? "#111827" : "#fff"}`,
                }} />
              )}
            </button>

            {notificationsOpen && (
              <div style={{
                position: "absolute", top: "100%", right: 0, marginTop: 8,
                background: dark ? "#111827" : "#fff",
                border: `1px solid ${dark ? "#1F2D45" : "#E4E8F0"}`,
                borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                width: 280, zIndex: 10, maxHeight: 300, overflowY: "auto"
              }}>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${dark ? "#1F2D45" : "#E4E8F0"}`, fontWeight: 600, fontSize: 14, color: dark ? "#E2E8F0" : "#0F172A" }}>
                  Notifications
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: 20, textAlign: "center", fontSize: 13, color: dark ? "#94A3B8" : "#64748B" }}>
                    No new notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{
                      padding: "10px 14px", borderBottom: `1px solid ${dark ? "#1F2D45" : "#E4E8F0"}`,
                      background: n.is_read ? "transparent" : (dark ? "rgba(37,99,235,0.1)" : "#EFF6FF")
                    }}>
                      <div style={{ fontSize: 13, color: dark ? "#E2E8F0" : "#0F172A", marginBottom: 4 }}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            id="nav-theme-toggle"
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
            style={iconBtn}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark ? "#1F2D45" : "#F0F4FF"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            {dark ? <Sun size={17} color="#F59E0B" /> : <Moon size={17} />}
          </button>

          <div style={{ width: 1, height: 26, background: dark ? "#1F2D45" : "#E4E8F0" }} />

          {session ? (
            <div style={{ position: "relative" }}>
              <button
                id="nav-profile"
                aria-label="User profile"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  background: "none", border: "none", cursor: "pointer", padding: "4px 8px 4px 4px",
                  borderRadius: 10, transition: "background 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark ? "#1F2D45" : "#F0F4FF"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}
              >
                {session.user?.image ? (
                  <img src={session.user.image} alt="Avatar" style={{ width: 34, height: 34, borderRadius: "50%" }} />
                ) : (
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 800, fontSize: 12, letterSpacing: 0.5,
                  }}>
                    {session.user?.name?.substring(0, 2).toUpperCase() || "U"}
                  </div>
                )}
                <ChevronDown size={13} color={dark ? "#94A3B8" : "#64748B"} />
              </button>
              
              {profileMenuOpen && (
                <div style={{
                  position: "absolute", top: "100%", right: 0, marginTop: 8,
                  background: dark ? "#111827" : "#fff",
                  border: `1px solid ${dark ? "#1F2D45" : "#E4E8F0"}`,
                  borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  padding: 8, minWidth: 160, zIndex: 10
                }}>
                  <div style={{ padding: "8px 12px", borderBottom: `1px solid ${dark ? "#1F2D45" : "#E4E8F0"}`, marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: dark ? "#fff" : "#0F172A" }}>{session.user?.name}</div>
                    <div style={{ fontSize: 12, color: dark ? "#94A3B8" : "#64748B" }}>{session.user?.email}</div>
                  </div>
                  <button
                    onClick={() => signOut()}
                    style={{
                      width: "100%", textAlign: "left", padding: "8px 12px",
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 14, color: "#EF4444", borderRadius: 6
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark ? "#1F2D45" : "#FEE2E2"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              style={{
                background: "transparent",
                color: dark ? "#E2E8F0" : "#0F172A",
                border: `1.5px solid ${dark ? "#1F2D45" : "#E4E8F0"}`,
                borderRadius: 999,
                padding: "8px 16px",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark ? "#1F2D45" : "#F8FAFC"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
