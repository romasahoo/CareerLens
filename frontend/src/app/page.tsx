"use client";
import { useState, useEffect, useCallback } from "react";
import { SlidersHorizontal, ChevronDown, Search, X, BookmarkPlus, Zap } from "lucide-react";
import { useSession, signIn } from "next-auth/react";

import { ThemeProvider, useTheme } from "@/components/ThemeContext";
import Navbar from "@/components/Navbar";
import FilterSidebar, { Filters, EMPTY_FILTERS } from "@/components/FilterSidebar";
import JobCard, { Job, JobCardSkeleton } from "@/components/JobCard";
import RightSidebar from "@/components/RightSidebar";
import JobDetailPanel from "@/components/JobDetailPanel";
import MobileNav from "@/components/MobileNav";

type SortOption = "Newest" | "Relevance" | "Company A–Z";
const SORT_OPTIONS: SortOption[] = ["Newest", "Relevance", "Company A–Z"];

function sortJobs(jobs: Job[], sort: SortOption): Job[] {
  if (sort === "Newest") return [...jobs].sort((a, b) => new Date(b.posted_date || 0).getTime() - new Date(a.posted_date || 0).getTime());
  if (sort === "Company A–Z") return [...jobs].sort((a, b) => (a.company || "").localeCompare(b.company || ""));
  return jobs;
}

function applyFilters(jobs: Job[], filters: Filters, query: string): Job[] {
  let out = jobs;

  // Text search
  if (query.trim()) {
    const q = query.toLowerCase();
    out = out.filter(j =>
      j.title.toLowerCase().includes(q) ||
      (j.company || "").toLowerCase().includes(q) ||
      (j.location || "").toLowerCase().includes(q)
    );
  }

  // Location filter
  if (filters.locations.length > 0) {
    out = out.filter(j => {
      const loc = (j.location || "").toLowerCase();
      return filters.locations.some(l => {
        if (l === "Remote") return j.remote;
        if (l === "Munich") return loc.includes("munich") || loc.includes("münchen");
        if (l === "Berlin") return loc.includes("berlin");
        if (l === "Hybrid") return loc.includes("hybrid");
        if (l === "Germany") return loc.includes("german");
        return loc.includes(l.toLowerCase());
      });
    });
  }

  // Source filter
  if (filters.sources.length > 0) {
    out = out.filter(j => filters.sources.some(s => {
      const src = (j.source || "").toLowerCase();
      const filterSrc = s.toLowerCase();
      // For RapidAPI match only the first word
      if (filterSrc.startsWith("rapidapi")) return src.includes("rapidapi") || src.includes("active jobs");
      return src.includes(filterSrc.split(" ")[0]);
    }));
  }

  // Employment type
  if (filters.types.length > 0) {
    out = out.filter(j =>
      filters.types.some(t => (j.job_type || "Full-time").toLowerCase().includes(t.toLowerCase().split("-")[0]))
    );
  }

  // Language filter — "English Only" removes jobs from non-English sources
  if (filters.language.includes("English Only")) {
    const NON_ENGLISH_SOURCES = ["xing", "stepstone"];
    const GERMAN_WORDS = ["entwickler", "ingenieur", "vollzeit", "teilzeit", "(m/w/d)", "(w/m/d)", "für", "mit "];
    out = out.filter(j => {
      const src = (j.source || "").toLowerCase();
      if (NON_ENGLISH_SOURCES.some(s => src.includes(s))) return false;
      const title = (j.title || "").toLowerCase();
      if (GERMAN_WORDS.some(w => title.includes(w))) return false;
      return true;
    });
  }

  return out;
}

function LoginContent() {
  const { theme } = useTheme();
  const dark = theme === "dark";

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: dark ? "#0A1120" : "#F0F2F8",
      padding: 20,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: dark ? "rgba(17,24,39,0.6)" : "rgba(255,255,255,0.8)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: 24,
        padding: "48px 36px",
        boxShadow: dark ? "0 24px 60px rgba(0,0,0,0.4)" : "0 24px 60px rgba(0,0,0,0.08)",
        border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.6)"}`,
        textAlign: "center"
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px", boxShadow: "0 8px 24px rgba(37,99,235,0.3)"
        }}>
          <Zap size={28} color="#fff" strokeWidth={2.5} />
        </div>
        <h1 style={{
          fontSize: 28, fontWeight: 800, margin: "0 0 8px",
          color: dark ? "#fff" : "#0F172A", letterSpacing: "-0.03em"
        }}>
          Welcome Back
        </h1>
        <p style={{ color: dark ? "#94A3B8" : "#64748B", fontSize: 15, margin: "0 0 36px", lineHeight: 1.5 }}>
          Sign in to save your job searches and get personalized alerts.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              width: "100%", padding: "14px", borderRadius: 14,
              background: dark ? "#1E293B" : "#fff",
              border: `1px solid ${dark ? "#334155" : "#E2E8F0"}`,
              color: dark ? "#F8FAFC" : "#0F172A",
              fontSize: 15, fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              width: "100%", padding: "14px", borderRadius: 14,
              background: dark ? "#1E293B" : "#fff",
              border: `1px solid ${dark ? "#334155" : "#E2E8F0"}`,
              color: dark ? "#F8FAFC" : "#0F172A",
              fontSize: 15, fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={dark ? "#fff" : "#000"}>
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

function PageContent() {
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pendingQuery, setPendingQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortOption>("Newest");
  const [sortOpen, setSortOpen] = useState(false);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [recentlyViewed, setRecentlyViewed] = useState<Job[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scraping, setScraping] = useState(false);
  
  const { data: session, status } = useSession();
  const [savingSearch, setSavingSearch] = useState(false);

  const fetchJobs = useCallback(async (q = "") => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const url = `${baseUrl}/api/jobs?q=${encodeURIComponent(q)}&location=&remote_only=false`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("API error");
      setAllJobs(await res.json());
    } catch {
      setError("Cannot connect to backend on port 8000. Make sure it's running.");
      setAllJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(""); }, [fetchJobs]);

  useEffect(() => {
    try {
      const s = localStorage.getItem("cl-bookmarks");
      if (s) setBookmarks(new Set(JSON.parse(s)));
    } catch {}
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedJob(null); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const handleSearch = () => {
    setSearchQuery(pendingQuery);
    fetchJobs(pendingQuery);
  };

  const handleScrape = async () => {
    setScraping(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      await fetch(`${baseUrl}/api/scrape`, { method: "POST" });
      await fetchJobs(searchQuery);
    } catch {
      // scrape error — silently ignore, fetchJobs will handle backend errors
    } finally {
      setScraping(false);
    }
  };

  const handleSaveSearch = async () => {
    if (!session) {
      alert("Please sign in to save a search filter.");
      return;
    }
    setSavingSearch(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${baseUrl}/api/filters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(session as any).provider}|${(session as any).accessToken}`
        },
        body: JSON.stringify({
          query: searchQuery,
          locations: filters.locations,
          types: filters.types,
          sources: filters.sources,
          language: filters.language
        })
      });
      if (res.ok) alert("Search saved! You'll be notified of new matches.");
      else alert("Failed to save search.");
    } catch (e) {
      alert("Error saving search.");
    } finally {
      setSavingSearch(false);
    }
  };

  const toggleBookmark = (id: number) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("cl-bookmarks", JSON.stringify([...next]));
      return next;
    });
  };

  const openJob = (job: Job) => {
    setSelectedJob(job);
    setRecentlyViewed(prev => [job, ...prev.filter(j => j.id !== job.id)].slice(0, 5));
  };

  const visibleJobs = sortJobs(applyFilters(allJobs, filters, searchQuery), sort);
  const similarJobs = selectedJob ? allJobs.filter(j => j.id !== selectedJob.id).slice(0, 5) : [];

  const bg = dark ? "#0A1120" : "#F0F2F8";
  const surface = dark ? "#111827" : "#FFFFFF";
  const border = dark ? "#1F2D45" : "#E4E8F0";
  const text1 = dark ? "#E2E8F0" : "#0F172A";
  const text3 = dark ? "#4B5563" : "#94A3B8";

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #2563EB", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <LoginContent />;
  }

  return (
    <div style={{ minHeight: "100vh", background: bg }}>
      <Navbar
        searchQuery={pendingQuery}
        onSearchChange={setPendingQuery}
        onSearchSubmit={handleSearch}
      />

      {/* ── 3-col layout ─────────────────────────────────── */}
      <div style={{
        maxWidth: 1440,
        margin: "0 auto",
        padding: "28px 24px 100px",
        display: "grid",
        gridTemplateColumns: "256px 1fr 272px",
        gap: 22,
        alignItems: "start",
      }} id="main-grid">

        {/* Left sidebar — self-scrolling aside handles overflow */}
        <div style={{ position: "sticky", top: 84 }} id="left-sidebar">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onApply={handleSearch}
          />
        </div>

        {/* Center: job list */}
        <main aria-label="Job listings">
          {/* Toolbar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 18, gap: 12, flexWrap: "wrap",
          }}>
            {/* Mobile filter btn */}
            <button
              id="mobile-filter-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open filters"
              style={{
                display: "none",
                alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 9,
                background: surface, border: `1.5px solid ${border}`,
                color: dark ? "#94A3B8" : "#475569",
                fontWeight: 600, fontSize: 13, fontFamily: "inherit", cursor: "pointer",
              }}
            >
              <SlidersHorizontal size={15} /> Filters
            </button>

            {/* Job count + Refresh */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div>
                <h1 style={{ fontWeight: 800, fontSize: 18, color: text1, margin: 0, letterSpacing: "-0.02em" }}>
                  {loading
                    ? <span style={{ color: text3 }}>Loading…</span>
                    : <><span style={{ color: "#2563EB" }}>{visibleJobs.length}</span> {visibleJobs.length === 1 ? "Job" : "Jobs"} Found</>
                  }
                </h1>
                {!loading && allJobs.length > 0 && (
                  <p style={{ fontSize: 12, color: text3, margin: "2px 0 0" }}>
                    From {new Set(allJobs.map(j => j.source)).size} sources
                  </p>
                )}
              </div>
              <button
                id="refresh-jobs-btn"
                onClick={handleScrape}
                disabled={scraping || loading}
                title="Refresh jobs from LinkedIn, Indeed & all sources"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 9,
                  background: scraping ? (dark ? "#1F2D45" : "#EFF6FF") : (dark ? "#1A2535" : "#F8FAFC"),
                  border: `1.5px solid ${dark ? "#1F2D45" : "#E4E8F0"}`,
                  color: scraping ? "#2563EB" : dark ? "#94A3B8" : "#475569",
                  fontWeight: 600, fontSize: 12, fontFamily: "inherit", cursor: scraping ? "wait" : "pointer",
                  transition: "all 0.2s", whiteSpace: "nowrap",
                }}
              >
                <span style={{
                  display: "inline-block",
                  animation: scraping ? "spin 1s linear infinite" : "none",
                  lineHeight: 1,
                }}>&#x21BB;</span>
                {scraping ? "Refreshing…" : "Refresh Jobs"}
              </button>
              
              <button
                onClick={handleSaveSearch}
                disabled={savingSearch}
                title="Save this search to get notifications for new matches"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 9,
                  background: savingSearch ? (dark ? "#1F2D45" : "#EFF6FF") : "transparent",
                  border: `1.5px solid ${dark ? "#1F2D45" : "#E4E8F0"}`,
                  color: savingSearch ? "#2563EB" : dark ? "#94A3B8" : "#475569",
                  fontWeight: 600, fontSize: 12, fontFamily: "inherit", cursor: savingSearch ? "wait" : "pointer",
                  transition: "all 0.2s", whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { if(!savingSearch) (e.currentTarget as HTMLElement).style.background = dark ? "#1A2535" : "#F8FAFC"; }}
                onMouseLeave={e => { if(!savingSearch) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <BookmarkPlus size={14} />
                {savingSearch ? "Saving..." : "Save Search"}
              </button>
            </div>

            {/* Sort */}
            <div style={{ position: "relative" }}>
              <button
                id="sort-dropdown-btn"
                aria-haspopup="listbox"
                aria-expanded={sortOpen}
                onClick={() => setSortOpen(o => !o)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 9,
                  background: surface, border: `1.5px solid ${border}`,
                  color: dark ? "#94A3B8" : "#475569",
                  fontWeight: 500, fontSize: 13, fontFamily: "inherit", cursor: "pointer",
                }}
              >
                <span>Sort: <strong style={{ color: text1 }}>{sort}</strong></span>
                <ChevronDown size={13} style={{ transform: sortOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {sortOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 5 }} onClick={() => setSortOpen(false)} />
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 10,
                    background: surface, border: `1px solid ${border}`, borderRadius: 12,
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)", minWidth: 170, overflow: "hidden",
                    animation: "fadeUp 0.15s ease both",
                  }} role="listbox">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        role="option"
                        aria-selected={sort === opt}
                        onClick={() => { setSort(opt); setSortOpen(false); }}
                        style={{
                          display: "block", width: "100%", padding: "10px 16px", textAlign: "left",
                          background: sort === opt ? (dark ? "rgba(37,99,235,0.15)" : "#EFF6FF") : "transparent",
                          color: sort === opt ? "#2563EB" : dark ? "#94A3B8" : "#475569",
                          fontWeight: sort === opt ? 700 : 400,
                          fontSize: 13, border: "none", cursor: "pointer", fontFamily: "inherit",
                        }}
                        onMouseEnter={e => { if (sort !== opt) (e.currentTarget as HTMLElement).style.background = dark ? "#1A2535" : "#F8FAFC"; }}
                        onMouseLeave={e => { if (sort !== opt) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Active filter pills */}
          {Object.values(filters).flat().length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {Object.entries(filters).flatMap(([key, vals]) =>
                (vals as string[]).map(v => (
                  <span key={`${key}-${v}`} style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "4px 10px 4px 12px", borderRadius: 999,
                    background: "#EFF6FF", color: "#2563EB",
                    border: "1.5px solid #BFDBFE",
                    fontSize: 12, fontWeight: 600,
                  }}>
                    {v}
                    <button
                      onClick={() => setFilters(f => ({ ...f, [key]: (f[key as keyof Filters]).filter(x => x !== v) }))}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#93C5FD", padding: 0, display: "flex",
                      }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: dark ? "rgba(220,38,38,0.1)" : "#FEF2F2",
              border: `1px solid ${dark ? "rgba(220,38,38,0.2)" : "#FCA5A5"}`,
              borderRadius: 12, padding: "14px 18px", marginBottom: 14,
              fontSize: 13.5, color: dark ? "#F87171" : "#B91C1C", fontWeight: 500,
            }} role="alert">
              ⚠️ {error}
            </div>
          )}

          {/* Skeletons */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Array.from({ length: 5 }).map((_, i) => <JobCardSkeleton key={i} dark={dark} />)}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && visibleJobs.length === 0 && (
            <div style={{
              background: surface, border: `1px solid ${border}`, borderRadius: 16,
              padding: "60px 32px", display: "flex", flexDirection: "column",
              alignItems: "center", textAlign: "center", gap: 12,
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: "50%",
                background: dark ? "rgba(37,99,235,0.15)" : "#EFF6FF",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Search size={26} color="#2563EB" />
              </div>
              <h2 style={{ fontWeight: 700, fontSize: 16, color: text1, margin: 0 }}>No jobs found</h2>
              <p style={{ color: text3, fontSize: 14, margin: 0 }}>Try adjusting your search or clearing filters</p>
              <button
                onClick={() => { setFilters(EMPTY_FILTERS); setPendingQuery(""); setSearchQuery(""); fetchJobs(""); }}
                style={{
                  marginTop: 4, padding: "10px 22px",
                  background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
                  color: "#fff", border: "none", borderRadius: 10,
                  fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: "pointer",
                }}
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Job list */}
          {!loading && !error && visibleJobs.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {visibleJobs.map((job, i) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isBookmarked={bookmarks.has(job.id)}
                  onBookmark={toggleBookmark}
                  onClick={openJob}
                  index={i}
                />
              ))}
            </div>
          )}
        </main>

        {/* Right sidebar */}
        <div style={{ position: "sticky", top: 84 }} id="right-sidebar">
          <RightSidebar jobs={allJobs} recentlyViewed={recentlyViewed} onJobClick={openJob} />
        </div>
      </div>

      {/* Mobile nav */}
      <MobileNav onFilterOpen={() => setDrawerOpen(true)} savedCount={bookmarks.size} />

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
              zIndex: 40, backdropFilter: "blur(3px)", animation: "fadeIn 0.2s ease",
            }}
          />
          <div style={{
            position: "fixed", top: 0, left: 0, bottom: 0, width: 300,
            background: surface, borderRight: `1px solid ${border}`,
            zIndex: 50, overflowY: "auto", animation: "slide-left 0.25s ease",
          }}>
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              onApply={handleSearch}
              isDrawer
              onClose={() => setDrawerOpen(false)}
            />
          </div>
        </>
      )}

      {/* Job detail */}
      {selectedJob && (
        <JobDetailPanel
          job={selectedJob}
          isBookmarked={bookmarks.has(selectedJob.id)}
          onBookmark={toggleBookmark}
          onClose={() => setSelectedJob(null)}
          similarJobs={similarJobs}
          onSimilarClick={openJob}
        />
      )}

      {/* Responsive styles */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 1200px) {
          #main-grid { grid-template-columns: 240px 1fr !important; }
          #right-sidebar { display: none !important; }
        }
        @media (max-width: 768px) {
          #main-grid { grid-template-columns: 1fr !important; padding: 16px 14px 80px !important; }
          #left-sidebar { display: none !important; }
          #mobile-filter-btn { display: inline-flex !important; }
        }
        @media (min-width: 769px) {
          nav.mobile-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <PageContent />
    </ThemeProvider>
  );
}
