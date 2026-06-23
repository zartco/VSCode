## 2025-02-28 - Vault-Web Search Debounce
**Learning:** Client-side fuzzy search operations (like fuse.js) can block the main thread and cause typing latency when executed on every keystroke.
**Action:** Always implement debouncing for search inputs that trigger client-side data processing, avoiding redundant operations while typing.
## 2025-02-28 - Vault-Web ReactMarkdown Re-renders
**Learning:** Passing inline arrays (e.g., `[remarkGfm, remarkMath]`) or dynamically generated inline objects (`{ blockquote: renderBlockquote }`) directly to `ReactMarkdown` props forces it to needlessly teardown and rebuild the internal Markdown AST on every parent component render.
**Action:** When using `ReactMarkdown`, always define static plugin arrays (`remarkPlugins`, `rehypePlugins`) outside the component scope and use `useMemo` for dynamic `components` props.
