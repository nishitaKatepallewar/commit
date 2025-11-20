import { db } from '../db';
import { InsertNote, InsertUser, notesTable, usersTable } from '../schema';

export async function createUser(data: InsertUser) {
  await db.insert(usersTable).values(data);
}

export async function createNote(data: InsertNote) {
  await db.insert(notesTable).values(data);
}

