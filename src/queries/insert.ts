import { eq } from 'drizzle-orm';
import { db } from '../db';
import {
  InsertNote,
  InsertNoteVersion,
  InsertUser,
  notesTable,
  noteVersionsTable,
  usersTable,
} from '../schema';

export async function createUser(data: InsertUser) {
  await db.insert(usersTable).values(data);
}

export async function createNote(data: InsertNote) {
  const [note] = await db.insert(notesTable).values(data).returning();
  return note;
}

export async function createNoteVersion(data: InsertNoteVersion) {
  const [version] = await db.insert(noteVersionsTable).values(data).returning();
  return version;
}

export async function createNoteWithInitialVersion({
  userId,
  title,
  content,
}: {
  userId: number;
  title: string;
  content: string;
}) {

  const [note] = await db.insert(notesTable).values({userId}).returning();
  const currentNoteId = note.id;
  const [version] = await db.insert(noteVersionsTable).values({noteId: currentNoteId, title, content}).returning();
  await db.update(notesTable).set({currentVersionId: version.id}).where(eq(notesTable.id, currentNoteId));
  return {
    noteId: currentNoteId,
    version,
  };
}
