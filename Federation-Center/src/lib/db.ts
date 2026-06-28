import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (_db) return _db;

  const dbPath = process.env.DB_PATH ?? join(process.cwd(), 'federation.db');
  const dbExists = existsSync(dbPath);

  _db = new DatabaseSync(dbPath);

  if (!dbExists) {
    const schemaPath = join(process.cwd(), 'schema.sql');
    if (existsSync(schemaPath)) {
      const schema = readFileSync(schemaPath, 'utf8');
      _db.exec(schema);
    }
  }

  return _db;
}
