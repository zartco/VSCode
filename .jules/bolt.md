## 2025-02-28 - Vault-Web Search Debounce
**Learning:** Client-side fuzzy search operations (like fuse.js) can block the main thread and cause typing latency when executed on every keystroke.
**Action:** Always implement debouncing for search inputs that trigger client-side data processing, avoiding redundant operations while typing.

## 2025-02-28 - ReactMarkdown AST Rebuilds
**Learning:** Passing inline plugin arrays and component objects to ReactMarkdown causes unnecessary AST tear-down and rebuilds on every render, degrading performance.
**Action:** Always define plugin arrays statically outside the component and memoize the components object using useMemo.

## 2025-02-28 - O(N²) Array Filtering in Hooks
**Learning:** Repeatedly filtering large arrays (like vault files/nodes) inside iterative loops within useMemo causes O(N²) time complexity and blocks the main thread on large vaults.
**Action:** Always pre-group arrays by their relation key into a Map or Record object (O(N) operation) before iterating over them to enable O(1) lookups.
