import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface VaultFile {
  name: string;
  path: string;
  folder: string;
  content: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface VaultFolder {
  name: string;
  path: string;
}

const VAULT_DIR = "C:\\Users\\Zartc\\Vault";

export function getVaultFiles(dirPath: string = VAULT_DIR): VaultFile[] {
  let files: VaultFile[] = [];

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files = files.concat(getVaultFiles(fullPath));
      } else if (stat.isFile() && item.endsWith(".md")) {
        const fileContent = fs.readFileSync(fullPath, "utf8");
        const parsed = matter(fileContent);

        // Extract inline tags #tagname
        const inlineTags = (parsed.content.match(/#[a-zA-Z0-9_]+/g) || []).map(
          (t: string) => t.substring(1),
        );
        // Combine with frontmatter tags
        let tags: string[] = [...inlineTags];
        if (parsed.data.tags) {
          if (Array.isArray(parsed.data.tags)) tags.push(...parsed.data.tags);
          else if (typeof parsed.data.tags === "string")
            tags.push(
              ...parsed.data.tags.split(",").map((s: string) => s.trim()),
            );
        }
        tags = Array.from(new Set(tags)); // remove duplicates

        // Extract top-level folder name relative to VAULT_DIR
        const relativePath = fullPath.replace(VAULT_DIR, "");
        const pathParts = relativePath.split(/[\\/]/).filter(Boolean);
        const folder = pathParts.length > 1 ? pathParts[0] : "Root";

        files.push({
          name: item,
          path: relativePath,
          folder,
          content: parsed.content, // only the raw markdown body
          metadata: parsed.data,
          tags,
        });
      }
    }
  } catch (error) {
    console.error(`Error reading vault directory ${dirPath}:`, error);
  }

  return files;
}

export function getVaultFolders(): VaultFolder[] {
  const folders: VaultFolder[] = [];
  try {
    if (!fs.existsSync(VAULT_DIR)) return folders;
    const items = fs.readdirSync(VAULT_DIR);
    for (const item of items) {
      if (item.startsWith(".")) continue; // skip hidden folders
      const fullPath = path.join(VAULT_DIR, item);
      if (fs.statSync(fullPath).isDirectory()) {
        folders.push({
          name: item,
          path: `/${item}`,
        });
      }
    }
  } catch (error) {
    console.error(`Error reading vault folders:`, error);
  }
  return folders;
}
