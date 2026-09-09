import { Shell } from "@/components/algoscope/Shell";
import { ModuleList } from "@/components/algoscope/Home";
export default function Learn() {
  return (
    <Shell>
      <main className="home-main">
        <div className="page-heading">
          <div className="eyebrow">THE CURRICULUM · 10 MODULES</div>
          <h1>Build understanding, one step at a time.</h1>
          <p>
            Explore a concept, run your own input, and inspect the work behind
            the result.
          </p>
        </div>
        <ModuleList />
        <div className="prose">
          <p>
            New to algorithms? Begin with Algorithmic Thinking, then Data
            Structures and Sorting & Searching. Each laboratory stands on its
            own.
          </p>
        </div>
      </main>
    </Shell>
  );
}
