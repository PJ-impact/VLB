import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: ['receptionist', 'admin'] }).notNull().default('receptionist'),
});

export const visitors = sqliteTable('visitors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  isCompany: integer('is_company', { mode: 'boolean' }).notNull(),
  affiliation: text('affiliation').notNull(),
  host: text('host').notNull(),
  status: text('status', { enum: ['active', 'completed'] }).notNull().default('active'),
  checkInTime: text('check_in_time').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  checkOutTime: text('check_out_time'),
});
