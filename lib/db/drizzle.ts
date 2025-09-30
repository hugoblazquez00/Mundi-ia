import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { config } from 'dotenv';

config({ path: '.env.local' }); 

if (!process.env.SUPABASE_DB_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

export const client = postgres(process.env.SUPABASE_DB_URL , { prepare: false });
export const db = drizzle(client, { schema });
