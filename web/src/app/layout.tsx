import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRISP-DM Demo Shop",
  description: "Chapter 17 ML pipeline demo app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-black">
        <header className="border-b bg-white text-black">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-3">
            <div className="flex items-center gap-4">
              <Link href="/" className="font-semibold tracking-tight text-black">
                CRISP-DM Demo Shop
              </Link>
              <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-black">
                <Link href="/select-customer" className="hover:underline">
                  Select Customer
                </Link>
                <Link href="/dashboard" className="hover:underline">
                  Dashboard
                </Link>
                <Link href="/place-order" className="hover:underline">
                  Place Order
                </Link>
                <Link href="/orders" className="hover:underline">
                  Order History
                </Link>
                <Link href="/warehouse/priority" className="hover:underline">
                  Priority Queue
                </Link>
                <Link href="/scoring" className="hover:underline">
                  Run Scoring
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1 bg-zinc-50 text-black">{children}</main>
        <footer className="border-t bg-white text-black">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-black">
            Uses Supabase Postgres. No authentication (customer selection via cookie).
          </div>
        </footer>
      </body>
    </html>
  );
}
