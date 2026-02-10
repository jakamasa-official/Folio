import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import {
  ArrowRight,
  Smartphone,
  BarChart3,
  Link2,
  Palette,
  Zap,
  Shield,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/wallpaper">
              <Button variant="ghost" size="sm">
                壁紙名刺
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                ログイン
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">
                無料で始める
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          あなたのビジネスを
          <br />
          <span className="text-primary">オンラインに。</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          プロフィールページ、デジタル名刺、アナリティクス。
          <br />
          10分で、ひとつのツールで、無料で始められます。
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              無料でページを作る
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/wallpaper">
            <Button size="lg" variant="outline" className="gap-2">
              <Smartphone className="h-4 w-4" />
              壁紙名刺を作る
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          クレジットカード不要 ・ 無料プランあり
        </p>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold">
            必要なものが、すべてここに
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            フリーランサー、小規模ビジネス、クリエイター。
            あなたのオンラインプレゼンスに必要なツールを一つにまとめました。
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Link2 className="h-6 w-6" />}
              title="プロフィールページ"
              description="プロフェッショナルなページを数分で作成。リンク、SNS、連絡先をまとめて共有。"
            />
            <FeatureCard
              icon={<Smartphone className="h-6 w-6" />}
              title="壁紙名刺"
              description="スマホのロック画面がデジタル名刺に。QRコードで簡単に情報を共有。"
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="アナリティクス"
              description="誰がページを見ているか把握。ページビュー、リファラー、デバイス情報を確認。"
            />
            <FeatureCard
              icon={<Palette className="h-6 w-6" />}
              title="テンプレート"
              description="4種類のプロフェッショナルテンプレートから選択。あなたのブランドに合わせてカスタマイズ。"
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="10分で完成"
              description="複雑な設定は不要。情報を入力するだけで、すぐにページが完成します。"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="無料で始められる"
              description="基本機能はすべて無料。カスタムドメインや高度な機能は月額¥2,000から。"
            />
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold">
            こんな方におすすめ
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <UseCaseCard
              title="フリーランサー"
              items={[
                "ポートフォリオとして共有",
                "クライアントへの自己紹介",
                "SNSとサービスをまとめる",
              ]}
            />
            <UseCaseCard
              title="小規模ビジネス"
              items={[
                "営業時間・場所を掲載",
                "メニューやサービス一覧",
                "Google口コミへ誘導",
              ]}
            />
            <UseCaseCard
              title="クリエイター"
              items={[
                "SNSリンクをまとめる",
                "作品やプロジェクトを紹介",
                "ファンとつながる",
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-2xl font-bold">
            今すぐ、あなたのページを作りましょう
          </h2>
          <p className="mt-3 opacity-90">
            無料で始められます。クレジットカードは不要です。
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              variant="secondary"
              className="mt-6 gap-2"
            >
              無料で始める
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
          <p className="mt-3">&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-6">
      <div className="mb-3 text-primary">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function UseCaseCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border p-6">
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 text-primary">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
