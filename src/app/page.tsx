import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  Smartphone,
  BarChart3,
  Link2,
  Palette,
  Zap,
  Shield,
  User,
  ExternalLink,
  MapPin,
  Mail,
  QrCode,
  CheckCircle2,
  LayoutDashboard,
} from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;
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
            <Link href="/about">
              <Button variant="ghost" size="sm">
                About
              </Button>
            </Link>
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="sm" className="gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  ダッシュボード
                </Button>
              </Link>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero — show don't tell */}
      <section className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Left: Copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              登録から公開まで10分
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              名刺交換の代わりに、
              <br />
              <span className="text-primary">ページを見せる。</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              自己紹介・SNS・連絡先・営業時間をひとつのページにまとめて、
              URLひとつで共有。フリーランス・個人事業主・小さなお店のための
              プロフィールページを<strong className="text-foreground">無料で</strong>作れます。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  {isLoggedIn ? "ダッシュボードへ" : "無料でページを作る"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/wallpaper">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  <Smartphone className="h-4 w-4" />
                  壁紙名刺を試す
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              クレジットカード不要 ・ ずっと無料で使えます
            </p>
          </div>

          {/* Right: Visual mockup of a profile page */}
          <div className="relative mx-auto w-full max-w-xs">
            <div className="rounded-2xl border-2 bg-white p-6 shadow-2xl">
              {/* Mock profile */}
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-pink-400 text-xl font-bold text-white">
                  Y
                </div>
                <h3 className="mt-3 text-lg font-bold text-gray-900">山田 太郎</h3>
                <p className="text-xs text-gray-500">フリーランスデザイナー</p>
                <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                  UI/UXデザインとブランディングが得意です。お気軽にご相談ください。
                </p>
                <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-400">
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-2.5 w-2.5" />
                    東京
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Mail className="h-2.5 w-2.5" />
                    hello@example.com
                  </span>
                </div>
              </div>
              {/* Mock links */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-gray-900 px-4 py-2.5 text-xs font-medium text-white">
                  <span>ポートフォリオ</span>
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-900 px-4 py-2.5 text-xs font-medium text-white">
                  <span>お問い合わせ</span>
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-900 px-4 py-2.5 text-xs font-medium text-white">
                  <span>料金プラン</span>
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </div>
              </div>
              {/* Mock social */}
              <div className="mt-3 flex justify-center gap-2">
                {["X", "IG", "LI"].map((s) => (
                  <div key={s} className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[9px] font-medium text-gray-500">
                    {s}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-[9px] text-gray-300">
                Powered by {APP_NAME}
              </p>
            </div>
            {/* Decorative elements */}
            <div className="absolute -right-4 -top-4 rounded-lg border bg-white px-3 py-2 shadow-lg">
              <div className="flex items-center gap-1.5 text-xs">
                <QrCode className="h-4 w-4 text-primary" />
                <span className="font-medium">QRコード付き</span>
              </div>
            </div>
            <div className="absolute -bottom-3 -left-4 rounded-lg border bg-white px-3 py-2 shadow-lg">
              <div className="flex items-center gap-1.5 text-xs">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="font-medium">閲覧数が見える</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — 3 steps */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold">
            3ステップで完成
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
            ウェブサイトを作る知識は不要。情報を入力するだけ。
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <StepCard
              number="1"
              title="無料で登録"
              description="メールアドレスとパスワードだけ。30秒で完了します。"
            />
            <StepCard
              number="2"
              title="情報を入力"
              description="名前、肩書き、SNS、リンクを入力。テンプレートを選ぶだけ。"
            />
            <StepCard
              number="3"
              title="URLを共有"
              description="folio.jp/あなたの名前 — メール署名、SNSプロフィール、名刺に貼るだけ。"
            />
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold">
            これだけ揃って、無料
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Link2 className="h-6 w-6" />}
              title="プロフィールページ"
              description="名前・肩書き・自己紹介・リンク・SNS・連絡先をひとつのページに。4種類のテンプレートから選べます。"
            />
            <FeatureCard
              icon={<Smartphone className="h-6 w-6" />}
              title="壁紙名刺"
              description="スマホのロック画面が名刺に。QRコードをスキャンするだけであなたの情報にアクセス。紙の名刺はもういらない。"
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="アナリティクス"
              description="誰がいつページを見たか一目でわかる。30日間のページビューをグラフで確認。"
            />
            <FeatureCard
              icon={<QrCode className="h-6 w-6" />}
              title="QRコード"
              description="プロフィールページ専用のQRコードを自動生成。印刷物やスライドにそのまま使えます。"
            />
            <FeatureCard
              icon={<Palette className="h-6 w-6" />}
              title="4つのテンプレート"
              description="プロフェッショナル、ミニマル、ビジネス、クリエイティブ。あなたの雰囲気に合うデザインを。"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="プライバシー重視"
              description="Cookieなし。訪問者の個人情報は収集しません。安心して使えるアナリティクス。"
            />
          </div>
        </div>
      </section>

      {/* Who is this for */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold">
            こんな方に使われています
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <UseCaseCard
              emoji="💻"
              title="フリーランス"
              description="クライアントに共有できるプロフェッショナルな自己紹介ページ"
              items={[
                "ポートフォリオとして",
                "メール署名に貼る",
                "SNSプロフィールに設定",
              ]}
            />
            <UseCaseCard
              emoji="🏪"
              title="小さなお店"
              description="営業時間・場所・メニューをまとめたミニホームページ"
              items={[
                "営業時間・アクセスを掲載",
                "メニューやサービス一覧",
                "予約リンクを設置",
              ]}
            />
            <UseCaseCard
              emoji="🎨"
              title="クリエイター"
              description="SNS・作品・活動をまとめたリンク集"
              items={[
                "全SNSをひとつにまとめる",
                "作品やプロジェクトを紹介",
                "ファンとの接点を増やす",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Wallpaper card feature highlight */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Mockup */}
            <div className="relative mx-auto w-48">
              <div className="aspect-[9/19.5] rounded-[2rem] border-4 border-gray-800 bg-gray-900 p-4 shadow-2xl">
                <div className="flex h-full flex-col items-center justify-end pb-8 text-center">
                  <div className="mb-4 h-16 w-16 rounded-lg border-2 border-white/20 bg-white/10" />
                  <p className="text-sm font-bold text-white">山田 太郎</p>
                  <p className="text-[9px] text-gray-400">デザイナー</p>
                  <p className="mt-1 text-[8px] text-gray-500">hello@example.com</p>
                  <p className="mt-3 text-[7px] text-gray-600">QRコードをスキャン</p>
                </div>
              </div>
              <div className="absolute -right-2 top-4 h-1 w-1 rounded-full bg-gray-600" />
            </div>
            {/* Copy */}
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                ロック画面が名刺になる。
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                スマホのロック画面に設定するだけで、いつでも名刺交換ができます。
                相手がQRコードをスキャンすれば、あなたのプロフィールページが開きます。
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "登録不要・完全無料で作成",
                  "5つのデザインスタイル",
                  "iPhone / Android対応",
                  "QRコードを自動生成",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/wallpaper">
                <Button size="lg" variant="outline" className="mt-8 gap-2">
                  <Smartphone className="h-4 w-4" />
                  今すぐ壁紙名刺を作る（無料）
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            まずは無料で試してみませんか？
          </h2>
          <p className="mt-3 opacity-90">
            10分であなた専用のプロフィールページが完成します。
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              variant="secondary"
              className="mt-6 gap-2"
            >
              無料でページを作る
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-3 text-sm opacity-70">
            クレジットカード不要
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-4">
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
            <span aria-hidden="true">/</span>
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

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
        {number}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function UseCaseCard({
  emoji,
  title,
  description,
  items,
}: {
  emoji: string;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border p-6">
      <div className="text-2xl">{emoji}</div>
      <h3 className="mt-2 font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
