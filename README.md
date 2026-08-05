# Link Shortener

A small, complete URL shortener built with **Next.js (App Router)** and **SQLite**.

- Paste a long URL and get a short link back (optionally with a custom code).
- Visiting `/<code>` performs a **server-side redirect** to the original URL.
- Click counts are incremented **on the server** during that redirect.
- A dashboard lists every link with its destination, creation date and click count.

## Requirements

- Node.js 20 or newer
- npm

## Setup

```bash
npm install
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

## Build command

```bash
npm run build
```

## Start command

```bash
npm run start
```

The server listens on port `3000` by default (`npm run start -- -p 8080` to change it).
For local development with hot reload, use `npm run dev`.

## Environment variables

| Variable        | Required | Default              | Description                                                                                                       |
| --------------- | -------- | -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `APP_NAME`      | No       | `Link Shortener`     | Name shown in the site header and footer, and returned by `/api/health`. Useful for verifying env wiring per host. |
| `DATABASE_PATH` | No       | `./data/links.db`    | Path to the SQLite database file. Relative paths resolve from the project root. Created automatically if missing.  |

Both are also documented in [`.env.example`](.env.example).

Example:

```bash
APP_NAME="Link Shortener — Staging"
DATABASE_PATH="/var/data/links.db"
```

The directory containing `DATABASE_PATH` is created on boot, so on hosts with a
persistent volume just point the variable at a path inside that volume. Without a
persistent volume the database resets whenever the instance restarts.

## Routes

| Route          | Description                                                            |
| -------------- | ---------------------------------------------------------------------- |
| `/`            | Create a short link                                                    |
| `/dashboard`   | All links with click counts                                            |
| `/<code>`      | Server-side redirect to the destination; increments the click counter  |
| `/api/health`  | `GET` — JSON health check                                              |
| `/api/links`   | `GET` list links · `POST` `{ "url": "...", "slug": "optional" }`       |

### `/api/health` response

```json
{
  "status": "ok",
  "appName": "Link Shortener",
  "uptimeSeconds": 42,
  "totalLinks": 3,
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

## Project structure

```
app/
  [slug]/page.tsx        server-side redirect + click counter
  api/health/route.ts    health check JSON
  api/links/route.ts     create / list links
  dashboard/page.tsx     links table with click counts
  page.tsx               shortener home page
  layout.tsx             shell (header, footer)
  globals.css            all styling — no external fonts or CDNs
components/
  Header.tsx             header, renders APP_NAME
  ShortenForm.tsx        client form that posts to /api/links
lib/
  config.ts              APP_NAME
  db.ts                  SQLite connection, schema and queries
.env.example
```

## Notes

- Storage is a single SQLite file via `better-sqlite3`; the schema is created on
  first connection, so there is no migration step.
- The redirect route is `force-dynamic` and never cached, so click counts stay accurate.
- No external fonts, stylesheets or CDN assets are loaded.
