# Lumi & Memo

AI-powered learning: **Lumi** helps you understand, **Memo** helps you remember.

## Monorepo layout

```
.
├── frontend/     # Next.js (App Router) — scaffolded in Step 3+
├── backend/      # FastAPI API + mock AI services (Step 2)
└── README.md
```

## Backend (local)

Use **Python 3.11 or 3.12** (recommended). Python 3.14+ may require building native wheels (Rust/MSVC) for Pydantic.

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- Health: `GET http://127.0.0.1:8000/health`
- OpenAPI: `http://127.0.0.1:8000/docs`

## Environment variables

See `backend/.env.example`. For Step 2, defaults work without Supabase; later steps wire auth and persistence.

## Database

Initial Postgres schema for Supabase: `backend/sql/schema.sql`.

## Frontend (local)

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

```bash
cd frontend
npm install
npm run dev
```

If your project path contains `&` (for example `...\Lumi&Memo\...`), some Windows `npm`/`cmd` shims can break. Options: move the repo to a path without `&`, or run Next directly:

```bash
node ./node_modules/next/dist/bin/next dev
```

Open `http://localhost:3000`.

## Next steps (from the build plan)

4. Tighten Add Lesson + lesson UX (optional polish)  
5. Flashcards + review hardening  
6. Supabase Auth + persistence  
