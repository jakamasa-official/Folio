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
  Shield,
  User,
  ExternalLink,
  MapPin,
  Mail,
  QrCode,
  CheckCircle2,
  LayoutDashboard,
  Zap,
  Users,
  Star,
  MessageSquare,
  Ticket,
  CalendarCheck,
  Share2,
  TrendingUp,
  MousePointerClick,
  Globe,
  Send,
  Bot,
  Gift,
  Eye,
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
            <Link href="/pricing">
              <Button variant="ghost" size="sm">
                料金
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

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              登録から公開まで10分
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              集客・顧客管理・分析を
              <br />
              <span className="text-primary">ひとつのツールで。</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              プロフィールページ、予約管理、顧客リスト、スタンプカード、
              クーポン、口コミ管理、メール配信、アナリティクス ——
              個人事業主に必要な機能が<strong className="text-foreground">すべて揃った</strong>ビジネスツール。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  {isLoggedIn ? "ダッシュボードへ" : "無料でページを作る"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  料金プランを見る
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              クレジットカード不要 ・ 無料プランあり
            </p>
          </div>

          {/* Mock profile card */}
          <div className="relative mx-auto w-full max-w-xs">
            <div className="rounded-2xl border-2 bg-white p-6 shadow-2xl">
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

      {/* Capability overview — numbers strip */}
      <section className="border-y bg-primary/5 py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 sm:grid-cols-4">
          <NumberStat number="15+" label="搭載機能" />
          <NumberStat number="50+" label="テンプレート" />
          <NumberStat number="¥0" label="基本プラン" />
          <NumberStat number="10分" label="で公開" />
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
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
              description="名前、肩書き、SNS、リンクを入力。50以上のテンプレートからデザインを選択。"
            />
            <StepCard
              number="3"
              title="URLを共有"
              description="folio.jp/あなたの名前 — メール署名、SNSプロフィール、名刺に貼るだけ。"
            />
          </div>
        </div>
      </section>

      {/* Core features — Profile & Design */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <p className="text-sm font-medium text-primary">プロフィール</p>
            <h2 className="mt-2 text-2xl font-bold">
              あなたのビジネスを一枚のページに
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              名前・肩書き・自己紹介・リンク・SNS・連絡先・予約フォームをひとつのURLで共有。
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Link2 className="h-5 w-5" />}
              title="プロフィールページ"
              description="自己紹介・リンク・SNS・連絡先をひとつのページにまとめて共有。リッチテキスト対応。"
            />
            <FeatureCard
              icon={<Palette className="h-5 w-5" />}
              title="50以上のテンプレート"
              description="プロフェッショナル、ミニマル、クリエイティブなど多数のデザインから選べます。"
            />
            <FeatureCard
              icon={<QrCode className="h-5 w-5" />}
              title="QRコード"
              description="カラーカスタマイズ可能なQRコードを自動生成。印刷物にそのまま使えます。"
            />
            <FeatureCard
              icon={<Smartphone className="h-5 w-5" />}
              title="壁紙名刺"
              description="スマホのロック画面が名刺に。QRコードをスキャンで即アクセス。紙の名刺は不要。"
            />
            <FeatureCard
              icon={<User className="h-5 w-5" />}
              title="vCard連絡先保存"
              description="ワンタップで連絡先に追加。訪問者がすぐにあなたの情報を保存できます。"
            />
            <FeatureCard
              icon={<Share2 className="h-5 w-5" />}
              title="SNSシェアプレビュー"
              description="OGP設定で、シェア時のタイトル・説明・画像をカスタマイズ。"
            />
          </div>
        </div>
      </section>

      {/* Marketing & CRM features */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <p className="text-sm font-medium text-primary">集客・マーケティング</p>
            <h2 className="mt-2 text-2xl font-bold">
              リピーターを増やす仕組みが全部ある
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              スタンプカード、クーポン、口コミ、紹介キャンペーン。
              個人事業主のリピート集客に必要な機能をワンストップで。
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Ticket className="h-5 w-5" />}
              title="スタンプカード"
              description="デジタルスタンプカードを発行。来店ごとにスタンプを押して特典を提供。"
            />
            <FeatureCard
              icon={<Gift className="h-5 w-5" />}
              title="クーポン配布"
              description="割引クーポンを作成・配布。利用回数制限や有効期限を自由に設定。"
            />
            <FeatureCard
              icon={<Star className="h-5 w-5" />}
              title="口コミ・レビュー管理"
              description="顧客から口コミを収集し、プロフィールページに掲載。信頼性をアップ。"
            />
            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              title="紹介キャンペーン"
              description="紹介コードを発行して、口コミ紹介で新規顧客を自動獲得。"
            />
            <FeatureCard
              icon={<CalendarCheck className="h-5 w-5" />}
              title="予約フォーム"
              description="オンライン予約フォームをプロフィールに設置。予約をダッシュボードで一元管理。"
            />
            <FeatureCard
              icon={<MessageSquare className="h-5 w-5" />}
              title="お問い合わせフォーム"
              description="訪問者からの問い合わせをメールで受信。ダッシュボードからも確認可能。"
            />
          </div>
        </div>
      </section>

      {/* CRM & Automation */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <p className="text-sm font-medium text-primary">顧客管理・自動化</p>
            <h2 className="mt-2 text-2xl font-bold">
              顧客をしっかり管理、フォローアップを自動化
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              問い合わせ・予約・メルマガ登録を一つの顧客リストに自動統合。
              フォローアップメールも自動で送信。
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              title="顧客リスト（CRM）"
              description="問い合わせ・予約・購読者を自動で顧客リストに追加。セグメント分けも可能。"
            />
            <FeatureCard
              icon={<Send className="h-5 w-5" />}
              title="メール配信"
              description="テンプレートでメールを一括送信。メルマガ登録者や顧客グループに配信。"
            />
            <FeatureCard
              icon={<Bot className="h-5 w-5" />}
              title="自動フォローアップ"
              description="予約後・問い合わせ後に自動でフォローメールを送信。手動の追客を削減。"
            />
            <FeatureCard
              icon={<Mail className="h-5 w-5" />}
              title="メルマガ購読"
              description="プロフィールページにメルマガ登録フォームを設置。購読者リストを管理。"
            />
            <FeatureCard
              icon={<Globe className="h-5 w-5" />}
              title="LINE連携"
              description="LINEの友だち追加ボタンを設置。LINE公式アカウントと連携して顧客対応。"
            />
            <FeatureCard
              icon={<Shield className="h-5 w-5" />}
              title="プライバシー重視"
              description="Cookieなし。訪問者の個人情報は収集しません。安心して使えるサービス。"
            />
          </div>
        </div>
      </section>

      {/* Analytics showcase */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Analytics mockup */}
            <div className="space-y-4">
              {/* Stat cards mock */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border bg-white p-3 text-center shadow-sm">
                  <p className="text-2xl font-bold text-gray-900">248</p>
                  <p className="text-[10px] text-gray-500">今日の閲覧</p>
                </div>
                <div className="rounded-lg border bg-white p-3 text-center shadow-sm">
                  <p className="text-2xl font-bold text-gray-900">1,432</p>
                  <p className="text-[10px] text-gray-500">7日間</p>
                </div>
                <div className="rounded-lg border bg-white p-3 text-center shadow-sm">
                  <p className="text-2xl font-bold text-gray-900">4.2%</p>
                  <p className="text-[10px] text-gray-500">コンバージョン</p>
                </div>
              </div>
              {/* Chart mock */}
              <div className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-700">ページビュー推移</p>
                  <div className="flex gap-1">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">日別</span>
                    <span className="rounded px-2 py-0.5 text-[10px] text-gray-400">週別</span>
                    <span className="rounded px-2 py-0.5 text-[10px] text-gray-400">月別</span>
                  </div>
                </div>
                <div className="flex items-end gap-1" style={{ height: 80 }}>
                  {[40, 55, 35, 70, 60, 80, 65, 90, 75, 85, 95, 70, 60, 88].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-primary/70" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              {/* Breakdown mock */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-white p-3 shadow-sm">
                  <p className="mb-2 text-[10px] font-medium text-gray-700">流入元</p>
                  <div className="space-y-1.5">
                    {[
                      { label: "Instagram", pct: 42 },
                      { label: "直接アクセス", pct: 28 },
                      { label: "X (Twitter)", pct: 18 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-[9px] text-gray-600">
                          <span>{item.label}</span>
                          <span>{item.pct}%</span>
                        </div>
                        <div className="mt-0.5 h-1.5 rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-primary/60" style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border bg-white p-3 shadow-sm">
                  <p className="mb-2 text-[10px] font-medium text-gray-700">リンクのクリック数</p>
                  <div className="space-y-1.5">
                    {[
                      { label: "ポートフォリオ", count: 89 },
                      { label: "予約する", count: 54 },
                      { label: "Instagram", count: 31 },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between text-[9px] text-gray-600">
                        <span>{item.label}</span>
                        <span className="font-medium">{item.count}回</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Copy */}
            <div>
              <p className="text-sm font-medium text-primary">アナリティクス</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                誰が、どこから、何をクリックしたか。
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                ページビュー、リンクのクリック、コンバージョン率。
                日別・週別・月別のトレンドで、集客効果を数字で把握できます。
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  { icon: <Eye className="h-4 w-4" />, text: "リアルタイム閲覧数" },
                  { icon: <MousePointerClick className="h-4 w-4" />, text: "リンク別のクリック数・CTR" },
                  { icon: <TrendingUp className="h-4 w-4" />, text: "日別/週別/月別のトレンド" },
                  { icon: <Globe className="h-4 w-4" />, text: "デバイス・ブラウザ・地域の分析" },
                  { icon: <Share2 className="h-4 w-4" />, text: "流入元・UTMパラメータ追跡" },
                  { icon: <TrendingUp className="h-4 w-4" />, text: "コンバージョン率の自動計算" },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-2.5 text-sm">
                    <span className="shrink-0 text-primary">{item.icon}</span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Wallpaper card feature */}
      <section className="border-t bg-muted/30 py-20">
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
              <p className="text-sm font-medium text-primary">壁紙名刺</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                ロック画面が名刺になる。
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                スマホのロック画面に設定するだけで、いつでも名刺交換ができます。
                相手がQRコードをスキャンすれば、あなたのプロフィールページが開きます。
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "登録不要・完全無料で作成",
                  "50以上のデザインスタイル",
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

      {/* Use cases */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold">
            こんな方に使われています
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <UseCaseCard
              emoji="💻"
              title="フリーランス"
              description="クライアントへの自己紹介からリピート獲得まで"
              items={[
                "ポートフォリオとして共有",
                "問い合わせフォームで仕事を受注",
                "口コミ掲載で信頼を獲得",
                "アナリティクスで反応を確認",
              ]}
            />
            <UseCaseCard
              emoji="🏪"
              title="小さなお店"
              description="ホームページ代わりの店舗ページ + 集客"
              items={[
                "予約フォームで24時間受付",
                "スタンプカードでリピーター育成",
                "クーポンで来店促進",
                "紹介キャンペーンで新規集客",
              ]}
            />
            <UseCaseCard
              emoji="🎨"
              title="クリエイター"
              description="全SNSをまとめてファンとの接点を管理"
              items={[
                "SNS・作品をひとつにまとめる",
                "メルマガで活動報告を配信",
                "フォロワーの反応を分析",
                "LINE連携でファンとのやり取り",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-2xl font-bold">シンプルな料金プラン</h2>
          <p className="mt-3 text-muted-foreground">無料で始めて、ビジネスが成長したらアップグレード。</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <PricingTeaser
              plan="Free"
              price="¥0"
              period=""
              features={["プロフィールページ", "壁紙名刺", "基本アナリティクス", "QRコード", "お問い合わせフォーム"]}
            />
            <PricingTeaser
              plan="Pro"
              price="¥480"
              period="/月"
              highlight
              features={["50以上のテンプレート", "予約フォーム", "口コミ管理", "メール配信", "顧客リスト"]}
            />
            <PricingTeaser
              plan="Pro+"
              price="¥1,480"
              period="/月"
              features={["スタンプカード", "クーポン", "自動フォローアップ", "紹介キャンペーン", "顧客セグメント"]}
            />
          </div>
          <Link href="/pricing">
            <Button variant="outline" className="mt-8 gap-2">
              詳しくはこちら
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
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
            <Link href="/pricing" className="hover:text-foreground">
              料金
            </Link>
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
    <div className="rounded-lg border bg-background p-5">
      <div className="mb-3 text-primary">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
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
    <div className="rounded-lg border bg-background p-6">
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

function NumberStat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-primary">{number}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function PricingTeaser({
  plan,
  price,
  period,
  features,
  highlight,
}: {
  plan: string;
  price: string;
  period: string;
  features: string[];
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-6 text-left ${highlight ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-background"}`}>
      <p className="text-sm font-medium text-muted-foreground">{plan}</p>
      <p className="mt-1">
        <span className="text-3xl font-bold">{price}</span>
        <span className="text-sm text-muted-foreground">{period}</span>
      </p>
      <ul className="mt-4 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
