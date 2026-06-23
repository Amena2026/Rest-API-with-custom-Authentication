# overview

A learning project for practicing backend fundamentals: a REST API built with Express, backed by Supabase, with user accounts, JWT-based token authentication, and an automated test suite.

## What it does

- **Notes** and **blogs** resources with basic CRUD routes (`/notes`, `/blogs`)
- **User administration** (`/users`) — create/list users, passwords hashed with `bcrypt` before being stored
- **Login** (`/login`) — verifies username/password against Supabase, returns a signed JWT on success
- **Token authentication** — protected routes read a `Bearer` token from the `Authorization` header, verify it with `jsonwebtoken`, and attach the decoded user to the request
- **Tests** — using Node's built-in test runner (`node --test`) plus `supertest` to exercise the API endpoints directly

## How the pieces fit together

- `index.js` — entry point, loads env vars and starts the server
- `app.js` — builds the Express app, wires up middleware and routers
- `routes/` — one file per resource, defines the URL paths
- `controllers/` — the actual logic for each route (talks to Supabase, applies auth rules)
- `utils/middleware.js` — request logging, token extraction (`tokenExtractor`), token verification (`userExtractor`), and centralized error handling
- `utils/supabase.js` — Supabase client setup (this project uses Supabase as the database, not a local DB)
- `utils/logger.js` — small logging helper
- `tests/` — test files for notes and users/auth flows

### Auth flow, in short

1. `POST /login` checks the submitted username/password against the `users` table in Supabase (`bcrypt.compare` against the stored hash).
2. On success, the server signs a JWT (`jwt.sign`) containing the user's `id` and `username`, using the `SECRET` env var, expiring in 1 hour.
3. The client sends that token back as `Authorization: Bearer <token>` on subsequent requests.
4. `tokenExtractor` middleware pulls the token off the header; `userExtractor` verifies it with `jwt.verify` and attaches `request.user` if valid.
5. Controllers can check `request.user` to decide whether a request is authorized.

## Running it

```bash
npm install
npm run dev     # starts with --watch for auto-restart
npm start        # plain start
npm test         # runs the test suite (node --test)
```

Requires a `.env` file (see `.env.example` for the expected keys: `PORT`, Supabase URL/key, and `SECRET` used to sign JWTs).
