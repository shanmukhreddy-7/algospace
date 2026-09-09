import {
  recorder,
  type Input,
  type Trace,
  type TreeNode,
} from "../engine/types";
export function knapsackTrace(input: Input, fractional: boolean): Trace {
  const { items, capacity } = input;
  const fractions = items.map(() => 0);
  const r = recorder({
    items,
    fractions,
    counts: { Comparisons: 0, Updates: 0 },
  });
  r.emit({
    variables: { capacity, value: 0, remaining: capacity },
    explanation: "Choose items without exceeding the capacity.",
  });
  if (fractional) {
    const order = items
      .map((item, i) => ({ item, i }))
      .sort((a, b) => {
        r.count("Comparisons");
        return b.item.value / b.item.weight - a.item.value / a.item.weight;
      });
    r.emit({
      type: "sort",
      line: 2,
      output: order.map(
        ({ item }) => `${item.name}: ${(item.value / item.weight).toFixed(2)}`,
      ),
      explanation: "Sort by descending value/weight ratio.",
    });
    let remaining = capacity,
      value = 0;
    for (const { item, i } of order) {
      const f = Math.min(1, remaining / item.weight);
      fractions[i] = f;
      remaining -= f * item.weight;
      value += f * item.value;
      r.count("Updates");
      r.emit({
        type: f === 0 ? "reject" : f === 1 ? "select" : "fraction",
        line: 4,
        fractions,
        active: [i],
        variables: {
          capacity,
          remaining,
          value: Number(value.toFixed(4)),
          weight: Number((capacity - remaining).toFixed(4)),
          ratio: Number((item.value / item.weight).toFixed(3)),
        },
        explanation:
          f === 0
            ? `No capacity remains; reject ${item.name}.`
            : `Take ${(f * 100).toFixed(1)}% of ${item.name}, adding ${(f * item.value).toFixed(2)} value.`,
      });
    }
    r.emit({
      type: "finish",
      line: 5,
      active: [],
      explanation: `Maximum value ${value.toFixed(2)}, using ${(capacity - remaining).toFixed(2)} of ${capacity} capacity.`,
    });
  } else {
    const dp = Array.from(
      { length: items.length + 1 },
      () => Array(capacity + 1).fill(0) as number[],
    );
    r.emit({
      table: dp,
      line: 2,
      type: "initialize",
      explanation: "Initialize row 0 and capacity 0 to zero.",
    });
    for (let i = 1; i <= items.length; i++) {
      const item = items[i - 1];
      for (let c = 0; c <= capacity; c++) {
        const exclude = dp[i - 1][c],
          include =
            item.weight <= c
              ? item.value + dp[i - 1][c - item.weight]
              : -Infinity;
        dp[i][c] = Math.max(exclude, include);
        r.count("Comparisons");
        r.count("Updates");
        r.count("Cells calculated");
        r.emit({
          table: dp,
          type: "cell",
          line: 4,
          cell: [i, c],
          sources:
            item.weight <= c
              ? [
                  [i - 1, c],
                  [i - 1, c - item.weight],
                ]
              : [[i - 1, c]],
          active: [i - 1],
          variables: {
            item: item.name,
            capacity: c,
            exclude,
            include: include < 0 ? "does not fit" : include,
            best: dp[i][c],
          },
          explanation: `dp[${i}][${c}] = max(exclude ${exclude}, include ${include < 0 ? "not feasible" : include}) = ${dp[i][c]}.`,
        });
      }
    }
    let c = capacity;
    const selected: string[] = [];
    for (let i = items.length; i > 0; i--) {
      const take = dp[i][c] !== dp[i - 1][c];
      if (take) {
        fractions[i - 1] = 1;
        selected.unshift(items[i - 1].name);
      }
      r.emit({
        type: "backtrack",
        line: 5,
        cell: [i, c],
        sources: [[i - 1, c]],
        fractions,
        output: selected,
        explanation: take
          ? `Value differs from the row above: select ${items[i - 1].name}.`
          : `Value equals the row above: skip ${items[i - 1].name}.`,
      });
      if (take) c -= items[i - 1].weight;
    }
    r.emit({
      type: "finish",
      line: 6,
      active: [],
      cell: undefined,
      sources: [],
      variables: {
        "Optimal value": dp[items.length][capacity],
        "Total weight": capacity - c,
        capacity,
      },
      explanation: `Optimal value ${dp[items.length][capacity]}; selected ${selected.join(", ") || "no items"}, total weight ${capacity - c}.`,
    });
  }
  return {
    steps: r.steps,
    code: fractional
      ? [
          "fractionalKnapsack(items, capacity)",
          "  sort items by value / weight descending",
          "  for each item in ratio order",
          "    take min(1, remaining / weight); update totals",
          "  return total value",
        ]
      : [
          "knapsack(items, capacity)",
          "  dp[0][c] = 0 for every c",
          "  for item i and capacity c",
          "    dp[i][c] = max(exclude, feasible include)",
          "  backtrack: select if value differs from above",
          "  return optimal value and selected items",
        ],
    complexity: fractional
      ? {
          best: "O(n log n)",
          average: "O(n log n)",
          worst: "O(n log n)",
          space: "O(n)",
        }
      : { best: "Θ(nC)", average: "Θ(nC)", worst: "Θ(nC)", space: "Θ(nC)" },
    assumption: fractional
      ? "Items are divisible; positive weights and non-negative values. Greedy ratio selection is optimal here."
      : "Items are indivisible, weights and capacity are non-negative integers (weights > 0). O(nC) is pseudo-polynomial in numeric capacity C.",
  };
}
export function huffmanTrace(text: string): Trace {
  const freq: Record<string, number> = {};
  for (const ch of text) freq[ch] = (freq[ch] ?? 0) + 1;
  type Node = TreeNode & {
    weight: number;
    symbol?: string;
    left?: Node;
    right?: Node;
  };
  let serial = 0;
  const queue: Node[] = Object.entries(freq).map(([symbol, weight]) => ({
    id: String(serial++),
    label: `${symbol === " " ? "␣" : symbol} · ${weight}`,
    weight,
    symbol,
  }));
  const codes: Record<string, string> = {};
  const r = recorder({
    frequencies: freq,
    codes,
    forest: queue,
    counts: { Combinations: 0, Comparisons: 0 },
  });
  r.emit({
    explanation:
      "Count each character and create one leaf per distinct symbol.",
  });
  while (queue.length > 1) {
    queue.sort((a, b) => {
      r.count("Comparisons");
      return a.weight - b.weight || Number(a.id) - Number(b.id);
    });
    r.emit({
      line: 2,
      type: "queue",
      forest: queue,
      explanation: "Order the priority queue by increasing frequency.",
    });
    const left = queue.shift()!,
      right = queue.shift()!;
    const parent: Node = {
      id: String(serial++),
      label: String(left.weight + right.weight),
      weight: left.weight + right.weight,
      left,
      right,
    };
    queue.push(parent);
    r.count("Combinations");
    r.emit({
      line: 3,
      type: "combine",
      forest: queue,
      current: parent.id,
      explanation: `Combine frequencies ${left.weight} and ${right.weight} into ${parent.weight}.`,
    });
  }
  const root = queue[0];
  function walk(n: Node, code: string) {
    if (n.symbol !== undefined) {
      codes[n.symbol] = code || "0";
      r.emit({
        line: 4,
        type: "code",
        tree: root,
        forest: undefined,
        current: n.id,
        codes,
        explanation: `Assign ${JSON.stringify(n.symbol)} the code ${codes[n.symbol]}.`,
      });
      return;
    }
    if (n.left) walk(n.left, code + "0");
    if (n.right) walk(n.right, code + "1");
  }
  walk(root, "");
  const encoded = [...text].map((c) => codes[c]).join("");
  r.emit({
    line: 5,
    type: "finish",
    current: undefined,
    output: [encoded],
    variables: {
      "UTF-8 input bits": new TextEncoder().encode(text).length * 8,
      "Encoded payload bits": encoded.length,
      "Distinct symbols": Object.keys(freq).length,
    },
    explanation:
      "Encoded payload complete. This comparison excludes the codebook and framing overhead; short messages may grow after that overhead.",
  });
  return {
    steps: r.steps,
    code: [
      "count frequencies; make leaves",
      "sort queue by ascending frequency",
      "combine two lightest nodes; reinsert parent",
      "walk tree: left = 0, right = 1; assign leaf codes",
      "encode each input character with its code",
    ],
    complexity: {
      best: "O(m + k² log k)",
      average: "O(m + k² log k)",
      worst: "O(m + k² log k)",
      space: "O(m + k)",
    },
    assumption:
      "m = text length, k = distinct symbols. This visible priority queue is re-sorted each round; a heap implementation reduces construction to O(k log k). Single-symbol input receives code 0.",
  };
}
