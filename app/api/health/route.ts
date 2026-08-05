import { NextResponse } from "next/server";
import { APP_NAME } from "@/lib/config";
import { countLinks } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    appName: APP_NAME,
    uptimeSeconds: Math.round(process.uptime()),
    totalLinks: countLinks(),
    timestamp: new Date().toISOString(),
  });
}
