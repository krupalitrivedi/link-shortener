/// <reference types="@cloudflare/workers-types" />

// Bindings declared in wrangler.jsonc.
declare global {
  interface CloudflareEnv {
    DB: D1Database;
    ASSETS: Fetcher;
    APP_NAME?: string;
  }
}

export {};
