import { build } from "esbuild";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
const file = join(tmpdir(), `algoscope-tests-${process.pid}.cjs`);
try {
  const result = await build({
    entryPoints: ["tests/algorithms.test.ts"],
    bundle: true,
    platform: "node",
    format: "cjs",
    write: false,
  });
  writeFileSync(file, result.outputFiles[0].contents);
  const run = spawnSync(process.execPath, ["--test", file], {
    stdio: "inherit",
  });
  process.exitCode = run.status ?? 1;
} finally {
  try {
    unlinkSync(file);
  } catch {}
}
