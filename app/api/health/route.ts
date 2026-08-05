import { NextResponse } from "next/server";
import { getAppName } from "@/lib/config";
import { countLinks } from "@/lib/db";

export const dynamic = "force-dynamic";

// Workers are not long-lived processes, so process.uptime() is not meaningful
// there; fall back to the age of this isolate.
const bootedAt = Date.now();

function uptimeSeconds(): number {
  if (typeof process !== "undefined" && typeof process.uptime === "function") {
    try {
      return Math.round(process.uptime());
    } catch {
      // ignore and fall through
    }
  }
  return Math.round((Date.now() - bootedAt) / 1000);
}

export async function GET() {
  const [appName, totalLinks] = await Promise.all([getAppName(), countLinks()]);

  return NextResponse.json({
    status: "ok",
    appName,
    uptimeSeconds: uptimeSeconds(),
    totalLinks,
    timestamp: new Date().toISOString(),
  });
}
