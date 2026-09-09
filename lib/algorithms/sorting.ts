import { recorder, type Trace, type TreeNode } from "../engine/types";
export function sortTrace(input: number[], kind: string): Trace {
  const a = [...input],
    ids = a.map((_, i) => i);
  const decomposition: TreeNode = {
    id: `0:${a.length - 1}`,
    label: `0–${a.length - 1}`,
  };
  const r = recorder({
    array: a,
    ids,
    active: [],
    done: [],
    decomposition: kind === "merge" ? decomposition : undefined,
    counts: { Comparisons: 0, Swaps: 0, Writes: 0, "Recursive calls": 0 },
  });
  const emit = (
    type: string,
    line: number,
    explanation: string,
    active: number[] = [],
    variables: Record<string, string | number> = {},
    extra: object = {},
  ) =>
    r.emit({
      type,
      line,
      explanation,
      active,
      variables,
      array: a,
      ids,
      ...extra,
    });
  emit("ready", 1, "The original array is ready.");
  function merge(lo: number, hi: number, branch: TreeNode) {
    r.count("Recursive calls");
    emit(
      "divide",
      2,
      `Consider indices ${lo} through ${hi}.`,
      [],
      { low: lo, high: hi },
      {
        range: [lo, hi],
        decomposition,
        decompositionCurrent: branch.id,
        mergeLeft: undefined,
        mergeRight: undefined,
      },
    );
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    branch.left = {
      id: `${lo}:${mid}`,
      label: lo === mid ? String(lo) : `${lo}–${mid}`,
    };
    branch.right = {
      id: `${mid + 1}:${hi}`,
      label: mid + 1 === hi ? String(hi) : `${mid + 1}–${hi}`,
    };
    emit(
      "divide",
      3,
      `Divide at index ${mid}: solve each half independently.`,
      [mid],
      { low: lo, mid, high: hi },
      { decomposition },
    );
    merge(lo, mid, branch.left);
    merge(mid + 1, hi, branch.right);
    const left = a.slice(lo, mid + 1),
      right = a.slice(mid + 1, hi + 1),
      li = ids.slice(lo, mid + 1),
      ri = ids.slice(mid + 1, hi + 1);
    let i = 0,
      j = 0,
      k = lo;
    while (i < left.length || j < right.length) {
      let takeLeft;
      if (i < left.length && j < right.length) {
        r.count("Comparisons");
        emit(
          "compare",
          6,
          `Compare ${left[i]} and ${right[j]}; take the smaller value.`,
          [lo + i, mid + 1 + j],
          { i, j, write: k },
          {
            range: [lo, hi],
            mergeLeft: left.slice(i),
            mergeRight: right.slice(j),
            decompositionCurrent: branch.id,
          },
        );
        takeLeft = left[i] <= right[j];
      } else takeLeft = i < left.length;
      a[k] = takeLeft ? left[i] : right[j];
      ids[k] = takeLeft ? li[i++] : ri[j++];
      r.count("Writes");
      emit(
        "write",
        7,
        `Write ${a[k]} into index ${k}.`,
        [k],
        {
          i,
          j,
          write: k,
        },
        { mergeLeft: left.slice(i), mergeRight: right.slice(j) },
      );
      k++;
    }
    emit(
      "merge",
      8,
      `Indices ${lo}–${hi} are now merged in order.`,
      [],
      { low: lo, high: hi },
      {
        range: [lo, hi],
        decompositionCurrent: branch.id,
        mergeLeft: undefined,
        mergeRight: undefined,
      },
    );
  }
  function quick(lo: number, hi: number) {
    r.count("Recursive calls");
    emit(
      "partition",
      2,
      `Consider partition [${lo}, ${hi}].`,
      [],
      { low: lo, high: hi },
      { range: [lo, hi] },
    );
    if (lo >= hi) return;
    const pivot = a[hi];
    let i = lo;
    emit(
      "pivot",
      3,
      `Choose ${pivot}, the last value, as pivot.`,
      [hi],
      { pivot, low: lo, high: hi, i },
      { pivot: hi },
    );
    for (let j = lo; j < hi; j++) {
      r.count("Comparisons");
      emit(
        "compare",
        5,
        `Compare ${a[j]} with pivot ${pivot}.`,
        [j, hi],
        { i, j, pivot },
        { pivot: hi, range: [lo, hi] },
      );
      if (a[j] < pivot) {
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          [ids[i], ids[j]] = [ids[j], ids[i]];
          r.count("Swaps");
          r.count("Writes");
          r.count("Writes");
        }
        emit("swap", 6, `Place ${a[i]} in the smaller partition.`, [i, j], {
          i,
          j,
          pivot,
        });
        i++;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    [ids[i], ids[hi]] = [ids[hi], ids[i]];
    if (i !== hi) {
      r.count("Swaps");
      r.count("Writes");
      r.count("Writes");
    }
    emit(
      "swap",
      7,
      `Pivot ${pivot} reaches its final position at ${i}.`,
      [i],
      { pivot, partition: i },
      { pivot: i },
    );
    quick(lo, i - 1);
    quick(i + 1, hi);
  }
  if (kind === "quick") quick(0, a.length - 1);
  else merge(0, a.length - 1, decomposition);
  emit(
    "finish",
    kind === "quick" ? 10 : 9,
    "Every value is now in ascending order.",
    [],
    { length: a.length },
    { done: a.map((_, i) => i), pivot: undefined, range: undefined },
  );
  return {
    steps: r.steps,
    code:
      kind === "quick"
        ? [
            "quickSort(a, low, high)",
            "  if low >= high: return",
            "  pivot = a[high]; i = low",
            "  for j = low to high - 1",
            "    if a[j] < pivot",
            "      swap(a[i++], a[j])",
            "  swap(a[i], a[high])",
            "  quickSort(a, low, i - 1)",
            "  quickSort(a, i + 1, high)",
            "  return a",
          ]
        : [
            "mergeSort(a, low, high)",
            "  if low >= high: return",
            "  mid = floor((low + high) / 2)",
            "  mergeSort(a, low, mid)",
            "  mergeSort(a, mid + 1, high)",
            "  compare heads of sorted halves",
            "  write smaller head; advance pointer",
            "  drain remaining values into a",
            "  return a",
          ],
    complexity:
      kind === "quick"
        ? {
            best: "Θ(n log n)",
            average: "Θ(n log n)",
            worst: "Θ(n²)",
            space: "O(n) worst stack",
          }
        : {
            best: "Θ(n log n)",
            average: "Θ(n log n)",
            worst: "Θ(n log n)",
            space: "O(n)",
          },
    assumption:
      kind === "quick"
        ? "Last-element pivot; in-place partitioning. Equal values may change order."
        : "Stable merging: ties select the left value first. Temporary halves use linear extra space.",
  };
}
export function searchTrace(
  a: number[],
  target: number,
  binary: boolean,
): Trace {
  const r = recorder({
    array: a,
    active: [],
    done: [],
    counts: { Comparisons: 0 },
  });
  r.emit({
    variables: { target },
    explanation: binary
      ? "The input must be sorted in ascending order."
      : "Inspect the array from left to right.",
  });
  let low = 0,
    high = a.length - 1,
    found = -1;
  while (low <= high) {
    const mid = binary ? Math.floor((low + high) / 2) : low;
    r.count("Comparisons");
    r.emit({
      type: "compare",
      line: 3,
      active: [mid],
      range: binary ? [low, high] : undefined,
      variables: { low, mid, high, target },
      explanation: `Compare ${a[mid]} at index ${mid} with target ${target}.`,
    });
    if (a[mid] === target) {
      found = mid;
      break;
    }
    if (binary && a[mid] > target) high = mid - 1;
    else low = mid + 1;
    r.emit({
      type: "eliminate",
      line: 5,
      range: binary ? [low, high] : undefined,
      variables: { low, mid, high, target },
      explanation: binary
        ? "Discard the half that cannot contain the target."
        : "Advance to the next index.",
    });
  }
  r.emit({
    type: "finish",
    line: 6,
    active: [],
    done: found >= 0 ? [found] : [],
    variables: { target, result: found },
    explanation:
      found >= 0
        ? `Found ${target} at index ${found}.`
        : `${target} does not occur in this array.`,
  });
  return {
    steps: r.steps,
    code: [
      "search(a, target)",
      "  while search range is not empty",
      "    inspect " + (binary ? "middle" : "next") + " value",
      "    if value == target: return index",
      "    narrow the search range",
      "  return result or -1",
    ],
    complexity: {
      best: "Θ(1)",
      average: binary ? "Θ(log n)" : "Θ(n)",
      worst: binary ? "Θ(log n)" : "Θ(n)",
      space: "Θ(1)",
    },
    assumption: binary
      ? "Requires ascending sorted input. Returns a matching index, not necessarily the first duplicate."
      : "Works on unsorted input. Returns the first matching index.",
  };
}
