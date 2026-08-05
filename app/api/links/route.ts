import { NextResponse } from "next/server";
import { createLink, isValidSlug, listLinks, normalizeUrl } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ links: await listLinks() });
}

export async function POST(request: Request) {
  let body: { url?: unknown; slug?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.url !== "string") {
    return NextResponse.json({ error: "A URL is required." }, { status: 400 });
  }

  const url = normalizeUrl(body.url);
  if (!url) {
    return NextResponse.json(
      { error: "That doesn't look like a valid URL." },
      { status: 400 }
    );
  }

  let slug: string | undefined;
  if (typeof body.slug === "string" && body.slug.trim()) {
    slug = body.slug.trim();
    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { error: "Codes may only use letters, numbers, hyphens and underscores." },
        { status: 400 }
      );
    }
  }

  try {
    const link = await createLink(url, slug);
    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create the link.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
