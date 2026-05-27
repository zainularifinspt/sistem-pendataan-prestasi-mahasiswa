# Sistem Pendataan Prestasi Mahasiswa

Next.js App Router application for Jurusan Pendidikan Matematika achievement data collection.

## Setup

Create `.env.local` from `env.example` and point it to a PostgreSQL database.

```bash
npm install
npm run db:docker
npm run db:push
npm run db:seed
npm run dev
```

Demo accounts use NIM/NIP as Better Auth username and `prestasi-demo` as password unless `SEED_DEMO_PASSWORD` is changed.

## Backend

The backend uses Next.js API route handlers, Better Auth, Drizzle ORM, and PostgreSQL.

- `POST /api/auth/sign-in/username` - Better Auth NIM + password login.
- `GET /api/me` - current authenticated user.
- `GET /api/stats` - jurusan statistics for authenticated users.
- `GET /api/categories` - category list.
- `POST /api/categories` - create category, admin only.
- `PATCH /api/categories` - update category, admin only.
- `GET /api/achievements` - achievements with filters.
- `POST /api/achievements` - create direct-record achievement.
- `GET /api/achievements/:id` - achievement detail.
- `PATCH /api/achievements/:id` - update achievement.
- `DELETE /api/achievements/:id` - delete achievement, admin only.
- `GET /api/export/achievements` - CSV export, dosen/admin only.

## Database Commands

```bash
npm run db:docker
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:studio
npm run db:seed
```
