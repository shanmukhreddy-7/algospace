"use client";
import { useState } from "react";
import { ArrowRight, FlaskConical } from "lucide-react";
import { Shell } from "./Shell";
import { Choice, PlaybackControls } from "./Controls";
import { Visualizer, DataTable } from "./Visualizers";
import { InputEditor } from "./InputEditor";
import { execute, defaultInput, parseArray } from "@/lib/algorithms";
import { names } from "@/lib/algorithms/metadata";
import { usePlayback } from "@/lib/engine/usePlayback";
import type { Input } from "@/lib/engine/types";
export function Compare() {
  const [pair, setPair] = useState("sorting"),
    [input, setInput] = useState<Input>(structuredClone(defaultInput)),
    [arrayText, setArrayText] = useState(defaultInput.array.join(", ")),
    [error, setError] = useState(""),
    [result, setResult] = useState(() => ({
      pair: "sorting",
      traces: [execute("merge", defaultInput), execute("quick", defaultInput)],
    }));
  const total = Math.max(...result.traces.map((t) => t.steps.length)),
    p = usePlayback(total);
  const algorithms =
    result.pair === "sorting" ? ["merge", "quick"] : ["prim", "kruskal"];
  function run() {
    try {
      const next = {
        ...input,
        array: pair === "sorting" ? parseArray(arrayText) : input.array,
      };
      const kinds =
        pair === "sorting" ? ["merge", "quick"] : ["prim", "kruskal"];
      const traces = kinds.map((k) => execute(k, next));
      setResult({ pair, traces });
      p.reset();
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Shell>
      <main className="lab-main">
        <div className="page-heading">
          <div className="eyebrow">THE COMPARISON LABORATORY</div>
          <h1>Same input. Different approaches.</h1>
          <p>
            Step through two algorithms together and compare the work they
            actually perform.
          </p>
        </div>
        <div className="lab-toolbar">
          <label className="inline-label">
            Compare
            <Choice
              label="Algorithm comparison"
              value={pair}
              onChange={(v) => {
                setPair(v);
                p.setPlaying(false);
              }}
              options={[
                { value: "sorting", label: "Merge Sort vs Quick Sort" },
                { value: "graphs", label: "Prim vs Kruskal" },
              ]}
            />
          </label>
          <span className="toolbar-note">
            One recorded operation per algorithm, per tick.
          </span>
        </div>
        <details className="input-details">
          <summary>
            Configure shared input{" "}
            <span>The same data goes to both algorithms</span>
          </summary>
          <InputEditor
            kind={pair === "sorting" ? "merge" : "prim"}
            input={input}
            setInput={setInput}
            arrayText={arrayText}
            setArrayText={setArrayText}
          />
        </details>
        <div className="run-row">
          <button className="button primary" onClick={run}>
            <FlaskConical size={16} /> Run comparison
          </button>
          <p>Changes apply to both panels when you run.</p>
        </div>
        {error && (
          <p className="error-box" role="alert">
            {error}
          </p>
        )}
        <div className="comparison-panels">
          {result.traces.map((trace, i) => {
            const s = trace.steps[Math.min(p.index, trace.steps.length - 1)];
            return (
              <section className="panel" key={algorithms[i]}>
                <div className="panel-label">
                  <span>{names[algorithms[i]]}</span>
                  <span className="mono">
                    {Math.min(p.index + 1, trace.steps.length)} /{" "}
                    {trace.steps.length}
                  </span>
                </div>
                <Visualizer kind={algorithms[i]} s={s} />
                <div className="comparison-explanation">
                  <span className="event-tag">{s.type}</span>
                  <p>{s.explanation}</p>
                </div>
                <div className="comparison-counts">
                  {Object.entries(s.counts).map(([name, value]) => (
                    <div key={name}>
                      <span>{name}</span>
                      <strong className="mono">{value}</strong>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
        <section className="panel">
          <PlaybackControls p={p} total={total} />
        </section>
        <section className="panel prose">
          <div className="eyebrow">THEORETICAL COMPLEXITY</div>
          <DataTable
            headers={[
              "Algorithm",
              "Best",
              "Average",
              "Worst",
              "Auxiliary space",
            ]}
            rows={result.traces.map((t, i) => [
              names[algorithms[i]],
              t.complexity.best,
              t.complexity.average,
              t.complexity.worst,
              t.complexity.space,
            ])}
          />
          <div className="two-columns">
            {result.traces.map((t, i) => (
              <p key={i}>
                <strong>{names[algorithms[i]]}:</strong> {t.assumption}
              </p>
            ))}
          </div>
          <h3>Interpret the tradeoff</h3>
          <p>
            {result.pair === "sorting"
              ? "Merge Sort guarantees Θ(n log n) time and stability, using a temporary buffer. Quick Sort partitions in place and often performs well, but its last-element pivot can produce quadratic work and a linear recursion stack. Neither is universally better."
              : "Prim grows one connected tree; Kruskal grows a forest and rejects cycles. Both produce a minimum spanning tree for a connected undirected graph, possibly with different edges when weights tie. Implementation choices and graph density determine the practical tradeoffs."}
          </p>
          <p className="field-hint">
            Panels advance by event, not equal CPU time. Counter definitions
            depend on the algorithm. Visualization history is excluded from
            auxiliary-space bounds.
          </p>
        </section>
        <a href="/playground" className="button">
          Try another experiment <ArrowRight size={16} />
        </a>
      </main>
    </Shell>
  );
}
