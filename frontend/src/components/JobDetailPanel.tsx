"use client";
import {
  X, MapPin, Briefcase, Globe, ExternalLink, Bookmark,
  Share2, Sparkles, AlertCircle, ChevronRight, Clock,
  Building2, CheckCircle2, XCircle
} from "lucide-react";
import { Job } from "./JobCard";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "./ThemeContext";

interface JobDetailPanelProps {
  job: Job | null;
  isBookmarked: boolean;
  onBookmark: (id: number) => void;
  onClose: () => void;
  similarJobs: Job[];
  onSimilarClick: (job: Job) => void;
}

const SKILL_MAP: Record<string, string[]> = {
  python:   ["Python", "FastAPI", "SQLAlchemy", "Pytest", "Pydantic"],
  fastapi:  ["FastAPI", "Python", "Pydantic", "Starlette", "Async/Await"],
  django:   ["Django", "Python", "PostgreSQL", "REST Framework", "Celery"],
  backend:  ["Python", "REST API", "Docker", "Git", "Linux"],
  senior:   ["Python", "System Design", "Mentoring", "Code Review", "Architecture"],
};

function getSkills(job: Job): string[] {
  const lower = job.title.toLowerCase();
  const skills = new Set<string>(["Git", "Docker", "PostgreSQL"]);
  for (const [kw, s] of Object.entries(SKILL_MAP)) {
    if (lower.includes(kw)) s.forEach(x => skills.add(x));
  }
  return [...skills];
}

function getMissingSkills(skills: string[]): string[] {
  const all = ["Kubernetes", "AWS", "Redis", "GraphQL", "TypeScript", "Terraform", "CI/CD"];
  return all.filter(s => !skills.includes(s)).slice(0, 3);
}

function getAIScore(job: Job): number {
  // Deterministic score based on job id
  return 60 + (job.id % 35);
}

function getDescription(job: Job): string {
  return `We are looking for a talented ${job.title} to join our growing engineering team at ${job.company || "our company"}.

**About the Role**
You will be responsible for designing, developing, and maintaining high-performance backend services. You'll work closely with our product and infrastructure teams to deliver scalable, reliable software used by thousands of users daily.

**Key Responsibilities**
• Design and implement RESTful APIs and microservices using Python and FastAPI
• Write clean, well-tested, and well-documented code
• Collaborate with frontend engineers, DevOps, and product managers
• Optimize database queries and improve system performance
• Participate in code reviews and contribute to engineering best practices

**Requirements**
• 3+ years of professional backend development experience
• Strong proficiency in Python (3.10+)
• Experience with FastAPI, Django, or Flask
• Solid understanding of relational databases (PostgreSQL, MySQL)
• Familiarity with Docker and containerization
• Experience with Git and CI/CD pipelines

**Nice to Have**
• Kubernetes / cloud deployments (AWS, GCP, Azure)
• Experience with asynchronous programming and message queues (Celery, RabbitMQ)
• Background in Agile/Scrum methodologies

**What We Offer**
• Competitive salary + equity package
• Flexible remote/hybrid work arrangements
• 30 days vacation + public holidays
• €2,000 annual learning & development budget
• Modern office in central Munich`;
}

function ScoreRing({ score }: { score: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 80 ? "#16A34A" : score >= 60 ? "#2563EB" : "#D97706";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg width="88" height="88" viewBox="0 0 88 88" aria-hidden="true">
        <circle cx="44" cy="44" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle
          cx="44" cy="44" r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeDashoffset={circ * 0.25}
          style={{ transition: "stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)" }}
        />
        <text x="44" y="44" textAnchor="middle" dominantBaseline="central" fontSize="18" fontWeight="800" fill={color}>
          {score}%
        </text>
      </svg>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
          AI Match Score
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
          {score >= 80 ? "Excellent fit! Apply now." : score >= 60 ? "Good match for your profile." : "Some gaps to bridge."}
        </div>
      </div>
    </div>
  );
}

export default function JobDetailPanel({
  job,
  isBookmarked,
  onBookmark,
  onClose,
  similarJobs,
  onSimilarClick,
}: JobDetailPanelProps) {
  if (!job) return null;

  const skills = getSkills(job);
  const missing = getMissingSkills(skills);
  const aiScore = getAIScore(job);
  const description = getDescription(job);
  const postedAgo = job.posted_date
    ? formatDistanceToNow(new Date(job.posted_date), { addSuffix: true })
    : "Recently";

  return (
    <>
      {/* Overlay */}
      <div
        className="drawer-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="detail-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${job.title} job details`}
      >
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <div
            style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid var(--border)",
              background: "var(--bg-card)",
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                {/* Logo */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    background: "linear-gradient(135deg,#2563EB,#7C3AED)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 16,
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
                  }}
                >
                  {(job.company || "?").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h1
                    style={{
                      fontWeight: 800,
                      fontSize: 18,
                      color: "var(--text-primary)",
                      margin: "0 0 2px",
                      lineHeight: 1.25,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {job.title}
                  </h1>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 13.5,
                        color: "var(--text-secondary)",
                        fontWeight: 600,
                      }}
                    >
                      <Building2 size={13} style={{ color: "var(--blue)" }} />
                      {job.company}
                    </span>
                    <span style={{ color: "var(--border)", fontSize: 10 }}>•</span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12.5,
                        color: "var(--text-muted)",
                      }}
                    >
                      <MapPin size={12} />
                      {job.location || "Munich"}
                    </span>
                    <span style={{ color: "var(--border)", fontSize: 10 }}>•</span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        color: "var(--text-muted)",
                      }}
                    >
                      <Clock size={11} />
                      {postedAgo}
                    </span>
                  </div>
                </div>
              </div>
              <button className="btn-icon" onClick={onClose} aria-label="Close panel">
                <X size={20} />
              </button>
            </div>

            {/* Meta chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              <span className="badge badge-type">
                <Briefcase size={10} /> {job.job_type || "Full-time"}
              </span>
              {job.remote && (
                <span className="badge badge-remote">🟢 Remote</span>
              )}
              <span className="badge badge-source">
                via {job.source.split(" ")[0]}
              </span>
              <span className="badge badge-new">
                <Globe size={10} /> Munich, Germany
              </span>
            </div>
          </div>

          {/* Body: 2 columns on large, single on small */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr min(260px,38%)",
              gap: 0,
              flex: 1,
              overflowY: "auto",
            }}
          >
            {/* Left: description */}
            <div
              style={{
                padding: "24px",
                borderRight: "1px solid var(--border)",
                overflowY: "auto",
              }}
            >
              {/* Skills */}
              <div style={{ marginBottom: 24 }}>
                <h2
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 10,
                  }}
                >
                  Required Skills
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {skills.map(s => (
                    <span key={s} className="skill-tag">
                      <CheckCircle2 size={10} style={{ color: "var(--green)" }} />
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h2
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 12,
                  }}
                >
                  About This Role
                </h2>
                <div
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.7,
                    color: "var(--text-secondary)",
                    whiteSpace: "pre-line",
                  }}
                >
                  {description}
                </div>
              </div>
            </div>

            {/* Right: sticky actions */}
            <div
              style={{
                padding: "20px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                overflowY: "auto",
              }}
            >
              {/* Apply CTA */}
              <a
                id={`panel-apply-${job.id}`}
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ justifyContent: "center", fontSize: 14, padding: "11px 16px" }}
                onClick={e => e.stopPropagation()}
              >
                Apply on Original Website <ExternalLink size={14} />
              </a>

              {/* Bookmark + Share */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn-ghost"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => onBookmark(job.id)}
                  aria-pressed={isBookmarked}
                >
                  <Bookmark
                    size={15}
                    fill={isBookmarked ? "var(--blue)" : "none"}
                    color={isBookmarked ? "var(--blue)" : undefined}
                  />
                  {isBookmarked ? "Saved" : "Save"}
                </button>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                  <Share2 size={15} /> Share
                </button>
              </div>

              <div className="divider" />

              {/* AI Match Score */}
              <div
                style={{
                  background: "var(--blue-light)",
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                <ScoreRing score={aiScore} />
              </div>

              {/* AI Summary */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 8,
                    fontWeight: 700,
                    fontSize: 12,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  <Sparkles size={12} style={{ color: "var(--blue)" }} /> AI Summary
                </div>
                <p
                  style={{
                    fontSize: 12.5,
                    lineHeight: 1.6,
                    color: "var(--text-secondary)",
                    margin: 0,
                    background: "var(--border-subtle)",
                    borderRadius: 10,
                    padding: "10px 12px",
                  }}
                >
                  Strong Python backend role at {job.company || "a Munich company"}, ideal for engineers experienced with async frameworks. Competitive tech stack with good growth potential.
                </p>
              </div>

              {/* Missing Skills */}
              {missing.length > 0 && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 8,
                      fontWeight: 700,
                      fontSize: 12,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    <AlertCircle size={12} style={{ color: "#D97706" }} /> Skill Gaps
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {missing.map(s => (
                      <div
                        key={s}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          padding: "5px 8px",
                          borderRadius: 7,
                          background: "var(--amber-light)",
                        }}
                      >
                        <XCircle size={12} style={{ color: "#D97706" }} />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Jobs */}
              {similarJobs.length > 0 && (
                <div>
                  <div className="divider" />
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 12,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 10,
                    }}
                  >
                    Similar Jobs
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {similarJobs.slice(0, 3).map(sj => (
                      <button
                        key={sj.id}
                        onClick={() => onSimilarClick(sj)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          background: "var(--border-subtle)",
                          border: "1px solid var(--border)",
                          borderRadius: 9,
                          padding: "8px 10px",
                          cursor: "pointer",
                          transition: "background 0.15s ease",
                          textAlign: "left",
                          fontFamily: "inherit",
                          width: "100%",
                        }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--blue-light)")}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "var(--border-subtle)")}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 7,
                            background: "linear-gradient(135deg,#2563EB,#7C3AED)",
                            color: "#fff",
                            fontSize: 9,
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {(sj.company || "?").slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "var(--text-primary)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {sj.title}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            {sj.company}
                          </div>
                        </div>
                        <ChevronRight size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
