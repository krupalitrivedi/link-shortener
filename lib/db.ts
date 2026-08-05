import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

export type Link = {
  id: number;
  slug: string;
  url: string;
  clicks: number;
  created_at: string;
};

const DATABASE_PATH = process.env.DATABASE_PATH || "./data/links.db";

// Reuse the connection across hot reloads in development.
const globalForDb = globalThis as unknown as { __db?: DatabaseSync };

function connect(): DatabaseSync {
  // turbopackIgnore: the DB path is runtime configuration, not a bundled asset.
  const file = path.resolve(/* turbopackIgnore: true */ process.cwd(), DATABASE_PATH);
  fs.mkdirSync(path.dirname(file), { recursive: true });

  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS links (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      slug       TEXT NOT NULL UNIQUE,
      url        TEXT NOT NULL,
      clicks     INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_links_slug ON links (slug);
  `);
  return db;
}

export function getDb(): DatabaseSync {
  if (!globalForDb.__db) globalForDb.__db = connect();
  return globalForDb.__db;
}

// Lowercase, no look-alike characters (l/o/0/1).
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

function randomSlug(length = 6): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

export function normalizeUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const parsed = new URL(withProtocol);
    if (!parsed.hostname.includes(".")) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function isValidSlug(slug: string): boolean {
  return /^[A-Za-z0-9_-]{1,64}$/.test(slug);
}

// Slugs that would collide with real routes.
const RESERVED = new Set(["api", "dashboard", "_next", "favicon.ico"]);

export function createLink(url: string, customSlug?: string): Link {
  const db = getDb();
  const insert = db.prepare(
    "INSERT INTO links (slug, url) VALUES (?, ?) RETURNING *"
  );

  if (customSlug) {
    if (RESERVED.has(customSlug.toLowerCase())) {
      throw new Error("That short code is reserved. Try another one.");
    }
    if (getLink(customSlug)) {
      throw new Error("That short code is already taken.");
    }
    return insert.get(customSlug, url) as unknown as Link;
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    const slug = randomSlug();
    if (RESERVED.has(slug) || getLink(slug)) continue;
    return insert.get(slug, url) as unknown as Link;
  }
  throw new Error("Could not generate a unique short code. Please retry.");
}

export function getLink(slug: string): Link | undefined {
  return getDb().prepare("SELECT * FROM links WHERE slug = ?").get(slug) as
    | unknown as Link
    | undefined;
}

export function listLinks(): Link[] {
  return getDb()
    .prepare("SELECT * FROM links ORDER BY id DESC")
    .all() as unknown as Link[];
}

/** Increments the click counter and returns the target URL, or null if unknown. */
export function recordClick(slug: string): string | null {
  const row = getDb()
    .prepare("UPDATE links SET clicks = clicks + 1 WHERE slug = ? RETURNING url")
    .get(slug) as unknown as { url: string } | undefined;
  return row?.url ?? null;
}

export function countLinks(): number {
  const row = getDb().prepare("SELECT COUNT(*) AS n FROM links").get() as
    unknown as { n: number };
  return row.n;
}

export function totalClicks(): number {
  const row = getDb()
    .prepare("SELECT COALESCE(SUM(clicks), 0) AS n FROM links")
    .get() as unknown as { n: number };
  return row.n;
}
