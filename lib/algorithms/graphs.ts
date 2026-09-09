import { recorder, type Input, type Trace } from "../engine/types";
export function graphTrace(input: Input, kind: string): Trace {
  const { nodes, edges, start, destination } = input;
  const visited: string[] = [],
    selected: number[] = [],
    rejected: number[] = [];
  const r = recorder({
    nodes,
    edges,
    visited,
    selectedEdges: selected,
    rejectedEdges: rejected,
    counts: { "Visited nodes": 0, "Edges examined": 0, Updates: 0 },
  });
  r.emit({
    explanation: "An undirected weighted graph is ready.",
    variables: { start },
  });
  let weight = 0;
  if (kind === "dijkstra") {
    const dist: Record<string, number> = {},
      prev: Record<string, string> = {};
    nodes.forEach((n) => (dist[n.id] = Infinity));
    dist[start] = 0;
    r.emit({
      line: 2,
      type: "initialize",
      distances: dist,
      predecessors: prev,
      explanation: `Set distance of ${start} to 0; all others start at infinity.`,
    });
    while (visited.length < nodes.length) {
      const u = nodes
        .filter((n) => !visited.includes(n.id))
        .sort((a, b) => dist[a.id] - dist[b.id])[0];
      if (!u || !Number.isFinite(dist[u.id])) break;
      visited.push(u.id);
      r.count("Visited nodes");
      r.emit({
        line: 3,
        type: "visit-node",
        visited,
        current: u.id,
        activeEdge: undefined,
        variables: { node: u.id, distance: dist[u.id] },
        explanation: `Finalize ${u.id} with shortest distance ${dist[u.id]}.`,
      });
      edges.forEach((e, index) => {
        const v = e.a === u.id ? e.b : e.b === u.id ? e.a : null;
        if (!v || visited.includes(v)) return;
        r.count("Edges examined");
        r.emit({
          line: 4,
          type: "examine-edge",
          activeEdge: index,
          explanation: `Examine ${u.id} → ${v}, weight ${e.weight}.`,
        });
        const candidate = dist[u.id] + e.weight;
        if (candidate < dist[v]) {
          const old = dist[v];
          dist[v] = candidate;
          prev[v] = u.id;
          r.count("Updates");
          r.emit({
            line: 6,
            type: "update-distance",
            distances: dist,
            predecessors: prev,
            variables: {
              node: v,
              previous: Number.isFinite(old) ? old : "∞",
              distance: candidate,
            },
            explanation: `Improve ${v}: ${Number.isFinite(old) ? old : "∞"} → ${candidate}, via ${u.id}.`,
          });
        }
      });
    }
    let cur = destination;
    const path: string[] = [];
    if (Number.isFinite(dist[cur])) {
      while (cur) {
        path.unshift(cur);
        const p = prev[cur];
        if (p)
          selected.push(
            edges.findIndex(
              (e) => (e.a === p && e.b === cur) || (e.b === p && e.a === cur),
            ),
          );
        cur = p;
      }
    }
    r.emit({
      line: 7,
      type: "finish",
      current: undefined,
      activeEdge: undefined,
      selectedEdges: selected,
      output: path,
      variables: {
        destination,
        distance: Number.isFinite(dist[destination])
          ? dist[destination]
          : "unreachable",
      },
      explanation: path.length
        ? `Shortest path: ${path.join(" → ")}. Total weight ${dist[destination]}.`
        : `${destination} is unreachable from ${start}.`,
    });
  } else if (kind === "prim") {
    visited.push(start);
    r.count("Visited nodes");
    r.emit({
      line: 2,
      type: "visit-node",
      visited,
      current: start,
      explanation: `Begin the tree at ${start}.`,
    });
    while (visited.length < nodes.length) {
      let best = -1;
      edges.forEach((e, i) => {
        if (visited.includes(e.a) === visited.includes(e.b)) return;
        r.count("Edges examined");
        r.emit({
          line: 3,
          type: "candidate",
          activeEdge: i,
          explanation: `Candidate edge ${e.a}–${e.b} has weight ${e.weight}.`,
        });
        if (best < 0 || e.weight < edges[best].weight) best = i;
      });
      if (best < 0)
        throw new Error(
          "Connect all graph nodes before running Prim's algorithm.",
        );
      const e = edges[best];
      visited.push(visited.includes(e.a) ? e.b : e.a);
      selected.push(best);
      weight += e.weight;
      r.count("Updates");
      r.count("Visited nodes");
      r.emit({
        line: 4,
        type: "select-edge",
        visited,
        selectedEdges: selected,
        activeEdge: best,
        variables: { "MST weight": weight, "Tree vertices": visited.length },
        explanation: `Select ${e.a}–${e.b}, the lightest edge leaving the tree.`,
      });
    }
    edges.forEach((_, i) => {
      if (!selected.includes(i)) rejected.push(i);
    });
    r.emit({
      line: 5,
      type: "finish",
      activeEdge: undefined,
      current: undefined,
      rejectedEdges: rejected,
      variables: { "MST weight": weight },
      explanation: `Minimum spanning tree complete: ${selected.length} edges, total weight ${weight}. Other edges are unnecessary.`,
    });
  } else {
    const parent: Record<string, string> = {};
    nodes.forEach((n) => (parent[n.id] = n.id));
    const find = (x: string): string => (parent[x] === x ? x : find(parent[x]));
    const order = edges
      .map((e, i) => ({ e, i }))
      .sort((a, b) => a.e.weight - b.e.weight);
    r.emit({
      line: 2,
      type: "sort-edges",
      output: order.map(({ e }) => `${e.a}–${e.b}: ${e.weight}`),
      variables: { components: nodes.length },
      explanation: "Sort all edges from lightest to heaviest.",
    });
    for (const { e, i } of order) {
      r.count("Edges examined");
      r.emit({
        line: 3,
        type: "examine-edge",
        activeEdge: i,
        variables: { "root u": find(e.a), "root v": find(e.b) },
        explanation: `Examine ${e.a}–${e.b} (${e.weight}) and compare component roots.`,
      });
      if (find(e.a) !== find(e.b)) {
        parent[find(e.a)] = find(e.b);
        selected.push(i);
        weight += e.weight;
        r.count("Updates");
        r.emit({
          line: 4,
          type: "select-edge",
          selectedEdges: selected,
          variables: {
            "MST weight": weight,
            components: nodes.length - selected.length,
            ...Object.fromEntries(nodes.map((n) => [n.id, find(n.id)])),
          },
          explanation:
            "The endpoints belong to different components. Join them.",
        });
      } else {
        rejected.push(i);
        r.emit({
          line: 5,
          type: "reject-edge",
          rejectedEdges: rejected,
          explanation:
            "Both endpoints are already connected. Reject this edge to avoid a cycle.",
        });
      }
    }
    if (selected.length !== nodes.length - 1)
      throw new Error("Connect all graph nodes to construct a spanning tree.");
    r.emit({
      line: 6,
      type: "finish",
      activeEdge: undefined,
      variables: { "MST weight": weight, components: 1 },
      explanation: `Minimum spanning tree complete: total weight ${weight}.`,
    });
  }
  return {
    steps: r.steps,
    code:
      kind === "dijkstra"
        ? [
            "dijkstra(graph, start)",
            "  distance[start] = 0; others = ∞",
            "  u = closest unvisited; mark visited",
            "  for each unvisited neighbor v of u",
            "    candidate = distance[u] + weight(u,v)",
            "    if smaller: update distance and predecessor",
            "  reconstruct destination path",
          ]
        : kind === "prim"
          ? [
              "prim(graph, start)",
              "  tree = {start}",
              "  inspect all edges crossing tree boundary",
              "  add lightest edge and its outside vertex",
              "  return minimum spanning tree",
            ]
          : [
              "kruskal(graph)",
              "  sort edges; make singleton components",
              "  for edge (u,v) in ascending order",
              "    if roots differ: union and select edge",
              "    else: reject cycle-forming edge",
              "  return minimum spanning tree",
            ],
    complexity:
      kind === "kruskal"
        ? {
            best: "O(E log E + EV)",
            average: "O(E log E + EV)",
            worst: "O(E log E + EV)",
            space: "O(V + E)",
          }
        : {
            best: "O(V² + VE)",
            average: "O(V² + VE)",
            worst: "O(V² + VE)",
            space: "O(V + E)",
          },
    assumption:
      kind === "dijkstra"
        ? "Undirected graph; non-negative weights. This teaching implementation scans vertices and the edge list."
        : kind === "prim"
          ? "Requires a connected, undirected graph. This version scans the entire edge list at every expansion (O(VE))."
          : "Requires a connected, undirected graph. This version uses simple union-find without rank or path compression; root lookup is O(V) worst case.",
  };
}
