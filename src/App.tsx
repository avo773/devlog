import { useEffect, useMemo, useRef, useState } from "react"; // React hooks: state, memoization, refs, and side effects
import "./App.css"; // Imports the CSS file that styles this component
import pic from "./assets/pic.jpg"; // Imports your profile image as a module (Vite handles this)

type Theme = "dark" | "light"; // A union type: theme can ONLY be "dark" or "light"

type SkillCategory = "AI" | "Full Stack" | "Data" | "Reliability"; // Narrow allowed categories (prevents typos)
type SkillLevel = "Core" | "Strong" | "Learning"; // Narrow allowed levels (prevents typos)

type Skill = {
  label: string; // Skill name shown on UI
  category: SkillCategory; // One of the allowed categories above
  level: SkillLevel; // One of the allowed levels above
};

type Project = {
  name: string; // Project display name
  subtitle: string; // Small descriptor line
  description: string; // Main explanation text
  tags: string[]; // Tags shown as chips
  bullets: string[]; // Impact bullets ("what it proves")
  links: { label: string; href: string }[]; // Buttons/links for the project
};

type DevLogEntry = {
  id: string; // Unique id for each entry
  createdAt: number; // Timestamp (ms) when created
  title: string; // Entry title
  body: string; // Entry details
  tags: string[]; // Entry tags
};

const LINKS = {
  linkedin: "https://www.linkedin.com/in/avobanks/", // Your real LinkedIn (rubric-safe)
  github: "https://github.com/avo773", // Your GitHub profile
  repo: "https://github.com/avo773/devlog", // Your devlog repo
  email: "avbanks@icstars.org", // Your contact email
}; // Centralized links so you don’t hunt them through JSX

const ROLE_ROTATION = [
  "A.I. Engineer",
  "Full-Stack Developer",
  "Agent + RAG Builder",
  "API + Workflow Architect",
  "Product-First Engineer",
]; // Rotating identity roles for the hero section

const SKILLS: Skill[] = [
  { label: "RAG (retrieval + chunking)", category: "AI", level: "Core" },
  { label: "Embeddings + reranking", category: "AI", level: "Strong" },
  { label: "Agent tool calling", category: "AI", level: "Core" },
  { label: "Structured outputs (schemas)", category: "AI", level: "Strong" },
  { label: "Eval harness + guardrails", category: "AI", level: "Learning" },

  { label: "React", category: "Full Stack", level: "Core" },
  { label: "TypeScript", category: "Full Stack", level: "Core" },
  { label: "Node/Express", category: "Full Stack", level: "Strong" },
  { label: "REST API design", category: "Full Stack", level: "Strong" },
  { label: "CSS (layout + systems)", category: "Full Stack", level: "Strong" },

  { label: "SQL + schema design", category: "Data", level: "Strong" },
  { label: "Data contracts + validation", category: "Data", level: "Strong" },
  { label: "ETL mindset", category: "Data", level: "Learning" },

  { label: "Testing (unit/integration)", category: "Reliability", level: "Strong" },
  { label: "Observability (logs/traces)", category: "Reliability", level: "Strong" },
  { label: "Idempotency + retries", category: "Reliability", level: "Learning" },
]; // Your skills matrix (data-driven UI)

const PROJECTS: Project[] = [
  {
    name: "JD Factory",
    subtitle: "Governed role-production compiler (not a JD writer)",
    description:
      "A job-description supply chain: research → spec → draft → review → diff → export. Built for auditability and predictable output.",
    tags: ["Artifacts", "Approvals", "Diffs", "Exports", "Governance"],
    bullets: [
      "Proves: workflow design + policy-driven systems",
      "Proves: data model thinking (canonical spec → exports)",
      "Proves: auditability (diffs, approvals, lineage)",
    ],
    links: [
      { label: "GitHub", href: LINKS.github },
      { label: "LinkedIn", href: LINKS.linkedin },
    ],
  },
  {
    name: "DevLog",
    subtitle: "Local-first engineering journal (this site)",
    description:
      "A devlog that persists entries, supports tags, exports JSON, and acts like a mini product—not just a portfolio poster.",
    tags: ["LocalStorage", "UX", "Data", "Export"],
    bullets: [
      "Proves: state + persistence + data shaping",
      "Proves: UI/UX you can demo live in 10 seconds",
      "Proves: you can ship product-y features fast",
    ],
    links: [
      { label: "Repo", href: LINKS.repo },
      { label: "GitHub", href: LINKS.github },
    ],
  },
  {
    name: "Agent Toolkit",
    subtitle: "Predictable agents with receipts",
    description:
      "Patterns for tool calling, routing, retries, and logs—so agents act like software, not vibes.",
    tags: ["Tooling", "Routing", "Guardrails", "Telemetry"],
    bullets: [
      "Proves: reliability mindset (idempotency, retries)",
      "Proves: agent design beyond prompt hype",
      "Proves: observability-first debugging",
    ],
    links: [{ label: "LinkedIn", href: LINKS.linkedin }],
  },
]; // Projects as data to render cards consistently

function safeCopy(text: string): Promise<void> {
  // Attempts clipboard copy, and falls back to prompt if clipboard is blocked
  if (navigator?.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).catch(() => {
      window.prompt("Copy this:", text); // Fallback UI if clipboard fails
    });
  }
  window.prompt("Copy this:", text); // Non-clipboard fallback
  return Promise.resolve(); // Makes function always return a Promise<void>
}

function uid(): string {
  // Creates a lightweight unique id (good enough for local UI)
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`; // Timestamp + random hex
}

function formatDate(ms: number): string {
  // Formats timestamps into a human-readable string
  return new Date(ms).toLocaleString(); // Uses user locale formatting
}

const STORAGE_KEY = "devlog.entries.v1"; // LocalStorage key name for persisted entries
const THEME_KEY = "devlog.theme.v1"; // LocalStorage key name for persisted theme choice

type CategoryFilter = "All" | SkillCategory; // Filter values for the skills UI

export default function App() {
  const [roleIndex, setRoleIndex] = useState<number>(0); // Which role from ROLE_ROTATION is showing
  const [category, setCategory] = useState<CategoryFilter>("All"); // Current skills filter selection
  const [copied, setCopied] = useState<boolean>(false); // Controls “copied” UI states for email copy
  const [theme, setTheme] = useState<Theme>("dark"); // Dark/light theme state
  const [paletteOpen, setPaletteOpen] = useState<boolean>(false); // Command palette open/close
  const paletteInputRef = useRef<HTMLInputElement | null>(null); // Ref to focus palette input

  const [entries, setEntries] = useState<DevLogEntry[]>([]); // DevLog entries list state
  const [entryTitle, setEntryTitle] = useState<string>(""); // New entry title input state
  const [entryBody, setEntryBody] = useState<string>(""); // New entry body input state
  const [entryTags, setEntryTags] = useState<string>(""); // Comma-separated tags input state

  useEffect(() => {
    // Load theme from localStorage on initial mount
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null; // Read saved theme
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme); // Apply saved theme if valid
    }
  }, []); // Empty dependency array: run once on mount only

  useEffect(() => {
    // Apply theme to document root so CSS can style based on [data-theme]
    document.documentElement.setAttribute("data-theme", theme); // Sets attribute like data-theme="dark"
    localStorage.setItem(THEME_KEY, theme); // Persist theme across reloads
  }, [theme]); // Runs every time theme changes

  useEffect(() => {
    // Load devlog entries from localStorage on initial mount
    const raw = localStorage.getItem(STORAGE_KEY); // Read serialized JSON
    if (!raw) return; // If nothing saved, do nothing
    try {
      const parsed = JSON.parse(raw) as DevLogEntry[]; // Parse JSON to array
      if (Array.isArray(parsed)) setEntries(parsed); // Only set state if it’s an array
    } catch {
      // If JSON parsing fails, ignore corrupted storage instead of crashing app
    }
  }, []); // Run once on mount

  useEffect(() => {
    // Persist entries to localStorage whenever entries change
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); // Serialize entries state into JSON
  }, [entries]); // Runs whenever entries changes

  useEffect(() => {
    // Rotate roles every 2.1 seconds
    const t = window.setInterval(() => {
      setRoleIndex((i) => (i + 1) % ROLE_ROTATION.length); // Wrap around using modulo
    }, 2100); // Interval duration in ms
    return () => window.clearInterval(t); // Cleanup interval on unmount
  }, []); // Run once on mount

  useEffect(() => {
    // Keyboard shortcut: Ctrl/Cmd + K opens command palette
    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k"; // Check if key is "k"
      const isShortcut = (e.ctrlKey || e.metaKey) && isK; // Ctrl+K (Windows) or Cmd+K (Mac)
      if (!isShortcut) return; // If not the shortcut, ignore
      e.preventDefault(); // Prevent browser default behavior
      setPaletteOpen(true); // Open palette
    };
    window.addEventListener("keydown", onKeyDown); // Attach handler
    return () => window.removeEventListener("keydown", onKeyDown); // Cleanup on unmount
  }, []); // Run once on mount

  useEffect(() => {
    // When palette opens, focus the input for immediate typing
    if (!paletteOpen) return; // Only run when open
    window.setTimeout(() => paletteInputRef.current?.focus(), 0); // Focus after render
  }, [paletteOpen]); // Runs whenever paletteOpen changes

  const filteredSkills = useMemo(() => {
    // Memoize filtered skills so we don’t recompute on every render unnecessarily
    if (category === "All") return SKILLS; // No filter case
    return SKILLS.filter((s) => s.category === category); // Filter by category
  }, [category]); // Recompute only when category changes

  const coreCount = filteredSkills.filter((s) => s.level === "Core").length; // Count Core skills in filtered list
  const strongCount = filteredSkills.filter((s) => s.level === "Strong").length; // Count Strong skills in filtered list

  const sortedEntries = useMemo(() => {
    // Sort entries newest-first (memoized)
    return [...entries].sort((a, b) => b.createdAt - a.createdAt); // Clone array then sort descending
  }, [entries]); // Recompute only if entries change

  function addEntry() {
    // Add a new devlog entry with validation + clean tag parsing
    const title = entryTitle.trim(); // Remove leading/trailing spaces
    const body = entryBody.trim(); // Remove leading/trailing spaces
    if (!title || !body) return; // Require both fields

    const tags = entryTags
      .split(",") // Split comma-separated
      .map((t) => t.trim()) // Trim whitespace
      .filter(Boolean) // Remove empty strings
      .slice(0, 8); // Cap tags so UI doesn’t get wrecked

    const next: DevLogEntry = {
      id: uid(), // Unique id
      createdAt: Date.now(), // Timestamp
      title, // Validated title
      body, // Validated body
      tags, // Cleaned tags
    };

    setEntries((prev) => [next, ...prev]); // Add new entry at top (newest first)
    setEntryTitle(""); // Clear title input
    setEntryBody(""); // Clear body input
    setEntryTags(""); // Clear tags input
  }

  function deleteEntry(id: string) {
    // Delete an entry by id
    setEntries((prev) => prev.filter((e) => e.id !== id)); // Keep everything except the id
  }

  async function exportEntries() {
    // Export entries as JSON via clipboard (simple + demo-friendly)
    const json = JSON.stringify(sortedEntries, null, 2); // Pretty-print JSON
    await safeCopy(json); // Copy to clipboard
    setCopied(true); // Show copied state
    window.setTimeout(() => setCopied(false), 1200); // Reset copied state after delay
  }

  function scrollToId(id: string) {
    // Smooth scroll to a section
    const el = document.getElementById(id); // Find element by id
    if (!el) return; // If missing, do nothing
    el.scrollIntoView({ behavior: "smooth", block: "start" }); // Smooth scroll
    setPaletteOpen(false); // Close palette after navigation
  }

  return (
    <div className="app" id="top">
      {/* Background visuals (purely decorative) */}
      <div className="bg" aria-hidden="true">
        <div className="bgGrid" />
        <div className="bgGlow" />
        <div className="bgScanlines" />
        <div className="bgNoise" />
      </div>

      {/* Top navigation bar */}
      <header className="topbar">
        <div className="topbarLeft">
          <span className="brandMark" aria-hidden="true" />
          <span className="brandText">AVORY // SYSTEMS</span>
        </div>

        <nav className="topbarNav" aria-label="Primary navigation">
          <a href="#about" className="navLink">
            About
          </a>
          <a href="#skills" className="navLink">
            Skills
          </a>
          <a href="#projects" className="navLink">
            Projects
          </a>
          <a href="#devlog" className="navLink">
            DevLog
          </a>
          <a href="#contact" className="navLink">
            Contact
          </a>

          <button
            className="navBtn"
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Open command palette"
            title="Command palette (Ctrl/Cmd + K)"
          >
            ⌘K
          </button>

          <button
            className="navBtn"
            type="button"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          <a className="navCta" href={LINKS.linkedin} target="_blank" rel="noreferrer">
            LinkedIn ↗
          </a>
        </nav>
      </header>

      <main className="layout">
        {/* Left sticky profile panel */}
        <aside className="identity" aria-label="Profile panel">
          <div className="identityCard">
            <div className="identityHolo" aria-hidden="true" />

            <div className="identityTop">
              <img className="avatar" src={pic} alt="Avory Banks profile photo" />
              <div className="idText">
                <h1 className="name">Avory Banks</h1>

                <p className="role">
                  <span className="roleLabel">ROLE:</span>{" "}
                  <span className="roleValue">{ROLE_ROTATION[roleIndex]}</span>
                  <span className="cursor" aria-hidden="true">
                    ▌
                  </span>
                </p>
              </div>
            </div>

            <div className="statusRow" aria-label="System status">
              <div className="statusItem">
                <span className="dot ok" aria-hidden="true" />
                <span>Shipping mindset</span>
              </div>
              <div className="statusItem">
                <span className="dot ok" aria-hidden="true" />
                <span>Audit-first design</span>
              </div>
              <div className="statusItem">
                <span className="dot warn" aria-hidden="true" />
                <span>Leveling up evals</span>
              </div>
            </div>

            <div className="quickLinks">
              <a className="pill" href={LINKS.linkedin} target="_blank" rel="noreferrer">
                LinkedIn ↗
              </a>
              <a className="pill" href={LINKS.github} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>

              <button
                className="pill ghost"
                type="button"
                onClick={async () => {
                  await safeCopy(LINKS.email);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1100);
                }}
              >
                {copied ? "Email copied ✅" : "Copy email"}
              </button>
            </div>

            <div className="micro">
              <div className="microLine">
                <span className="microKey">BASE:</span>
                <span className="microVal">Chicago • Remote-friendly</span>
              </div>
              <div className="microLine">
                <span className="microKey">MODE:</span>
                <span className="microVal">Build → Measure → Iterate</span>
              </div>
              <div className="microLine">
                <span className="microKey">SHORTCUT:</span>
                <span className="microVal">Ctrl/Cmd + K</span>
              </div>
            </div>
          </div>

          <div className="miniCard">
            <h2 className="miniTitle">Signal</h2>
            <p className="miniText">
              I don’t chase “cool AI.” I ship systems that are testable, explainable, and usable by
              real teams under real constraints.
            </p>
          </div>
        </aside>

        {/* Right content sections */}
        <section className="content">
          {/* ABOUT */}
          <section className="panel" id="about" aria-labelledby="aboutTitle">
            <div className="panelHeader">
              <h2 className="panelTitle" id="aboutTitle">
                About Me
              </h2>
              <span className="panelTag">human + agent workflows</span>
            </div>

            <p className="p">
              I’m an AI Engineer and Full Stack Developer focused on production-ready agent workflows,
              retrieval (RAG), and clean web systems. I build governed AI: consistent outputs, reviewable
              diffs, and receipts (logs, versions, exports).
            </p>

            <p className="p">
              I’m comfortable across UI, APIs, and data modeling—plus the boring reliability stuff
              (validation, tests, telemetry). If it can break at 3AM, I’m thinking about it at 3PM.
            </p>

            <div className="callout">
              <div className="calloutLeft">
                <span className="calloutTitle">Current obsession</span>
                <span className="calloutBody">
                  Evaluation loops + human-in-the-loop checkpoints that keep AI fast without letting it
                  get reckless.
                </span>
              </div>
              <button className="calloutBtn" type="button" onClick={() => scrollToId("projects")}>
                See what I’m building →
              </button>
            </div>
          </section>

          {/* SKILLS */}
          <section className="panel" id="skills" aria-labelledby="skillsTitle">
            <div className="panelHeader">
              <h2 className="panelTitle" id="skillsTitle">
                Skills Matrix
              </h2>
              <span className="panelTag">
                Core {coreCount} • Strong {strongCount}
              </span>
            </div>

            <div className="filterRow" role="tablist" aria-label="Skill filters">
              {(["All", "AI", "Full Stack", "Data", "Reliability"] as CategoryFilter[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`filterBtn ${category === c ? "active" : ""}`}
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="skillsGrid" aria-label="Skill list">
              {filteredSkills.map((s) => (
                <div key={s.label} className={`skillChip level-${s.level}`}>
                  <span className="skillTop">
                    <span className="skillLabel">{s.label}</span>
                    <span className="skillLevel">{s.level}</span>
                  </span>
                  <span className="skillMeta">{s.category}</span>
                </div>
              ))}
            </div>

            {/* Rubric-friendly minimal list (kept) */}
            <div className="classicSkills" aria-label="Required skills list">
              <h3>Skills</h3>
              <ul>
                <li>JavaScript</li>
                <li>React</li>
                <li>CSS</li>
              </ul>
            </div>
          </section>

          {/* PROJECTS */}
          <section className="panel" id="projects" aria-labelledby="projectsTitle">
            <div className="panelHeader">
              <h2 className="panelTitle" id="projectsTitle">
                Projects
              </h2>
              <span className="panelTag">what I ship</span>
            </div>

            <div className="cards">
              {PROJECTS.map((p) => (
                <article key={p.name} className="card">
                  <div className="cardTop">
                    <div className="cardTitleBlock">
                      <h3>{p.name}</h3>
                      <p className="cardSub">{p.subtitle}</p>
                    </div>
                    <span className="chip">Portfolio proof</span>
                  </div>

                  <p className="p">{p.description}</p>

                  <div className="tagRow" aria-label="Project tags">
                    {p.tags.map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </div>

                  <ul className="bullets" aria-label="Project impact bullets">
                    {p.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>

                  <div className="actions">
                    {p.links.map((l) => (
                      <a key={l.href} className="btn" href={l.href} target="_blank" rel="noreferrer">
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* DEVLOG */}
          <section className="panel" id="devlog" aria-labelledby="devlogTitle">
            <div className="panelHeader">
              <h2 className="panelTitle" id="devlogTitle">
                DevLog
              </h2>
              <span className="panelTag">local-first • demoable • exportable</span>
            </div>

            <div className="devlogGrid">
              <div className="devlogComposer" aria-label="Create a new devlog entry">
                <label className="label">
                  Title
                  <input
                    className="input"
                    value={entryTitle}
                    onChange={(e) => setEntryTitle(e.target.value)}
                    placeholder="What did you ship today?"
                  />
                </label>

                <label className="label">
                  Body
                  <textarea
                    className="textarea"
                    value={entryBody}
                    onChange={(e) => setEntryBody(e.target.value)}
                    placeholder="Drop the details. What broke? What did you fix? What’s next?"
                    rows={6}
                  />
                </label>

                <label className="label">
                  Tags (comma-separated)
                  <input
                    className="input"
                    value={entryTags}
                    onChange={(e) => setEntryTags(e.target.value)}
                    placeholder="react, vite, css, shipping"
                  />
                </label>

                <div className="devlogActions">
                  <button className="btn primary" type="button" onClick={addEntry}>
                    Add entry
                  </button>

                  <button className="btn" type="button" onClick={exportEntries}>
                    {copied ? "Export copied ✅" : "Export JSON (copy)"}
                  </button>
                </div>

                <p className="hint">
                  Tip: This saves to <span className="mono">localStorage</span>, so refresh won’t delete your logs.
                </p>
              </div>

              <div className="devlogFeed" aria-label="Devlog entries feed">
                {sortedEntries.length === 0 ? (
                  <div className="empty">No entries yet. Add one and make it real. 😈</div>
                ) : (
                  sortedEntries.map((e) => (
                    <article key={e.id} className="entry">
                      <div className="entryTop">
                        <div>
                          <h3 className="entryTitle">{e.title}</h3>
                          <div className="entryMeta">{formatDate(e.createdAt)}</div>
                        </div>

                        <button className="iconBtn" type="button" onClick={() => deleteEntry(e.id)} aria-label="Delete entry">
                          🗑️
                        </button>
                      </div>

                      <p className="entryBody">{e.body}</p>

                      {e.tags.length > 0 && (
                        <div className="tagRow" aria-label="Entry tags">
                          {e.tags.map((t) => (
                            <span key={t} className="tag">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* CONTACT */}
          <section className="panel" id="contact" aria-labelledby="contactTitle">
            <div className="panelHeader">
              <h2 className="panelTitle" id="contactTitle">
                Contact Terminal
              </h2>
              <span className="panelTag">let’s build</span>
            </div>

            <div className="terminal" role="region" aria-label="Contact terminal">
              <div className="terminalLine">
                <span className="prompt">$</span> echo "reach avory"
              </div>

              <div className="terminalLine">
                <span className="prompt">$</span> linkedin:{" "}
                <a href={LINKS.linkedin} target="_blank" rel="noreferrer">
                  {LINKS.linkedin}
                </a>
              </div>

              <div className="terminalLine">
                <span className="prompt">$</span> github:{" "}
                <a href={LINKS.github} target="_blank" rel="noreferrer">
                  {LINKS.github}
                </a>
              </div>

              <div className="terminalLine">
                <span className="prompt">$</span> repo:{" "}
                <a href={LINKS.repo} target="_blank" rel="noreferrer">
                  {LINKS.repo}
                </a>
              </div>

              <div className="terminalLine">
                <span className="prompt">$</span> email:{" "}
                <button
                  className="inlineBtn"
                  type="button"
                  onClick={async () => {
                    await safeCopy(LINKS.email);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1100);
                  }}
                >
                  {copied ? "copied ✅" : LINKS.email}
                </button>
              </div>
            </div>
          </section>

          <footer className="footer">
            <span>© {new Date().getFullYear()} • Avory Banks</span>
            <span className="sep" aria-hidden="true">
              •
            </span>
            <span>Vite + React + TypeScript</span>
          </footer>
        </section>
      </main>

      {/* Command palette modal */}
      {paletteOpen && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Command palette">
          <div className="modalBackdrop" onClick={() => setPaletteOpen(false)} />
          <div className="modalCard">
            <div className="modalTop">
              <div className="modalTitle">Command Palette</div>
              <button className="iconBtn" type="button" onClick={() => setPaletteOpen(false)} aria-label="Close palette">
                ✕
              </button>
            </div>

            <input
              ref={paletteInputRef}
              className="input"
              placeholder="Type: about / skills / projects / devlog / contact..."
              onKeyDown={(e) => {
                if (e.key === "Escape") setPaletteOpen(false);
              }}
            />

            <div className="paletteActions">
              <button className="btn" type="button" onClick={() => scrollToId("about")}>
                Go: About
              </button>
              <button className="btn" type="button" onClick={() => scrollToId("skills")}>
                Go: Skills
              </button>
              <button className="btn" type="button" onClick={() => scrollToId("projects")}>
                Go: Projects
              </button>
              <button className="btn" type="button" onClick={() => scrollToId("devlog")}>
                Go: DevLog
              </button>
              <button className="btn" type="button" onClick={() => scrollToId("contact")}>
                Go: Contact
              </button>

              <button
                className="btn primary"
                type="button"
                onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              >
                Toggle theme
              </button>
            </div>

            <div className="hint">
              Shortcut: <span className="mono">Ctrl/Cmd + K</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}