"use client";
import { useSyncExternalStore } from "react";
import { ArrowUpRight } from "lucide-react";
import { Logo, LogoScene } from "./Logo";
const key = "algospace-intro-v2";
let entered = false;
const subscribe = (notify: () => void) => {
  window.addEventListener("algospace-enter", notify);
  return () => window.removeEventListener("algospace-enter", notify);
};
const read = () => {
  try {
    return entered || sessionStorage.getItem(key) === "seen";
  } catch {
    return entered;
  }
};
export function Intro({ children }: { children: React.ReactNode }) {
  const seen = useSyncExternalStore(subscribe, read, () => false);
  if (seen) return children;
  return (
    <main className="space-intro">
      <div className="intro-brand">
        <Logo /> AlgoSpace<span className="mono">VISUAL ALGORITHM LAB</span>
      </div>
      <div className="intro-center">
        <LogoScene />
        <div className="eyebrow">A NEW WAY TO UNDERSTAND</div>
        <h1>
          Small steps.
          <br />
          <span>Infinite possibilities.</span>
        </h1>
        <p>Understand algorithms by watching them work.</p>
        <button
          className="button primary"
          onClick={() => {
            entered = true;
            try {
              sessionStorage.setItem(key, "seen");
            } catch {}
            window.dispatchEvent(new Event("algospace-enter"));
          }}
        >
          Enter AlgoSpace <ArrowUpRight size={18} />
        </button>
      </div>
      <div className="intro-bottom">
        <span>EXPLORE · EXECUTE · UNDERSTAND</span>
        <span>Designed for curious minds.</span>
      </div>
    </main>
  );
}
