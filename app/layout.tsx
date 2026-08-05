import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { getAppName } from "@/lib/config";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: await getAppName(),
    description: "Turn long URLs into short, shareable links.",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appName = await getAppName();

  return (
    <html lang="en">
      <body>
        <div className="site">
          <Header />
          <main className="main">{children}</main>
          <footer className="footer">
            <div className="footer-inner">
              <span>{appName}</span>
              <Link href="/api/health">Health</Link>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
