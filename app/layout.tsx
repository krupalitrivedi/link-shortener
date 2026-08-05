import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { APP_NAME } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Turn long URLs into short, shareable links.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="site">
          <Header />
          <main className="main">{children}</main>
          <footer className="footer">
            <div className="footer-inner">
              <span>{APP_NAME}</span>
              <Link href="/api/health">Health</Link>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
