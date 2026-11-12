export const lessons: Record<
  string,
  { concept: string; invariant: string; try: string }
> = {
  complexity: {
    concept:
      "An algorithm is a finite, unambiguous sequence of steps that transforms valid inputs into the specified output.",
    invariant:
      "Establish what remains true after each operation; use it to connect individual steps to the final result.",
    try: "Double n in the operation-count experiment. Which costs double, and which quadruple?",
  },
  "data-structures": {
    concept:
      "A representation determines which operations are cheap. Arrays offer direct indexing; stacks and queues restrict removal order. Hash tables map keys to buckets.",
    invariant:
      "A chained hash table stores every key in the bucket selected by its hash. A collision does not overwrite an existing key.",
    try: "Use 7, 14, 21, 8, 15 to force collisions. Compare stack removal order with queue removal order.",
  },
  "sorting-searching": {
    concept:
      "Merge Sort combines sorted halves. Quick Sort partitions around a pivot. Linear Search scans; Binary Search eliminates half the remaining interval.",
    invariant:
      "Merge Sort maintains a sorted output prefix. Quick Sort keeps values smaller than the pivot before the boundary. Binary Search keeps any possible match inside [low, high].",
    try: "Compare sorted and reverse-sorted input. Last-element Quick Sort can perform quadratic work on both.",
  },
  recursion: {
    concept:
      "Recursion expresses a problem using smaller instances. Iteration repeats a state update. Both need a stopping condition.",
    invariant:
      "factorial(n) returns n times factorial(n−1), with 0! = 1. The iterative accumulator stores the product computed so far.",
    try: "Run factorial(5) in both approaches. Each performs linear work, but only recursion retains pending call frames.",
  },
  "divide-conquer": {
    concept:
      "Divide the input, conquer the smaller problems, then combine their answers. Merge Sort divides before recursion and combines afterward; Quick Sort partitions before recursion.",
    invariant:
      "Every recursive interval gets strictly smaller. Combining correct solutions to disjoint halves produces a correct solution to the whole.",
    try: "Follow the highlighted [low, high] interval as it divides and merges. Merge Sort satisfies T(n)=2T(n/2)+Θ(n).",
  },
  bst: {
    concept:
      "In a binary search tree, keys in the left subtree are smaller and keys in the right subtree are larger. The input order determines the shape.",
    invariant:
      "Every inserted key preserves the ordering rule for all of its ancestors. Inorder traversal therefore outputs sorted keys.",
    try: "Insert increasing values to create a skewed tree, then compare with 8, 4, 12, 2, 6, 10, 14.",
  },
  "fractional-knapsack": {
    concept:
      "When fractions are allowed, consume capacity in descending value-per-weight order. An exchange argument shows that replacing a lower-ratio portion with a higher-ratio portion cannot reduce value.",
    invariant:
      "Every chosen portion has at least the ratio of any unchosen portion, except equal-ratio ties.",
    try: "Compare the same items with 0/1 Knapsack. The fractional result is an upper bound on the indivisible result.",
  },
  graphs: {
    concept:
      "Dijkstra finds shortest paths from a source. Prim grows a minimum spanning tree from one vertex. Kruskal joins components in ascending edge-weight order.",
    invariant:
      "Dijkstra finalizes the closest unvisited vertex with non-negative weights. Prim and Kruskal select safe edges that cross a cut without introducing a cycle.",
    try: "Change an edge weight and rerun. A shortest-path tree need not be a minimum spanning tree.",
  },
  huffman: {
    concept:
      "Huffman coding repeatedly merges the two least frequent symbols or subtrees. Frequent symbols usually receive shorter codes.",
    invariant:
      "Symbols are leaves. No complete symbol code is a prefix of another, so the encoded stream is uniquely decodable.",
    try: "Compare BANANA with ABCDEF. Payload savings depend on frequency imbalance; a codebook also costs space.",
  },
  knapsack: {
    concept:
      "dp[i][c] stores the best value using the first i items with capacity c. Either exclude item i, or include it once and use capacity c−weight[i] from the previous row.",
    invariant:
      "Every cell refers only to the previous item row. This prevents the same item from being selected repeatedly.",
    try: "Watch backtracking: when a value differs from the cell above, the current item was selected.",
  },
};

Object.assign(lessons, {
  "all-pairs": {
    concept:
      "Floyd–Warshall improves a distance matrix by allowing one more intermediate vertex in each phase.",
    invariant:
      "After phase k, each cell is the shortest path using only intermediate vertices 0 through k.",
    try: "Remove an edge. Watch indirect paths replace missing direct connections.",
  },
  traversal: {
    concept:
      "BFS expands a FIFO frontier by levels. DFS uses a LIFO work stack to follow deeper branches first.",
    invariant:
      "Each vertex is visited once. BFS keeps discovered vertices in a queue; DFS pops the most recently added pending entry and skips entries already visited.",
    try: "Use the same start vertex in both traversals. Compare the order and the frontier.",
  },
  "eight-queens": {
    concept:
      "Backtracking builds a candidate one row at a time and undoes choices that cannot lead to a solution.",
    invariant: "Every placed queen has a distinct row, column, and diagonal.",
    try: "Pause at a conflict, then step backward to see why the candidate was rejected.",
  },
  "knights-tour": {
    concept:
      "A knight must visit every square exactly once. Warnsdorff ordering tries moves with few onward options first.",
    invariant:
      "Numbered squares form a legal path with no repeated square; backtracking removes a failed suffix.",
    try: "Compare a 5×5 board with a larger board. Heuristic ordering helps but does not guarantee a quick solution.",
  },
  "travelling-salesman": {
    concept:
      "Branch and bound explores tours while retaining the cheapest complete trip found so far.",
    invariant:
      "With non-negative weights, partial cost cannot exceed the cost of any completion; branches no better than the incumbent can be pruned.",
    try: "Add a cheap return edge. Does the best route change? Missing edges are never treated as shortcuts.",
  },
  "sliding-puzzle": {
    concept:
      "Best-first branch and bound (A*) prioritizes moves-so-far plus Manhattan distance. Parent pointers reconstruct a solution.",
    invariant:
      "Manhattan distance never overestimates remaining moves. The first goal removed from the frontier has minimum cost.",
    try: "Increase scramble depth. Compare expanded search states to the length of the final solution.",
  },
  randomized: {
    concept:
      "Random choices can shuffle a deck, choose pivots, or decide search order. A seed lets you reproduce a run.",
    invariant:
      "Shuffling preserves every card; random search never rechecks an index; partitioning preserves all input values.",
    try: "Try two seeds with the same input. Compare operation counts, then replay a seed to get the same trace.",
  },
});
