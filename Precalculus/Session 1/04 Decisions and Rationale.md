# Decisions & Rationale

- **Backbone = hybrid (Obsidian vault + on-demand PDF export).** The vault is the editable source of truth; export polished artifacts when needed. Chosen because the user studies/reviews before tests, will reuse material in harder courses, and shares with peers — and wants sustainable, human-editable notes. The vault's wikilinks/graph realize the "connections between concepts" idea.
- **Export format = PDF** (not HTML), built with pandoc + xelatex (best math quality available in the sandbox). For handing to peers who won't open an HTML file.
- **Flashcards = yes** (Spaced Repetition) in addition to collapsible solutions — strongest retention lever for test prep.
- **Textbooks = inside the vault** (`Textbooks/`, all 5 PDFs) — the user's explicit choice despite the ~400 MB OneDrive-sync cost.
- **Depth weighting = weakest-first** (recommended): go deepest on trig (starting from zero) and factoring/quadratics. NOT yet locked — confirm when building the first new full module.
- **Assessment format / calculator policy = unknown** — the user hasn't confirmed. Ask when it matters (drives memorization-vs-technique in practice design).
- **Theme = contrast-aware** — added after the user flagged low-contrast navy headings on Obsidian's dark background.
- **Obsidian was already installed** (the user thought it wasn't). Their pre-existing vault "Vault" is at `C:\Users\Zartc`.
- **Plugins** were downloaded by the user but not enabled; activated via the Settings toggles (the user also helped toggle from their side).
- **One module at a time** — building all 14 full lessons at once is infeasible/low-quality; pace it.
