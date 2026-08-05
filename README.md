# Link Shortener — Cloudflare Workers branch

A small, complete URL shortener built with **Next.js (App Router)**, deployed to
**Cloudflare Workers** via OpenNext, with **D1** for storage.

- Paste a long URL and get a short link back (optionally with a custom code).
- Visiting `/<code>` performs a **server-side redirect** to the original URL.
- Click counts are incremented **on the server** during that redirect.
- A dashboard lists every link with its destination, creation date and click count.

> **This branch targets Cloudflare only.** Workers have no filesystem, so storage
> is D1 rather than a SQLite file, and `lib/db.ts` resolves its database from the
> `DB` binding. That means `npm run start` (the plain Node server) does **not**
> work here — use the `main` branch for Node hosts, and this branch for Cloudflare.

## Requirements

- Node.js 22 (see [`.nvmrc`](.nvmrc))
- npm
- A Cloudflare account with Workers and D1 enabled

## Setup

```bash
npm install
```

Create the database and paste the returned `database_id` into
[`wrangler.jsonc`](wrangler.jsonc), replacing `REPLACE_WITH_YOUR_D1_DATABASE_ID`:

```bash
npm run cf-db:create
```

Then apply the schema:

```bash
npm run cf-db:migrate
```

## Build command

```bash
npm run cf-build
```

## Deploy command

```bash
npm run cf-deploy
```

## Running locally

```bash
npm run cf-db:migrate:local
npm run cf-build
npm run cf-preview
```

This runs the real `workerd` runtime against a local D1 database in `.wrangler/`,
so nothing touches your Cloudflare account.

## Environment variables

| Variable        | Where it lives                     | Description                                                                                                       |
| --------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `APP_NAME`      | `vars` in `wrangler.jsonc`         | Name shown in the site header and footer, and returned by `/api/health`. Useful for verifying env wiring per host. |
| `DB`            | `d1_databases` in `wrangler.jsonc` | The D1 binding used for all storage. Not a value you set — a binding Cloudflare injects.                          |

On Workers, `vars` arrive on the `env` object rather than as real process
environment variables, so `APP_NAME` is read per request in
[`lib/config.ts`](lib/config.ts) instead of once at module load.

`DATABASE_PATH` is **not used on this branch** — it only applies to the
filesystem-backed SQLite build on `main`.

Example:

```jsonc
"vars": {
  "APP_NAME": "Link Shortener — Staging"
}
```

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
  not-found.tsx          styled 404
  globals.css            all styling — no external fonts or CDNs
components/
  Header.tsx             header, renders APP_NAME
  ShortenForm.tsx        client form that posts to /api/links
lib/
  config.ts              APP_NAME, read per request from the Worker env
  db.ts                  D1 queries
migrations/
  0001_create_links.sql  D1 schema
open-next.config.ts      OpenNext Cloudflare adapter config
wrangler.jsonc           Worker name, bindings, vars
cloudflare-env.d.ts      types for the DB / ASSETS bindings
```

## Notes

- Storage is Cloudflare D1. The schema lives in `migrations/` and is applied with
  `wrangler d1 migrations apply`, so there is no create-on-boot step.
- Every database call is async — D1 has no synchronous API.
- The redirect route is `force-dynamic` and never cached, so click counts stay accurate.
- No external fonts, stylesheets or CDN assets are loaded.
