import { notFound, redirect } from "next/navigation";
import { recordClick } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Server-side redirect for short links.
 * The click counter is incremented here, on the server, before the
 * 307 redirect is issued — no client-side JavaScript is involved.
 * Unknown codes render the styled 404 page with a real 404 status.
 */
export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const target = recordClick(slug);

  if (!target) notFound();

  redirect(target);
}
