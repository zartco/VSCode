## 2025-02-28 - Vault-Web Search Debounce
**Learning:** Client-side fuzzy search operations (like fuse.js) can block the main thread and cause typing latency when executed on every keystroke.
**Action:** Always implement debouncing for search inputs that trigger client-side data processing, avoiding redundant operations while typing.

## 2025-02-28 - ReactMarkdown AST Rebuilds
**Learning:** Passing inline plugin arrays and component objects to ReactMarkdown causes unnecessary AST tear-down and rebuilds on every render, degrading performance.
**Action:** Always define plugin arrays statically outside the component and memoize the components object using useMemo.
