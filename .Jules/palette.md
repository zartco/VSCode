## 2024-05-24 - Exposing Hidden Global Shortcuts
**Learning:** Global keyboard shortcuts (like `Ctrl+K` for search) are powerful but lack discoverability for new users or those navigating strictly via screen readers. Relying solely on a placeholder text in a component that is hidden by default makes the feature entirely invisible.
**Action:** Always pair global keyboard shortcuts with a persistently visible, accessible UI element (like a button) that both triggers the action and advertises the shortcut key, ensuring all users can discover and utilize the feature.

## 2026-06-27 - Search Palette Accessibility
**Learning:** Custom interactive modal components often lack standard dialog roles and keyboard focus states out-of-the-box, making them invisible to screen readers and difficult to navigate for keyboard users.
**Action:** Always ensure modals use `role="dialog"` with `aria-modal="true"` and interactive child elements have clear `focus:` visual indicators (like `focus:ring-2`).
