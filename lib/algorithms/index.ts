import { type Input, type Trace } from "../engine/types";
import { sortTrace, searchTrace } from "./sorting";
import { graphTrace } from "./graphs";
import { structureTrace } from "./structures";
import { knapsackTrace, huffmanTrace } from "./optimization";
export const defaultInput: Input = {
  array: [42, 17, 31, 8, 25, 56, 12, 38],
  target: 25,
  n: 5,
  text: "BANANA",
  items: [
    { name: "A", weight: 2, value: 12 },
    { name: "B", weight: 3, value: 20 },
    { name: "C", weight: 4, value: 28 },
    { name: "D", weight: 5, value: 30 },
  ],
  capacity: 8,
  nodes: [
    { id: "A", x: 75, y: 170 },
    { id: "B", x: 230, y: 65 },
    { id: "C", x: 230, y: 275 },
    { id: "D", x: 400, y: 65 },
    { id: "E", x: 400, y: 275 },
    { id: "F", x: 550, y: 170 },
  ],
  edges: [
    { a: "A", b: "B", weight: 4 },
    { a: "A", b: "C", weight: 2 },
    { a: "B", b: "C", weight: 1 },
    { a: "B", b: "D", weight: 5 },
    { a: "C", b: "E", weight: 8 },
    { a: "D", b: "E", weight: 2 },
    { a: "D", b: "F", weight: 6 },
    { a: "E", b: "F", weight: 3 },
  ],
  start: "A",
  destination: "F",
};
export function parseArray(text: string) {
  if (!text.trim()) throw new Error("Enter at least two values.");
  const tokens = text.split(",");
  if (tokens.some((x) => !x.trim()))
    throw new Error("Separate numbers with single commas.");
  const a = tokens.map(Number);
  if (
    a.length < 2 ||
    a.length > 24 ||
    a.some((v) => !Number.isInteger(v) || Math.abs(v) > 999)
  )
    throw new Error("Enter 2–24 integers between -999 and 999.");
  return a;
}
export function validateInput(i: Input, kind: string) {
  if (
    [
      "merge",
      "quick",
      "linear",
      "binary",
      "hash",
      "array",
      "stack",
      "queue",
    ].includes(kind)
  )
    parseArray(i.array.join(","));
  if (kind === "binary" && i.array.some((v, n) => n > 0 && v < i.array[n - 1]))
    throw new Error(
      "Binary Search requires sorted input. Choose the Sorted preset.",
    );
  if (
    ["linear", "binary", "bst-search"].includes(kind) &&
    (!Number.isInteger(i.target) || Math.abs(i.target) > 999)
  )
    throw new Error("Target must be an integer between -999 and 999.");
  if (
    kind.includes("bst") ||
    ["inorder", "preorder", "postorder"].includes(kind)
  ) {
    if (i.array.length > 15)
      throw new Error("A tree supports at most 15 input values.");
    if (i.array.some((v) => !Number.isInteger(v) || Math.abs(v) > 999))
      throw new Error("Tree keys must be integers between -999 and 999.");
  }
  if (
    ["recursive", "iterative"].includes(kind) &&
    (!Number.isInteger(i.n) || i.n < 0 || i.n > 12)
  )
    throw new Error("Use an integer from 0 to 12.");
  if (
    kind === "huffman" &&
    (!i.text || [...i.text].length > 80 || new Set([...i.text]).size > 12)
  )
    throw new Error("Enter 1–80 characters with at most 12 distinct symbols.");
  if (["fractional", "knapsack"].includes(kind)) {
    if (!Number.isInteger(i.capacity) || i.capacity < 0 || i.capacity > 30)
      throw new Error("Capacity must be an integer from 0 to 30.");
    if (
      i.items.length < 1 ||
      i.items.length > 8 ||
      i.items.some(
        (x) =>
          !x.name.trim() ||
          !Number.isInteger(x.weight) ||
          x.weight <= 0 ||
          x.weight > 30 ||
          !Number.isInteger(x.value) ||
          x.value < 0 ||
          x.value > 999,
      )
    )
      throw new Error(
        "Use 1–8 named items, integer weights 1–30 and values 0–999.",
      );
    if (new Set(i.items.map((x) => x.name)).size !== i.items.length)
      throw new Error("Give each item a unique name.");
  }
  if (["dijkstra", "prim", "kruskal"].includes(kind)) {
    if (i.nodes.length < 1 || i.nodes.length > 10)
      throw new Error("Add 1–10 graph nodes.");
    const ids = new Set(i.nodes.map((n) => n.id));
    if (!ids.has(i.start) || !ids.has(i.destination))
      throw new Error("Select valid start and destination nodes.");
    if (
      i.edges.some(
        (e) =>
          !ids.has(e.a) ||
          !ids.has(e.b) ||
          e.a === e.b ||
          !Number.isFinite(e.weight) ||
          e.weight < 0 ||
          e.weight > 99,
      )
    )
      throw new Error(
        "Edges need distinct endpoints and non-negative weights from 0 to 99.",
      );
  }
}
export function execute(kind: string, i: Input): Trace {
  validateInput(i, kind);
  if (kind === "merge" || kind === "quick") return sortTrace(i.array, kind);
  if (kind === "linear" || kind === "binary")
    return searchTrace(i.array, i.target, kind === "binary");
  if (["dijkstra", "prim", "kruskal"].includes(kind))
    return graphTrace(i, kind);
  if (kind === "fractional" || kind === "knapsack")
    return knapsackTrace(i, kind === "fractional");
  if (kind === "huffman") return huffmanTrace(i.text);
  return structureTrace(i, kind);
}
export function preset(size: number, type: string) {
  const a = Array.from(
    { length: size },
    () => Math.floor(Math.random() * 90) + 5,
  );
  if (type !== "Random") a.sort((a, b) => a - b);
  if (type === "Reverse Sorted") a.reverse();
  if (type === "Nearly Sorted" && a.length > 2) [a[1], a[2]] = [a[2], a[1]];
  return a;
}
