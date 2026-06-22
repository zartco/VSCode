# Palette's UX Learning Journal

## 2024-06-22 - Search Palette Discoverability
**Learning:** The SearchPalette component implemented a global shortcut (Ctrl+K) but lacked a visible UI trigger in the main application layout (`VaultApp.tsx`). This violates the accessibility and UX principle of discoverability, as users wouldn't know the feature existed without guessing the shortcut.
**Action:** Added a prominent, styled search button to the top taskbar that explicitly shows the `Ctrl+K` shortcut using a `<kbd>` element. Pair keyboard shortcuts with visible UI buttons.
