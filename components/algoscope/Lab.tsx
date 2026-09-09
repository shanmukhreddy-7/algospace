"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  FlaskConical,
  Check,
  RotateCcw,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Shell } from "./Shell";
import { Choice, PlaybackControls } from "./Controls";
import { Visualizer, DataTable } from "./Visualizers";
import { InputEditor } from "./InputEditor";
import { ComplexityLab } from "./ComplexityLab";
import { usePlayback } from "@/lib/engine/usePlayback";
import { modules, names, type Module } from "@/lib/algorithms/metadata";
import { lessons } from "@/lib/algorithms/lessons";
import { execute, defaultInput, parseArray } from "@/lib/algorithms";
import type { Input, Trace } from "@/lib/engine/types";
const allAlgorithms = Object.keys(names).filter((k) => k !== "complexity");
export function Lab({
  module,
  playground = false,
}: {
  module: Module;
  playground?: boolean;
}) {
  const [kind, setKind] = useState<string>(module.algorithms[0]),
    [input, setInput] = useState<Input>(structuredClone(defaultInput)),
    [arrayText, setArrayText] = useState(defaultInput.array.join(", ")),
    [error, setError] = useState(""),
    [mode, setMode] = useState("learn"),
    [question, setQuestion] = useState(false),
    [feedback, setFeedback] = useState(""),
    [answered, setAnswered] = useState<number[]>([]),
    [trace, setTrace] = useState<Trace>(() =>
      execute(
        module.algorithms[0] === "complexity" ? "merge" : module.algorithms[0],
        defaultInput,
      ),
    ),
    [ran, setRan] = useState(false);
  const beforeAdvance = useCallback(
    (index: number) => {
      if (
        mode === "practice" &&
        index > 0 &&
        index < trace.steps.length - 1 &&
        index % 5 === 0 &&
        !answered.includes(index)
      ) {
        setQuestion(true);
        return false;
      }
      return true;
    },
    [mode, answered, trace.steps.length],
  );
  const p = usePlayback(trace.steps.length, !question, beforeAdvance);
  const { reset, setIndex, setPlaying } = p;
  const s = trace.steps[p.index];
  const previous = trace.steps[Math.max(0, p.index - 1)];
  const activeModule = playground
    ? (modules.find((m) =>
        (m.algorithms as readonly string[]).includes(kind),
      ) ?? module)
    : module;
  const lesson = lessons[activeModule.slug];
  const run = useCallback(
    (selected = kind, override?: Input) => {
      try {
        const isArray = [
          "merge",
          "quick",
          "linear",
          "binary",
          "hash",
          "array",
          "stack",
          "queue",
        ].includes(selected);
        const isTree = [
          "bst-insert",
          "bst-search",
          "inorder",
          "preorder",
          "postorder",
        ].includes(selected);
        const next = { ...(override ?? input) };
        if (isArray) next.array = parseArray(arrayText);
        if (isTree) {
          if (arrayText.trim() && arrayText.split(",").some((x) => !x.trim()))
            throw new Error("Separate tree values with single commas.");
          next.array = arrayText.trim()
            ? arrayText.split(",").map((x) => Number(x.trim()))
            : [];
        }
        const result = execute(selected, next);
        setTrace(result);
        setInput(next);
        reset();
        setQuestion(false);
        setFeedback("");
        setAnswered([]);
        setError("");
        setRan(true);
        try {
          localStorage.setItem("algoscope-last-algorithm", selected);
        } catch {
          /* Storage may be disabled. */
        }
        return result;
      } catch (e) {
        setError((e as Error).message);
        return null;
      }
    },
    [kind, input, arrayText, reset],
  );
  function changeAlgorithm(k: string) {
    const result = run(k);
    if (result) setKind(k);
  }
  function advance() {
    if (
      mode === "practice" &&
      p.index < trace.steps.length - 1 &&
      !answered.includes(p.index)
    ) {
      setQuestion(true);
      p.setPlaying(false);
    } else p.next();
  }
  function play() {
    if (
      mode === "practice" &&
      !p.playing &&
      !answered.includes(p.index) &&
      p.index < trace.steps.length - 1
    )
      setQuestion(true);
    else p.toggle();
  }
  const nextType =
    trace.steps[Math.min(p.index + 1, trace.steps.length - 1)].type;
  const options = useMemo(
    () =>
      [
        ...new Set([
          nextType,
          "compare",
          "finish",
          "insert",
          "visit-node",
          "write",
          "select-edge",
        ]),
      ]
        .slice(0, 4)
        .sort(),
    [nextType],
  );
  useEffect(() => {
    const doc = document as Document & {
      modelContext?: {
        registerTool: (tool: unknown, options: unknown) => void;
      };
    };
    if (!doc.modelContext) return;
    const controller = new AbortController();
    try {
      doc.modelContext.registerTool(
        {
          name: "set_execution_step",
          description:
            "Move the active algorithm laboratory to a recorded execution step and return its state.",
          inputSchema: {
            type: "object",
            properties: { step: { type: "integer", minimum: 1 } },
            required: ["step"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false },
          execute: async (value: unknown) => {
            const step = (value as { step?: number })?.step;
            if (
              !Number.isInteger(step) ||
              step! < 1 ||
              step! > trace.steps.length
            )
              throw new Error("Step is outside the execution history.");
            setPlaying(false);
            setIndex(step! - 1);
            await new Promise<void>((resolve) =>
              requestAnimationFrame(() =>
                requestAnimationFrame(() => resolve()),
              ),
            );
            return { step, state: trace.steps[step! - 1] };
          },
        },
        { signal: controller.signal },
      );
    } catch {
      /* Optional browser capability. */
    }
    return () => controller.abort();
  }, [trace, setIndex, setPlaying]);
  return (
    <Shell>
      <main className="lab-main">
        <div className="breadcrumbs">
          <Link href="/learn">
            <ArrowLeft size={14} /> All modules
          </Link>
          <span>/</span>
          <span>{playground ? "Playground" : activeModule.category}</span>
        </div>
        <div className="lab-title">
          <div>
            <div className="eyebrow">
              {playground
                ? "EXPERIMENT & OBSERVE"
                : `MODULE ${String(modules.indexOf(module) + 1).padStart(2, "0")} · ${module.category}`}
            </div>
            <h1>{playground ? "Algorithm Playground" : module.title}</h1>
            <p>
              {playground
                ? "Change the input, rerun the experiment, and observe how the work changes."
                : module.description}
            </p>
          </div>
          <span className="difficulty">{module.difficulty}</span>
        </div>
        {kind === "complexity" ? (
          <ComplexityLab />
        ) : (
          <>
            <div className="lab-toolbar">
              <label className="inline-label">
                Algorithm
                <Choice
                  label="Algorithm"
                  value={kind}
                  onChange={changeAlgorithm}
                  options={(playground
                    ? allAlgorithms
                    : [...module.algorithms]
                  ).map((value) => ({ value, label: names[value] }))}
                />
              </label>
              <Tabs
                value={mode}
                onValueChange={(v) => {
                  setMode(v);
                  setQuestion(false);
                  setFeedback("");
                  p.setPlaying(false);
                }}
              >
                <TabsList>
                  <TabsTrigger value="learn">Learn mode</TabsTrigger>
                  <TabsTrigger value="practice">Practice mode</TabsTrigger>
                </TabsList>
              </Tabs>
              <span className="toolbar-note">
                {mode === "learn"
                  ? "Every operation, explained."
                  : "Predict the next operation."}
              </span>
            </div>
            <details className="input-details" open={!ran} onToggle={() => {}}>
              <summary>
                Configure input <span>Custom data & examples</span>
              </summary>
              <InputEditor
                kind={kind}
                input={input}
                setInput={(v) => {
                  setInput(v);
                  p.setPlaying(false);
                }}
                arrayText={arrayText}
                setArrayText={(v) => {
                  setArrayText(v);
                  p.setPlaying(false);
                }}
              />
              <div className="run-row">
                <button className="button primary" onClick={() => run()}>
                  <FlaskConical size={16} /> Run algorithm
                </button>
                <p>
                  Input edits apply when you run. Playback shows the last
                  executed input.
                </p>
              </div>
            </details>
            {error && (
              <div className="error-box" role="alert">
                {error}
              </div>
            )}
            <section className="laboratory">
              <div className="lab-workspace">
                <div className="visualization-panel">
                  <div className="panel-label">
                    <span>
                      VISUALIZATION{" "}
                      <span className="sub-label">/ {names[kind]}</span>
                    </span>
                    <span className="event-tag">{s.type}</span>
                  </div>
                  <Visualizer s={s} kind={kind} />
                </div>
                <div className="code-panel">
                  <div className="panel-label">
                    <span>PSEUDOCODE</span>
                    <span className="sub-label">line {s.line}</span>
                  </div>
                  <div className="code-lines">
                    {trace.code.map((line, i) => (
                      <div
                        key={i}
                        className={s.line === i + 1 ? "code-active" : ""}
                      >
                        <span>{i + 1}</span>
                        <code>{line}</code>
                        {s.line === i + 1 && (
                          <span className="line-arrow">←</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="code-assumption">{trace.assumption}</div>
                </div>
              </div>
              <PlaybackControls
                p={p}
                total={trace.steps.length}
                onNext={advance}
                onPlay={play}
                locked={question}
              />
              <div className="step-explanation" aria-live="polite">
                <span className="step-number">
                  {String(p.index + 1).padStart(2, "0")}
                </span>
                <div>
                  <span className="eyebrow">
                    {s.type === "finish" ? "RESULT" : "THIS STEP"}
                  </span>
                  <p>{s.explanation}</p>
                </div>
              </div>
              {question && (
                <div className="practice-question">
                  <h3>What operation happens next?</h3>
                  <p>
                    Inspect the current code line and state before choosing.
                  </p>
                  <div className="button-row">
                    {options.map((option) => (
                      <button
                        className="button"
                        key={option}
                        onClick={() => {
                          setFeedback(
                            option === nextType
                              ? `Correct — ${nextType}.`
                              : `The next operation is ${nextType}. Read the next step to see why.`,
                          );
                          setAnswered([...answered, p.index]);
                          setQuestion(false);
                          p.setPlaying(false);
                          p.setIndex(
                            Math.min(p.index + 1, trace.steps.length - 1),
                          );
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {feedback && (
                <p className="practice-feedback" role="status">
                  <Check size={16} />
                  {feedback}
                </p>
              )}
            </section>
            <section className="inspector panel">
              <Tabs defaultValue="variables">
                <TabsList variant="line">
                  <TabsTrigger value="variables">Variables</TabsTrigger>
                  <TabsTrigger value="operations">Operations</TabsTrigger>
                  <TabsTrigger value="complexity">Complexity</TabsTrigger>
                </TabsList>
                <TabsContent value="variables">
                  <div className="variable-grid">
                    {Object.entries(s.variables).length ? (
                      Object.entries(s.variables).map(([key, v]) => (
                        <div
                          key={key}
                          className={
                            previous.variables[key] !== v
                              ? "variable-changed"
                              : ""
                          }
                        >
                          <span>{key}</span>
                          <strong className="mono">{v}</strong>
                        </div>
                      ))
                    ) : (
                      <p>
                        No local variables yet. Step forward to inspect the
                        execution.
                      </p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="operations">
                  <div className="eyebrow">
                    MEASURED EXECUTION · COUNTED OPERATIONS
                  </div>
                  <div className="variable-grid">
                    {Object.entries(s.counts).map(([key, v]) => (
                      <div key={key}>
                        <span>{key}</span>
                        <strong className="mono">{v}</strong>
                      </div>
                    ))}
                  </div>
                  <p className="field-hint">
                    Counters measure this implementation on this input. Trace
                    snapshots and rendering are extra educational overhead,
                    excluded from theoretical complexity.
                  </p>
                </TabsContent>
                <TabsContent value="complexity">
                  <div className="eyebrow">
                    THEORETICAL COMPLEXITY · UNDERLYING ALGORITHM
                  </div>
                  <DataTable
                    headers={["Best", "Average", "Worst", "Auxiliary space"]}
                    rows={[
                      [
                        trace.complexity.best,
                        trace.complexity.average,
                        trace.complexity.worst,
                        trace.complexity.space,
                      ],
                    ]}
                  />
                  <p className="field-hint">
                    {trace.assumption} Browser animation duration is not a
                    measure of algorithmic complexity.
                  </p>
                </TabsContent>
              </Tabs>
            </section>
            <div className="keyboard-hint">
              <span>
                <kbd>Space</kbd> play / pause
              </span>
              <span>
                <kbd>←</kbd>
                <kbd>→</kbd> step through
              </span>
              <span>
                <RotateCcw size={13} /> Backward steps restore all recorded
                state.
              </span>
            </div>
          </>
        )}
        <section className="lesson-grid">
          <div>
            <div className="eyebrow">THE IDEA</div>
            <h3>Understand the approach</h3>
            <p>{lesson.concept}</p>
          </div>
          <div>
            <div className="eyebrow">WHY IT WORKS</div>
            <h3>The invariant</h3>
            <p>{lesson.invariant}</p>
          </div>
          <div>
            <div className="eyebrow">TRY AN EXPERIMENT</div>
            <h3>Go one step further</h3>
            <p>{lesson.try}</p>
          </div>
        </section>
        <div className="lab-bottom">
          <Link href="/compare" className="button">
            Compare approaches <ArrowRight size={16} />
          </Link>
          <Link href="/learn">Back to the curriculum</Link>
        </div>
      </main>
    </Shell>
  );
}
