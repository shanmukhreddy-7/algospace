import {
  recorder,
  type Input,
  type Trace,
  type TraversalEntry,
} from "../engine/types";

export const advancedKinds = [
  "floyd",
  "bfs",
  "dfs",
  "queens",
  "knight",
  "tsp",
  "puzzle",
  "shuffle",
  "random-quick",
  "random-search",
];
export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
const complexity = (worst: string, space: string, average = worst) => ({
  best: worst,
  average,
  worst,
  space,
});
function result(
  r: ReturnType<typeof recorder>,
  code: string[],
  cost: Trace["complexity"],
  assumption: string,
): Trace {
  return { steps: r.steps, code, complexity: cost, assumption };
}
export function advancedTrace(kind: string, input: Input): Trace {
  if (["floyd", "bfs", "dfs", "tsp"].includes(kind))
    return graphSearch(kind, input);
  if (kind === "queens" || kind === "knight") return boardSearch(kind, input.n);
  if (kind === "puzzle") return puzzleTrace(input.n);
  return randomTrace(kind, input);
}
function graphSearch(kind: string, input: Input): Trace {
  const { nodes, edges, start } = input;
  const ids = nodes.map((n) => n.id),
    n = ids.length;
  const d = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)),
  );
  for (const e of edges) {
    const a = ids.indexOf(e.a),
      b = ids.indexOf(e.b);
    d[a][b] = d[b][a] = Math.min(d[a][b], e.weight);
  }
  if (kind === "floyd") {
    const r = recorder({
      table: d,
      matrixLabels: ids,
      counts: { Comparisons: 0, Updates: 0 },
    });
    r.emit({
      explanation:
        "Initialize direct edge weights, zero on the diagonal, and infinity for absent edges.",
    });
    for (let k = 0; k < n; k++)
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          r.count("Comparisons");
          const candidate = d[i][k] + d[k][j];
          const improved = candidate < d[i][j];
          if (improved) {
            d[i][j] = candidate;
            r.count("Updates");
          }
          r.emit({
            type: improved ? "relax" : "compare",
            line: improved ? 5 : 4,
            table: d,
            cell: [i, j],
            sources: [
              [i, k],
              [k, j],
            ],
            variables: {
              via: ids[k],
              from: ids[i],
              to: ids[j],
              candidate: Number.isFinite(candidate) ? candidate : "∞",
            },
            explanation: improved
              ? `Using ${ids[k]}, improve ${ids[i]} → ${ids[j]} to ${candidate}.`
              : `Check ${ids[i]} → ${ids[k]} → ${ids[j]}; keep the current distance.`,
          });
        }
    r.emit({
      type: "finish",
      line: 6,
      cell: undefined,
      sources: [],
      explanation:
        "All-pairs shortest distances are complete. Infinity means no connecting path exists.",
    });
    return result(
      r,
      [
        "D = direct weights; D[i][i] = 0",
        "for each intermediate vertex k",
        "  for each pair (i, j)",
        "    candidate = D[i][k] + D[k][j]",
        "    D[i][j] = min(D[i][j], candidate)",
        "return D",
      ],
      complexity("Θ(V³)", "Θ(V²)"),
      "Undirected graph with non-negative edge weights. Each phase permits one more intermediate vertex.",
    );
  }
  if (kind === "tsp") {
    const r = recorder({
      nodes,
      edges,
      visited: [],
      selectedEdges: [],
      counts: { Expanded: 0, Pruned: 0 },
    });
    const root = ids.indexOf(start);
    let best = Infinity,
      bestPath: number[] = [];
    const path = [root];
    const used = new Set(path);
    const edgeIndices = (p: number[]) =>
      p
        .slice(1)
        .map((v, i) =>
          edges.findIndex(
            (e) =>
              (e.a === ids[p[i]] && e.b === ids[v]) ||
              (e.b === ids[p[i]] && e.a === ids[v]),
          ),
        )
        .filter((i) => i >= 0);
    r.emit({
      explanation:
        "Enumerate Hamiltonian round trips. Prune any partial route already costing at least the best known complete tour.",
    });
    function visit(cost: number) {
      r.count("Expanded");
      r.emit({
        type: "visit-node",
        line: 2,
        current: ids[path.at(-1)!],
        visited: path.map((i) => ids[i]),
        selectedEdges: edgeIndices(path),
        variables: {
          cost,
          best: Number.isFinite(best) ? best : "∞",
          path: path.map((i) => ids[i]).join(" → "),
        },
        explanation: `Explore ${path.map((i) => ids[i]).join(" → ")}; partial cost ${cost} is a lower bound (all weights are non-negative).`,
      });
      if (cost >= best) {
        r.count("Pruned");
        r.emit({
          type: "prune",
          line: 3,
          explanation:
            "This lower bound cannot improve the incumbent. Prune the branch.",
        });
        return;
      }
      if (path.length === n) {
        const total = cost + d[path.at(-1)!][root];
        if (total < best) {
          best = total;
          bestPath = [...path, root];
          r.emit({
            type: "solution",
            line: 4,
            selectedEdges: edgeIndices(bestPath),
            variables: { cost: total, best: total },
            explanation: `A better complete tour costs ${total}. Keep it as the incumbent.`,
          });
        }
        return;
      }
      const from = path.at(-1)!;
      for (const next of ids
        .map((_, i) => i)
        .filter((i) => !used.has(i) && Number.isFinite(d[from][i]))
        .sort((a, b) => d[from][a] - d[from][b])) {
        used.add(next);
        path.push(next);
        visit(cost + d[from][next]);
        path.pop();
        used.delete(next);
      }
    }
    if (n > 1) visit(0);
    r.emit({
      type: "finish",
      line: 6,
      current: undefined,
      selectedEdges: edgeIndices(bestPath),
      visited: bestPath.map((i) => ids[i]),
      variables: {
        cost: Number.isFinite(best) ? best : "No tour",
        tour: bestPath.map((i) => ids[i]).join(" → "),
      },
      explanation: bestPath.length
        ? `Optimal tour: ${bestPath.map((i) => ids[i]).join(" → ")}. Total cost ${best}.`
        : "No Hamiltonian round trip exists using these edges. Add edges and try again.",
    });
    return result(
      r,
      [
        "best = ∞; path = [start]",
        "expand(path, cost)",
        "  if cost >= best: prune",
        "  if complete: update best with return edge",
        "  recurse on each unvisited neighbor; undo",
        "return cheapest complete tour",
      ],
      complexity("O(V!)", "O(V²) graph + O(V) recursion"),
      "Exact branch and bound, limited to 2–7 vertices. Partial cost is a valid lower bound for non-negative weights. Missing edges cannot be traversed.",
    );
  }
  const depthFirst = kind === "dfs";
  const visited: string[] = [],
    selectedEdges: number[] = [];
  const seen = new Set<string>(),
    scheduled = new Set([start]);
  const history: TraversalEntry[] = [{ id: 0, node: start, state: "waiting" }];
  const pending: TraversalEntry[] = [history[0]];
  const frontier = () => pending.map((entry) => entry.node);
  const r = recorder({
    nodes,
    edges,
    visited,
    selectedEdges,
    frontier: frontier(),
    traversalHistory: history,
    counts: {
      Visits: 0,
      "Edge checks": 0,
      [depthFirst ? "Pushes" : "Enqueues"]: 1,
    },
  });
  r.emit({
    current: start,
    explanation: `Put ${start} into the ${depthFirst ? "stack" : "queue"}. Every entry stays visible in the history after processing.`,
  });
  while (pending.length) {
    const entry = depthFirst ? pending.pop()! : pending.shift()!;
    const current = entry.node;
    if (seen.has(current)) {
      entry.state = "skipped";
      r.emit({
        type: "skip",
        line: 3,
        current,
        activeEdge: undefined,
        frontier: frontier(),
        traversalHistory: history,
        variables: { current },
        explanation: `${current} was already visited through another branch. Skip this older stack entry.`,
      });
      continue;
    }
    entry.state = "active";
    seen.add(current);
    visited.push(current);
    r.count("Visits");
    if (entry.edge !== undefined) selectedEdges.push(entry.edge);
    r.emit({
      type: "visit-node",
      line: 3,
      current,
      activeEdge: undefined,
      visited,
      selectedEdges,
      frontier: frontier(),
      traversalHistory: history,
      variables: { current, visited: visited.length },
      explanation: `${depthFirst ? "Pop" : "Dequeue"} ${current} and visit it. Keep ${current} highlighted while adding its unvisited neighbors.`,
    });
    const incident = edges
      .map((edge, index) => ({ edge, index }))
      .filter(({ edge }) => edge.a === current || edge.b === current);
    if (depthFirst) incident.reverse();
    for (const { edge, index } of incident) {
      const next = edge.a === current ? edge.b : edge.a;
      r.count("Edge checks");
      const add = !seen.has(next) && (depthFirst || !scheduled.has(next));
      if (add) {
        const nextEntry: TraversalEntry = {
          id: history.length,
          node: next,
          from: current,
          edge: index,
          state: "waiting",
        };
        history.push(nextEntry);
        pending.push(nextEntry);
        scheduled.add(next);
        r.count(depthFirst ? "Pushes" : "Enqueues");
      }
      r.emit({
        type: add ? (depthFirst ? "push" : "enqueue") : "inspect-edge",
        line: 4,
        current,
        activeEdge: index,
        frontier: frontier(),
        traversalHistory: history,
        variables: { current, neighbor: next, pending: pending.length },
        explanation: add
          ? `${current} stays highlighted: ${depthFirst ? "push" : "enqueue"} its neighbor ${next}${depthFirst && history.some((item) => item.id !== history.length - 1 && item.node === next && item.state === "waiting") ? " for this deeper branch; the older pending entry will be skipped if already visited" : ""}.`
          : `Still expanding ${current}: ${next} is ${seen.has(next) ? "already visited" : "already waiting in the queue"}; do not add it.`,
      });
    }
    entry.state = "processed";
    r.emit({
      type: "processed",
      line: 5,
      current,
      activeEdge: undefined,
      frontier: frontier(),
      traversalHistory: history,
      explanation: `All neighbors of ${current} have been checked. Keep its processed entry visible; ${pending.length} entries are still waiting.`,
    });
  }
  r.emit({
    type: "finish",
    line: 6,
    current: undefined,
    activeEdge: undefined,
    frontier: [],
    traversalHistory: history,
    visited,
    variables: { order: visited.join(" → "), reached: visited.length },
    explanation: `${depthFirst ? "DFS" : "BFS"} traversal: ${visited.join(" → ")}. The complete ${depthFirst ? "stack" : "queue"} history remains visible. ${n - visited.length} vertices are unreachable from ${start}.`,
  });
  return result(
    r,
    [
      `${depthFirst ? "stack" : "queue"} = [start]`,
      `while ${depthFirst ? "stack" : "queue"} is not empty`,
      `  v = ${depthFirst ? "pop" : "dequeue"}(); skip if visited; visit(v)`,
      `  ${depthFirst ? "push unvisited neighbors in reverse order" : "enqueue undiscovered neighbors"}`,
      "  mark v processed; retain its history entry",
      "return traversal order and full history",
    ],
    complexity("O(VE + V)", "O(V + E)"),
    depthFirst
      ? "Iterative DFS uses a LIFO work stack. Neighbors are pushed in reverse edge order. A vertex can have multiple pending entries; an already-visited entry is skipped on pop. Scans the edge list per newly visited vertex. History is a display log, not the pending stack."
      : "BFS uses a FIFO queue and schedules each vertex once. Scans the edge list per vertex; adjacency lists would give O(V+E). History retains processed entries separately from the real pending queue. Edge weights are ignored.",
  );
}

function boardSearch(kind: string, size: number): Trace {
  const n = kind === "queens" ? 8 : size;
  const board = Array.from({ length: n }, () => Array(n).fill(0) as number[]);
  const r = recorder({
    board,
    boardKind: kind === "queens" ? "queens" : "knight",
    counts: { Attempts: 0, Backtracks: 0 },
  });
  let expanded = 0;
  const budget = 20000;
  let limited = false;
  const emit = (
    type: string,
    line: number,
    row: number,
    col: number,
    explanation: string,
  ) => {
    if (r.steps.length < 1800)
      r.emit({
        type,
        line,
        board,
        cell: [row, col],
        variables: { row: row + 1, column: col + 1 },
        explanation,
      });
  };
  r.emit({
    explanation:
      kind === "queens"
        ? "Place one queen per row; reject occupied columns and diagonals."
        : "Start at the top-left. Try legal knight moves, preferring squares with the fewest onward moves.",
  });
  const moves = [
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
    [-1, -2],
    [-2, -1],
    [-2, 1],
    [-1, 2],
  ];
  const legal = (a: number, b: number) =>
    a >= 0 && b >= 0 && a < n && b < n && board[a][b] === 0;
  function queens(row: number): boolean {
    if (row === n) return true;
    for (let col = 0; col < n; col++) {
      r.count("Attempts");
      const safe = board.every(
        (cells, rr) =>
          rr >= row ||
          cells.every(
            (v, cc) =>
              !v || (cc !== col && Math.abs(rr - row) !== Math.abs(cc - col)),
          ),
      );
      emit(
        safe ? "place" : "conflict",
        safe ? 3 : 2,
        row,
        col,
        safe
          ? `Place a queen at row ${row + 1}, column ${col + 1}.`
          : `Column ${col + 1} is attacked; reject this choice.`,
      );
      if (!safe) continue;
      board[row][col] = 1;
      emit(
        "place",
        3,
        row,
        col,
        "This partial placement has no attacking queens.",
      );
      if (queens(row + 1)) return true;
      board[row][col] = 0;
      r.count("Backtracks");
      emit(
        "backtrack",
        5,
        row,
        col,
        "No solution down this branch. Remove the queen and try the next column.",
      );
    }
    return false;
  }
  function knight(row: number, col: number, step: number): boolean {
    if (++expanded > budget) {
      limited = true;
      return false;
    }
    board[row][col] = step;
    r.count("Attempts");
    emit(
      "place",
      3,
      row,
      col,
      `Move ${step}: visit row ${row + 1}, column ${col + 1}.`,
    );
    if (step === n * n) return true;
    const onward = (a: number, b: number) =>
      moves.filter(([x, y]) => legal(a + x, b + y)).length;
    const options = moves
      .map(([x, y]) => [row + x, col + y])
      .filter(([a, b]) => legal(a, b))
      .sort(([a, b], [c, d]) => onward(a, b) - onward(c, d));
    for (const [a, b] of options) {
      if (knight(a, b, step + 1)) return true;
      if (limited) break;
    }
    board[row][col] = 0;
    r.count("Backtracks");
    emit(
      "backtrack",
      5,
      row,
      col,
      "Dead end. Undo this move and try another square.",
    );
    return false;
  }
  const solved = kind === "queens" ? queens(0) : knight(0, 0, 1);
  r.emit({
    type: solved ? "finish" : "limit",
    line: 6,
    board,
    cell: undefined,
    variables: {
      solved: solved ? "Yes" : "No",
      size: n,
      ...(kind === "knight" ? { searchCalls: expanded } : {}),
    },
    explanation: solved
      ? kind === "queens"
        ? "Eight queens are placed; no pair shares a row, column, or diagonal."
        : `An open knight’s tour visits all ${n * n} squares once. Numbered cells show the route.`
      : "Search budget reached. No solution is claimed; try a smaller board. Intermediate trace capture is capped at 1,800 steps.",
  });
  return result(
    r,
    [
      "start with an empty board",
      "reject moves violating constraints",
      "place the next piece / visit the square",
      "recurse on legal choices",
      "undo failed choices and backtrack",
      "return solution, or report search limit",
    ],
    complexity(
      kind === "queens" ? "O(N!)" : "O(8^(N²))",
      "O(N²) board + recursion",
    ),
    kind === "queens"
      ? "Fixed eight-queen problem; find the first valid arrangement."
      : "Open tour. Warnsdorff ordering with backtracking; at most 20,000 search calls, first 1,800 snapshots plus final state. A budget limit is not a proof of impossibility.",
  );
}
function puzzleTrace(depth: number): Trace {
  const goal = Array.from({ length: 16 }, (_, i) => (i + 1) % 16);
  const neighbors = (a: number[]) => {
    const z = a.indexOf(0),
      row = Math.floor(z / 4),
      col = z % 4;
    return [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ]
      .filter(([r, c]) => r >= 0 && r < 4 && c >= 0 && c < 4)
      .map(([r, c]) => {
        const b = [...a];
        [b[z], b[r * 4 + c]] = [b[r * 4 + c], b[z]];
        return b;
      });
  };
  const random = seededRandom(1947);
  let initial = [...goal],
    previous = "";
  for (let i = 0; i < depth; i++) {
    const options = neighbors(initial).filter((a) => a.join(",") !== previous);
    previous = initial.join(",");
    initial = options[Math.floor(random() * options.length)];
  }
  const h = (a: number[]) =>
    a.reduce(
      (v, t, i) =>
        !t
          ? v
          : v +
            Math.abs(Math.floor(i / 4) - Math.floor((t - 1) / 4)) +
            Math.abs((i % 4) - ((t - 1) % 4)),
      0,
    );
  type State = { a: number[]; g: number; parent?: State };
  const open: State[] = [{ a: initial, g: 0 }],
    seen = new Map([[initial.join(","), 0]]);
  const board = (a: number[]) =>
    Array.from({ length: 4 }, (_, i) => a.slice(i * 4, i * 4 + 4));
  const r = recorder({
    board: board(initial),
    boardKind: "puzzle",
    counts: { Expanded: 0, Generated: 1 },
  });
  r.emit({
    variables: { scramble: depth, heuristic: h(initial) },
    explanation: `A solvable 4×4 puzzle is generated by ${depth} legal moves from the goal. Blank = 0.`,
  });
  let solved: State | undefined,
    expanded = 0;
  while (open.length && expanded < 5000) {
    open.sort((a, b) => a.g + h(a.a) - (b.g + h(b.a)) || h(a.a) - h(b.a));
    const node = open.shift()!;
    if (node.g !== seen.get(node.a.join(","))) continue;
    expanded++;
    r.count("Expanded");
    if (r.steps.length < 1000)
      r.emit({
        type: "expand",
        line: 3,
        board: board(node.a),
        variables: {
          g: node.g,
          h: h(node.a),
          bound: node.g + h(node.a),
          frontier: open.length,
        },
        explanation: `Expand the lowest bound f = g + h = ${node.g} + ${h(node.a)}. Manhattan distance never overestimates remaining moves.`,
      });
    if (h(node.a) === 0) {
      solved = node;
      break;
    }
    for (const a of neighbors(node.a)) {
      const key = a.join(","),
        g = node.g + 1;
      if (g >= (seen.get(key) ?? Infinity)) continue;
      seen.set(key, g);
      open.push({ a, g, parent: node });
      r.count("Generated");
    }
  }
  if (solved) {
    const path: State[] = [];
    for (let s: State | undefined = solved; s; s = s.parent) path.unshift(s);
    for (const s of path)
      r.emit({
        type: "solution-path",
        line: 5,
        board: board(s.a),
        variables: { move: s.g, moves: solved.g },
        explanation: `Optimal solution playback: move ${s.g} of ${solved.g}. Each transition slides one tile into the blank.`,
      });
  }
  r.emit({
    type: solved ? "finish" : "limit",
    line: 6,
    variables: { solved: solved ? "Yes" : "No", moves: solved?.g ?? "Unknown" },
    explanation: solved
      ? `Puzzle solved optimally in ${solved.g} moves. The numbered tiles are in order.`
      : "Search reached 5,000 expansions. No solution is claimed. Reduce the scramble depth.",
  });
  return result(
    r,
    [
      "generate a solvable board; frontier = [board]",
      "bound = moves + Manhattan distance",
      "expand the board with minimum bound",
      "add unseen / improved legal neighbors",
      "on goal: reconstruct the parent path",
      "return solution or explicit search limit",
    ],
    complexity("O(S² log S) with sorted frontier", "O(S) stored states"),
    "Best-first branch and bound (A*) with admissible Manhattan bound. S is generated states; sorting the frontier each expansion adds overhead. Scramble depth 1–16. Captures first 1,000 search snapshots and full solution path. Search expansions jump between branches; only solution-path steps are consecutive moves.",
  );
}
function randomTrace(kind: string, input: Input): Trace {
  const random = seededRandom(input.n),
    a =
      kind === "shuffle"
        ? Array.from({ length: 16 }, (_, i) => i)
        : [...input.array];
  const r = recorder({
    ...(kind === "shuffle" ? { cards: a } : { array: a }),
    active: [],
    counts: { Comparisons: 0, Swaps: 0 },
  });
  r.emit({
    explanation: `Seed ${input.n} makes this randomized run reproducible. Change the seed to explore another run.`,
  });
  if (kind === "shuffle") {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
      r.count("Swaps");
      r.emit({
        type: "swap",
        line: 3,
        cards: a,
        active: [i, j],
        variables: { i, j },
        explanation: `Choose j uniformly from 0…${i}, then swap cards ${i} and ${j}. The suffix is fixed.`,
      });
    }
    r.emit({
      type: "finish",
      line: 5,
      cards: a,
      active: [],
      explanation:
        "All 16 cards are present once. Fisher–Yates is unbiased with an ideal uniform random source; this demo uses a deterministic pseudorandom seed.",
    });
    return result(
      r,
      [
        "a = deck; initialize random source",
        "for i = length - 1 down to 1",
        "  j = uniformInteger(0, i); swap(a[i], a[j])",
        "  suffix after i is finalized",
        "return shuffled deck",
      ],
      complexity("Θ(n)", "Θ(1)"),
      "16 distinct cards. Fisher–Yates needs independent uniform choices for exact uniformity; a finite seeded generator is used here for reproducibility, not cryptographic randomness.",
    );
  }
  if (kind === "random-search") {
    const indices = a.map((_, i) => i);
    let found = -1;
    while (indices.length) {
      const p = Math.floor(random() * indices.length),
        j = indices[p];
      indices[p] = indices.at(-1)!;
      indices.pop();
      r.count("Comparisons");
      r.emit({
        type: "compare",
        line: 3,
        array: a,
        active: [j],
        variables: {
          index: j,
          target: input.target,
          remaining: indices.length,
        },
        explanation: `Inspect randomly selected unvisited index ${j}: ${a[j]}.`,
      });
      if (a[j] === input.target) {
        found = j;
        break;
      }
    }
    r.emit({
      type: "finish",
      line: 5,
      active: [],
      done: found < 0 ? [] : [found],
      variables: { result: found, target: input.target },
      explanation:
        found < 0
          ? "Every index was checked; the target is absent."
          : `Found ${input.target} at index ${found}.`,
    });
    return result(
      r,
      [
        "remaining = all indices",
        "while remaining is not empty",
        "  choose and remove a random index; compare",
        "  if equal: return index",
        "return index or -1",
      ],
      { best: "Θ(1)", average: "Θ(n)", worst: "Θ(n)", space: "Θ(n)" },
      "Random search without replacement. No sorted input is required. At most n comparisons; randomness alone does not give logarithmic search.",
    );
  }
  function quick(lo: number, hi: number) {
    if (lo >= hi) return;
    const pick = lo + Math.floor(random() * (hi - lo + 1));
    [a[pick], a[hi]] = [a[hi], a[pick]];
    r.count("Swaps");
    const pivot = a[hi];
    let i = lo;
    r.emit({
      type: "pivot",
      line: 2,
      array: a,
      active: [pick, hi],
      pivot: hi,
      range: [lo, hi],
      variables: { pick, pivot },
      explanation: `Randomly choose index ${pick} in [${lo}, ${hi}] and move pivot ${pivot} to the end.`,
    });
    for (let j = lo; j < hi; j++) {
      r.count("Comparisons");
      r.emit({
        type: "compare",
        line: 3,
        array: a,
        active: [j, hi],
        explanation: `Compare ${a[j]} with pivot ${pivot}.`,
      });
      if (a[j] < pivot) {
        [a[i], a[j]] = [a[j], a[i]];
        r.count("Swaps");
        r.emit({
          type: "swap",
          line: 4,
          array: a,
          active: [i, j],
          explanation: "Move the smaller value to the left partition.",
        });
        i++;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    r.count("Swaps");
    r.emit({
      type: "partition",
      line: 5,
      array: a,
      pivot: i,
      active: [i],
      explanation: `Pivot ${pivot} is now at final index ${i}.`,
    });
    quick(lo, i - 1);
    quick(i + 1, hi);
  }
  quick(0, a.length - 1);
  r.emit({
    type: "finish",
    line: 6,
    array: a,
    active: [],
    range: undefined,
    pivot: undefined,
    done: a.map((_, i) => i),
    explanation: "The randomized partitions produce the same ascending result.",
  });
  return result(
    r,
    [
      "randomQuickSort(a, low, high)",
      "choose uniform pivot; swap to high",
      "compare each value against pivot",
      "move smaller values to left partition",
      "place pivot; recurse on both sides",
      "return sorted array",
    ],
    {
      best: "Θ(n log n)",
      average: "Expected Θ(n log n), distinct keys",
      worst: "Θ(n²)",
      space: "O(n) worst recursion",
    },
    "Random pivot with Lomuto partitioning. Distinct keys give expected O(n log n); equal-heavy inputs can still be quadratic. A seeded pseudorandom source makes replay deterministic. Swap counter includes self-swaps.",
  );
}
