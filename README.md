# AlgoScope

Understand algorithms by watching them work.

An interactive university Design and Analysis of Algorithms laboratory. Built with React 19, TypeScript, Tailwind CSS, accessible Radix/Shadcn primitives, SVG visualizations, and Recharts. Next.js App Router conventions are served by Vinext/Vite, with a Cloudflare Worker build for Sites hosting. The algorithm engine runs in the browser; no application backend or authentication is required.

## Run locally

Requires Node.js 22.13 or newer.

```sh
npm run install:ci
npm run dev
```

The development server uses http://localhost:5173. For a production build:

```sh
npm run typecheck
npm test
npm run lint
npm run build
npm start
```

If the Windows npm launcher is misconfigured, invoke its JavaScript entrypoint directly, for example:

```powershell
node "C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js" run dev
```

## Routes

- `/`: compact introduction, live sorting preview, and curriculum
- `/learn`: all ten fixed learning modules
- `/learn/[algorithm]`: individual labs; slugs are defined in `lib/algorithms/metadata.ts`
- `/playground`: experiment with any implemented algorithm and custom input
- `/compare`: Merge Sort vs Quick Sort, or Prim vs Kruskal, with shared input
- `/about`: project explanation and measurement assumptions

## Architecture

- `lib/engine/types.ts`: snapshot, graph, tree, item, input, and trace contracts; immutable history recorder
- `lib/engine/usePlayback.ts`: shared stepping, playback timing, speed, reset, keyboard behavior
- `lib/algorithms/`: algorithm implementations, validation, metadata, and educational notes
- `components/algoscope/Visualizers.tsx`: array, graph, tree, stack, hash, capacity, and DP rendering
- `components/algoscope/InputEditor.tsx`: validated array, item, text, and weighted-graph editors
- `components/algoscope/Lab.tsx`: code synchronization, variable inspector, practice prompts, learning layout
- `components/algoscope/Compare.tsx`: synchronized comparison on the same input
- `tests/algorithms.test.ts`: deterministic reference and property checks

An algorithm emits a snapshot after each meaningful operation. Each snapshot deep-copies the visualization data, variables, counters, explanation, and pseudocode line. Playback reads snapshots by index, so backward stepping restores state without rerunning or reversing mutations. Input edits are staged until Run is pressed.

## Coverage

1. Complexity: seven selectable logarithmically scaled growth curves, actual loop-operation counts, O/Ω/Θ explanations, polynomial Master Method calculator.
2. Structures: arrays, stack, queue, modulo-7 hashing with separate chaining.
3. Sorting/searching: stable Merge Sort, last-pivot Quick Sort, linear and binary search.
4. Recursion/iteration: factorial with call frames, recursive tree, and iterative accumulator.
5. Divide and conquer: recursive range decomposition and visible merge buffers.
6. BST: custom insertion order, search, three traversals, empty/reset state; duplicates ignored.
7. Fractional Knapsack: ratio sorting, full/fractional/rejected selections, capacity allocation.
8. Graphs: move/add/delete nodes, connect/update/delete edges, random connected example, Dijkstra, Prim, Kruskal.
9. Huffman: frequencies, priority queue, combinations, prefix tree, generated codes, encoded payload.
10. 0/1 Knapsack: full DP table, include/exclude dependencies, backtracking and selected items.

## Measurement and limits

The displayed complexity bounds describe the underlying teaching implementation, not the memory consumed by its recorded history. Browser animation duration is not execution complexity. Queue removal uses array shifting; graph implementations scan edge lists; Huffman re-sorts a visible priority queue; Kruskal uses simple union-find. These choices and their costs are explicitly described in the UI.

Input bounds keep traces and diagrams usable: 24 array values, 15 BST keys, 10 graph vertices, 8 items, capacity up to 30, factorial up to 12, and 80 text characters with at most 12 distinct symbols. Graph weights are non-negative, 0–99. Binary Search rejects unsorted input. Prim and Kruskal reject disconnected graphs. Item weights are positive integers; values are non-negative integers. Huffman size comparisons exclude codebook/framing overhead.

Local storage holds theme preference and the last executed algorithm. Inputs stay in memory on this device.

## Verification

`npm test` checks randomized sorting, stable duplicate handling, input immutability and snapshot isolation, searching, collision chains, stack/queue ordering, factorial, BST traversals, Dijkstra against Floyd–Warshall, MSTs against exhaustive spanning-tree enumeration, 0/1 Knapsack against brute force, Huffman prefix-freeness/round trips, and validation boundaries.

TypeScript, application lint, production compilation, and HTTP rendering of all routes are checked separately. Automated browser interaction/visual QA has not been performed. The optional feature-detected `set_execution_step` WebMCP hook has not been exercised in a browser supporting that proposed API; it is not required for ordinary use.

## Demonstration sequence

1. Run Quick Sort on a reverse-sorted array; inspect the pivot and comparison counter.
2. Step backward and show that array values, code line, and variables all restore.
3. Compare the same array with Merge Sort.
4. Create a weighted graph and change one edge; compare shortest-path and MST behavior.
5. Run 0/1 Knapsack and follow reconstruction from the final DP cell.
6. Encode BANANA and inspect why the resulting codes are prefix-free.
7. Adjust n in the complexity lab and relate the observed counts to growth classes.
