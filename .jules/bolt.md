## 2025-02-28 - Vault-Web Search Debounce
**Learning:** Client-side fuzzy search operations (like fuse.js) can block the main thread and cause typing latency when executed on every keystroke.
**Action:** Always implement debouncing for search inputs that trigger client-side data processing, avoiding redundant operations while typing.

## 2026-06-19 - ReactMarkdown AST Rebuilding
**Learning:** Passing inline plugin arrays (e.g., `remarkPlugins={[...]}`) or dynamic component maps (e.g., `components={{...}}`) to `ReactMarkdown` causes it to tear down and rebuild the entire Markdown AST on every render, severely degrading performance for large files.
**Action:** Always define static plugin arrays outside the React component scope and memoize the `components` object using `useMemo` if it depends on dynamic props.
