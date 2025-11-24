import { eq } from 'drizzle-orm';
import { db } from '../db';
import { SelectNote, notesTable } from '../schema';

export async function updateNote(id: SelectNote['id'], data: Partial<Omit<SelectNote, 'id'>>) {
  await db.update(notesTable).set(data).where(eq(notesTable.id, id));
}

export async function setNoteCurrentVersion(noteId: number, versionId: number) {
  const [note] = await db
    .update(notesTable)
    .set({ currentVersionId: versionId })
    .where(eq(notesTable.id, noteId))
    .returning();
  return note;
}

