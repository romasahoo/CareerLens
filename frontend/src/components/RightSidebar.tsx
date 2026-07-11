"use client";
import { TrendingUp, Building2, BarChart3, Clock, ArrowUpRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "./ThemeContext";
import { Job } from "./JobCard";

interface RightSidebarProps {
  jobs: Job[];
  recentlyViewed: Job[];
  onJobClick: (job: Job) => void;
}

const TRENDING_SKILLS = [
  { name: "FastAPI",     growth: 42, hot: true  },
  { name: "Python 3.12", growth: 38, hot: true  },
  { name: "PostgreSQL",  growth: 31, hot: false },
  { name: "Docker",      growth: 27, hot: false },
  { name: "Kubernetes",  growth: 24, hot: false },
  { name: "Redis",       growth: 19, hot: false },
];

const TOP_COMPANIES = [
  { name: "MedTech GmbH",    logo: "MT", jobs: 12, color: "#2563EB" },
  { name: "Fintech AG",       logo: "FA", jobs: 9,  color: "#7C3AED" },
  { name: "Startup Hub",      logo: "SH", jobs: 7,  color: "#16A34A" },
  { name: "TechCorp Munich",  logo: "TC", jobs: 6,  color: "#D97706" },
  { name: "DataSystems GmbH", logo: "DS", jobs: 5,  color: "#EF4444" },
];

function Widget({ title, icon: Icon, children, dark }: {
  title: string; icon: React.ElementType; children: React.ReactNode; dark: boolean;
}) {
  return (
    <div style={{
      background: dark ? "#111827" : "#FFFFFF",
      border: `1px solid ${dark ? "#1F2D45" : "#E4E8F0"}`,
      borderRadius: 16, padding: "18px 20px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
        <div style={{
          width: 30, height: 30,
          background: dark ? "rgba(37,99,235,0.15)" : "#EFF6FF",
          borderRadius: 9,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={14} color="#2563EB" />
        </div>
        <h3 style={{ fontWeight: 700, fontSize: 13.5, color: dark ? "#E2E8F0" : "#0F172A", margin: 0 }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

export default function RightSidebar({ jobs, recentlyViewed, onJobClick }: RightSidebarProps) {
  const { theme } = useTheme();
  const dark = theme === "dark";

  const totalJobs = jobs.length;
  const remoteJobs = jobs.filter(j => j.remote).length;
  const remotePercent = totalJobs > 0 ? Math.round((remoteJobs / totalJobs) * 100) : 0;
  const fullTimeJobs = jobs.filter(j => (j.job_type || "").toLowerCase().includes("full")).length;

  const bar = (pct: number) => (
    <div style={{ height: 5, background: dark ? "#1F2D45" : "#F1F5F9", borderRadius: 99, overflow: "hidden", marginTop: 5 }}>
      <div style={{
        height: "100%", borderRadius: 99, width: `${pct * 2}%`,
        background: "linear-gradient(90deg, #2563EB, #60A5FA)",
        transition: "width 0.8s cubic-bezier(.22,1,.36,1)",
      }} />
    </div>
  );

  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 14 }} aria-label="Job insights">
      {/* Trending Skills */}
      <Widget title="Trending Skills" icon={TrendingUp} dark={dark}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {TRENDING_SKILLS.map(s => (
            <div key={s.name}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: dark ? "#CBD5E1" : "#1E293B" }}>
                  {s.name}
                  {s.hot && (
                    <span style={{ fontSize: 9, fontWeight: 800, background: "#FEF2F2", color: "#DC2626", padding: "1px 5px", borderRadius: 99 }}>
                      HOT
                    </span>
                  )}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 11.5, color: "#16A34A", fontWeight: 700 }}>
                  <ArrowUpRight size={11} />{s.growth}%
                </span>
              </div>
              {bar(s.growth)}
            </div>
          ))}
        </div>
      </Widget>

      {/* Top Companies */}
      <Widget title="Top Hiring Companies" icon={Building2} dark={dark}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {TOP_COMPANIES.map(co => (
            <div key={co.name} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 6px", borderRadius: 8, cursor: "pointer", transition: "background 0.15s",
            }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = dark ? "#1A2535" : "#F8FAFC")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: co.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 11, fontWeight: 800, flexShrink: 0,
              }}>
                {co.logo}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: dark ? "#CBD5E1" : "#1E293B" }}>{co.name}</div>
                <div style={{ fontSize: 11, color: dark ? "#4B5563" : "#94A3B8" }}>{co.jobs} open roles</div>
              </div>
            </div>
          ))}
        </div>
      </Widget>

      {/* Statistics */}
      <Widget title="Job Statistics" icon={BarChart3} dark={dark}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Total",      value: totalJobs,       color: "#2563EB" },
            { label: "Remote",     value: `${remotePercent}%`, color: "#16A34A" },
            { label: "Full-time",  value: fullTimeJobs,    color: "#7C3AED" },
            { label: "New today",  value: Math.min(totalJobs, 6), color: "#D97706" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: dark ? "#1A2535" : "#F8FAFC",
              border: `1px solid ${dark ? "#1F2D45" : "#F1F5F9"}`,
              borderRadius: 10, padding: "10px 12px",
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 11, color: dark ? "#4B5563" : "#94A3B8", marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
      </Widget>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <Widget title="Recently Viewed" icon={Clock} dark={dark}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {recentlyViewed.slice(0, 4).map(job => (
              <div
                key={job.id}
                onClick={() => onJobClick(job)}
                style={{
                  display: "flex", gap: 9, cursor: "pointer", padding: "7px 6px",
                  borderRadius: 8, transition: "background 0.15s",
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = dark ? "#1A2535" : "#F8FAFC")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: "linear-gradient(135deg,#2563EB,#7C3AED)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 10, fontWeight: 800, flexShrink: 0,
                }}>
                  {(job.company || "?").slice(0, 2).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 12, fontWeight: 600, color: dark ? "#CBD5E1" : "#1E293B",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {job.title}
                  </div>
                  <div style={{ fontSize: 11, color: dark ? "#4B5563" : "#94A3B8" }}>
                    {job.posted_date ? formatDistanceToNow(new Date(job.posted_date), { addSuffix: true }) : "Recently"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Widget>
      )}
    </aside>
  );
}
