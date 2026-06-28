(function() {
  const styles = `
    html, body {
      background-color: #000000 !important;
      background-image: none !important;
    }
    *:not(img):not(video):not(canvas):not(svg):not(picture):not(#__matrix1):not(#__matrix2):not(#__matrix3),
    [id]:not(img):not(video):not(canvas):not(svg):not(picture):not(#__matrix1):not(#__matrix2):not(#__matrix3) {
      color: #00ff41 !important;
      border-color: #008f11 !important;
      text-shadow: none !important;
      box-shadow: none !important;
      -webkit-text-fill-color: initial !important;
    }
    *:not(img):not(video):not(canvas):not(svg):not(picture):not(.google-symbols):not(.material-symbols-outlined):not(.material-symbols-rounded):not(.material-symbols-sharp):not(.material-icons):not(mat-icon):not([class*="icon" i]):not([class*="math" i]):not([class*="mjx" i]):not([class*="katex" i]):not([class*="tex" i]):not(math) {
      font-family: 'Courier New', Courier, monospace !important;
    }
    *:not(html):not(body):not(img):not(video):not(canvas):not(svg):not(picture):not(#__matrix1):not(#__matrix2):not(#__matrix3),
    [id]:not(html):not(body):not(img):not(video):not(canvas):not(svg):not(picture):not(#__matrix1):not(#__matrix2):not(#__matrix3) {
      background-color: #000000 !important;
      box-shadow: none !important;
    }
    *:not(img):not(video):not(canvas):not(svg):not(picture):not([style*="url("]):not(#__matrix1):not(#__matrix2):not(#__matrix3) {
      background-image: none !important;
    }
    svg rect[fill="#ffffff"], svg rect[fill="#fff"], svg rect[fill="white"] {
      fill: transparent !important;
    }
    html body input:not(#__matrix1):not(#__matrix2):not(#__matrix3),
html body textarea:not(#__matrix1):not(#__matrix2):not(#__matrix3),
html body select:not(#__matrix1):not(#__matrix2):not(#__matrix3),
html body button:not(#__matrix1):not(#__matrix2):not(#__matrix3),
html body dialog:not(#__matrix1):not(#__matrix2):not(#__matrix3),
html body [role="menu"]:not(#__matrix1):not(#__matrix2):not(#__matrix3),
html body [role="dialog"]:not(#__matrix1):not(#__matrix2):not(#__matrix3),
html body [role="listbox"]:not(#__matrix1):not(#__matrix2):not(#__matrix3),
html body [role="tooltip"]:not(#__matrix1):not(#__matrix2):not(#__matrix3),
html body [role="button"]:not(#__matrix1):not(#__matrix2):not(#__matrix3),
html body [role="tab"]:not(#__matrix1):not(#__matrix2):not(#__matrix3),
html body cr-realbox-dropdown:not(#__matrix1):not(#__matrix2):not(#__matrix3),
html body .dropdown-wrapper:not(#__matrix1):not(#__matrix2):not(#__matrix3),
.sbsb_a:not(#__matrix1):not(#__matrix2):not(#__matrix3),
.sbdd_b:not(#__matrix1):not(#__matrix2):not(#__matrix3),
.gstl_50:not(#__matrix1):not(#__matrix2):not(#__matrix3),
.ytd-searchbox-spt:not(#__matrix1):not(#__matrix2):not(#__matrix3),
tp-yt-iron-dropdown:not(#__matrix1):not(#__matrix2):not(#__matrix3),
iron-dropdown:not(#__matrix1):not(#__matrix2):not(#__matrix3),
[role="listbox"]:not(#__matrix1):not(#__matrix2):not(#__matrix3),
#suggestions:not(#__matrix1):not(#__matrix2):not(#__matrix3),
ytd-searchbox:not(#__matrix1):not(#__matrix2):not(#__matrix3) {
  background-color: #000000 !important;
  border: 1px solid #008f11 !important;
}
    img, video, canvas, svg, picture, [style*="background-image"] {
      opacity: 1 !important;
      visibility: visible !important;
      mix-blend-mode: normal !important;
      filter: invert(1) brightness(0.6) sepia(1) hue-rotate(85deg) saturate(600%) brightness(1.2) !important;
      background-color: transparent !important;
    }

    /* Headings -> Cyan */
    h1:not(#__syntax), h1 *:not(#__syntax),
    h2:not(#__syntax), h2 *:not(#__syntax),
    h3:not(#__syntax), h3 *:not(#__syntax),
    h4:not(#__syntax), h4 *:not(#__syntax),
    h5:not(#__syntax), h5 *:not(#__syntax),
    h6:not(#__syntax), h6 *:not(#__syntax) {
      color: #00ffb4 !important;
      border-color: #00ffb4 !important;
    }

    /* Bold/Emphasis -> Yellow */
    b:not(#__syntax), b *:not(#__syntax),
    strong:not(#__syntax), strong *:not(#__syntax),
    em:not(#__syntax), em *:not(#__syntax),
    i:not(#__syntax), i *:not(#__syntax),
    mark:not(#__syntax), mark *:not(#__syntax) {
      color: #ffff00 !important;
    }
  `;

  function injectStyles(shadowRoot) {
    if (!shadowRoot || shadowRoot.host.id === 'player') return;
    
    // Check if we already injected to prevent duplicates
    if (shadowRoot.querySelector('style[data-matrix-theme]')) return;
    
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-matrix-theme', 'true');
    styleEl.textContent = styles;
    shadowRoot.appendChild(styleEl);
  }

  function traverseAndInject(node) {
    // Only process Element nodes and DocumentFragments (like shadowRoot)
    if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      if (node.shadowRoot) {
        injectStyles(node.shadowRoot);
      }
      if (node.childNodes && node.childNodes.length > 0) {
        node.childNodes.forEach(traverseAndInject);
      }
    }
  }

  // Wait a brief moment to let standard DOM settle before aggressive piercing
  setTimeout(() => {
    traverseAndInject(document.body);

    // Watch for newly added nodes
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          traverseAndInject(node);
        });
      });
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }, 100);
})();
