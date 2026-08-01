import { useState } from "react";
import { Synthesize } from "./pages/Synthesize";
import { Voices } from "./pages/Voices";

type Page = "synthesize" | "voices";

export function App() {
  const [page, setPage] = useState<Page>("synthesize");

  return (
    <div className="app">
      <nav>
        <button
          className={page === "synthesize" ? "active" : ""}
          onClick={() => setPage("synthesize")}
        >
          Synthesize
        </button>
        <button
          className={page === "voices" ? "active" : ""}
          onClick={() => setPage("voices")}
        >
          Voices
        </button>
      </nav>

      <main>
        {page === "synthesize" && <Synthesize />}
        {page === "voices" && <Voices />}
      </main>
    </div>
  );
}
