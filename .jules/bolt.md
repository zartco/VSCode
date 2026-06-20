## 2025-02-28 - Vault-Web Search Debounce
**Learning:** Client-side fuzzy search operations (like fuse.js) can block the main thread and cause typing latency when executed on every keystroke.
**Action:** Always implement debouncing for search inputs that trigger client-side data processing, avoiding redundant operations while typing.
## 2025-02-28 - Vault-Web ReactMarkdown Performance
**Learning:** Passing inline arrays or objects (like `remarkPlugins`, `components`) directly to `ReactMarkdown` causes unnecessary AST tear-downs and rebuilds on every render, severely degrading performance.
**Action:** Always define static plugin arrays outside the component scope and use `useMemo` for dynamic `components` props when using `ReactMarkdown`.
