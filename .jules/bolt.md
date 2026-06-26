## 2025-02-28 - Vault-Web Search Debounce
**Learning:** Client-side fuzzy search operations (like fuse.js) can block the main thread and cause typing latency when executed on every keystroke.
**Action:** Always implement debouncing for search inputs that trigger client-side data processing, avoiding redundant operations while typing.

## 2025-06-21 - ReactMarkdown Rendering Performance
**Learning:** Passing inline arrays or dynamic component objects directly to ReactMarkdown causes it to unnecessarily tear down and rebuild the Markdown AST on every render, severely degrading performance for large files.
**Action:** Always define static plugin arrays (e.g., remarkPlugins, rehypePlugins) outside the component scope and use useMemo for dynamic components props when using ReactMarkdown.
