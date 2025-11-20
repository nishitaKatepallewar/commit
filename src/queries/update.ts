import { eq } from 'drizzle-orm';
import { db } from '../db';
import { SelectNote, notesTable } from '../schema';

export async function updateNote(id: SelectNote['id'], data: Partial<Omit<SelectNote, 'id'>>) {
  await db.update(notesTable).set(data).where(eq(notesTable.id, id));
}

