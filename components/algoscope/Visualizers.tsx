"use client";
import { useRef, useState } from "react";
import type { Snapshot, TreeNode, Vertex } from "@/lib/engine/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
export function ArrayVisualizer({ s }: { s: Snapshot }) {
  const a = s.array ?? [],
    max = Math.max(1, ...a.map(Math.abs));
  const unique = s.ids && new Set(s.ids).size === a.length;
  return (
    <div className="array-stage">
      <div className="array-top-note">
        <span className="eyebrow">
          {s.type === "finish" ? "Execution complete" : "ARRAY STATE"}
        </span>
        <span className="mono">
          {s.range ? `range [${s.range.join(", ")}]` : `n = ${a.length}`}
        </span>
      </div>
      <div className="array-bars">
        {a.length === 0 ? (
          <p className="empty-state">The structure is empty.</p>
        ) : (
          a.map((v, i) => (
            <div
              key={unique ? s.ids![i] : i}
              className={
                "array-bar " +
                (s.done?.includes(i)
                  ? "is-done"
                  : s.active?.includes(i)
                    ? "is-active"
                    : "") +
                (s.pivot === i ? " is-pivot" : "") +
                (s.range && (i < s.range[0] || i > s.range[1]) ? " is-out" : "")
              }
              style={{
                height: (Math.abs(v) / max) * 145 + 38,
                width: `${84 / a.length}%`,
                left: `${(i * 100) / a.length}%`,
              }}
            >
              <b>{v}</b>
              <span className="array-index">{i}</span>
              {s.pivot === i && <span className="pivot-label">P</span>}
            </div>
          ))
        )}
      </div>
      <div className="legend">
        <span>□ Neutral</span>
        <span className="text-amber">▣ Active / comparison</span>
        <span className="text-green">✓ Complete</span>
        <span>P Pivot</span>
      </div>
    </div>
  );
}
function treeLayout(root: TreeNode) {
  const nodes: (Vertex & { parent?: string; side?: string })[] = [];
  let order = 0;
  function walk(n: TreeNode, depth: number, parent?: string, side?: string) {
    if (n.left) walk(n.left, depth + 1, n.id, "0");
    nodes.push({
      id: n.id,
      label: n.label,
      x: ++order,
      y: depth,
      parent,
      side,
    });
    if (n.right) walk(n.right, depth + 1, n.id, "1");
  }
  walk(root, 0);
  const depth = Math.max(...nodes.map((n) => n.y));
  const width = Math.max(620, nodes.length * 32);
  return {
    nodes: nodes.map((n) => ({
      ...n,
      x: 35 + (n.x / (nodes.length + 1)) * (width - 70),
      y: 40 + n.y * 65,
    })),
    height: Math.max(240, (depth + 1) * 65 + 30),
    width,
  };
}
export function TreeVisualizer({
  root,
  current,
  showBits = false,
}: {
  root?: TreeNode;
  current?: string;
  showBits?: boolean;
}) {
  if (!root)
    return (
      <div className="empty-state">The tree is empty. Add values to begin.</div>
    );
  const { nodes, height, width } = treeLayout(root);
  return (
    <div className="tree-scroll">
      <svg
        className="tree-svg"
        viewBox={`0 0 ${width} ${height}`}
        style={width > 620 ? { minWidth: width } : undefined}
        role="img"
        aria-label="Algorithm tree"
      >
        <title>
          {nodes
            .map((n) => `${n.label}${n.parent ? " child of " + n.parent : ""}`)
            .join("; ")}
        </title>
        {nodes
          .filter((n) => n.parent)
          .map((n) => {
            const p = nodes.find((p) => p.id === n.parent)!;
            return (
              <g key={"edge" + n.id}>
                <line
                  x1={n.x}
                  y1={n.y}
                  x2={p.x}
                  y2={p.y}
                  className="tree-edge"
                />
                {showBits && (
                  <text
                    x={(n.x + p.x) / 2 + 8}
                    y={(n.y + p.y) / 2}
                    className="edge-label"
                  >
                    {n.side}
                  </text>
                )}
              </g>
            );
          })}
        {nodes.map((n) => (
          <g
            key={n.id}
            style={{ transform: `translate(${n.x}px,${n.y}px)` }}
            className={"tree-node " + (current === n.id ? "node-active" : "")}
          >
            <circle r={n.label!.length > 5 ? 27 : 22} />
            <text textAnchor="middle" dominantBaseline="central">
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
export function GraphVisualizer({
  s,
  onMove,
  onNode,
  onEdge,
  selectedNode,
}: {
  s: Snapshot;
  onMove?: (id: string, x: number, y: number) => void;
  onNode?: (id: string) => void;
  onEdge?: (i: number) => void;
  selectedNode?: string;
}) {
  const svg = useRef<SVGSVGElement>(null),
    [drag, setDrag] = useState<string | null>(null);
  return (
    <svg
      ref={svg}
      className={"graph-svg " + (onMove ? "editable" : "")}
      viewBox="0 0 620 340"
      role="img"
      aria-label="Weighted undirected graph"
      onPointerMove={(e) => {
        if (!drag || !onMove || !svg.current) return;
        const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(
          svg.current.getScreenCTM()!.inverse(),
        );
        onMove(
          drag,
          Math.max(25, Math.min(595, point.x)),
          Math.max(25, Math.min(315, point.y)),
        );
      }}
      onPointerUp={() => setDrag(null)}
      onPointerCancel={() => setDrag(null)}
    >
      <title>
        {s.nodes?.length
          ? `${s.nodes.length} vertices and ${s.edges?.length ?? 0} edges. ${s.explanation}`
          : "No graph yet. Add a node or generate an example."}
      </title>
      {s.edges?.map((edge, i) => {
        const a = s.nodes?.find((n) => n.id === edge.a),
          b = s.nodes?.find((n) => n.id === edge.b);
        if (!a || !b) return null;
        return (
          <g
            key={`${edge.a}-${edge.b}`}
            className={
              "graph-edge " +
              (s.selectedEdges?.includes(i)
                ? "edge-selected"
                : s.rejectedEdges?.includes(i)
                  ? "edge-rejected"
                  : s.activeEdge === i
                    ? "edge-active"
                    : "")
            }
            onClick={() => onEdge?.(i)}
            role={onEdge ? "button" : undefined}
            tabIndex={onEdge ? 0 : undefined}
            aria-label={`Edge ${edge.a} to ${edge.b}, weight ${edge.weight}`}
            onKeyDown={(e) => {
              if (e.key === "Enter") onEdge?.(i);
            }}
          >
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            <circle cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2} r={12} />
            <text
              x={(a.x + b.x) / 2}
              y={(a.y + b.y) / 2}
              dominantBaseline="central"
              textAnchor="middle"
            >
              {edge.weight}
            </text>
          </g>
        );
      })}
      {s.nodes?.map((n) => (
        <g
          key={n.id}
          className={
            "graph-node " +
            (s.current === n.id || selectedNode === n.id
              ? "node-active"
              : s.visited?.includes(n.id)
                ? "node-visited"
                : "")
          }
          style={{ transform: `translate(${n.x}px,${n.y}px)` }}
          tabIndex={onNode ? 0 : undefined}
          role={onNode ? "button" : undefined}
          aria-label={`Node ${n.id}. ${onMove ? "Drag to move; click to select." : ""}`}
          onPointerDown={(e) => {
            if (onMove) {
              setDrag(n.id);
              e.currentTarget.setPointerCapture(e.pointerId);
            }
          }}
          onClick={() => onNode?.(n.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onNode?.(n.id);
            if (onMove && e.key.startsWith("Arrow")) {
              e.preventDefault();
              onMove(
                n.id,
                Math.max(
                  25,
                  Math.min(
                    595,
                    n.x +
                      (e.key === "ArrowRight"
                        ? 10
                        : e.key === "ArrowLeft"
                          ? -10
                          : 0),
                  ),
                ),
                Math.max(
                  25,
                  Math.min(
                    315,
                    n.y +
                      (e.key === "ArrowDown"
                        ? 10
                        : e.key === "ArrowUp"
                          ? -10
                          : 0),
                  ),
                ),
              );
            }
          }}
        >
          <circle r="22" />
          <text textAnchor="middle" dominantBaseline="central">
            {n.id}
          </text>
          {s.visited?.includes(n.id) && (
            <text className="node-check" x="22" y="-17">
              ✓
            </text>
          )}
        </g>
      ))}
      {!s.nodes?.length && (
        <text x="310" y="170" textAnchor="middle" fill="currentColor">
          No graph yet. Add a node or generate an example.
        </text>
      )}
    </svg>
  );
}
export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((h, i) => (
            <TableHead key={i}>{h}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            {row.map((v, j) => (
              <TableCell key={j}>
                {Number.isFinite(v) || typeof v === "string" ? v : "∞"}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
export function Visualizer({ s, kind }: { s: Snapshot; kind: string }) {
  return (
    <div className="visualizer-content">
      {s.buckets ? (
        <div className="buckets">
          {s.buckets.map((bucket, i) => (
            <div
              className={
                "bucket " + (s.active?.includes(i) ? "bucket-active" : "")
              }
              key={i}
            >
              <span className="mono">{i}</span>
              <div>
                {bucket.length ? (
                  bucket.map((v, j) => (
                    <span className="bucket-value" key={j}>
                      {v}
                      {j < bucket.length - 1 ? " →" : ""}
                    </span>
                  ))
                ) : (
                  <span className="muted">empty</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : s.nodes ? (
        <>
          <GraphVisualizer s={s} />
          {s.distances && (
            <DataTable
              headers={["Vertex", "Distance", "Predecessor"]}
              rows={Object.entries(s.distances).map(([n, d]) => [
                n,
                d,
                s.predecessors?.[n] ?? "—",
              ])}
            />
          )}
          <div className="legend">
            <span className="text-amber">▣ Examining</span>
            <span className="text-green">✓ Selected / visited</span>
            <span>┄ Rejected edge</span>
          </div>
        </>
      ) : s.table ? (
        <div className="dp-scroll">
          <Table className="dp-table">
            <TableHeader>
              <TableRow>
                <TableHead>i / C</TableHead>
                {s.table[0].map((_, c) => (
                  <TableHead key={c}>{c}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {s.table.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{i === 0 ? "∅" : s.items?.[i - 1].name}</TableCell>
                  {row.map((v, c) => (
                    <TableCell
                      key={c}
                      className={
                        s.cell?.[0] === i && s.cell?.[1] === c
                          ? "cell-active"
                          : s.sources?.some(([a, b]) => a === i && b === c)
                            ? "cell-source"
                            : ""
                      }
                    >
                      {v}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="legend">
            <span className="text-amber">▣ Current cell</span>
            <span className="text-green">▣ Previous states</span>
          </div>
        </div>
      ) : s.items ? (
        <div className="capacity-view">
          <h3>Capacity allocation</h3>
          <div className="capacity-track">
            {s.items.map((item, i) => (
              <div
                key={i}
                style={{
                  width: `${(((s.fractions?.[i] ?? 0) * item.weight) / Math.max(1, Number(s.variables.capacity))) * 100}%`,
                }}
                title={item.name}
              >
                {(s.fractions?.[i] ?? 0) > 0 ? item.name : ""}
              </div>
            ))}
          </div>
          <div className="item-tiles">
            {s.items.map((item, i) => (
              <div
                key={i}
                className={(s.fractions?.[i] ?? 0) > 0 ? "item-selected" : ""}
              >
                <b>{item.name}</b>
                <span>
                  {item.weight} weight · {item.value} value
                </span>
                <span className="mono">
                  ratio {(item.value / item.weight).toFixed(2)}
                </span>
                <strong>
                  {((s.fractions?.[i] ?? 0) * 100).toFixed(1)}% selected
                </strong>
              </div>
            ))}
          </div>
        </div>
      ) : s.stack ? (
        <div className="recursion-view">
          <div>
            <div className="eyebrow">CALL STACK · {s.stack.length} frames</div>
            <div className="stack-frames">
              {[...s.stack].reverse().map((frame, i) => (
                <div key={frame} className={i === 0 ? "frame-active" : ""}>
                  {frame}
                </div>
              ))}
              {!s.stack.length && <p>Stack is empty.</p>}
            </div>
          </div>
          <TreeVisualizer root={s.tree} current={s.current} />
        </div>
      ) : s.forest ? (
        <div className="forest">
          <div className="eyebrow">
            PRIORITY QUEUE · {s.forest.length} trees
          </div>
          <div>
            {s.forest.map((root) => (
              <div key={root.id}>
                <TreeVisualizer root={root} current={s.current} showBits />
              </div>
            ))}
          </div>
        </div>
      ) : s.tree ? (
        <TreeVisualizer
          root={s.tree}
          current={s.current}
          showBits={kind === "huffman"}
        />
      ) : s.array ? (
        <>
          <ArrayVisualizer s={s} />
          {s.mergeLeft && (
            <div className="merge-buffers">
              <div>
                <span className="eyebrow">LEFT BUFFER · HEAD FIRST</span>
                <p className="mono">{s.mergeLeft.join(" · ") || "empty"}</p>
              </div>
              <div>
                <span className="eyebrow">RIGHT BUFFER · HEAD FIRST</span>
                <p className="mono">{s.mergeRight?.join(" · ") || "empty"}</p>
              </div>
            </div>
          )}
          {s.decomposition && (
            <details className="decomposition" open>
              <summary>
                Recursive decomposition{" "}
                <span>index ranges · divide → conquer → combine</span>
              </summary>
              <TreeVisualizer
                root={s.decomposition}
                current={s.decompositionCurrent}
              />
            </details>
          )}
        </>
      ) : (
        <div className="empty-state">
          <h3>Ready to begin</h3>
          <p>Step forward to see the first operation.</p>
        </div>
      )}
      {s.frequencies && (
        <DataTable
          headers={["Character", "Frequency", "Code"]}
          rows={Object.entries(s.frequencies).map(([c, f]) => [
            c === " " ? "␣ (space)" : c,
            f,
            s.codes?.[c] ?? "—",
          ])}
        />
      )}{" "}
      {!!s.output?.length && (
        <div className="trace-output">
          <span className="eyebrow">
            {kind === "huffman" && s.type === "finish"
              ? "ENCODED PAYLOAD"
              : "OUTPUT / ORDER"}
          </span>
          <div className="mono">{s.output.join(" → ")}</div>
        </div>
      )}
    </div>
  );
}
