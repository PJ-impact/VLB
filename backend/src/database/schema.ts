import { pgTable, serial, text, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('receptionist'),
});

export const visitors = pgTable('visitors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  isCompany: boolean('is_company').notNull().default(false),
  affiliation: text('affiliation').notNull(),
  host: text('host').notNull(),
  status: text('status').notNull().default('active'),
  checkInTime: timestamp('check_in_time', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  checkOutTime: timestamp('check_out_time', { withTimezone: true, mode: 'string' }),
});