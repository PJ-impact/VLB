import { Module, Global } from '@nestjs/common';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

export const DRIZZLE = 'DRIZZLE';

const dbProvider = {
  provide: DRIZZLE,
  useFactory: () => {
    const sqlite = new Database('sqlite.db');
    return drizzle(sqlite, { schema });
  },
};

@Global()
@Module({
  providers: [dbProvider],
  exports: [DRIZZLE],
})
export class DatabaseModule {}