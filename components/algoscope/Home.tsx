"use client";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, useRef } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Play,
  Pause,
  GitBranch,
  BarChart3,
  Network,
  Layers,
  Braces,
  Hash,
  Search,
  Backpack,
  Binary,
  Table2,
  Sparkles,
  Route,
  Crown,
  Grid2X2,
  Shuffle,
} from "lucide-react";
import { Shell } from "./Shell";
import { LogoScene } from "./Logo";
import { modules } from "@/lib/algorithms/metadata";
import { sortTrace } from "@/lib/algorithms/sorting";
const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (notify: () => void) => {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const readMotion = () => window.matchMedia(motionQuery).matches;
const demo = sortTrace([42, 17, 31, 8, 25, 56, 12], "quick");
const icons = [
  BarChart3,
  Hash,
  Search,
  Braces,
  Layers,
  GitBranch,
  Backpack,
  Network,
  Binary,
  Table2,
  Grid2X2,
  Network,
  Crown,
  Route,
  Route,
  Grid2X2,
  Shuffle,
];
export function ModuleList({ featured = false }: { featured?: boolean }) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("All topics");
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (featured) return;
    const focusSearch = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.key !== "/" ||
        event.ctrlKey ||
        event.metaKey ||
        target.closest("input, textarea, select, [contenteditable]")
      )
        return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, [featured]);
  const categories = ["All topics", ...new Set(modules.map((m) => m.category))];
  const shown = modules.filter(
    (m) =>
      (!featured ||
        [
          "sorting-searching",
          "graphs",
          "knapsack",
          "eight-queens",
          "all-pairs",
          "randomized",
        ].includes(m.slug)) &&
      (category === "All topics" || m.category === category) &&
      `${m.title} ${m.category} ${m.algorithms.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      {!featured && (
        <div className="catalog-tools">
          <label className="catalog-search">
            <Search size={18} />
            <input
              ref={searchRef}
              aria-label="Search algorithms"
              placeholder="Find an algorithm or topic…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd>/</kbd>
          </label>
          <div className="category-filters" aria-label="Filter topics">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={c === category}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="catalog-result mono">
            {shown.length} LABS AVAILABLE
          </div>
        </div>
      )}
      <div className="module-grid">
        {shown.map((m) => {
          const i = modules.indexOf(m),
            Icon = icons[i] ?? Network;
          return (
            <Link
              href={"/learn/" + m.slug}
              className="module-card"
              key={m.slug}
            >
              <div className="module-top">
                <span className="module-symbol">
                  <Icon size={22} strokeWidth={1.5} />
                </span>
                <span className="module-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <ArrowUpRight size={16} />
              </div>
              <span className="eyebrow">{m.category}</span>
              <h3>{m.short}</h3>
              <p>{m.description}</p>
              <div className="module-meta">
                <span
                  className={"difficulty level-" + m.difficulty.toLowerCase()}
                >
                  {m.difficulty}
                </span>
                <span>
                  {m.algorithms.length}{" "}
                  {m.algorithms.length === 1 ? "algorithm" : "algorithms"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      {!shown.length && (
        <p className="search-empty">
          No matching labs. Try a different search or category.
        </p>
      )}
    </>
  );
}
export function Home() {
  const [step, setStep] = useState(0),
    [playing, setPlaying] = useState<boolean | null>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    readMotion,
    () => true,
  );
  const running = playing ?? !reducedMotion;
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(
      () => setStep((s) => (s + 1) % demo.steps.length),
      1100,
    );
    return () => clearInterval(timer);
  }, [running]);
  const s = demo.steps[step];
  return (
    <Shell>
      <main className="home-main space-home">
        <section className="space-hero">
          <div className="space-hero-copy">
            <div className="release-pill">
              <span className="status-dot" /> YOUR IDEAS. IN MOTION.
            </div>
            <h1>
              See the logic.
              <br />
              <span>Feel the flow.</span>
            </h1>
            <p>
              A visual playground for algorithms.
              <br />
              Go from “how?” to “got it,” one step at a time.
            </p>
            <div className="hero-actions">
              <Link className="button primary" href="/learn">
                Explore the labs <ArrowUpRight size={18} />
              </Link>
              <Link className="button secondary" href="/playground">
                <Play size={15} /> Open playground
              </Link>
            </div>
            <div className="hero-small mono">
              <span>{modules.length} INTERACTIVE LABS</span>
              <i /> BUILT FOR EXPLORATION
            </div>
          </div>
          <div className="hero-art">
            <LogoScene />
            <span className="art-tag tag-one">
              <GitBranch size={14} /> explore every path
            </span>
            <span className="art-tag tag-two">
              <span className="status-dot" /> understanding, unlocked
            </span>
          </div>
        </section>
        <section className="home-terminal">
          <div className="terminal-top">
            <div>
              <i />
              <i />
              <i />
              <span className="mono">QUICK SORT / LIVE EXECUTION</span>
            </div>
            <Link href="/learn/sorting-searching">
              Open lab <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="terminal-content">
            <div className="terminal-copy">
              <span className="eyebrow">DON’T JUST READ IT.</span>
              <h2>Watch it click.</h2>
              <p>{s.explanation}</p>
              <div className="demo-controls">
                <button
                  className="icon-button"
                  aria-label={running ? "Pause preview" : "Play preview"}
                  onClick={() => setPlaying(!running)}
                >
                  {running ? <Pause size={17} /> : <Play size={17} />}
                </button>
                <span className="mono">
                  STEP {String(step + 1).padStart(2, "0")} / {demo.steps.length}
                </span>
                <span className="event-tag">{s.type}</span>
              </div>
            </div>
            <div className="space-bars" aria-label="Live Quick Sort preview">
              {s.array?.map((v, i) => (
                <div
                  key={s.ids?.[i] ?? i}
                  className={
                    "space-bar " +
                    (s.done?.includes(i)
                      ? "complete"
                      : s.active?.includes(i)
                        ? "comparing"
                        : "")
                  }
                  style={{ height: `${v * 2 + 35}px`, order: i }}
                >
                  <span>{v}</span>
                  <small>{i}</small>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="curriculum">
          <div className="space-section-heading">
            <div>
              <div className="eyebrow">FIND YOUR NEXT AHA MOMENT</div>
              <h2>A little curiosity goes a long way.</h2>
            </div>
            <Link href="/learn">
              All {modules.length} labs <ArrowRight size={17} />
            </Link>
          </div>
          <ModuleList featured />
        </section>
        <section className="space-compare">
          <div className="compare-orbits" aria-hidden="true">
            <Layers size={42} />
            <Sparkles size={20} />
          </div>
          <div>
            <div className="eyebrow">SAME INPUT. DIFFERENT THINKING.</div>
            <h2>Understand the tradeoffs.</h2>
            <p>Run two algorithms side by side.</p>
          </div>
          <Link href="/compare" className="button secondary">
            Compare algorithms <ArrowUpRight size={17} />
          </Link>
        </section>
      </main>
    </Shell>
  );
}
