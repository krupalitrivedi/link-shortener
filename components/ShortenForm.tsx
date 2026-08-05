"use client";

import { useState } from "react";

type Created = { slug: string; url: string; shortUrl: string };

export default function ShortenForm() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);
  const [copied, setCopied] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setCopied(false);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, slug: slug.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setCreated(null);
        return;
      }
      setCreated({
        slug: data.slug,
        url: data.url,
        shortUrl: `${window.location.origin}/${data.slug}`,
      });
      setUrl("");
      setSlug("");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function copy() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.shortUrl);
      setCopied(true);
    } catch {
      setError("Copying is not available in this browser.");
    }
  }

  return (
    <div className="card card-pad">
      <form onSubmit={onSubmit}>
        <div className="form-row">
          <div className="field">
            <label htmlFor="url">Destination URL</label>
            <input
              id="url"
              name="url"
              type="text"
              inputMode="url"
              placeholder="https://example.com/a/very/long/path"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <div className="field field-narrow">
            <label htmlFor="slug">Custom code (optional)</label>
            <input
              id="slug"
              name="slug"
              type="text"
              placeholder="launch"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="form-actions">
            <button className="btn" type="submit" disabled={pending}>
              {pending ? "Shortening…" : "Shorten"}
            </button>
          </div>
        </div>
        <p className="hint">
          Leave the code blank and we&apos;ll generate one for you.
        </p>
      </form>

      {error && <div className="alert">{error}</div>}

      {created && (
        <div className="result">
          <p className="result-label">Your short link</p>
          <div className="result-row">
            <a className="result-link" href={created.shortUrl}>
              {created.shortUrl}
            </a>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={copy}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="result-target">Redirects to {created.url}</p>
        </div>
      )}
    </div>
  );
}
