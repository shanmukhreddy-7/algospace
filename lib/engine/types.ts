export type Vertex = { id: string; x: number; y: number; label?: string };
export type Edge = { a: string; b: string; weight: number };
export type TreeNode = {
  id: string;
  label: string;
  left?: TreeNode;
  right?: TreeNode;
};
export type Item = { name: string; weight: number; value: number };
export type Snapshot = {
  type: string;
  line: number;
  explanation: string;
  variables: Record<string, string | number>;
  counts: Record<string, number>;
  array?: number[];
  ids?: number[];
  active?: number[];
  done?: number[];
  pivot?: number;
  range?: [number, number];
  tree?: TreeNode;
  decomposition?: TreeNode;
  decompositionCurrent?: string;
  mergeLeft?: number[];
  mergeRight?: number[];
  forest?: TreeNode[];
  stack?: string[];
  output?: string[];
  buckets?: number[][];
  nodes?: Vertex[];
  edges?: Edge[];
  selectedEdges?: number[];
  rejectedEdges?: number[];
  activeEdge?: number;
  visited?: string[];
  current?: string;
  distances?: Record<string, number>;
  predecessors?: Record<string, string>;
  table?: number[][];
  cell?: [number, number];
  sources?: [number, number][];
  items?: Item[];
  fractions?: number[];
  codes?: Record<string, string>;
  frequencies?: Record<string, number>;
};
export type Trace = {
  steps: Snapshot[];
  code: string[];
  complexity: { best: string; average: string; worst: string; space: string };
  assumption: string;
};
export type Input = {
  array: number[];
  target: number;
  n: number;
  text: string;
  items: Item[];
  capacity: number;
  nodes: Vertex[];
  edges: Edge[];
  start: string;
  destination: string;
};
export function recorder(initial: Partial<Snapshot> = {}) {
  let state: Snapshot = {
    type: "ready",
    line: 1,
    explanation: "Input is ready. Step forward to begin.",
    variables: {},
    counts: {},
    ...initial,
  };
  const steps: Snapshot[] = [];
  return {
    steps,
    emit(patch: Partial<Snapshot>) {
      state = { ...state, ...patch };
      steps.push(structuredClone(state));
    },
    count(key: string) {
      state.counts[key] = (state.counts[key] ?? 0) + 1;
    },
  };
}
