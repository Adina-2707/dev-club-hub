# Dev Club Hub Backend

This backend provides a complete REST API for the Dev Club Hub frontend.

## Features

- User registration and login with JWT authentication
- Project CRUD, likes, bookmarks
- Team management with ownership and membership
- Blog post CRUD
- Internship posting and applications
- Comments and notifications
- SQLite database via Prisma

## Setup

1. Install dependencies:

```bash
cd backend
npm install
```

2. Generate Prisma client:

```bash
npx prisma generate
```

3. Push the schema and seed demo data:

```bash
npx prisma db push
npm run db:seed
```

4. Start development server:

```bash
npm run dev
```

## API Base URL

`http://localhost:3001/api`

## Notes

- A local SQLite database is stored at `backend/dev.db`.
- Use the `.env` file to customize `PORT`, `FRONTEND_URL`, `JWT_SECRET`, and `DATABASE_URL`.

## Railway deployment

For Railway, set these environment variables in the project settings:

- `DATABASE_URL` — path to the SQLite file or the Postgres connection string
- `JWT_SECRET` — secret for JWT tokens
- `FRONTEND_URL` — frontend URL allowed by CORS
- `PORT` — Railway provides this automatically; the app uses `process.env.PORT` fallback

The backend uses `npm start` and a `Procfile` for the web process. `postinstall` now generates the Prisma client and builds the app automatically.

> Note: Prisma schema is currently configured for SQLite by default. If you want Railway to use Postgres, update `prisma/schema.prisma` with `provider = "postgresql"` and set `DATABASE_URL` to the Railway Postgres URL.
