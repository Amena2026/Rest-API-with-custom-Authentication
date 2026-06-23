# RestAPIwithAuth

A learning project for practicing full-stack fundamentals: a React frontend talking to an Express/Supabase REST API secured with JWT-based authentication.

The project is split into two independent apps:

```
backend/    Express REST API (notes, blogs, users, login)
frontend/   React + Vite client (renders/edits notes via the API)
```

Each has its own `package.json`, dependencies, and dev server — they are run separately.

## backend/

A REST API built with Express, backed by Supabase, with user accounts, JWT-based token authentication, and an automated test suite.

- **Notes** and **blogs** resources with basic CRUD routes (`/notes`, `/blogs`)
- **User administration** (`/users`) — create/list users, passwords hashed with `bcrypt` before being stored
- **Login** (`/login`) — verifies username/password against Supabase, returns a signed JWT on success
- **Token authentication** — protected routes read a `Bearer` token from the `Authorization` header, verify it with `jsonwebtoken`, and attach the decoded user to the request
- **Tests** — using Node's built-in test runner (`node --test`) plus `supertest` to exercise the API endpoints directly

Auth flow: `POST /login` checks the username/password against Supabase, signs a JWT on success, and the client sends that token back as `Authorization: Bearer <token>` on subsequent requests. Middleware extracts and verifies the token and attaches `request.user` for controllers to check.

```bash
cd backend
npm install
npm run dev     # starts with --watch for auto-restart
npm start        # plain start
npm test         # runs the test suite (node --test)
```

Requires a `.env` file (see `backend/.env.example`: `PORT`, Supabase URL/key, and `SECRET` used to sign JWTs). Server runs on `PORT` (default `3001`).

See `backend/README.md` for more detail.

## frontend/

A React (Vite) client that consumes the backend's `/notes` API — lists existing notes, adds new ones, and deletes them.

- `src/App.jsx` — top-level component holding `notes` state, loads notes on mount via `services/notes`, and wires up add/delete handlers
- `src/components/` — presentational components (`Note`, `Form`)
- `src/services/` — `axios`-based API client for talking to the backend

```bash
cd frontend
npm install
npm run dev       # starts the Vite dev server
npm run build     # production build
npm run lint      # eslint
```

The frontend expects the backend to be running (default `http://localhost:3001`) since it calls the notes API directly.

See `frontend/README.md` for Vite-specific notes.