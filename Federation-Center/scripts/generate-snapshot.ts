import fs from "fs";
import path from "path";
import { getVaultFiles } from "../src/lib/vault";

function main() {
  const files = getVaultFiles();
  
  const snapshot = {
    timestamp: Date.now(),
    date: new Date().toISOString(),
    totalFiles: files.length,
    folders: {} as Record<string, number>,
    tags: {} as Record<string, number>,
    vaultSizeTimeSeries: [] as { date: string; count: number }[]
  };

  files.forEach((file) => {
    snapshot.folders[file.folder] = (snapshot.folders[file.folder] || 0) + 1;
    if (file.tags) {
      file.tags.forEach((tag) => {
        snapshot.tags[tag] = (snapshot.tags[tag] || 0) + 1;
      });
    }
  });

  const sortedFiles = [...files]
    .filter((f) => f.createdAt)
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

  const grouped: Record<string, number> = {};
  sortedFiles.forEach((f) => {
    const date = new Date(f.createdAt!);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    grouped[dateKey] = (grouped[dateKey] || 0) + 1;
  });

  let cumulative = 0;
  snapshot.vaultSizeTimeSeries = Object.entries(grouped).map(([date, count]) => {
    cumulative += count;
    return { date, count: cumulative };
  });

  const snapshotDir = path.join(process.cwd(), "snapshots");
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  const dateStr = new Date().toISOString().split("T")[0];
  const filePath = path.join(snapshotDir, `snapshot-${dateStr}.json`);

  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
  console.log(`Snapshot saved to ${filePath}`);
}

main();
