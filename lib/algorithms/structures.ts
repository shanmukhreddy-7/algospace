import {
  recorder,
  type Input,
  type Trace,
  type TreeNode,
} from "../engine/types";
export function structureTrace(input: Input, kind: string): Trace {
  const r = recorder({ counts: { Operations: 0 } });
  let code: string[], assumption: string;
  let complexity = {
    best: "Θ(n)",
    average: "Θ(n)",
    worst: "Θ(n)",
    space: "O(n)",
  };
  if (["hash", "array", "stack", "queue"].includes(kind)) {
    const a: number[] = [],
      output: string[] = [],
      buckets: number[][] = Array.from({ length: 7 }, () => []);
    r.emit({
      array: a,
      buckets: kind === "hash" ? buckets : undefined,
      output,
      explanation:
        kind === "hash"
          ? "Seven buckets; collisions use separate chaining."
          : "Insert the input values in order.",
    });
    for (const key of input.array) {
      r.count("Operations");
      if (kind === "hash") {
        const index = ((key % 7) + 7) % 7;
        r.emit({
          type: "hash",
          line: 2,
          active: [index],
          variables: { key, hash: `((${key} % 7) + 7) % 7`, bucket: index },
          explanation: `Hash ${key} to bucket ${index}.`,
        });
        if (buckets[index].length)
          r.emit({
            type: "collision",
            line: 3,
            explanation: `Collision at bucket ${index}; append to its chain.`,
          });
        buckets[index].push(key);
        r.emit({
          type: "insert",
          line: 4,
          buckets,
          explanation: `Store ${key} in bucket ${index}.`,
        });
      } else {
        a.push(key);
        r.emit({
          type: kind === "queue" ? "enqueue" : "push",
          line: 2,
          array: a,
          active: [a.length - 1],
          variables: { size: a.length, top: a[a.length - 1] },
          explanation: `${kind === "queue" ? "Enqueue" : "Append"} ${key}.`,
        });
      }
    }
    if (kind === "stack" || kind === "queue") {
      while (a.length) {
        const v = kind === "stack" ? a.pop() : a.shift();
        output.push(String(v));
        r.count("Operations");
        r.emit({
          type: kind === "stack" ? "pop" : "dequeue",
          line: 3,
          array: a,
          output,
          active: [],
          variables: { size: a.length, removed: v! },
          explanation: `Remove ${v} from the ${kind === "stack" ? "top (last in, first out)" : "front (first in, first out)"}.`,
        });
      }
    }
    r.emit({
      type: "finish",
      line: 5,
      active: [],
      explanation:
        kind === "hash"
          ? "All keys are stored. Linked chains preserve collisions."
          : "The sequence is complete.",
    });
    code = [
      "build(values)",
      "  insert value / calculate hash",
      "  handle collision / remove next value",
      "  append to bucket chain",
      "  return structure",
    ];
    assumption =
      kind === "hash"
        ? "Separate chaining; modulo 7 handles negative keys too. Expected O(1) insertion and lookup with a good distribution; worst O(n) lookup."
        : kind === "queue"
          ? "FIFO behavior is shown with a JavaScript array. shift() costs O(n); a linked or circular queue supports O(1) dequeue."
          : kind === "stack"
            ? "A stack removes the last inserted value. Each push/pop is amortized O(1)."
            : "Arrays provide O(1) indexed access; middle insertion requires shifting O(n) values.";
    if (kind === "queue")
      complexity = {
        best: "Θ(n²)",
        average: "Θ(n²)",
        worst: "Θ(n²)",
        space: "O(n)",
      };
  } else if (kind === "recursive" || kind === "iterative") {
    const n = input.n,
      stack: string[] = [],
      tree: TreeNode = { id: String(n), label: `f(${n})` };
    r.emit({
      stack,
      tree: kind === "recursive" ? tree : undefined,
      variables: { n, result: 1 },
      explanation: `Compute ${n}! as the product of integers from 1 to ${n}.`,
    });
    let result = 1;
    if (kind === "recursive") {
      let node = tree;
      for (let i = n; i >= 1; i--) {
        stack.push(`factorial(${i})`);
        if (i < n) {
          node.left = { id: String(i), label: `f(${i})` };
          node = node.left;
        }
        r.count("Calls");
        r.emit({
          type: "push",
          line: 2,
          stack,
          tree,
          current: String(i),
          variables: { n: i, result },
          explanation: `Push factorial(${i}) onto the call stack.`,
        });
      }
      if (n === 0)
        r.emit({
          type: "base-case",
          line: 3,
          variables: { n: 0, result: 1 },
          explanation: "The base case 0! returns 1.",
        });
      for (let i = 1; i <= n; i++) {
        result *= i;
        stack.pop();
        r.count("Operations");
        r.emit({
          type: "return",
          line: i === 1 ? 3 : 4,
          stack,
          tree,
          current: String(i),
          variables: { n: i, result },
          explanation: `Return ${result} from factorial(${i}); pop its frame.`,
        });
      }
    } else {
      for (let i = 2; i <= n; i++) {
        result *= i;
        r.count("Operations");
        r.emit({
          type: "multiply",
          line: 3,
          variables: { i, n, result },
          array: Array.from({ length: i }, (_, j) => j + 1),
          active: [i - 1],
          explanation: `Multiply the accumulator by ${i}: result = ${result}.`,
        });
      }
    }
    r.emit({
      type: "finish",
      line: 5,
      variables: { n, result },
      explanation: `${n}! = ${result}.`,
    });
    code =
      kind === "recursive"
        ? [
            "factorial(n)",
            "  enter frame for n",
            "  if n <= 1: return 1",
            "  return n * factorial(n - 1)",
            "result = factorial(input)",
          ]
        : [
            "factorial(n)",
            "  result = 1",
            "  for i = 2 to n: result *= i",
            "  // one accumulator, no recursive frames",
            "  return result",
          ];
    assumption =
      "Accepts integers 0–12 to keep the visualization readable. Both approaches perform linear work; recursion retains one frame per call.";
    complexity = {
      best: "Θ(n)",
      average: "Θ(n)",
      worst: "Θ(n)",
      space: kind === "recursive" ? "Θ(n)" : "Θ(1)",
    };
  } else {
    let root: TreeNode | undefined;
    const output: string[] = [];
    r.emit({
      output,
      explanation:
        "Build a binary search tree from the input order. Duplicate keys are ignored.",
    });
    for (const value of input.array) {
      if (!root) {
        root = { id: String(value), label: String(value) };
        r.count("Operations");
        r.emit({
          tree: root,
          type: "insert",
          line: 2,
          current: String(value),
          explanation: `Insert ${value} as the root.`,
        });
        continue;
      }
      let node = root;
      while (true) {
        r.count("Operations");
        r.emit({
          tree: root,
          type: "compare",
          line: 3,
          current: node.id,
          variables: { key: value, node: node.label },
          explanation: `Compare ${value} with ${node.label}.`,
        });
        if (value === Number(node.label)) break;
        const side = value < Number(node.label) ? "left" : "right";
        if (!node[side]) {
          node[side] = { id: String(value), label: String(value) };
          r.emit({
            tree: root,
            type: "insert",
            line: 4,
            current: String(value),
            explanation: `Insert ${value} as the ${side} child of ${node.label}.`,
          });
          break;
        }
        node = node[side]!;
      }
    }
    if (kind === "bst-search") {
      let node = root;
      let found = false;
      while (node) {
        r.count("Operations");
        r.emit({
          type: "visit-node",
          line: 5,
          current: node.id,
          variables: { target: input.target, node: node.label },
          explanation: `Inspect ${node.label}; smaller keys are left, larger keys are right.`,
        });
        if (Number(node.label) === input.target) {
          found = true;
          break;
        }
        node = input.target < Number(node.label) ? node.left : node.right;
      }
      output.push(
        found ? `Found ${input.target}` : `${input.target} not found`,
      );
    } else if (kind !== "bst-insert") {
      function visit(node: TreeNode | undefined) {
        if (!node) return;
        if (kind === "preorder") out(node);
        visit(node.left);
        if (kind === "inorder") out(node);
        visit(node.right);
        if (kind === "postorder") out(node);
      }
      function out(node: TreeNode) {
        output.push(node.label);
        r.count("Operations");
        r.emit({
          type: "visit-node",
          line: 5,
          current: node.id,
          output,
          explanation: `Visit ${node.label}; traversal so far: ${output.join(", ")}.`,
        });
      }
      visit(root);
    }
    r.emit({
      type: "finish",
      line: 6,
      current: undefined,
      output,
      explanation:
        kind === "bst-insert"
          ? "Tree construction complete."
          : output.join(" → "),
    });
    code = [
      "build BST(values)",
      "  if tree empty: insert root",
      "  compare key with current node",
      "  descend left/right; insert at empty child",
      kind === "bst-search"
        ? "  search: compare and descend toward target"
        : `  traverse ${kind === "preorder" ? "root, left, right" : kind === "postorder" ? "left, right, root" : "left, root, right"}`,
      "  return tree / traversal result",
    ];
    assumption =
      "Unbalanced BST; duplicate keys are ignored. Insert/search costs O(h); a skewed tree has h = n. Traversal costs Θ(n). Display includes construction before traversal.";
    complexity = {
      best: "O(n log n) build",
      average: "O(n log n) build",
      worst: "O(n²) build",
      space: "O(n)",
    };
  }
  return { steps: r.steps, code, complexity, assumption };
}
