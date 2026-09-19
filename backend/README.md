# Diwali Fund API

Express + Sequelize + PostgreSQL (Docker).

## Quick start

```bash
# 1. Start Postgres (creates DB `diwalifund` on port 5434)
docker compose up -d

# 2. Install deps
npm install

# 3. Seed demo data + collector user
npm run seed

# 4. Run API
npm run dev
```

API: `http://localhost:4000/api`

### Demo login

- Phone: `9876543210`
- Password: `diwali123`

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | no | Health check |
| POST | `/api/auth/login` | no | `{ phone, password }` → JWT |
| GET | `/api/auth/me` | yes | Current user |
| GET | `/api/bootstrap` | yes | Full snapshot for the app |
| CRUD | `/api/members` | yes | Members |
| CRUD | `/api/schemes` | yes | Schemes |
| CRUD | `/api/memberships` | yes | Scheme enrollments |
| POST | `/api/memberships/bulk` | yes | Add many members to a scheme |
| CRUD | `/api/payments` | yes | Payments |

Send `Authorization: Bearer <token>` on protected routes.

## Database

Uses Neon Postgres via `DATABASE_URL` in `.env`.

```bash
npm run seed   # create tables + demo data
npm run dev    # start API
```

Local Docker Postgres (`docker compose`) is optional — only needed if you are not using Neon.
