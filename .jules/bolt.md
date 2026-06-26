## 2025-02-28 - Vault-Web Search Debounce
**Learning:** Client-side fuzzy search operations (like fuse.js) can block the main thread and cause typing latency when executed on every keystroke.
**Action:** Always implement debouncing for search inputs that trigger client-side data processing, avoiding redundant operations while typing.

## 2026-06-26 - React Hooks in JSX Props
**Learning:** Calling useMemo() or other hooks directly inside a JSX prop (e.g., <Component prop={useMemo(...)} />) is an anti-pattern that violates the Rules of Hooks and can cause runtime errors if the component tree is ever conditionally rendered.
**Action:** Always define React hooks strictly at the top level of the component's functional body before the return statement.
