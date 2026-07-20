# AINTRIX Global — Test Credentials

## Admin Panel (`/admin/login`)
- **Email:** `admin@aintrix.com`
- **Password:** `Aintrix@2026`
- **Role:** `admin`
- Seeded idempotently on backend startup (see `server.py`).

## Auth Endpoints
- `POST /api/auth/login` — body `{ "email", "password" }` → returns `{ access_token, user }`
- `GET  /api/auth/me` — requires `Authorization: Bearer <token>`
- All admin routes live under `/api/admin/*` and require the admin bearer token.
