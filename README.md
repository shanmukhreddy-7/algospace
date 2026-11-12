# AlgoSpace

Understand algorithms by watching them work.

An interactive university Design and Analysis of Algorithms laboratory. Built with React 19, TypeScript, Tailwind CSS, accessible Radix/Shadcn primitives, SVG visualizations, and Recharts. The project supports native Next.js deployment on Vercel and a Vinext/Vite Cloudflare Worker build for Sites hosting. The algorithm engine runs in the browser; no application backend or authentication is required.

## Run locally

Requires Node.js 22.13 or newer and npm. On Fedora/Linux, install dependencies from the lockfile; do this again after copying the project from Windows because native packages in `node_modules` are platform-specific.

```sh
npm ci --include=dev --include=optional
npm run dev:next
```

Open http://localhost:3000. These commands use native Next.js, matching the Vercel deployment. No environment variables, database, or hosting credentials are required for the learning app.

To verify and build locally, stop the development server first:

```sh
npm test
npm run lint
npm run build:next
npm run typecheck
npm run start:next
```

`start:next` serves the production build at http://localhost:3000. Type checking after building uses freshly generated Next.js route types.

The original `dev`, `build`, `start`, and `install:ci` scripts remain available for the older Vinext/Sites workflow; they are not the native Next.js commands. Vercel already selects native Next.js through `vercel.json`. Local setup does not deploy the app.

When transferring between Windows and Linux, discard generated `.next` files before starting. Git may report CRLF/LF differences from the transfer; inspect them before normalizing so existing edits are preserved.

## Routes

- `/`: compact introduction, live sorting preview, and curriculum
- `/learn`: all 17 learning modules
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

TypeScript, application lint, production compilation, and HTTP rendering are checked separately. Browser checks cover intro entry, catalog search and filtering, forward/backward playback across the 16 shared-player labs, timed card playback, custom randomized sorting input, and the complexity slider. The optional `set_execution_step` WebMCP hook was exercised on the eight-queen solution. Desktop and narrow browser-panel layouts were inspected; this is not comprehensive cross-browser or physical-device testing.

## Demonstration sequence

1. Run Quick Sort on a reverse-sorted array; inspect the pivot and comparison counter.
2. Step backward and show that array values, code line, and variables all restore.
3. Compare the same array with Merge Sort.
4. Create a weighted graph and change one edge; compare shortest-path and MST behavior.
5. Run 0/1 Knapsack and follow reconstruction from the final DP cell.
6. Encode BANANA and inspect why the resulting codes are prefix-free.
7. Adjust n in the complexity lab and relate the observed counts to growth classes.

## AlgoSpace redesign

The interface defaults to dark with a light-theme option. A custom SVG logo and CSS 3D orbit introduce the site once per browser session. Reduced-motion preferences stop decorative motion and homepage autoplay; manual algorithm playback remains available. The homepage shows six featured labs; `/learn` searches and filters all 17 topics.

New labs cover Floyd–Warshall, BFS/DFS, eight queens and backtracking, knight’s tour, TSP (also labelled TSSP), the 4×4 sliding puzzle, Fisher–Yates cards, randomized Quick Sort, and randomized search. Huffman and 0/1 Knapsack remain available.

Search bounds keep interactive runs manageable: exact TSP uses 2–7 graph vertices; knight tours support 5–8 boards and 20,000 calls; sliding puzzles use 1–16 legal scramble moves and at most 5,000 expansions. The puzzle is the conventional 15-tile/one-blank 4×4 interpretation of “16-puzzle.” Knight and puzzle trace capture is capped separately from search work, and a search limit never claims a solution. Puzzle search snapshots may jump between candidate states; only the reconstructed solution sequence represents consecutive legal moves.

New correctness checks cover shortest-path agreement, graph traversal, queen constraints, legal knight moves, exact TSP costs, legal puzzle solutions, seeded shuffling, randomized sorting/search, snapshot isolation, and input bounds. No deployment is performed as part of this local redesign.

The creator page and its navigation links have been removed. Graph traversal labs display the persistent BFS queue or DFS work-stack history below the graph, with waiting/active/processed labels and a separate visited-order history. The active parent stays highlighted while its neighbors are added. DFS uses iterative LIFO traversal and skips stale entries on pop. Knight’s Tour displays a knight piece at the current end of the route, while preserving move numbers.
