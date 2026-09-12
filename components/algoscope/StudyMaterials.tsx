"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, FileText, FolderOpen } from "lucide-react";
import { Shell } from "./Shell";
import { modules } from "@/lib/algorithms/metadata";
import { slides } from "@/lib/study-materials";
const collections = [
  {
    name: "Slides & Notes",
    id: "1ua8bkDvAKnU9-UFs_9eUIoMDmYS8eIDi",
    icon: BookOpen,
    description:
      "Lecture slides, syllabus, and course notes. Select a PDF to open its Google Drive viewer.",
  },
  {
    name: "Previous Year Papers",
    id: "1x7UUdoO8DEGBm5CzfjS2tCglm4cFgh7H",
    icon: FileText,
    description:
      "Exam papers will appear here as they are uploaded. Check the folder for the latest additions.",
  },
];
export function StudyMaterials() {
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState("");
  const collection = collections[selected];
  return (
    <Shell>
      <main className="resources-page">
        <header className="resource-hero">
          <span className="eyebrow">THE STUDY LIBRARY</span>
          <h1>
            A little preparation.
            <br />
            <em>A deeper understanding.</em>
          </h1>
          <p>
            Your course slides, notes, and previous year papers, together in one
            place. Free to explore, whenever you need them.
          </p>
          <a
            className="resource-link"
            href="https://drive.google.com/drive/folders/12UdG7o_8p6BBhjF10oeM1g0fsRuukb6z"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FolderOpen size={18} /> Open complete library{" "}
            <ArrowUpRight size={16} />
          </a>
        </header>
        <section className="library-panel" aria-label="Study library">
          <div
            className="library-tabs"
            role="group"
            aria-label="Choose collection"
          >
            {collections.map((c, i) => (
              <button
                key={c.id}
                aria-pressed={selected === i}
                onClick={() => setSelected(i)}
              >
                <c.icon size={19} />
                {c.name}
              </button>
            ))}
          </div>
          <div className="library-heading">
            <div>
              <h2>{collection.name}</h2>
              <p>{collection.description}</p>
            </div>
            <a
              className="resource-link"
              href={`https://drive.google.com/drive/folders/${collection.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Drive <ArrowUpRight size={16} />
            </a>
          </div>
          {selected === 0 ? (
            <div className="slide-catalog">
              <label className="slide-search">
                Find a slide or syllabus
                <input
                  type="search"
                  placeholder="Search materials…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <div className="slide-grid">
                {slides
                  .filter((s) =>
                    s.title.toLowerCase().includes(query.toLowerCase().trim()),
                  )
                  .map((s) => (
                    <a
                      key={s.id}
                      href={`https://drive.google.com/file/d/${s.id}/view`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText size={24} />
                      <span>
                        <small>PDF · COURSE MATERIAL</small>
                        <strong>{s.title}</strong>
                      </span>
                      <ArrowUpRight size={17} />
                    </a>
                  ))}
              </div>
              {!slides.some((s) =>
                s.title.toLowerCase().includes(query.toLowerCase().trim()),
              ) && (
                <p className="search-empty">
                  No matching materials. Try another title or browse the full
                  Drive folder.
                </p>
              )}
            </div>
          ) : (
            <div className="papers-welcome">
              <FileText size={32} />
              <h3>Your exam preparation starts here.</h3>
              <p>
                Browse the live papers folder below. New papers become available
                as they are uploaded.
              </p>
            </div>
          )}
          <details
            className="live-folder"
            open={selected === 1}
            key={collection.id}
          >
            <summary>
              Browse live {collection.name.toLowerCase()} folder
            </summary>
            <iframe
              className="drive-library"
              title={`${collection.name} — public Google Drive folder`}
              src={`https://drive.google.com/embeddedfolderview?id=${collection.id}#list`}
              loading="lazy"
            />
          </details>
          <p className="library-note">
            Files are hosted on Google Drive. If the library does not load, use
            “Open in Drive” above. New uploads appear in these folders
            automatically.
          </p>
        </section>
        <section className="library-modules">
          <span className="eyebrow">PUT YOUR READING INTO PRACTICE</span>
          <h2>From the slides to the solution.</h2>
          <div className="practice-grid">
            {modules.map((m, i) => (
              <Link href={`/learn/${m.slug}`} key={m.slug}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <strong>{m.short}</strong>
                <ArrowUpRight size={17} />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </Shell>
  );
}
