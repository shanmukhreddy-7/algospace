"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun, Activity, ArrowUpRight } from "lucide-react";
let fallbackDark = false;
const readTheme = () => {
  try {
    return localStorage.getItem("algoscope-theme") === "dark";
  } catch {
    return fallbackDark;
  }
};
const subscribeTheme = (notify: () => void) => {
  window.addEventListener("storage", notify);
  window.addEventListener("algoscope-theme-change", notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener("algoscope-theme-change", notify);
  };
};
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const dark = useSyncExternalStore(subscribeTheme, readTheme, () => false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <>
      <header className="topbar">
        <Link className="wordmark" href="/">
          <span className="brand-icon">
            <Activity size={21} />
          </span>
          AlgoScope<span className="brand-dot">.</span>
        </Link>
        <nav aria-label="Main navigation">
          {[
            ["/learn", "Learn"],
            ["/playground", "Playground"],
            ["/compare", "Compare"],
          ].map(([href, label]) => (
            <Link
              key={href}
              className={path.startsWith(href) ? "nav-active" : ""}
              href={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-end">
          <button
            className="icon-button"
            aria-label="Toggle dark theme"
            onClick={() => {
              fallbackDark = !dark;
              try {
                localStorage.setItem(
                  "algoscope-theme",
                  !dark ? "dark" : "light",
                );
              } catch {
                /* Device storage is optional. */
              }
              window.dispatchEvent(new Event("algoscope-theme-change"));
            }}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <span className="nav-divider" />
          <Link href="/about">
            About <ArrowUpRight size={14} />
          </Link>
        </div>
      </header>
      {children}
      <footer>
        <span className="wordmark small">
          AlgoScope<span className="brand-dot">.</span>
        </span>
        <span>A laboratory for algorithmic thinking.</span>
        <span>Design & Analysis of Algorithms</span>
      </footer>
    </>
  );
}
