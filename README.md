# Data Tampering Detection System (Hash Comparison)

Production-oriented full-stack app using:
- React + Tailwind CSS (animated UI + light/dark toggle)
- Node.js + Express API
- Supabase (Auth, OAuth, Postgres)
- JWT verification on backend

## Features
- Email/password login and OAuth login (Google/GitHub) via Supabase
- Backend-protected APIs using Supabase JWT bearer tokens
- Deterministic JSON canonicalization + SHA-256 hashing
- Record hash snapshots in Supabase
- Verify incoming payload against stored hash
- Tampered vs Intact result panel with animated UI feedback
- Security middleware (`helmet`, rate limit, CORS, input validation)

## Project Structure
- `backend/` Express API
- `frontend/` React + Tailwind app
- `backend/supabase/schema.sql` DB schema and RLS policies

## 1) Supabase Setup
1. Create a Supabase project.
2. Run `backend/supabase/schema.sql` in SQL Editor.
3. In Supabase Auth:
   - Enable Email auth
   - Enable OAuth providers you want (Google/GitHub)
   - Add redirect URL(s), for local dev use:
     - `http://localhost:5173`
4. Copy project keys from Supabase settings:
   - Project URL
   - `anon` key
   - `service_role` key

## 2) Environment Variables
Backend:
1. Copy `backend/.env.example` to `backend/.env`
2. Fill values:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CORS_ORIGIN` (comma-separated allowed origins in production)

Frontend:
1. Copy `frontend/.env.example` to `frontend/.env`
2. Fill values:
   - `VITE_API_URL` (local API: `http://localhost:8080`)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 3) Local Development
Install dependencies:

```bash
npm install --workspace backend
npm install --workspace frontend
```

Run backend:

```bash
npm run dev:backend
```

Run frontend:

```bash
npm run dev:frontend
```

Local URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

## 4) Production Build
Frontend build:

```bash
npm run build:frontend
```

Backend start:

```bash
npm run start:backend
```

## 5) Docker Deployment
1. Ensure `backend/.env` exists.
2. Export frontend Supabase vars in your shell:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Run:

```bash
docker compose up --build -d
```

Containers:
- Web: `http://localhost:3000`
- API: `http://localhost:8080`

## API Endpoints
- `GET /api/health` Public health check
- `GET /api/auth/me` Authenticated user info
- `GET /api/records` List current user's records
- `POST /api/records` Store new hash snapshot
- `POST /api/records/verify` Compare incoming payload vs stored hash

All protected endpoints require:
- Header: `Authorization: Bearer <supabase_access_token>`

## Security Notes
- `service_role` key must stay on backend only.
- Use HTTPS in production.
- Restrict `CORS_ORIGIN` to trusted frontend domains.
- Keep rate limits enabled.
- Rotate keys if leakage is suspected.
