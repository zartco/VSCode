const fs = require('fs');
const path = require('path');

const VAULT_DIR = "C:\\VSCode\\Vault";

function checkDir(dirPath) {
  let count = 0;
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      count += checkDir(fullPath);
    } else if (stat.isFile() && item.endsWith(".md")) {
      count++;
    }
  }
  return count;
}

console.time('count');
console.log('Total md files:', checkDir(VAULT_DIR));
console.timeEnd('count');
