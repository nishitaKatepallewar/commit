import express from 'express';
import { config } from 'dotenv';

config({ path: '.env' });

import { InsertUser, InsertPost } from './schema';
import {
  getUserById,
  getUsersWithPostsCount,
  getPostsForLast24Hours,
} from './queries/select';
import { createUser, createPost } from './queries/insert';

const app = express();
app.use(express.json());

app.get('/', (_req, res) => res.send({ ok: true }));

// Users
app.get('/users', async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 5);
    const users = await getUsersWithPostsCount(page, pageSize);
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

// Posts
app.get('/posts', async (req, res) => {
  try {
    // If query `last24h=true` is provided, use that helper
    const last24h = req.query.last24h === 'true' || req.query.last24h === '1';
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 5);
    if (last24h) {
      const posts = await getPostsForLast24Hours(page, pageSize);
      return res.json(posts);
    }
    // fallback: reuse the last24h helper for now (you can add a general list later)
    const posts = await getPostsForLast24Hours(page, pageSize);
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/posts', async (req, res) => {
  try {
    const body = req.body as InsertPost;
    if (!body.title || !body.content || typeof body.userId !== 'number') {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }
    await createPost(body);
    res.status(201).json({ ok: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message ?? 'Failed to create post' });
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
