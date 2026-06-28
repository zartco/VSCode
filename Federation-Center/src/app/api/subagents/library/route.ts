import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const globalSubagentsDir = path.join(os.homedir(), '.subagents');
const globalManifestPath = path.join(globalSubagentsDir, 'manifest.json');

async function readManifest(manifestPath: string) {
  try {
    const data = await fs.readFile(manifestPath, 'utf8');
    return JSON.parse(data);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return { agents: [] };
    }
    throw err;
  }
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await readManifest(globalManifestPath);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
