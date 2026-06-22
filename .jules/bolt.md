## 2025-02-28 - Vault-Web Search Debounce
**Learning:** Client-side fuzzy search operations (like fuse.js) can block the main thread and cause typing latency when executed on every keystroke.
**Action:** Always implement debouncing for search inputs that trigger client-side data processing, avoiding redundant operations while typing.

## 2025-02-28 - ReactMarkdown Re-render Optimization
**Learning:** Passing inline objects/arrays (like `components`, `remarkPlugins`, `rehypePlugins`) to `ReactMarkdown` causes it to needlessly rebuild the Markdown AST on every single render, severely degrading performance for large markdown files.
**Action:** Always define static plugin arrays outside the component scope and use `useMemo` for dynamic `components` props in `ReactMarkdown`.
