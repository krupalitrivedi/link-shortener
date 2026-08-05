import { getCloudflareContext } from "@opennextjs/cloudflare";

const FALLBACK = "Link Shortener";

/**
 * On Workers, vars arrive on the `env` object rather than as real process
 * environment variables, so this must be read per-request rather than once at
 * module scope. process.env is kept as a fallback for `next dev`.
 */
export async function getAppName(): Promise<string> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (env?.APP_NAME) return env.APP_NAME;
  } catch {
    // Not running inside a Worker (e.g. plain `next dev`).
  }
  return process.env.APP_NAME || FALLBACK;
}
