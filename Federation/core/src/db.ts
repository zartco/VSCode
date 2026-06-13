import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (_db) return _db;

  const dbPath = process.env.DB_PATH ?? join(__dirname, '..', 'federation.db');
  _db = new DatabaseSync(dbPath);

  const schema = readFileSync(join(__dirname, '..', 'schema.sql'), 'utf8');
  _db.exec(schema);

  return _db;
}
