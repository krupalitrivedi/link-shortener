import { getCloudflareContext } from "@opennextjs/cloudflare";

export type Link = {
  id: number;
  slug: string;
  url: string;
  clicks: number;
  created_at: string;
};

/**
 * The D1 binding declared in wrangler.jsonc.
 * Every query below is async — D1 has no synchronous API.
 */
async function getDb(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.DB) {
    throw new Error(
      "The D1 binding `DB` is missing. Check d1_databases in wrangler.jsonc."
    );
  }
  return env.DB;
}

// Lowercase, no look-alike characters (l/o/0/1).
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

function randomSlug(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
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

export async function createLink(
  url: string,
  customSlug?: string
): Promise<Link> {
  const db = await getDb();
  const sql = "INSERT INTO links (slug, url) VALUES (?, ?) RETURNING *";

  if (customSlug) {
    if (RESERVED.has(customSlug.toLowerCase())) {
      throw new Error("That short code is reserved. Try another one.");
    }
    if (await getLink(customSlug)) {
      throw new Error("That short code is already taken.");
    }
    const row = await db.prepare(sql).bind(customSlug, url).first<Link>();
    if (!row) throw new Error("Could not create the link.");
    return row;
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    const slug = randomSlug();
    if (RESERVED.has(slug) || (await getLink(slug))) continue;
    const row = await db.prepare(sql).bind(slug, url).first<Link>();
    if (row) return row;
  }
  throw new Error("Could not generate a unique short code. Please retry.");
}

export async function getLink(slug: string): Promise<Link | null> {
  const db = await getDb();
  return db
    .prepare("SELECT * FROM links WHERE slug = ?")
    .bind(slug)
    .first<Link>();
}

export async function listLinks(): Promise<Link[]> {
  const db = await getDb();
  const { results } = await db
    .prepare("SELECT * FROM links ORDER BY id DESC")
    .all<Link>();
  return results ?? [];
}

/** Increments the click counter and returns the target URL, or null if unknown. */
export async function recordClick(slug: string): Promise<string | null> {
  const db = await getDb();
  const row = await db
    .prepare("UPDATE links SET clicks = clicks + 1 WHERE slug = ? RETURNING url")
    .bind(slug)
    .first<{ url: string }>();
  return row?.url ?? null;
}

export async function countLinks(): Promise<number> {
  const db = await getDb();
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM links")
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function totalClicks(): Promise<number> {
  const db = await getDb();
  const row = await db
    .prepare("SELECT COALESCE(SUM(clicks), 0) AS n FROM links")
    .first<{ n: number }>();
  return row?.n ?? 0;
}
