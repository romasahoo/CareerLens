"use client";
import { Home, Search, Bookmark, User, SlidersHorizontal } from "lucide-react";

interface MobileNavProps {
  onFilterOpen: () => void;
  savedCount: number;
}

const navItems = [
  { id: "home",   icon: Home,              label: "Home" },
  { id: "search", icon: Search,            label: "Search" },
  { id: "filter", icon: SlidersHorizontal, label: "Filters", isAction: true },
  { id: "saved",  icon: Bookmark,          label: "Saved" },
  { id: "profile",icon: User,              label: "Profile" },
];

export default function MobileNav({ onFilterOpen, savedCount }: MobileNavProps) {
  return (
    <nav className="mobile-nav md:hidden" aria-label="Mobile navigation">
      {navItems.map(({ id, icon: Icon, label, isAction }) => (
        <button
          key={id}
          id={`mobile-nav-${id}`}
          aria-label={label}
          onClick={isAction ? onFilterOpen : undefined}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "3px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.04em",
            padding: "6px 12px",
            borderRadius: "var(--radius-sm)",
            transition: "color 0.15s ease",
            position: "relative",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--blue)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <span style={{ position: "relative" }}>
            <Icon size={20} />
            {id === "saved" && savedCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -5,
                  background: "#EF4444",
                  color: "#fff",
                  borderRadius: "99px",
                  fontSize: "9px",
                  fontWeight: 800,
                  padding: "0 4px",
                  minWidth: "14px",
                  textAlign: "center",
                  lineHeight: "14px",
                }}
              >
                {savedCount}
              </span>
            )}
          </span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
