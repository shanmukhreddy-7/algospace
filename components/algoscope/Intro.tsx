"use client";
import { useSyncExternalStore } from "react";
import { ArrowRight, Activity } from "lucide-react";
const key = "algoscope-intro-v1";
let entered = false;
const subscribe = (notify: () => void) => {
  window.addEventListener("algoscope-enter", notify);
  return () => window.removeEventListener("algoscope-enter", notify);
};
const read = () => {
  try {
    return entered || sessionStorage.getItem(key) === "seen";
  } catch {
    return entered;
  }
};
export function Intro({ children }: { children: React.ReactNode }) {
  const seen = useSyncExternalStore(subscribe, read, () => false);
  if (seen) return children;
  return (
    <main className="intro-scene">
      <div className="intro-top">
        <span>
          <Activity size={20} /> AlgoScope.
        </span>
        <span>DESIGN & ANALYSIS OF ALGORITHMS</span>
      </div>
      <div className="intro-orbit" aria-hidden="true">
        <svg viewBox="0 0 800 500">
          <g className="intro-lines">
            <path d="M400 80 200 220 100 390 M200 220 300 390 M400 80 600 220 500 390 M600 220 700 390" />
          </g>
          {[
            [400, 80, "01"],
            [200, 220, "02"],
            [600, 220, "03"],
            [100, 390, "04"],
            [300, 390, "05"],
            [500, 390, "06"],
            [700, 390, "07"],
          ].map(([x, y, n], i) => (
            <g
              key={n}
              className="intro-node"
              style={{ animationDelay: `${i * 180}ms` }}
            >
              <circle cx={x} cy={y} r="29" />
              <text x={x} y={Number(y) + 5}>
                {n}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="intro-copy">
        <span className="intro-kicker">CURIOSITY → CLARITY</span>
        <h1>
          Every great solution
          <br />
          starts with <em>a step.</em>
        </h1>
        <p>
          See the logic. Follow the journey.
          <br />
          Understand algorithms by watching them work.
        </p>
        <button
          className="intro-enter"
          onClick={() => {
            entered = true;
            try {
              sessionStorage.setItem(key, "seen");
            } catch {}
            window.dispatchEvent(new Event("algoscope-enter"));
            requestAnimationFrame(() =>
              document.querySelector<HTMLElement>(".home-main h1")?.focus(),
            );
          }}
        >
          Enter AlgoScope <ArrowRight size={20} />
        </button>
      </div>
      <div className="intro-bottom">
        <span>VISUALIZE. EXPERIMENT. UNDERSTAND.</span>
        <span>Created by Shanmukh Reddy</span>
      </div>
      <noscript>
        <style>{`.intro-scene{display:none}`}</style>
        <p>
          Enable JavaScript to use the interactive laboratory.{" "}
          <a href="/study-materials">Browse study materials</a>.
        </p>
      </noscript>
    </main>
  );
}
