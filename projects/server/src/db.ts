import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const DB_PATH = resolve(process.cwd(), 'invoicer.db');
export const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

if (process.argv[2] === '--init') {
  const schema = readFileSync(resolve(process.cwd(), 'src/schema.sql'), 'utf8');
  db.exec(schema);
  console.log('✅ Database initialized');
}
