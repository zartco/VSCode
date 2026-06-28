const matrixThemeCSS = '*:not(img,video,svg,canvas) { background-color: #000 !important; background-image: none !important; color: #0f0 !important; border-color: #080 !important; } a { color: #39ff14 !important; }';

const mtxSheet = new CSSStyleSheet();
mtxSheet.replaceSync(matrixThemeCSS);

function injectAllShadows(root) {
  const all = root.querySelectorAll('*');
  for (let el of all) {
    // Exclude shadow roots inside media players to prevent breaking videos
    if (el.closest('video, #player, #player-container, .ytd-video-primary-info-renderer, .ytd-watch-metadata')) {
      continue;
    }
    if (el.shadowRoot) {
      if (!el.shadowRoot.adoptedStyleSheets.includes(mtxSheet)) {
        el.shadowRoot.adoptedStyleSheets = [...el.shadowRoot.adoptedStyleSheets, mtxSheet];
      }
      injectAllShadows(el.shadowRoot);
    }
  }
}

injectAllShadows(document.documentElement);
setInterval(() => injectAllShadows(document.documentElement), 1000);
