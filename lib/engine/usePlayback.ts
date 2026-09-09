"use client";
import { useCallback, useEffect, useState } from "react";
export function usePlayback(
  length: number,
  keyboard = true,
  beforeAdvance?: (index: number) => boolean,
) {
  const [index, setIndex] = useState(0),
    [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(1);
  const reset = useCallback(() => {
    setPlaying(false);
    setIndex(0);
  }, []);
  const next = useCallback(() => {
    setPlaying(false);
    if (beforeAdvance?.(index) === false) return;
    setIndex((i) => Math.min(length - 1, i + 1));
  }, [length, index, beforeAdvance]);
  const previous = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.max(0, i - 1));
  }, []);
  const toggle = useCallback(() => {
    if (index >= length - 1) setIndex(0);
    setPlaying((p) => !p);
  }, [index, length]);
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      if (index >= length - 1 || beforeAdvance?.(index) === false) {
        setPlaying(false);
        return;
      }
      setIndex(index + 1);
    }, 900 / speed);
    return () => clearTimeout(timer);
  }, [playing, speed, length, index, beforeAdvance]);
  useEffect(() => {
    if (!keyboard) return;
    const handler = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const t = e.target as HTMLElement;
      if (
        t.closest(
          'input,textarea,select,button,[role="button"],[role="combobox"],[role="slider"],[role="tab"],[contenteditable]',
        )
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        previous();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keyboard, toggle, next, previous]);
  return {
    index: Math.min(index, length - 1),
    setIndex,
    playing,
    setPlaying,
    speed,
    setSpeed,
    reset,
    next,
    previous,
    toggle,
  };
}
