import { useEffect, useMemo, useState } from "react";
import "./App.css";
import pic from "./assets/pic.jpg";

// Update these 3 links and you're done.
// (LinkedIn must be real so the rubric passes.)
const LINKS = {
  linkedin: "https://www.linkedin.com/in/avobanks/", // <-- change if needed
  github: "https://github.com/avo773", // optional
  email: "avbanks@icstars.org", // <-- change
};

const ROLE_ROTATION = [
  "A.I. Engineer",
  "Full-Stack Developer",
  "Agent + RAG Builder",
  "API + Workflow Architect",
  "Product-First Engineer",
];

type Skill = {
  label: string;
  category: "AI" | "Full Stack" | "Data" | "Reliability";
  level: "Core" | "Strong" | "Learning";
};

const SKILLS: Skill[] = [
  { label: "RAG (retrieval + chunking)", category: "AI", level: "Core" },
  { label: "Embeddings + reranking", category: "AI", level: "Strong" },
  { label: "Agent tool calling", category: "AI", level: "Core" },
  { label: "Prompt + policy packs", category: "AI", level: "Strong" },
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
];

type Category = "All" | Skill["category"];

function safeCopy(text: string) {
  // clipboard can fail on non-https; fallback to prompt.
  if (navigator?.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).catch(() => {
      window.prompt("Copy this:", text);
    });
  }
  window.prompt("Copy this:", text);
}

export default function App() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [category, setCategory] = useState<Category>("All");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => {
      setRoleIndex((i) => (i + 1) % ROLE_ROTATION.length);
    }, 2100);
    return () => window.clearInterval(t);
  }, []);

  const filteredSkills = useMemo(() => {
    if (category === "All") return SKILLS;
    return SKILLS.filter((s) => s.category === category);
  }, [category]);

  const coreCount = filteredSkills.filter((s) => s.level === "Core").length;
  const strongCount = filteredSkills.filter((s) => s.level === "Strong").length;

  return (
    <div className="app" id="top">
      {/* Ambient background layers */}
      <div className="bg" aria-hidden="true">
        <div className="bgGrid" />
        <div className="bgGlow" />
        <div className="bgScanlines" />
        <div className="bgNoise" />
      </div>

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
          <a href="#contact" className="navLink">
            Contact
          </a>

          <a
            className="navCta"
            href={LINKS.linkedin}
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn ↗
          </a>
        </nav>
      </header>

      <main className="layout">
        {/* LEFT: sticky identity capsule */}
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
                <span>Currently leveling up evals</span>
              </div>
            </div>

            <div className="quickLinks">
              <a
                className="pill"
                href={LINKS.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn ↗
              </a>
              <a className="pill" href={LINKS.github} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
              <button
                className="pill ghost"
                onClick={asSync () => {
                  await safeCopy(LINKS.email);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1100);
                }}
                type="button"
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
            </div>
          </div>

          <div className="miniCard">
            <h2 className="miniTitle">Signal</h2>
            <p className="miniText">
              I don’t chase “cool AI.” I ship systems that are testable, explainable,
              and usable by real teams under real constraints.
            </p>
          </div>
        </aside>

        {/* RIGHT: content */}
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
              I’m an AI Engineer and Full Stack Developer focused on production-ready
              agent workflows, retrieval (RAG), and clean web systems. I like building
              “governed AI” — where output is consistent, reviewable, and backed by
              receipts (audit logs, diffs, versioned artifacts).
            </p>
            <p className="p">
              I’m comfortable across the stack: UI, APIs, data modeling, and the boring
              reliability stuff (validation, tests, telemetry). If it can break at 3AM,
              I’m thinking about it at 3PM.
            </p>

            <div className="callout">
              <div className="calloutLeft">
                <span className="calloutTitle">Current obsession</span>
                <span className="calloutBody">
                  Evaluation loops + human-in-the-loop checkpoints that keep AI “fast”
                  without letting it get reckless.
                </span>
              </div>
              <a className="calloutBtn" href="#projects">
                See what I’m building →
              </a>
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
              {(["All", "AI", "Full Stack", "Data", "Reliability"] as Category[]).map(
                (c) => (
                  <button
                    key={c}
                    type="button"
                    className={`filterBtn ${category === c ? "active" : ""}`}
                    onClick={() => setCategory(c)}
                    aria-pressed={category === c}
                  >
                    {c}
                  </button>
                )
              )}
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

            {/* You asked for this exact list earlier — included, but styled */}
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
                Modules
              </h2>
              <span className="panelTag">what I ship</span>
            </div>

            <div className="cards">
              <article className="card">
                <div className="cardTop">
                  <h3>JD Factory</h3>
                  <span className="chip">Governed GenAI</span>
                </div>
                <p className="p">
                  A governed JD supply chain: research → draft → review → diff → export.
                  Built for auditability, consistency, and measurable cycle-time reduction.
                </p>
                <div className="tagRow">
                  <span className="tag">Artifacts</span>
                  <span className="tag">Approvals</span>
                  <span className="tag">Diffs</span>
                  <span className="tag">Exports</span>
                </div>
              </article>

              <article className="card">
                <div className="cardTop">
                  <h3>Agent Toolkit</h3>
                  <span className="chip">Tool Calling</span>
                </div>
                <p className="p">
                  Patterns for predictable agents: structured outputs, tool routing,
                  guardrails, and logs that make debugging sane.
                </p>
                <div className="tagRow">
                  <span className="tag">Policies</span>
                  <span className="tag">Retries</span>
                  <span className="tag">Telemetry</span>
                </div>
              </article>

              <article className="card">
                <div className="cardTop">
                  <h3>Portfolio Systems</h3>
                  <span className="chip">React</span>
                </div>
                <p className="p">
                  Unorthodox UI experiments that still follow semantic HTML and stay
                  stable. “Cool” is meaningless if it breaks.
                </p>
                <div className="tagRow">
                  <span className="tag">TypeScript</span>
                  <span className="tag">CSS</span>
                  <span className="tag">UX</span>
                </div>
              </article>
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
                <span className="prompt">$</span> email:{" "}
                <button
                  className="inlineBtn"
                  onClick={async () => {
                    await safeCopy(LINKS.email);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1100);
                  }}
                  type="button"
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
    </div>
  );
}