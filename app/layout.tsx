import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { prisma } from "../src/db";
import { CookieBanner } from "../components/cookie-banner";
import { SiteFooter, SiteHeader } from "../components/site-chrome";
import "./globals.css";

const sans = Outfit({ subsets: ["latin"], variable: "--font-sans" });
const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif" });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Curlden",
  description: "Comfort for dogs and cats, shipped from the United States.",
  icons: { icon: "/favicon-curlden.png", apple: "/favicon-curlden.png" },
};

async function settings() {
  return prisma.setting.findUnique({ where: { id: 1 } });
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const setting = await settings();
  const name = "Curlden";
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable}`}>
        <SiteHeader name={name} />
        {children}
        <SiteFooter name={name} address={setting?.address || ""} />
        <CookieBanner />
      </body>
    </html>
  );
}
