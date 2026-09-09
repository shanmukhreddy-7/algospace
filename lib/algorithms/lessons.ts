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
