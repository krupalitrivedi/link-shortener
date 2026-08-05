import Link from "next/link";
import { headers } from "next/headers";
import { listLinks } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard" };

function formatDate(value: string) {
  // SQLite stores UTC as "YYYY-MM-DD HH:MM:SS".
  const date = new Date(value.replace(" ", "T") + "Z");
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const links = await listLinks();
  const clicks = links.reduce((sum, link) => sum + link.clicks, 0);

  const host = (await headers()).get("host") ?? "localhost:3000";
  const origin = `${host.startsWith("localhost") ? "http" : "https"}://${host}`;

  return (
    <div className="container">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">
        Every link created on this instance, newest first.
      </p>

      <div className="stats">
        <div className="stat">
          <p className="stat-label">Total links</p>
          <p className="stat-value">{links.length}</p>
        </div>
        <div className="stat">
          <p className="stat-label">Total clicks</p>
          <p className="stat-value">{clicks}</p>
        </div>
        <div className="stat">
          <p className="stat-label">Avg. clicks per link</p>
          <p className="stat-value">
            {links.length ? (clicks / links.length).toFixed(1) : "0.0"}
          </p>
        </div>
      </div>

      <div className="card">
        {links.length === 0 ? (
          <div className="empty">
            <p>No links yet.</p>
            <Link className="btn" href="/">
              Create your first link
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Short link</th>
                  <th>Destination</th>
                  <th>Created</th>
                  <th className="num">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id}>
                    <td>
                      <a className="slug-link" href={`/${link.slug}`}>
                        /{link.slug}
                      </a>
                    </td>
                    <td>
                      <a
                        className="target"
                        href={link.url}
                        title={link.url}
                        rel="noreferrer noopener"
                        target="_blank"
                      >
                        {link.url}
                      </a>
                    </td>
                    <td className="date">{formatDate(link.created_at)}</td>
                    <td className="num">
                      <span
                        className={`pill${link.clicks > 0 ? " pill-hot" : ""}`}
                      >
                        {link.clicks}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="hint">Short links resolve at {origin}/&lt;code&gt;.</p>
    </div>
  );
}
