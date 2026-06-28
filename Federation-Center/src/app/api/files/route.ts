import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DEFAULT_ROOT = 'C:\\VSCode';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dir = searchParams.get('dir');
    const targetDir = dir ? path.resolve(dir) : DEFAULT_ROOT;

    const entries = await fs.readdir(targetDir, { withFileTypes: true });
    const files = entries.map((entry) => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      path: path.join(targetDir, entry.name),
    }));

    // Sort directories first, then alphabetically
    files.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ currentDir: targetDir, files });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to read directory', details: err.message },
      { status: 500 }
    );
  }
}
