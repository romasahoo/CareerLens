"use client";
import { useState } from "react";
import { X, ChevronDown, ChevronUp, MapPin, Briefcase, Layers, Code2, Clock, Globe } from "lucide-react";
import { useTheme } from "./ThemeContext";

export interface Filters {
  locations: string[];
  experience: string[];
  sources: string[];
  skills: string[];
  types: string[];
  language: string[];
}

export const EMPTY_FILTERS: Filters = {
  locations: [], experience: [], sources: [], skills: [], types: [], language: [],
};

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onApply: () => void;
  isDrawer?: boolean;
  onClose?: () => void;
}

const OPTIONS = {
  locations:  ["Munich", "Berlin", "Remote", "Hybrid", "Germany"],
  experience: ["Junior", "Mid-level", "Senior", "Lead", "Staff"],
  sources:    ["Arbeitnow", "RapidAPI (Active Jobs DB)", "LinkedIn", "Indeed", "Glassdoor", "StepStone", "XING"],
  skills:     ["Python", "FastAPI", "Django", "PostgreSQL", "Docker", "AWS", "Kubernetes", "Redis", "GraphQL", "TypeScript"],
  types:      ["Full-time", "Part-time", "Contract", "Freelance", "Internship"],
  language:   ["English Only"],
};

const SECTIONS: { key: keyof typeof OPTIONS; label: string; icon: React.ElementType }[] = [
  { key: "locations",  label: "Location",         icon: MapPin },
  { key: "experience", label: "Experience Level",  icon: Briefcase },
  { key: "sources",    label: "Job Source",        icon: Layers },
  { key: "skills",     label: "Skills",            icon: Code2 },
  { key: "types",      label: "Employment Type",   icon: Clock },
  { key: "language",   label: "Language",          icon: Globe },
];

function AccordionSection({
  label, icon: Icon, options, selected, onToggle, dark,
}: {
  label: string;
  icon: React.ElementType;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  dark: boolean;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
          padding: "6px 0", marginBottom: open ? 10 : 0,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Icon size={13} color="#2563EB" />
          <span style={{
            fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            color: dark ? "#94A3B8" : "#64748B",
          }}>
            {label}
          </span>
          {selected.length > 0 && (
            <span style={{
              background: "#2563EB", color: "#fff", borderRadius: 99,
              fontSize: 10, fontWeight: 700, padding: "1px 6px", lineHeight: "14px",
            }}>
              {selected.length}
            </span>
          )}
        </span>
        {open
          ? <ChevronUp size={13} color={dark ? "#4B5563" : "#94A3B8"} />
          : <ChevronDown size={13} color={dark ? "#4B5563" : "#94A3B8"} />
        }
      </button>

      {/* Chips */}
      {open && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {options.map(opt => {
            const active = selected.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => onToggle(opt)}
                aria-pressed={active}
                style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "5px 12px", borderRadius: 999,
                  fontSize: 12, fontWeight: 500, cursor: "pointer",
                  fontFamily: "inherit",
                  border: active ? "1.5px solid #2563EB" : `1.5px solid ${dark ? "#1F2D45" : "#E4E8F0"}`,
                  background: active ? "#2563EB" : dark ? "#1A2535" : "#F8FAFC",
                  color: active ? "#fff" : dark ? "#94A3B8" : "#475569",
                  transition: "all 0.15s ease",
                  userSelect: "none",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.borderColor = "#93C5FD";
                    (e.currentTarget as HTMLElement).style.color = "#2563EB";
                    (e.currentTarget as HTMLElement).style.background = "#EFF6FF";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.borderColor = dark ? "#1F2D45" : "#E4E8F0";
                    (e.currentTarget as HTMLElement).style.color = dark ? "#94A3B8" : "#475569";
                    (e.currentTarget as HTMLElement).style.background = dark ? "#1A2535" : "#F8FAFC";
                  }
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: dark ? "#1F2D45" : "#F1F5F9", marginTop: 16 }} />
    </div>
  );
}

export default function FilterSidebar({ filters, onChange, onApply, isDrawer = false, onClose }: FilterSidebarProps) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const totalActive = Object.values(filters).flat().length;

  const toggle = (key: keyof Filters, val: string) => {
    const cur = filters[key];
    onChange({ ...filters, [key]: cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val] });
  };

  const clearAll = () => onChange(EMPTY_FILTERS);

  const surface: React.CSSProperties = {
    background: dark ? "#111827" : "#FFFFFF",
    border: isDrawer ? "none" : `1px solid ${dark ? "#1F2D45" : "#E4E8F0"}`,
    borderRadius: isDrawer ? 0 : 16,
    padding: "20px 18px",
    boxShadow: isDrawer ? "none" : "0 1px 4px rgba(0,0,0,0.05)",
  };

  return (
    <aside style={{ ...surface, overflowY: "auto", maxHeight: isDrawer ? "100vh" : "calc(100vh - 110px)" }} aria-label="Job filters">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: dark ? "#E2E8F0" : "#0F172A" }}>
          Filters
          {totalActive > 0 && (
            <span style={{
              marginLeft: 8, background: "#EFF6FF", color: "#2563EB",
              borderRadius: 99, fontSize: 11, fontWeight: 700, padding: "1px 8px",
            }}>
              {totalActive} active
            </span>
          )}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {totalActive > 0 && (
            <button
              id="filter-clear"
              onClick={clearAll}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600, color: "#2563EB", fontFamily: "inherit", padding: "4px 8px",
              }}
            >
              Clear all
            </button>
          )}
          {isDrawer && onClose && (
            <button
              onClick={onClose}
              aria-label="Close filters"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: dark ? "#94A3B8" : "#475569", display: "flex", padding: 4,
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map(({ key, label, icon }) => (
        <AccordionSection
          key={key}
          label={label}
          icon={icon}
          options={OPTIONS[key]}
          selected={filters[key]}
          onToggle={val => toggle(key, val)}
          dark={dark}
        />
      ))}

      {/* Apply */}
      <button
        id="filter-apply"
        onClick={() => { onApply(); onClose?.(); }}
        style={{
          width: "100%", marginTop: 8,
          background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
          color: "#fff", border: "none", borderRadius: 10,
          padding: "11px 0", fontWeight: 700, fontSize: 14, fontFamily: "inherit",
          cursor: "pointer", transition: "opacity 0.15s",
          boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        Apply Filters
      </button>
    </aside>
  );
}
