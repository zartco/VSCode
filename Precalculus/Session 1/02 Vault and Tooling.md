# Vault & Tooling

**Vault:** `C:\VSCode\Precalculus\WGU Precalculus Vault` (open in Obsidian; the user's other vault "Vault" at `C:\Users\Zartc` is separate and unrelated).

**Structure:**
- `Modules/` — M01–M14. **M01 Algebraic Expressions** + **M02 Solving Equations** = full lessons; M03–M14 = outlines (objectives, OpenStax readings, subtopics, links). M03/M04 named "M03 Functions Part 1" / "M04 Functions Part 2".
- `Concepts/` — atomic wikilinked cards: Properties of Equality, Distributive Property, Like Terms, Exponent Rules, Rational Exponents, Radicals and Principal Roots, Polynomials, Factoring.
- `Cheat-Sheets/` — per-module references (M01 Reference).
- `Textbooks/` — all 5 OpenStax PDFs.
- `Diagrams/` — Excalidraw home (About Diagrams).
- `Attachments/` — snapshots: final_def.png, final_principles.png, final_strategy.png, m01_principal_roots.png.
- `Exports/` — generated PDFs.
- `_export/export.py` — the exporter.
- `_templates/Module Template.md`.
- Home notes: `00 Dashboard`, `00 Study Plan`, `00 Formula Cheat-Sheet`, `Error Log`, `Resources`, `Start Here`.
- `.obsidian/` — config + `snippets/wgu-theme.css`.

**Plugins enabled** (`.obsidian/community-plugins.json`): `dataview`, `obsidian-tasks-plugin`, `obsidian-spaced-repetition`, `obsidian-excalidraw-plugin`. Restricted mode off. NOTE: enabling requires the Settings toggle (editing the JSON alone did not activate them).

**Theme** (`.obsidian/snippets/wgu-theme.css`) — contrast-aware: deep navy headings on light (#13294b / accent #0b1533), bright blue on dark (text #9cc2f5 / accent #5e8fd6). Covers reading view (`.markdown-rendered`) and live preview (`.cm-header`). Callout tints for goal/warning/question.

**Module frontmatter schema:**
```
module: <n>
title: <name>
block: "Weeks X-Y"
dates: "Mon DD-DD"
status: planned | in-progress | drafted | done
confidence: unrated | red | amber | green
openstax: "<refs>"
tags: [precalc, m<n>, ...]
```
Concept cards use `type: concept`, `confidence`, `tags: [concept]`.

**Dashboard** (`00 Dashboard`) uses **Dataview**: a "Needs review" table (confidence red/amber), an "All modules" table, and a **Tasks** "Due soon" query. **Study Plan** uses Tasks checkboxes with `📅 YYYY-MM-DD` due dates.

**Flashcards (Spaced Repetition):** single-line `Question::Answer` under a deck tag `#flashcards/precalc/m<NN>` in a `## Flashcards` section at the END of a module note. M01 = 8 cards, M02 = 5 (13 total). The exporter strips this section from PDFs.

**PDF exporter — `_export/export.py`** (pandoc + xelatex):
- Run: `python3 "_export/export.py" "Modules/M01 Algebraic Expressions.md"` → `Exports/<name>.pdf`.
- It strips frontmatter + leading H1 + the Flashcards section; converts `![[img]]`→embedded image, `[[A|B]]`/`[[A]]`→bold text, `> [!type]` callouts→bold-headed blockquotes; maps unicode→LaTeX (→, ✓, ·, etc.) and strips emoji; applies a WGU-navy header via xcolor/sectsty/fancyhdr.
- Sandbox capabilities confirmed: **pandoc, xelatex, soffice, PyMuPDF (`fitz`), sympy** present; **no chromium/weasyprint/wkhtmltopdf**.

**Snapshotting OpenStax** (for new lessons): use PyMuPDF. `pip install pymupdf --break-system-packages`. Page index = TOC page − 1. Text extraction DROPS the math (it's drawn), so render page regions to PNG: `page.get_pixmap(matrix=fitz.Matrix(2.2,2.2), clip=fitz.Rect(x0,y0,x1,y1))`. Locate boxes with `page.search_for("...")`. Always sympy-verify practice answers before shipping.

**HTML notebook** (`WGU_Precalculus_Notebook.html`): standalone WGU-portal theme (navy owl header, slate bg, white card, collapsible sidebar progress tracker, MathJax, base64-embedded snapshots). The polished compilation — update only on explicit request with live course data.
