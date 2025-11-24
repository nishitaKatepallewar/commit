import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users_table', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  email: text('email').notNull().unique(),
});

export const notesTable = pgTable('notes_table', {
  id: serial('id').primaryKey(),
  currentVersionId: integer('current_version_id'),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const noteVersionsTable = pgTable('note_versions_table', {
  id: serial('id').primaryKey(),
  noteId: integer('note_id')
    .notNull()
    .references(() => notesTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date()),
});


export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertNote = typeof notesTable.$inferInsert;
export type SelectNote = typeof notesTable.$inferSelect;

export type InsertNoteVersion = typeof noteVersionsTable.$inferInsert;
export type SelectNoteVersion = typeof noteVersionsTable.$inferSelect;