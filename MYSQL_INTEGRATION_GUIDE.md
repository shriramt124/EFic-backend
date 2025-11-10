# MySQL Integration Guide for next-tiptap Admin

This project now uses MySQL via the `mysql2` driver instead of MongoDB/Mongoose. Follow this guide to prepare your database and environment.

## 1. Configure Environment Variables

Set the following variables locally in `.env` (already demonstrated in `.env.example`) and in your hosting provider (e.g. Hostinger):

```
MYSQL_HOST=localhost
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database
```

## 2. Provision the Schema

1. Log into your MySQL instance (phpMyAdmin or CLI).
2. Run the statements in `database-schema.sql`. The script creates the tables used by the admin panel:
   - `categories`
   - `posts`
   - `projects`
   - `faqs`
3. If you already ran the schema for the public site, you can reuse the same database. The table layouts are compatible and include extra columns needed by the editor (e.g. `content_html`, `content_json`, `tags`).

## 3. Install Dependencies

After pulling the updated code, install dependencies to get `mysql2`:

```
npm install
```

## 4. Data Flow Overview

- `src/lib/db.ts` creates a shared MySQL connection pool (10 connections max).
- API routes under `src/app/api/v1/*` call `connectDB()` to reuse the pool and execute parameterised SQL queries.
- Result sets are transformed to camelCase objects in `src/lib/sql-mappers.ts`. Each mapper also hydrates `_id` (for UI compatibility) and normalises JSON/date fields.

## 5. Table Notes

| Table | Purpose | Key Columns |
| --- | --- | --- |
| `posts` | Blog content authored via the editor | `slug`, `content_html`, `tags`, `published` |
| `categories` | Category management | `slug`, `description` |
| `projects` | Portfolio items | `thumbnail_url`, `tags`, `featured` |
| `faqs` | FAQ entries for the site | `order_index`, `published` |

All IDs are stored as 36-character UUID strings generated with `crypto.randomUUID()`.

## 6. Deployment Checklist

1. Import `database-schema.sql` into the production database.
2. Ensure environment variables are present on the server.
3. Deploy or rebuild the Next.js app (`npm run build` then `npm run start`).
4. Test key routes (`/api/v1/posts`, `/api/v1/projects`, `/api/v1/faqs`, `/api/v1/categories`).

## 7. Troubleshooting

- **Access denied** → check MySQL credentials and host.
- **Table not found** → run `database-schema.sql` and confirm the active database matches `MYSQL_DATABASE`.
- **Empty results** → verify `published` flags and that content has been inserted.
- **Driver errors** → reinstall dependencies (`rm -rf node_modules && npm install`).

## 8. Next Steps (Optional)

- Add authentication to the admin routes.
- Create migrations for future schema changes (e.g. using Prisma or Knex).
- Set up automated backups for the MySQL database.
