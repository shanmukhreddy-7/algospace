"use client";
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { usePlayback } from "@/lib/engine/usePlayback";
export function Choice({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (s: string) => void;
  options: (string | { value: string; label: string })[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="choice">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((x) => {
          const v = typeof x === "string" ? x : x.value;
          return (
            <SelectItem key={v} value={v}>
              {typeof x === "string" ? x : x.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
export function PlaybackControls({
  p,
  total,
  onNext,
  onPlay,
  locked = false,
}: {
  p: ReturnType<typeof usePlayback>;
  total: number;
  onNext?: () => void;
  onPlay?: () => void;
  locked?: boolean;
}) {
  return (
    <div className="playback">
      <div className="playback-buttons">
        <button
          className="icon-button"
          title="Previous step (←)"
          aria-label="Previous step"
          disabled={p.index === 0}
          onClick={p.previous}
        >
          <SkipBack size={18} />
        </button>
        <button
          className="button primary"
          disabled={locked}
          onClick={onPlay ?? p.toggle}
        >
          {p.playing ? <Pause size={16} /> : <Play size={16} />}{" "}
          {p.playing ? "Pause" : "Play"}
        </button>
        <button
          className="icon-button"
          title="Next step (→)"
          aria-label="Next step"
          disabled={p.index === total - 1 || locked}
          onClick={onNext ?? p.next}
        >
          <SkipForward size={18} />
        </button>
        <span className="nav-divider" />
        <button
          className="icon-button"
          title="Restart"
          aria-label="Restart"
          onClick={p.reset}
        >
          <RotateCcw size={17} />
        </button>
      </div>
      <div className="step-scrubber">
        <Slider
          aria-label="Execution step"
          min={0}
          max={Math.max(1, total - 1)}
          value={[p.index]}
          onValueChange={([v]) => {
            p.setPlaying(false);
            p.setIndex(Math.min(v, total - 1));
          }}
        />
        <span className="mono">
          Step {p.index + 1} / {total}
        </span>
      </div>
      <div className="speed-control">
        <span>Speed</span>
        <Choice
          label="Playback speed"
          value={String(p.speed)}
          onChange={(v) => p.setSpeed(Number(v))}
          options={[0.5, 1, 1.5, 2].map((v) => ({
            value: String(v),
            label: v + "×",
          }))}
        />
      </div>
    </div>
  );
}
