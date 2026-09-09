"use client";
import { useState } from "react";
import { Plus, Trash2, Shuffle } from "lucide-react";
import type { Input } from "@/lib/engine/types";
import { defaultInput, preset } from "@/lib/algorithms";
import { Choice } from "./Controls";
import { GraphVisualizer } from "./Visualizers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
export function InputEditor({
  kind,
  input,
  setInput,
  arrayText,
  setArrayText,
}: {
  kind: string;
  input: Input;
  setInput: (v: Input) => void;
  arrayText: string;
  setArrayText: (v: string) => void;
}) {
  const [size, setSize] = useState(8),
    [pattern, setPattern] = useState("Random"),
    [node, setNode] = useState(""),
    [a, setA] = useState("A"),
    [b, setB] = useState("B"),
    [weight, setWeight] = useState(4),
    [error, setError] = useState(""),
    [newValue, setNewValue] = useState("");
  const isGraph = ["dijkstra", "prim", "kruskal"].includes(kind),
    isItems = ["fractional", "knapsack"].includes(kind),
    isTree = [
      "bst-insert",
      "bst-search",
      "inorder",
      "preorder",
      "postorder",
    ].includes(kind);
  function generate() {
    setArrayText(preset(size, pattern).join(", "));
  }
  function graphUpdate(next: Input) {
    setInput(next);
    setError("");
  }
  return (
    <div className="input-editor">
      {isGraph ? (
        <>
          <div className="editor-title">
            <h3>Graph editor</h3>
            <span>Undirected · 0–99 weights · up to 10 vertices</span>
          </div>
          <div className="graph-editor-layout">
            <GraphVisualizer
              s={{
                ...input,
                type: "edit",
                line: 1,
                explanation: "Edit graph",
                variables: {},
                counts: {},
              }}
              selectedNode={node}
              onMove={(id, x, y) =>
                setInput({
                  ...input,
                  nodes: input.nodes.map((n) =>
                    n.id === id ? { ...n, x, y } : n,
                  ),
                })
              }
              onNode={(id) => {
                setNode(id);
                setA(id);
              }}
              onEdge={(i) => {
                const e = input.edges[i];
                setA(e.a);
                setB(e.b);
                setWeight(e.weight);
              }}
            />
            <div className="graph-tools">
              <div className="button-row">
                <button
                  className="button"
                  disabled={input.nodes.length >= 10}
                  onClick={() => {
                    const id = "ABCDEFGHIJ"
                      .split("")
                      .find((id) => !input.nodes.some((n) => n.id === id))!;
                    graphUpdate({
                      ...input,
                      nodes: [
                        ...input.nodes,
                        { id, x: 70 + input.nodes.length * 45, y: 160 },
                      ],
                      start: input.nodes.length ? input.start : id,
                      destination: id,
                    });
                  }}
                >
                  <Plus size={15} /> Add node
                </button>
                <button
                  className="button"
                  disabled={!node}
                  onClick={() => {
                    const nodes = input.nodes.filter((n) => n.id !== node);
                    graphUpdate({
                      ...input,
                      nodes,
                      edges: input.edges.filter(
                        (e) => e.a !== node && e.b !== node,
                      ),
                      start:
                        input.start === node
                          ? (nodes[0]?.id ?? "")
                          : input.start,
                      destination:
                        input.destination === node
                          ? (nodes.at(-1)?.id ?? "")
                          : input.destination,
                    });
                    setNode("");
                  }}
                >
                  <Trash2 size={15} /> {node ? "Delete " + node : "Select node"}
                </button>
              </div>
              <p className="field-hint">
                Drag nodes to move them. Keyboard: focus a node and use arrow
                keys. Select an edge to edit its weight.
              </p>
              <div className="field-row">
                <label>
                  From
                  <Choice
                    value={a}
                    label="Edge from"
                    onChange={setA}
                    options={input.nodes.map((n) => n.id)}
                  />
                </label>
                <label>
                  To
                  <Choice
                    value={b}
                    label="Edge to"
                    onChange={setB}
                    options={input.nodes.map((n) => n.id)}
                  />
                </label>
                <label>
                  Weight
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                  />
                </label>
              </div>
              <div className="button-row">
                <button
                  className="button"
                  onClick={() => {
                    if (
                      a === b ||
                      !input.nodes.some((n) => n.id === a) ||
                      !input.nodes.some((n) => n.id === b) ||
                      !Number.isFinite(weight) ||
                      weight < 0 ||
                      weight > 99
                    ) {
                      setError(
                        "Choose two distinct existing nodes and weight 0–99.",
                      );
                      return;
                    }
                    const edges = input.edges.filter(
                      (e) =>
                        !((e.a === a && e.b === b) || (e.a === b && e.b === a)),
                    );
                    graphUpdate({
                      ...input,
                      edges: [...edges, { a, b, weight }],
                    });
                  }}
                >
                  Connect / update
                </button>
                <button
                  className="button"
                  onClick={() =>
                    graphUpdate({
                      ...input,
                      edges: input.edges.filter(
                        (e) =>
                          !(
                            (e.a === a && e.b === b) ||
                            (e.a === b && e.b === a)
                          ),
                      ),
                    })
                  }
                >
                  Delete edge
                </button>
              </div>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <div className="field-row">
                <label>
                  Start
                  <Choice
                    label="Start node"
                    value={input.start}
                    onChange={(start) => setInput({ ...input, start })}
                    options={input.nodes.map((n) => n.id)}
                  />
                </label>
                {kind === "dijkstra" && (
                  <label>
                    Destination
                    <Choice
                      label="Destination"
                      value={input.destination}
                      onChange={(destination) =>
                        setInput({ ...input, destination })
                      }
                      options={input.nodes.map((n) => n.id)}
                    />
                  </label>
                )}
              </div>
              <div className="button-row">
                <button
                  className="button"
                  onClick={() =>
                    graphUpdate({
                      ...input,
                      nodes: structuredClone(defaultInput.nodes),
                      edges: defaultInput.edges
                        .filter((_, i) => i !== 2 && i !== 5)
                        .map((e) => ({
                          ...e,
                          weight: 1 + Math.floor(Math.random() * 12),
                        })),
                      start: "A",
                      destination: "F",
                    })
                  }
                >
                  <Shuffle size={15} /> Random graph
                </button>
                <button
                  className="button"
                  onClick={() => {
                    graphUpdate({
                      ...input,
                      nodes: [],
                      edges: [],
                      start: "",
                      destination: "",
                    });
                    setNode("");
                  }}
                >
                  Clear
                </button>
                <button
                  className="button"
                  onClick={() =>
                    graphUpdate({
                      ...input,
                      nodes: structuredClone(defaultInput.nodes),
                      edges: structuredClone(defaultInput.edges),
                      start: "A",
                      destination: "F",
                    })
                  }
                >
                  Example
                </button>
              </div>
            </div>
          </div>
        </>
      ) : isItems ? (
        <>
          <div className="editor-title">
            <h3>Items & capacity</h3>
            <label className="inline-label">
              Capacity
              <input
                type="number"
                min="0"
                max="30"
                value={input.capacity}
                onChange={(e) =>
                  setInput({ ...input, capacity: Number(e.target.value) })
                }
              />
            </label>
          </div>
          <Table className="item-editor">
            <TableHeader>
              <TableRow>
                {["Item", "Weight", "Value", "Value / weight", ""].map(
                  (h, i) => (
                    <TableHead key={i}>{h}</TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {input.items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <input
                      aria-label={`Item ${i + 1} name`}
                      value={item.name}
                      maxLength={12}
                      onChange={(e) =>
                        setInput({
                          ...input,
                          items: input.items.map((v, j) =>
                            i === j ? { ...v, name: e.target.value } : v,
                          ),
                        })
                      }
                    />
                  </TableCell>
                  {(["weight", "value"] as const).map((key) => (
                    <TableCell key={key}>
                      <input
                        type="number"
                        aria-label={`Item ${i + 1} ${key}`}
                        value={item[key]}
                        min={key === "weight" ? 1 : 0}
                        max={key === "weight" ? 30 : 999}
                        onChange={(e) =>
                          setInput({
                            ...input,
                            items: input.items.map((v, j) =>
                              i === j
                                ? { ...v, [key]: Number(e.target.value) }
                                : v,
                            ),
                          })
                        }
                      />
                    </TableCell>
                  ))}
                  <TableCell className="mono">
                    {item.weight ? (item.value / item.weight).toFixed(2) : "—"}
                  </TableCell>
                  <TableCell>
                    <button
                      className="icon-button"
                      aria-label={`Remove item ${i + 1}`}
                      onClick={() =>
                        setInput({
                          ...input,
                          items: input.items.filter((_, j) => j !== i),
                        })
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <button
            className="button"
            disabled={input.items.length >= 8}
            onClick={() =>
              setInput({
                ...input,
                items: [
                  ...input.items,
                  {
                    name: "Item " + (input.items.length + 1),
                    weight: 1,
                    value: 10,
                  },
                ],
              })
            }
          >
            <Plus size={15} /> Add item
          </button>
        </>
      ) : kind === "huffman" ? (
        <label>
          Input text
          <textarea
            value={input.text}
            maxLength={80}
            onChange={(e) => setInput({ ...input, text: e.target.value })}
          />
          <span className="field-hint">
            1–80 characters, at most 12 distinct symbols. Spaces count.
          </span>
        </label>
      ) : ["recursive", "iterative"].includes(kind) ? (
        <div className="field-row">
          <label>
            Factorial input (n)
            <input
              type="number"
              min="0"
              max="12"
              value={input.n}
              onChange={(e) =>
                setInput({ ...input, n: Number(e.target.value) })
              }
            />
          </label>
          <p className="field-hint">
            Try the same n in both approaches to compare the call stack and
            accumulator.
          </p>
        </div>
      ) : (
        <>
          <div className="field-row">
            <label className="grow">
              {isTree ? "Tree values in insertion order" : "Array values"}
              <input
                value={arrayText}
                onChange={(e) => setArrayText(e.target.value)}
                placeholder="42, 17, 8, 31, 25"
              />
            </label>
            {["linear", "binary", "bst-search"].includes(kind) && (
              <label>
                Target
                <input
                  type="number"
                  value={input.target}
                  onChange={(e) =>
                    setInput({ ...input, target: Number(e.target.value) })
                  }
                />
              </label>
            )}
          </div>
          {isTree ? (
            <div className="field-row">
              <label>
                New node
                <input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  type="number"
                />
              </label>
              <button
                className="button"
                onClick={() => {
                  if (!newValue.trim() || !Number.isInteger(Number(newValue)))
                    return;
                  setArrayText(
                    arrayText.trim() ? arrayText + ", " + newValue : newValue,
                  );
                  setNewValue("");
                }}
              >
                <Plus size={15} /> Add node
              </button>
              <button className="button" onClick={() => setArrayText("")}>
                Clear tree
              </button>
            </div>
          ) : (
            <div className="field-row presets">
              <label>
                Input pattern
                <Choice
                  label="Input pattern"
                  value={pattern}
                  onChange={setPattern}
                  options={[
                    "Random",
                    "Sorted",
                    "Reverse Sorted",
                    "Nearly Sorted",
                  ]}
                />
              </label>
              <label>
                Size
                <input
                  type="number"
                  min={2}
                  max={24}
                  value={size}
                  onChange={(e) =>
                    setSize(Math.max(2, Math.min(24, Number(e.target.value))))
                  }
                />
              </label>
              <button className="button" onClick={generate}>
                <Shuffle size={15} /> Generate
              </button>
              <span className="field-hint">2–24 integers · −999 to 999</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
