import fs from 'fs/promises';
import path from 'path';
import { FastifyPluginAsync } from 'fastify';

const DEFAULT_ROOT = 'C:\\VSCode';

export const filesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/files', async (request, reply) => {
    const query = request.query as { dir?: string };
    const targetDir = query.dir ? path.resolve(query.dir) : DEFAULT_ROOT;

    try {
      const entries = await fs.readdir(targetDir, { withFileTypes: true });
      const files = entries.map(entry => ({
        name: entry.name,
        isDirectory: entry.isDirectory(),
        path: path.join(targetDir, entry.name)
      }));

      // Sort directories first
      files.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      return { currentDir: targetDir, files };
    } catch (err: any) {
      fastify.log.error(err);
      reply.status(500).send({ error: 'Failed to read directory', details: err.message });
    }
  });
};
