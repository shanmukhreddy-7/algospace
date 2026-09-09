import Link from "next/link";
import { Shell } from "@/components/algoscope/Shell";
export default function About() {
  return (
    <Shell>
      <main className="about-main">
        <div className="eyebrow">DESIGN & ANALYSIS OF ALGORITHMS</div>
        <h1>Make the invisible work visible.</h1>
        <p className="about-lead">
          AlgoScope is an interactive learning laboratory for a university
          Design and Analysis of Algorithms project.
        </p>
        <section className="prose panel">
          <h2>Learn from the execution</h2>
          <p>
            Each algorithm executes on your input and records a sequence of
            immutable states. Playback restores those states, including
            variables, data structures, operation counts, and the highlighted
            pseudocode line. Stepping backward is a true state restoration.
          </p>
          <h3>Designed for experiments</h3>
          <p>
            Change an input, predict a step, and compare the result. The ten
            modules cover foundations, data structures, divide and conquer,
            greedy methods, graph algorithms, and dynamic programming.
          </p>
          <h3>Read the measurements carefully</h3>
          <p>
            Operation counters describe the implementation shown. Theoretical
            bounds describe growth with input size and are labeled with
            assumptions. Recorded history adds memory and processing overhead.
            Playback speed and browser timing are not algorithmic complexity
            measurements.
          </p>
          <h3>Your data stays in your browser</h3>
          <p>
            Algorithms run locally. No account is required. Theme preference and
            the last selected algorithm are saved on this device; your input is
            not uploaded to a backend.
          </p>
          <h3>Controls & accessibility</h3>
          <p>
            Use Space to play or pause and the arrow keys to step. All controls
            are keyboard accessible. Graph nodes can be moved with arrow keys
            when focused. State labels accompany color, and reduced-motion
            preferences are respected.
          </p>
          <Link className="button primary" href="/learn">
            Explore the curriculum →
          </Link>
        </section>
      </main>
    </Shell>
  );
}
