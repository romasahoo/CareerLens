"use client";
import { MapPin, Briefcase, Clock, ExternalLink, Bookmark, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "./ThemeContext";

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  job_type: string;
  remote: boolean;
  url: string;
  source: string;
  posted_date: string;
}

interface JobCardProps {
  job: Job;
  isBookmarked: boolean;
  onBookmark: (id: number) => void;
  onClick: (job: Job) => void;
  index?: number;
}

const GRADIENTS = [
  "linear-gradient(135deg,#2563EB,#7C3AED)",
  "linear-gradient(135deg,#0EA5E9,#2563EB)",
  "linear-gradient(135deg,#16A34A,#0D9488)",
  "linear-gradient(135deg,#D97706,#EF4444)",
  "linear-gradient(135deg,#7C3AED,#EC4899)",
  "linear-gradient(135deg,#0F766E,#16A34A)",
  "linear-gradient(135deg,#6366F1,#2563EB)",
  "linear-gradient(135deg,#BE185D,#7C3AED)",
];

function companyGradient(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}

function initials(name: string) {
  return (name || "?")
    .split(/[\s\-&]+/).filter(Boolean).slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? "").join("") || "??";
}

const SOURCE_BADGE: Record<string, { bg: string; color: string }> = {
  "Arbeitnow":                { bg: "#EFF6FF", color: "#1D4ED8" },
  "RapidAPI":                 { bg: "#F5F3FF", color: "#6D28D9" },
  "LinkedIn":                 { bg: "#E0F2FE", color: "#0369A1" },
  "StepStone":                { bg: "#FFF7ED", color: "#C2410C" },
};
function sourceBadge(source: string) {
  for (const [k, v] of Object.entries(SOURCE_BADGE)) if (source.includes(k)) return v;
  return { bg: "#F1F5F9", color: "#475569" };
}

const SKILL_KEYWORDS: [string, string[]][] = [
  ["fastapi",  ["FastAPI", "Pydantic", "Starlette"]],
  ["django",   ["Django", "Django REST", "Celery"]],
  ["python",   ["Python", "SQLAlchemy", "Pytest"]],
  ["backend",  ["REST API", "Docker", "PostgreSQL"]],
  ["senior",   ["Architecture", "Mentoring", "Code Review"]],
  ["devops",   ["Docker", "Kubernetes", "Terraform"]],
  ["data",     ["Pandas", "NumPy", "SQL"]],
];

function deriveTags(job: Job): string[] {
  const lower = (job.title + " " + job.source).toLowerCase();
  const tags = new Set<string>();
  for (const [kw, skills] of SKILL_KEYWORDS) if (lower.includes(kw)) skills.forEach(s => tags.add(s));
  tags.add("Git");
  if (job.remote) tags.add("Remote-friendly");
  return [...tags].slice(0, 5);
}

function aiSummary(job: Job) {
  return `${job.company || "This company"} is hiring a ${job.title}. You'll build scalable backend systems and APIs in a collaborative engineering team.`;
}

export default function JobCard({ job, isBookmarked, onBookmark, onClick, index = 0 }: JobCardProps) {
  const { theme } = useTheme();
  const dark = theme === "dark";

  const tags = deriveTags(job);
  const visibleTags = tags.slice(0, 4);
  const extra = tags.length - visibleTags.length;
  const sb = sourceBadge(job.source);
  const postedAgo = job.posted_date
    ? formatDistanceToNow(new Date(job.posted_date), { addSuffix: true })
    : "Recently";

  const card: React.CSSProperties = {
    background: dark ? "#111827" : "#FFFFFF",
    border: `1px solid ${dark ? "#1F2D45" : "#E4E8F0"}`,
    borderRadius: 16,
    padding: "20px 22px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    cursor: "pointer",
    transition: "box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
    animationDelay: `${index * 45}ms`,
  };

  const badgeBase: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "3px 9px", borderRadius: 999,
    fontSize: 11.5, fontWeight: 600, letterSpacing: "0.02em", whiteSpace: "nowrap",
  };

  return (
    <article
      className={`fade-up s${Math.min(index, 7)}`}
      style={card}
      onClick={() => onClick(job)}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = "0 8px 32px rgba(37,99,235,0.12)";
        el.style.borderColor = "#BFDBFE";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = "none";
        el.style.borderColor = dark ? "#1F2D45" : "#E4E8F0";
        el.style.transform = "translateY(0)";
      }}
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick(job)}
      aria-label={`${job.title} at ${job.company}`}
      role="button"
    >
      {/* ── Row 1: Avatar + Header ─────────────────────────── */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {/* Company avatar */}
        <div style={{
          width: 50, height: 50, borderRadius: 13, flexShrink: 0,
          background: companyGradient(job.company || "?"),
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 800, fontSize: 15,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}>
          {initials(job.company)}
        </div>

        {/* Title + company + bookmark */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{
              fontWeight: 700, fontSize: 15.5,
              color: dark ? "#E2E8F0" : "#0F172A",
              margin: 0, lineHeight: 1.3, letterSpacing: "-0.01em",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              transition: "color 0.15s",
            }}>
              {job.title}
            </h3>
            <p style={{ fontSize: 13, color: dark ? "#64748B" : "#64748B", fontWeight: 500, margin: "3px 0 0" }}>
              {job.company}
            </p>
          </div>
          <button
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
            onClick={e => { e.stopPropagation(); onBookmark(job.id); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: 4, borderRadius: 8, flexShrink: 0,
              color: isBookmarked ? "#2563EB" : dark ? "#4B5563" : "#CBD5E1",
              transition: "color 0.15s, transform 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.15)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
          >
            <Bookmark size={17} fill={isBookmarked ? "#2563EB" : "none"} />
          </button>
        </div>
      </div>

      {/* ── Row 2: Meta badges ─────────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        {/* Location */}
        <span style={{
          ...badgeBase,
          background: dark ? "#1A2535" : "#F1F5F9",
          color: dark ? "#94A3B8" : "#475569",
        }}>
          <MapPin size={11} /> {job.location || "Munich"}
        </span>

        {/* Job type */}
        <span style={{
          ...badgeBase,
          background: dark ? "#1C2A1C" : "#F0FDF4",
          color: "#16A34A",
        }}>
          <Briefcase size={11} /> {job.job_type || "Full-time"}
        </span>

        {/* Remote */}
        {job.remote && (
          <span style={{ ...badgeBase, background: "#DCFCE7", color: "#15803D" }}>
            🌐 Remote
          </span>
        )}

        {/* Source */}
        <span style={{ ...badgeBase, background: sb.bg, color: sb.color }}>
          {job.source.split(" ")[0]}
        </span>

        {/* Posted */}
        <span style={{
          marginLeft: "auto", display: "flex", alignItems: "center", gap: 4,
          fontSize: 11.5, color: dark ? "#4B5563" : "#94A3B8",
        }}>
          <Clock size={11} /> {postedAgo}
        </span>
      </div>

      {/* ── Row 3: AI Summary ─────────────────────────────── */}
      <div style={{
        background: dark ? "rgba(37,99,235,0.1)" : "#EFF6FF",
        border: `1px solid ${dark ? "rgba(37,99,235,0.2)" : "#BFDBFE"}`,
        borderRadius: 10, padding: "9px 13px",
        display: "flex", gap: 9, alignItems: "flex-start",
      }}>
        <Sparkles size={13} color="#2563EB" style={{ marginTop: 1, flexShrink: 0 }} />
        <p style={{
          fontSize: 12.5, color: dark ? "#94A3B8" : "#3B5BAD",
          margin: 0, lineHeight: 1.55,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}>
          {aiSummary(job)}
        </p>
      </div>

      {/* ── Row 4: Skills + Apply ──────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {visibleTags.map(tag => (
            <span key={tag} style={{
              display: "inline-flex", alignItems: "center",
              padding: "3px 10px", borderRadius: 999,
              fontSize: 11.5, fontWeight: 500,
              background: dark ? "#1A2535" : "#F1F5F9",
              color: dark ? "#64748B" : "#475569",
              border: `1px solid ${dark ? "#1F2D45" : "#E4E8F0"}`,
            }}>
              {tag}
            </span>
          ))}
          {extra > 0 && (
            <span style={{
              display: "inline-flex", alignItems: "center",
              padding: "3px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 600,
              background: "#EFF6FF", color: "#2563EB",
              border: "1px solid #BFDBFE",
            }}>
              +{extra} more
            </span>
          )}
        </div>

        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          id={`apply-${job.id}`}
          onClick={e => e.stopPropagation()}
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "8px 16px", borderRadius: 9,
            background: "#EFF6FF", color: "#2563EB",
            fontWeight: 600, fontSize: 13, textDecoration: "none",
            border: "1.5px solid #BFDBFE",
            transition: "all 0.15s ease", flexShrink: 0,
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = "#2563EB"; el.style.color = "#fff";
            el.style.borderColor = "#2563EB";
            el.style.boxShadow = "0 4px 12px rgba(37,99,235,0.35)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = "#EFF6FF"; el.style.color = "#2563EB";
            el.style.borderColor = "#BFDBFE"; el.style.boxShadow = "none";
          }}
        >
          Apply <ExternalLink size={12} />
        </a>
      </div>
    </article>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────── */
export function JobCardSkeleton({ dark = false }: { dark?: boolean }) {
  const bg = dark ? "#111827" : "#fff";
  const sk = dark ? "#1F2D45" : "#E4E8F0";
  return (
    <div style={{
      background: bg, border: `1px solid ${sk}`, borderRadius: 16, padding: "20px 22px",
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      <div style={{ display: "flex", gap: 14 }}>
        <div className="skeleton" style={{ width: 50, height: 50, borderRadius: 13, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 18, width: "55%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 13, width: "35%" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[90, 80, 65, 55].map((w, i) => (
          <div key={i} className="skeleton" style={{ height: 24, width: w, borderRadius: 999 }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: 46, borderRadius: 10 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[70, 60, 55].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: 24, width: w, borderRadius: 999 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 34, width: 80, borderRadius: 9 }} />
      </div>
    </div>
  );
}
