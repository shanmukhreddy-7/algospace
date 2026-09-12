import Link from "next/link";
import {
  GitBranch as Github,
  Mail,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import { Shell } from "@/components/algoscope/Shell";
export const metadata = {
  title: "Meet the Creator | AlgoScope",
  description:
    "Meet Shanmukh Reddy, creator of AlgoScope. Connect on GitHub or by email.",
};
export default function Creator() {
  return (
    <Shell>
      <main className="creator-page">
        <section className="creator-card">
          <div className="creator-art" aria-hidden="true">
            <span className="creator-art-label">
              THE PERSON BEHIND THE PROJECT
            </span>
            <div className="creator-monogram">
              SR<span>.</span>
            </div>
            <div className="creator-art-bottom">
              <span>THINK IN STEPS.</span>
              <span>BUILD WITH PURPOSE.</span>
            </div>
          </div>
          <div className="creator-copy">
            <span className="eyebrow">MEET THE CREATOR</span>
            <h1>
              Shanmukh
              <br />
              <em>Reddy.</em>
            </h1>
            <p className="creator-role">Creator of AlgoScope</p>
            <p>
              AlgoScope brings algorithms to life through interactive
              visualizations, hands-on experiments, and accessible study
              materials.
            </p>
            <p>
              Have a suggestion, spotted an issue, or want to connect? Get in
              touch.
            </p>
            <div className="creator-contacts">
              <a
                href="https://github.com/shanmukhreddy-7"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github size={21} />
                <span>
                  <small>GITHUB</small>shanmukhreddy-7
                </span>
                <ArrowUpRight size={18} />
              </a>
              <a href="mailto:shanmukhreddy2507@gmail.com">
                <Mail size={21} />
                <span>
                  <small>EMAIL</small>shanmukhreddy2507@gmail.com
                </span>
                <ArrowUpRight size={18} />
              </a>
            </div>
            <Link className="resource-link" href="/learn">
              Explore the laboratory <ArrowRight size={17} />
            </Link>
          </div>
        </section>
        <a
          className="creator-source"
          href="https://github.com/shanmukhreddy-7/algospace"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>CURIOUS HOW IT WORKS?</span> Explore the project on GitHub{" "}
          <ArrowUpRight size={18} />
        </a>
      </main>
    </Shell>
  );
}
