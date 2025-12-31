import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Use DATABASE_URL or POSTGRES_URL
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// For build time, return a mock if no URL
function createDb() {
  if (!databaseUrl) {
    console.warn('No database URL configured');
    return null as unknown as ReturnType<typeof drizzle<typeof schema>>;
  }
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

export const db = createDb();

export * from './schema';
