import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultInput, execute, parseArray } from "../lib/algorithms";
import type { Input } from "../lib/engine/types";
const input = (patch: Partial<Input> = {}): Input => ({
  ...structuredClone(defaultInput),
  ...patch,
});
const last = (kind: string, patch: Partial<Input> = {}) =>
  execute(kind, input(patch)).steps.at(-1)!;
let seed = 8172;
const random = (max: number) => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed % max;
};
test("Merge and Quick Sort match a numeric reference on duplicate, negative and varied arrays", () => {
  for (const kind of ["merge", "quick"])
    for (let trial = 0; trial < 100; trial++) {
      const a = Array.from({ length: 2 + random(20) }, () => random(101) - 50);
      assert.deepEqual(
        last(kind, { array: a }).array,
        [...a].sort((a, b) => a - b),
      );
    }
});
test("Merge Sort preserves original identity order for equal keys", () => {
  const final = last("merge", { array: [4, 2, 4, 2, 4] });
  assert.deepEqual(final.ids, [1, 3, 0, 2, 4]);
});
test("Snapshots preserve earlier state and code lines are valid", () => {
  for (const kind of [
    "merge",
    "quick",
    "linear",
    "hash",
    "stack",
    "queue",
    "array",
    "recursive",
    "iterative",
    "bst-insert",
    "bst-search",
    "inorder",
    "preorder",
    "postorder",
    "fractional",
    "dijkstra",
    "prim",
    "kruskal",
    "huffman",
    "knapsack",
  ]) {
    const i = input();
    const before = structuredClone(i);
    const trace = execute(kind, i);
    assert.deepEqual(i, before, kind + " mutated input");
    trace.steps.forEach((s) =>
      assert.ok(s.line >= 1 && s.line <= trace.code.length),
    );
    const first = structuredClone(trace.steps[0]);
    trace.steps.at(-1)!.counts.changed = 100;
    assert.deepEqual(trace.steps[0], first, kind + " shared counter state");
  }
});
test("Search finds valid positions, returns -1 when absent, and validates sorted input", () => {
  for (const kind of ["linear", "binary"])
    for (let t = 0; t < 30; t++) {
      const a = Array.from({ length: 12 }, () => random(20)).sort(
          (a, b) => a - b,
        ),
        target = random(25);
      const found = Number(last(kind, { array: a, target }).variables.result);
      assert.equal(found < 0, a.indexOf(target) < 0);
      if (found >= 0) assert.equal(a[found], target);
    }
  assert.throws(() => execute("binary", input({ array: [2, 1] })), /sorted/);
});
test("Hash collisions and negative keys are retained in separate chains", () => {
  const s = last("hash", { array: [7, 14, -7, 8] });
  assert.deepEqual(s.buckets?.[0], [7, 14, -7]);
  assert.deepEqual(s.buckets?.[1], [8]);
});
test("Stack is LIFO and queue is FIFO", () => {
  assert.deepEqual(last("stack", { array: [1, 2, 3] }).output, ["3", "2", "1"]);
  assert.deepEqual(last("queue", { array: [1, 2, 3] }).output, ["1", "2", "3"]);
});
test("Recursive and iterative factorial agree including zero", () => {
  let f = 1;
  for (let n = 0; n <= 12; n++) {
    if (n > 0) f *= n;
    for (const kind of ["recursive", "iterative"])
      assert.equal(last(kind, { n }).variables.result, f);
  }
  assert.throws(() => last("recursive", { n: 13 }));
});
test("BST traversals maintain ordering and ignore duplicates", () => {
  const array = [8, 4, 12, 2, 6, 10, 14, 8];
  assert.deepEqual(last("inorder", { array }).output, [
    "2",
    "4",
    "6",
    "8",
    "10",
    "12",
    "14",
  ]);
  assert.deepEqual(last("preorder", { array }).output, [
    "8",
    "4",
    "2",
    "6",
    "12",
    "10",
    "14",
  ]);
  assert.deepEqual(last("postorder", { array }).output, [
    "2",
    "6",
    "4",
    "10",
    "14",
    "12",
    "8",
  ]);
  assert.deepEqual(last("bst-search", { array, target: 10 }).output, [
    "Found 10",
  ]);
  assert.deepEqual(last("bst-search", { array, target: 11 }).output, [
    "11 not found",
  ]);
  assert.equal(last("bst-insert", { array: [] }).tree, undefined);
});
test("Dijkstra agrees with Floyd-Warshall reference on generated non-negative graphs", () => {
  for (let t = 0; t < 30; t++) {
    const nodes = defaultInput.nodes.slice(0, 5);
    const edges = [];
    for (let a = 0; a < nodes.length; a++)
      for (let b = a + 1; b < nodes.length; b++)
        if (random(3) > 0)
          edges.push({ a: nodes[a].id, b: nodes[b].id, weight: random(10) });
    const d = Array.from({ length: 5 }, (_, i) =>
      Array.from({ length: 5 }, (_, j) => (i === j ? 0 : Infinity)),
    );
    for (const e of edges) {
      const a = nodes.findIndex((n) => n.id === e.a),
        b = nodes.findIndex((n) => n.id === e.b);
      d[a][b] = d[b][a] = e.weight;
    }
    for (let k = 0; k < 5; k++)
      for (let i = 0; i < 5; i++)
        for (let j = 0; j < 5; j++)
          d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);
    const s = last("dijkstra", { nodes, edges, start: "A", destination: "E" });
    nodes.forEach((n, i) => assert.equal(s.distances?.[n.id], d[0][i]));
  }
});
test("Prim and Kruskal agree with an exhaustive spanning-tree reference", () => {
  for (let t = 0; t < 20; t++) {
    const nodes = defaultInput.nodes.slice(0, 4);
    const edges = [
      { a: "A", b: "B", weight: random(10) },
      { a: "B", b: "C", weight: random(10) },
      { a: "C", b: "D", weight: random(10) },
      { a: "A", b: "D", weight: random(10) },
      { a: "A", b: "C", weight: random(10) },
    ];
    let optimum = Infinity;
    for (let mask = 0; mask < 1 << edges.length; mask++) {
      const chosen = edges.filter((_, i) => mask & (1 << i));
      if (chosen.length !== 3) continue;
      const seen = new Set(["A"]);
      for (let i = 0; i < 4; i++)
        for (const e of chosen)
          if (seen.has(e.a) || seen.has(e.b)) {
            seen.add(e.a);
            seen.add(e.b);
          }
      if (seen.size === 4)
        optimum = Math.min(
          optimum,
          chosen.reduce((s, e) => s + e.weight, 0),
        );
    }
    for (const kind of ["prim", "kruskal"]) {
      const s = last(kind, { nodes, edges, start: "A", destination: "D" });
      assert.equal(s.variables["MST weight"], optimum);
      assert.equal(s.selectedEdges?.length, 3);
    }
  }
});
test("Graphs reject negative weights and disconnected MST inputs; shortest paths report unreachable", () => {
  assert.throws(
    () => last("dijkstra", { edges: [{ a: "A", b: "B", weight: -1 }] }),
    /non-negative/,
  );
  for (const kind of ["prim", "kruskal"])
    assert.throws(() => last(kind, { edges: [] }), /Connect/);
  assert.equal(
    last("dijkstra", { edges: [] }).variables.distance,
    "unreachable",
  );
});
test("Fractional Knapsack takes correct fractions for classic example", () => {
  const s = last("fractional", {
    items: [
      { name: "A", weight: 10, value: 60 },
      { name: "B", weight: 20, value: 100 },
      { name: "C", weight: 30, value: 120 },
    ],
    capacity: 25,
  });
  assert.deepEqual(s.fractions, [1, 0.75, 0]);
  assert.equal(s.variables.value, 135);
});
test("0/1 Knapsack matches brute force and reconstructs an optimal feasible selection", () => {
  for (let t = 0; t < 80; t++) {
    const items = Array.from({ length: 1 + random(7) }, (_, i) => ({
        name: String(i),
        weight: 1 + random(8),
        value: random(30),
      })),
      capacity = random(20);
    let optimum = 0;
    for (let mask = 0; mask < 1 << items.length; mask++) {
      let w = 0,
        v = 0;
      items.forEach((item, i) => {
        if (mask & (1 << i)) {
          w += item.weight;
          v += item.value;
        }
      });
      if (w <= capacity) optimum = Math.max(optimum, v);
    }
    const s = last("knapsack", { items, capacity });
    assert.equal(s.variables["Optimal value"], optimum);
    let w = 0,
      v = 0;
    items.forEach((item, i) => {
      if (s.fractions?.[i]) {
        w += item.weight;
        v += item.value;
      }
    });
    assert.equal(v, optimum);
    assert.ok(w <= capacity);
  }
});
test("Huffman codes are prefix-free and round-trip text including Unicode and one symbol", () => {
  for (const text of [
    "BANANA",
    "AAAAA",
    "abcdef",
    "a b a",
    "🌲🌲🪵",
    "a",
    "mississippi",
  ]) {
    const s = last("huffman", { text });
    const codes = s.codes!;
    const entries = Object.entries(codes);
    for (const [a, ca] of entries)
      for (const [b, cb] of entries) if (a !== b) assert.ok(!ca.startsWith(cb));
    let decoded = "",
      pending = "";
    for (const bit of s.output![0]) {
      pending += bit;
      const entry = entries.find(([, code]) => code === pending);
      if (entry) {
        decoded += entry[0];
        pending = "";
      }
    }
    assert.equal(decoded, text);
    assert.equal(pending, "");
  }
});
test("Input guards reject empty tokens, invalid values and unreasonable workloads", () => {
  for (const s of ["", "1,", "1,,2", "a,2", "1000,2", "1.5,2"])
    assert.throws(() => parseArray(s));
  assert.throws(() => last("huffman", { text: "" }));
  assert.throws(() => last("knapsack", { capacity: 31 }));
  assert.throws(() =>
    last("fractional", { items: [{ name: "A", weight: 0, value: 2 }] }),
  );
});
