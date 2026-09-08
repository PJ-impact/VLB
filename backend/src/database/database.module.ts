import { Module, Global } from '@nestjs/common';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as dotenv from 'dotenv'
import * as schema from './schema.js';

dotenv.config();

export const DRIZZLE = 'DRIZZLE';

const dbProvider = {
  provide: DRIZZLE,
  useFactory: () => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is missing.');
    }

    // Postgres.js client with SSL enabled for cloud databases (Supabase/Neon)
    const client = postgres(connectionString, {
      ssl: 'require',
      max: 10,
    });

    return drizzle(client, { schema });
  },
};

@Global()
@Module({
  providers: [dbProvider],
  exports: [DRIZZLE],
})
export class DatabaseModule {}