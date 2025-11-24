import express from 'express';
import { config } from 'dotenv';

config({ path: '.env' });

import { InsertUser } from './schema';
import {
  getUserById,
  getNoteById,
  getUsersWithNotesCount,
  getNotes,
  getNoteVersions,
  getNoteVersionByVersionId,
} from './queries/select';
import { createUser, createNoteVersion, createNoteWithInitialVersion } from './queries/insert';
import { setNoteCurrentVersion } from './queries/update';

const app = express();
app.use(express.json());

app.get('/', (_req, res) => res.send({ ok: true }));

// Users
app.get('/users/all', async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 5);
    const users = await getUsersWithNotesCount(page, pageSize);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = await getUserById(id);
    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const body = req.body as InsertUser;
    if (!body.name || !body.email || typeof body.age !== 'number') {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }
    await createUser(body);
    res.status(201).json({ ok: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message ?? 'Failed to create user' });
  }
});

// Notes
app.get('/notes/all', async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 5);
    const notes = await getNotes(page, pageSize);
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

app.get('/notes/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = await getNoteById(id);
    const note = rows[0];
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

app.post('/notes', async (req, res) => {
  try {
    const body = req.body as {
      userId?: number;
      title?: string;
      content?: string;
    };

    if (
      typeof body.userId !== 'number' ||
      typeof body.title !== 'string' ||
      typeof body.content !== 'string'
    ) {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    const result = await createNoteWithInitialVersion({
      userId: body.userId,
      title: body.title,
      content: body.content,
    });

    res.status(201).json(result);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message ?? 'Failed to create note' });
  }
});

app.patch('/notes/:id', async (req, res) => {
  try {
    const noteId = Number(req.params.id);
    if (Number.isNaN(noteId)) {
      return res.status(400).json({ error: 'Invalid note id' });
    }

    const rows = await getNoteById(noteId);
    const note = rows[0];
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const body = req.body as { title?: string; content?: string };
    if (typeof body.title !== 'string' && typeof body.content !== 'string') {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const nextTitle = body.title ?? note.title;
    const nextContent = body.content ?? note.content;

    if (!nextTitle || !nextContent) {
      return res.status(400).json({ error: 'Note must have both title and content' });
    }

    const version = await createNoteVersion({
      noteId,
      title: nextTitle,
      content: nextContent,
    });

    await setNoteCurrentVersion(noteId, version.id);

    res.json({ noteId, versionId: version.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

app.get('/notes/:id/versions', async (req, res) => {
  try {
    const noteId = Number(req.params.id);
    if (Number.isNaN(noteId)) {
      return res.status(400).json({ error: 'Invalid note id' });
    }

    const noteRows = await getNoteById(noteId);
    if (!noteRows[0]) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const versions = await getNoteVersions(noteId);
    res.json(versions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch note versions' });
  }
});

app.post('/notes/:id/restore/:versionId', async (req, res) => {
  try {
    const noteId = Number(req.params.id);
    const versionId = Number(req.params.versionId);
    if (Number.isNaN(noteId) || Number.isNaN(versionId)) {
      return res.status(400).json({ error: 'Invalid note or version id' });
    }

    const noteRows = await getNoteById(noteId);
    if (!noteRows[0]) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const versionRows = await getNoteVersionByVersionId(versionId);
    const version = versionRows[0];
    if (!version || version.noteId !== noteId) {
      return res.status(404).json({ error: 'Version not found for this note' });
    }

    await setNoteCurrentVersion(noteId, versionId);
    res.json({ noteId, versionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to restore note version' });
  }
});

// Basic error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

export default app;
