/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const VAULT_DIR = 'C:\\Users\\Zartc\\Vault';

function getVaultFiles(dirPath = VAULT_DIR) {
  let files = [];
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files = files.concat(getVaultFiles(fullPath));
    } else if (stat.isFile() && item.endsWith('.md')) {
      const relativePath = fullPath.replace(VAULT_DIR, '');
      const pathParts = relativePath.split(/[\\/]/).filter(Boolean);
      const folder = pathParts.length > 1 ? pathParts[0] : 'Root';
      files.push({ name: item, folder });
    }
  }
  return files;
}

const files = getVaultFiles();
console.log(files.slice(0, 5));
