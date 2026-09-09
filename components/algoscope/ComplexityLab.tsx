"use client";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Choice } from "./Controls";
import { DataTable } from "./Visualizers";
const curves = [
  { name: "1", label: "O(1)", color: "#626970", log: () => 0 },
  {
    name: "log",
    label: "O(log n)",
    color: "#486581",
    log: (n: number) => Math.log10(Math.max(1, Math.log2(n))),
  },
  {
    name: "n",
    label: "O(n)",
    color: "#4f7665",
    log: (n: number) => Math.log10(n),
  },
  {
    name: "nlog",
    label: "O(n log n)",
    color: "#9b8457",
    log: (n: number) => Math.log10(Math.max(1, n * Math.log2(n))),
  },
  {
    name: "square",
    label: "O(n²)",
    color: "#a65353",
    log: (n: number) => 2 * Math.log10(n),
  },
  {
    name: "exp",
    label: "O(2ⁿ)",
    color: "#6c6580",
    log: (n: number) => n * Math.log10(2),
  },
  {
    name: "factorial",
    label: "O(n!)",
    color: "#a36c3e",
    log: (n: number) =>
      Array.from({ length: n }, (_, i) => Math.log10(i + 1)).reduce(
        (a, b) => a + b,
        0,
      ),
  },
];
export function ComplexityLab() {
  const [n, setN] = useState(16),
    [selected, setSelected] = useState(curves.map((c) => c.name)),
    [experiment, setExperiment] = useState("Single loop"),
    [a, setA] = useState(2),
    [b, setB] = useState(2),
    [d, setD] = useState(1);
  const data = Array.from({ length: n }, (_, i) =>
    Object.fromEntries([
      ["input", i + 1],
      ...curves.map((c) => [c.name, Number(c.log(i + 1).toFixed(4))]),
    ]),
  );
  const logb = Math.log(a) / Math.log(b);
  const master =
    Math.abs(logb - d) < 0.0001
      ? `Θ(n${d === 1 ? "" : `^${d}`} log n)`
      : logb > d
        ? `Θ(n^${logb.toFixed(3)})`
        : `Θ(n${d === 1 ? "" : `^${d}`})`;
  let count = 0;
  for (let i = 1; i <= n; i++) {
    if (experiment === "Single loop") count++;
    else
      for (let j = 1; j <= (experiment === "Nested loops" ? n : i); j++)
        count++;
  }
  return (
    <>
      <section className="panel complexity-panel">
        <div className="panel-label">
          <span>GROWTH-RATE LABORATORY</span>
          <span className="mono">n = {n}</span>
        </div>
        <div className="complexity-controls">
          <label>
            Input size (n)
            <Slider
              min={2}
              max={50}
              value={[n]}
              onValueChange={([v]) => setN(v)}
              aria-label="Complexity input size"
            />
          </label>
          <div className="curve-options">
            {curves.map((c) => (
              <label key={c.name}>
                <Checkbox
                  checked={selected.includes(c.name)}
                  onCheckedChange={(v) =>
                    setSelected(
                      v
                        ? [...selected, c.name]
                        : selected.filter((s) => s !== c.name),
                    )
                  }
                  aria-label={`Show ${c.label}`}
                />
                <span style={{ color: c.color }}>{c.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="growth-chart">
          <ResponsiveContainer width="100%" height={330}>
            <LineChart
              data={data}
              margin={{ left: 10, right: 25, top: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 4" stroke="var(--border)" />
              <XAxis dataKey="input" stroke="var(--muted-foreground)" />
              <YAxis
                stroke="var(--muted-foreground)"
                tickFormatter={(v) => "10^" + Math.round(v)}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                formatter={(v) => [`10^${Number(v).toFixed(2)}`]}
              />
              {curves
                .filter((c) => selected.includes(c.name))
                .map((c) => (
                  <Line
                    key={c.name}
                    type="monotone"
                    dataKey={c.name}
                    name={c.label}
                    stroke={c.color}
                    dot={false}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="chart-note">
          The vertical axis shows log₁₀(operations). Equal vertical intervals
          represent multiplication by 10. This keeps exponential and factorial
          growth visible without overflow. Curves illustrate growth classes with
          unit constants.
        </p>
        <DataTable
          headers={["Growth class", `Operations at n = ${n}`]}
          rows={curves
            .filter((c) => selected.includes(c.name))
            .map((c) => [
              c.label,
              c.log(n) > 8
                ? `≈ 10^${c.log(n).toFixed(2)}`
                : Math.round(10 ** c.log(n)).toLocaleString(),
            ])}
        />
      </section>
      <div className="two-columns">
        <section className="panel prose">
          <div className="eyebrow">MEASURED OPERATION COUNT</div>
          <h3>What does a loop cost?</h3>
          <Choice
            label="Operation counting experiment"
            value={experiment}
            onChange={setExperiment}
            options={["Single loop", "Nested loops", "Triangular loop"]}
          />
          <pre>
            {experiment === "Single loop"
              ? "for i = 1 to n:\n  count += 1"
              : experiment === "Nested loops"
                ? "for i = 1 to n:\n  for j = 1 to n:\n    count += 1"
                : "for i = 1 to n:\n  for j = 1 to i:\n    count += 1"}
          </pre>
          <p>
            <strong className="metric-number">{count.toLocaleString()}</strong>{" "}
            body executions for n = {n}
          </p>
          <p>
            {experiment === "Single loop"
              ? "n"
              : experiment === "Nested loops"
                ? "n × n"
                : "1 + 2 + … + n = n(n+1)/2"}
            . Count the repeated primitive operation before simplifying to a
            growth class.
          </p>
        </section>
        <section className="panel prose">
          <div className="eyebrow">MASTER METHOD</div>
          <h3>Analyze recursive decomposition</h3>
          <p className="mono">T(n) = a T(n/b) + Θ(nᵈ)</p>
          <div className="field-row">
            {[
              ["a", a, setA],
              ["b", b, setB],
              ["d", d, setD],
            ].map(([name, value, fn]) => (
              <label key={String(name)}>
                {String(name)}
                <input
                  type="number"
                  value={Number(value)}
                  min={name === "b" ? 2 : name === "a" ? 1 : 0}
                  max={name === "d" ? 5 : 8}
                  onChange={(e) =>
                    (fn as (v: number) => void)(
                      Math.max(
                        name === "b" ? 2 : name === "a" ? 1 : 0,
                        Math.min(name === "d" ? 5 : 8, Number(e.target.value)),
                      ),
                    )
                  }
                />
              </label>
            ))}
          </div>
          <p className="master-result mono">{master}</p>
          <p>
            Compare d = {d} with log<sub>{b}</sub>({a}) ≈ {logb.toFixed(3)}.{" "}
            {Math.abs(logb - d) < 0.0001
              ? "Balanced work across levels adds a log n factor."
              : logb > d
                ? "Recursive leaves dominate the work."
                : "The nonrecursive work dominates; the regularity condition holds for this polynomial f(n)."}
          </p>
          <p>
            Assumes a ≥ 1, b &gt; 1, constant base-case cost, and f(n) = Θ(nᵈ).
            This calculator covers polynomial f(n), not all recurrences.
          </p>
        </section>
      </div>
      <section className="panel prose">
        <h3>Reason about a problem before writing code</h3>
        <p>
          Specify inputs and outputs, identify constraints, choose a
          representation, and state an invariant. Then prove termination and
          count work. For example, summing n values needs one accumulator and a
          loop invariant: after i iterations, the accumulator equals the sum of
          the first i values.
        </p>
        <DataTable
          headers={["Notation", "Meaning", "Example"]}
          rows={[
            [
              "O — upper bound",
              "Eventually no faster than a constant multiple of g(n)",
              "3n + 2 ∈ O(n)",
            ],
            [
              "Ω — lower bound",
              "Eventually at least a constant multiple of g(n)",
              "3n + 2 ∈ Ω(n)",
            ],
            [
              "Θ — tight bound",
              "Both an upper and a lower bound",
              "3n + 2 ∈ Θ(n)",
            ],
          ]}
        />
        <p>
          Big-O is not a synonym for worst case. Best, average, and worst
          describe inputs; O, Ω, and Θ describe bounds on a chosen cost
          function.
        </p>
      </section>
    </>
  );
}
