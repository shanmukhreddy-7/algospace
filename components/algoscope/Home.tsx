"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Shell } from "./Shell";
import { modules } from "@/lib/algorithms/metadata";
import { sortTrace } from "@/lib/algorithms/sorting";
const demo = sortTrace([42, 17, 31, 8, 25], "quick");
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
];
export function ModuleList() {
  return (
    <div className="module-grid">
      {modules.map((m, i) => {
        const Icon = icons[i];
        return (
          <Link
            href={"/learn/" + m.slug}
            className={"module-card module-" + i}
            key={m.slug}
          >
            <div className="module-top">
              <span className="module-num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="eyebrow">{m.category}</span>
              <Icon size={21} strokeWidth={1.5} />
            </div>
            <h3>{m.short}</h3>
            <p>{m.description}</p>
            <div className="module-meta">
              <span
                className={"difficulty level-" + m.difficulty.toLowerCase()}
              >
                {m.difficulty}
              </span>
              <span>{m.visual}</span>
              <ArrowUpRight size={16} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
export function Home() {
  const [step, setStep] = useState(3),
    [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(
      () => setStep((s) => (s + 1) % demo.steps.length),
      1300,
    );
    return () => clearInterval(timer);
  }, [playing]);
  const s = demo.steps[step];
  return (
    <Shell>
      <main className="home-main">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow kicker">
              <span /> THE ALGORITHM LEARNING LAB
            </div>
            <h1 tabIndex={-1}>
              Understand algorithms
              <br />
              by watching them <em>work.</em>
            </h1>
            <p>
              Explore, execute and analyze fundamental algorithms
              <br className="desktop-break" /> through interactive
              visualizations.
            </p>
            <div className="hero-actions">
              <Link className="button primary" href="/learn">
                Explore Algorithms <ArrowRight size={17} />
              </Link>
              <Link className="button secondary" href="/playground">
                Open Playground <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="hero-note">
              <span>10 learning modules</span>
              <i />
              Step-by-step execution
              <i />
              Your input. Your pace.
            </div>
          </div>
          <div className="hero-demo">
            <div className="panel-label">
              <span>
                <span className="status-dot" /> QUICK SORT{" "}
                <span className="sub-label">/ a closer look</span>
              </span>
              <span className="mono">
                {String(step + 1).padStart(2, "0")} / {demo.steps.length}
              </span>
            </div>
            <div className="mini-bars">
              {s.array?.map((v, i) => (
                <div
                  key={i}
                  className={
                    "mini-bar " +
                    (s.done?.includes(i)
                      ? "complete"
                      : s.active?.includes(i)
                        ? "comparing"
                        : "")
                  }
                  style={{ height: v * 2.6 + 25 }}
                >
                  <span>{v}</span>
                  <small>{i}</small>
                </div>
              ))}
            </div>
            <div className="demo-explanation">
              <span className="mono">{s.type}</span>
              <p>{s.explanation}</p>
              <button
                aria-label={playing ? "Pause preview" : "Play preview"}
                className="icon-button"
                onClick={() => setPlaying(!playing)}
              >
                {playing ? <Pause size={17} /> : <Play size={17} />}
              </button>
            </div>
            <div className="demo-foot">
              <span>
                <i className="legend-square" /> Unvisited
              </span>
              <span>
                <i className="legend-square amber" /> Active operation
              </span>
              <Link href="/learn/sorting-searching">
                Try it yourself <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
        <div className="principles">
          <span>
            <Play size={17} /> Learn by doing
          </span>
          <p>Real algorithms. Your own inputs. Every operation explained.</p>
          <span className="mono">01 → 10</span>
        </div>
        <section className="curriculum">
          <div className="section-heading">
            <div className="eyebrow">THE CURRICULUM</div>
            <div>
              <h2>
                Choose what you want to understand
                <span className="brand-dot">.</span>
              </h2>
              <p>
                Start with the foundations, or go straight to a problem that
                interests you.
              </p>
            </div>
            <span className="module-count">10 modules ↓</span>
          </div>
          <ModuleList />
        </section>
        <section className="compare-banner">
          <div className="compare-mark">
            <BarChart3 size={30} />
          </div>
          <div>
            <div className="eyebrow">ONE INPUT. TWO APPROACHES.</div>
            <h3>Same problem. Different paths.</h3>
            <p>
              Run algorithms side by side and see where the tradeoffs begin.
            </p>
          </div>
          <Link className="button secondary" href="/compare">
            Compare Algorithms <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    </Shell>
  );
}
