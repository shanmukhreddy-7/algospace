import Link from "next/link";
export default function NotFound() {
  return (
    <main className="about-main">
      <div className="eyebrow">404 · MODULE NOT FOUND</div>
      <h1>This laboratory does not exist.</h1>
      <p>Choose one of the ten modules in the curriculum.</p>
      <Link className="button primary" href="/learn">
        Back to modules
      </Link>
    </main>
  );
}
