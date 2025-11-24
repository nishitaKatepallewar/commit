import { asc, between, count, eq, getTableColumns, sql } from 'drizzle-orm';
import { db } from '../db';
import { SelectUser, SelectNote, usersTable, notesTable } from '../schema';

export async function getUserById(id: SelectUser['id']): Promise<
  Array<{
    id: number;
    name: string;
    age: number;
    email: string;
  }>
> {
  return db.select().from(usersTable).where(eq(usersTable.id, id));
}

export async function getNoteById(id: SelectNote['id']): Promise<
  Array<{
    id: number;
    title: string;
    content: string;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
  }>
> {
  return db.select().from(notesTable).where(eq(notesTable.id, id));
}

export async function getUsersWithNotesCount(
  page = 1,
  pageSize = 5,
): Promise<
  Array<{
    notesCount: number;
    id: number;
    name: string;
    age: number;
    email: string;
  }>
> {
  return db
    .select({
      ...getTableColumns(usersTable),
      notesCount: count(notesTable.id),
    })
    .from(usersTable)
    .leftJoin(notesTable, eq(usersTable.id, notesTable.userId))
    .groupBy(usersTable.id)
    .orderBy(asc(usersTable.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}

export async function getNotes(
  page = 1,
  pageSize = 5,
): Promise<
  Array<{
    id: number;
    title: string;
  }>
> {
  return db
    .select({
      id: notesTable.id,
      title: notesTable.title,
    })
    .from(notesTable)
    .orderBy(asc(notesTable.title), asc(notesTable.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}

