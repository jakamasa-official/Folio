import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
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
  title: {
    default: "Folio - あなたのビジネスをオンラインに",
    template: "%s | Folio",
  },
  description:
    "プロフィールページ、デジタル名刺、アナリティクス。10分で、ひとつのツールで、無料で始められます。",
  keywords: [
    "プロフィールページ",
    "デジタル名刺",
    "フリーランス",
    "ポートフォリオ",
    "リンクまとめ",
    "Folio",
  ],
  openGraph: {
    title: "Folio - あなたのビジネスをオンラインに",
    description:
      "プロフィールページ、デジタル名刺、アナリティクス。10分で、ひとつのツールで。",
    type: "website",
    locale: "ja_JP",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
