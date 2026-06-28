import Fuse from "fuse.js";
import { VaultFile } from "./vault";

export function createSearchIndex(files: VaultFile[]) {
  return new Fuse(files, {
    keys: ["name", "content"],
    threshold: 0.3,
    includeMatches: true,
  });
}
