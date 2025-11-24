import { asc, count, eq, getTableColumns } from 'drizzle-orm';
import { db } from '../db';
import { SelectUser, SelectNote, usersTable, notesTable, noteVersionsTable } from '../schema';

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
    title: string | null;
    content: string | null;
    currentVersionId: number | null;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
  }>
> {
  return db
    .select({
      id: notesTable.id,
      title: noteVersionsTable.title,
      content: noteVersionsTable.content,
      currentVersionId: notesTable.currentVersionId,
      userId: notesTable.userId,
      createdAt: notesTable.createdAt,
      updatedAt: notesTable.updatedAt,
    })
    .from(notesTable)
    .leftJoin(noteVersionsTable, eq(notesTable.currentVersionId, noteVersionsTable.id))
    .where(eq(notesTable.id, id));
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

export async function getNoteVersionByVersionId(versionId: number) {
  return db
    .select()
    .from(noteVersionsTable)
    .where(eq(noteVersionsTable.id, versionId));
}

export async function getNotes(
  //join notestable with noteversionstable on currentversionid, get title and content from noteversionstable and userid from notestable
  page = 1,
  pageSize = 5,
): Promise<
  Array<{
    id: number;
    title: string | null;
    content: string | null;
    userId: number;
  }>
> {
  return db
    .select({
      id: notesTable.id,
      title: noteVersionsTable.title,
      content: noteVersionsTable.content,
      userId: notesTable.userId,
    })
    .from(notesTable)
    .leftJoin(noteVersionsTable, eq(notesTable.currentVersionId, noteVersionsTable.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}

export async function getNoteVersions(noteId: number) {
  return db
    .select()
    .from(noteVersionsTable)
    .where(eq(noteVersionsTable.noteId, noteId))
    .orderBy(asc(noteVersionsTable.id));
}


