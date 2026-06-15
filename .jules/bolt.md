## 2025-02-28 - Vault-Web Search Debounce
**Learning:** Client-side fuzzy search operations (like fuse.js) can block the main thread and cause typing latency when executed on every keystroke.
**Action:** Always implement debouncing for search inputs that trigger client-side data processing, avoiding redundant operations while typing.

## 2023-10-25 - React.memo Optimization for Heavy Markdown Parsing
**Learning:** Using heavy parsers (like ReactMarkdown) inside deep component trees without memoization causes massive CPU spikes when unrelated parent states update.
**Action:** Always wrap `MarkdownReader` or similar parser components in `React.memo` to prevent re-renders when parent properties (like navigation state) change.
