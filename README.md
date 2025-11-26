# commit

A simple note-taking app with built-in version control.  
Every update creates a version — so you can view history and restore anytime.

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | /notes/all | Fetch all notes |
| GET | /notes/{id} | Fetch a single note (latest version) |
| POST | /notes/ | Create a new note |
| PATCH | /notes/{id} | Update an existing note (creates a new version) |
| GET | /notes/{id}/versions | View version history of a note |
| POST | /notes/{id}/restore/{version-id} | Restore a note to a previous version |

---

## Getting Started

### Install
```bash
git clone https://github.com/nishitaKatepallewar/commit.git
cd commit
npm install
npm run db:generate
npm run db:migrate
npm run dev
