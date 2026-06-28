const fs = require('fs');
const baseSelectors = [
  'html body input', 'html body textarea', 'html body select', 'html body button', 'html body dialog',
  'html body [role="menu"]', 'html body [role="dialog"]', 'html body [role="listbox"]',
  'html body [role="tooltip"]', 'html body [role="button"]', 'html body [role="tab"]',
  'html body cr-realbox-dropdown', 'html body .dropdown-wrapper',
  '.sbsb_a', '.sbdd_b', '.gstl_50', '.ytd-searchbox-spt', 'tp-yt-iron-dropdown', 'iron-dropdown', '[role="listbox"]',
  '#suggestions', 'ytd-searchbox'
];
const suffix = ':not(#__matrix1):not(#__matrix2):not(#__matrix3)';
const selectors = baseSelectors.map(s => s + suffix).join(',\n');
const css = selectors + ' {\n  background-color: #000000 !important;\n  border: 1px solid #008f11 !important;\n}';
fs.writeFileSync('new_css.txt', css);
