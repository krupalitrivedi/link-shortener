import Link from "next/link";
import ShortenForm from "@/components/ShortenForm";
import { countLinks, totalClicks } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [links, clicks] = await Promise.all([countLinks(), totalClicks()]);

  return (
    <div className="container">
      <div className="hero">
        <h1 className="page-title">Short links, made simple</h1>
        <p className="page-subtitle">
          Paste a long URL and get a clean, shareable link you can track.
        </p>
      </div>

      <ShortenForm />

      <p className="hint" style={{ textAlign: "center", marginTop: 24 }}>
        {links} link{links === 1 ? "" : "s"} created · {clicks} total click
        {clicks === 1 ? "" : "s"} ·{" "}
        <Link href="/dashboard" style={{ color: "var(--accent)" }}>
          View dashboard
        </Link>
      </p>
    </div>
  );
}
