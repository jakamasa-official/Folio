import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Folioを作った理由。個人事業主やフリーランスのために、ひとつのツールですべてをまとめたかった。",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ホーム
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">無料で始める</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-2xl px-4 pt-20 pb-12 md:pt-28 md:pb-16">
        <p className="text-sm font-medium text-muted-foreground">
          About {APP_NAME}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          ひとりでやるのは大変だ。
          <br />
          だから、ひとつにまとめた。
        </h1>
      </section>

      {/* Japanese version */}
      <section className="mx-auto max-w-2xl px-4 pb-16">
        <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
          <p>
            サロンオーナー、フリーランス、講師、小さなお店。
            ひとりでビジネスを回している人は、やることが多すぎます。
          </p>
          <p>
            予約管理はこのアプリ、メールはあのサービス、
            SNSはまた別のツール、口コミはさらに別の場所。
            気づけば5つも6つもツールを使い分けて、
            本当にやりたい仕事に集中できなくなっている。
            毎月の料金もバカにならない。
          </p>
          <p>
            {APP_NAME}は、その問題を解決するために作りました。
            プロフィールページ、デジタル名刺、アナリティクス、予約、レビュー管理。
            ぜんぶひとつにまとめて、しかも無料で始められる。
            個人事業主のための、個人事業主が作ったツールです。
          </p>
          <p>
            大企業向けの複雑な機能はありません。
            必要なものだけを、シンプルに。日本語でも英語でも使えます。
            ひとりで頑張っている人が、もっとラクに、
            もっと自分の仕事に集中できるように。
            それが{APP_NAME}を作り続ける理由です。
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-2xl px-4">
        <div className="border-t" />
      </div>

      {/* English version */}
      <section className="mx-auto max-w-2xl px-4 pt-16 pb-16">
        <p className="text-sm font-medium text-muted-foreground">In English</p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          Too many tools. Not enough time.
        </h2>
        <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground">
          <p>
            If you run a small business by yourself, you know the feeling.
            One app for bookings, another for email, another for social media,
            yet another for reviews. Before you know it, you're paying for six
            different tools and spending more time managing them than doing
            actual work.
          </p>
          <p>
            I built {APP_NAME} because I lived this problem.
            Profile page, digital business card, analytics, bookings, review
            management, all in one place. Free to start, simple to use,
            designed for one-person businesses, not enterprise teams.
          </p>
          <p>
            No unnecessary complexity. No features you'll never touch.
            Just the tools you actually need, in Japanese and English,
            so you can get back to doing what you love.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-xl font-bold sm:text-2xl">
            まずは無料で試してみませんか？
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            クレジットカード不要。10分で完成します。
          </p>
          <Link href="/signup">
            <Button size="lg" className="mt-6 gap-2">
              無料でページを作る
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              プライバシーポリシー
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/terms" className="hover:text-foreground">
              利用規約
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/tokushoho" className="hover:text-foreground">
              特定商取引法
            </Link>
          </div>
          <p className="mt-3">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
