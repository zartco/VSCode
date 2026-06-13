# Project — WGU Precalculus

**Goal:** help an adult learner pass WGU Precalculus on a compressed timeline.

**Timeline:** ~7–8 week sprint. Started **Jun 12, 2026**; final-exam target **Aug 1, 2026** (standard pace is 12 weeks; we compressed the completion guide's 8-week plan).

**Schedule (8-week blocks):**
- Weeks 1–2 (Jun 12–25): Modules 1–4
- Weeks 3–4 (Jun 26–Jul 9): Modules 5–7 + **Midterm**
- Weeks 5–6 (Jul 10–21): Modules 8–10
- Weeks 7–8 (Jul 22–Aug 1): Modules 11–14 + **Final**

Assessment: 14 quizzes, 1 midterm, 1 final, 3 competency units.

**14 modules → primary OpenStax sections** (PC = Precalculus 2e, CA = College Algebra 2e; page = 1-based PDF page):
1. Algebraic Expressions — CA 1.2 p33, 1.3 p48, 1.4 p58, 1.5 p67
2. Solving Equations — CA 2.2 p106, 2.3 p122, 2.5 p141, 2.6 p155; ElemAlg Ch.2
3. Functions Pt 1 — PC 1.1 p17, 1.2 p43, 1.3 p64, 1.4 p80
4. Functions Pt 2 — PC 1.5 p96, 1.6 p127, 1.7 p140
5. Linear Functions — PC 2.1 p170, 2.2 p191, 2.3 p216, 2.4 p230; systems PC 9.1 p906, 9.2 p924
6. Quadratic Functions — PC 3.1 p255, 3.2 p265; CA 2.5 p141, 1.5 p67
7. Transformations — PC 1.5 p96
8. Exponential Functions — PC 4.1 p408, 4.2 p426
9. Logarithmic Functions — PC 4.3 p439, 4.4 p449, 4.5 p470, 4.6 p482
10. Sequences & Series — PC 11.1 p1099, 11.2 p1114, 11.3 p1125, 11.4 p1134
11. Preparing for Trigonometry — PC 5.1 p546 (degrees/radians, arc length, sector area)
12. Trigonometry — PC 5.2 p569, 5.3 p589, 5.4 p604; 6.3 p664; 7.1 p685; 7.5 p729
13. Graphing Trig Functions — PC 6.1 p625, 6.2 p644, 6.3 p664
14. Applications of Trigonometry — PC 8.1 (Law of Sines) p775, 8.2 (Law of Cosines) p792

**Built so far:**
- Obsidian vault (see `02`): M01 + M02 = full lessons; M03–M14 = outlines.
- HTML notebook `WGU_Precalculus_Notebook.html` = the polished compilation (currently holds Entry 1 = Solving Linear Equations).
- PDF exporter (`_export/export.py`).
- All 5 OpenStax PDFs + syllabus + completion guide.

**Pending:**
- Build M03–M14 full lessons, **one module at a time**, at M01 depth: explanation → OpenStax snapshot(s) → worked examples → sympy-verified practice → flashcards → wikilinked concept cards → further reading.
- Fold material into the HTML notebook ONLY when the student feeds live WGU course data and explicitly asks.

**Key paths:**
- Connected working folder: `C:\VSCode\Precalculus`
- Vault: `...\WGU Precalculus Vault`
- HTML notebook: `...\WGU_Precalculus_Notebook.html`
- OpenStax PDFs: vault `Textbooks\` (also in the working-folder root)
- Syllabus `Precalculus_syllabus_v3.pdf`; completion guide `Precalculus_guide_v2.pdf`

**Student diagnostic (Session 1):** solved two-step equations and integer arithmetic correctly; trig = starting from zero. Algebra mechanics are workable. **Biggest risk = trigonometry (Modules 11–14)** on a tight clock → weight depth there.
