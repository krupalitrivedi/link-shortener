import Link from "next/link";

export const metadata = { title: "Link not found" };

export default function NotFound() {
  return (
    <div className="container">
      <div className="card card-pad" style={{ textAlign: "center" }}>
        <h1 className="page-title">Link not found</h1>
        <p className="page-subtitle">
          That short link doesn&apos;t exist, or it was never created on this
          instance.
        </p>
        <Link className="btn" href="/">
          Create a short link
        </Link>
      </div>
    </div>
  );
}
