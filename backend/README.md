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
- Use the `.env` file to customize `PORT`, `FRONTEND_URL`, and `JWT_SECRET`.
