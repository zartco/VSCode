import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const globalSubagentsDir = path.join(os.homedir(), '.subagents');
const projectSubagentsDir = path.join('C:\\VSCode', '.subagents');
const globalManifestPath = path.join(globalSubagentsDir, 'manifest.json');
const projectManifestPath = path.join(projectSubagentsDir, 'manifest.json');

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

async function writeManifest(manifestPath: string, data: any) {
  const dir = path.dirname(manifestPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(manifestPath, JSON.stringify(data, null, 2));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name: string;
      vendor: string;
      triggers: string;
      instructions: string;
      scope: 'global' | 'project';
    };

    const targetDir = body.scope === 'global' ? globalSubagentsDir : projectSubagentsDir;
    const manifestPath = body.scope === 'global' ? globalManifestPath : projectManifestPath;

    // Read current manifest
    const manifest = await readManifest(manifestPath);

    // Add to manifest
    if (!manifest.agents) manifest.agents = [];
    manifest.agents.push({
      name: body.name,
      vendor: body.vendor,
      triggers: body.triggers,
    });

    // Write updated manifest
    await writeManifest(manifestPath, manifest);

    // Create subagent directory and instruction file
    const agentDir = path.join(targetDir, body.name);
    await fs.mkdir(agentDir, { recursive: true });

    // We store instructions as instructions.md
    await fs.writeFile(path.join(agentDir, 'instructions.md'), body.instructions);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
