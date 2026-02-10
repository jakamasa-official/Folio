"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { APP_NAME, APP_URL } from "@/lib/constants";
import { PHONE_DIMENSIONS } from "@/lib/types";
import { Download, Smartphone, ArrowLeft } from "lucide-react";

interface StyleItem {
  id: string;
  label: string;
  preview: string;
}

interface StyleCategory {
  name: string;
  styles: StyleItem[];
}

const WALLPAPER_STYLE_CATEGORIES: StyleCategory[] = [
  {
    name: "ベーシック",
    styles: [
      { id: "dark", label: "ダーク", preview: "bg-gray-900 text-white" },
      { id: "light", label: "ライト", preview: "bg-white text-gray-900 border" },
      { id: "gradient", label: "グラデーション", preview: "bg-gradient-to-br from-blue-600 to-purple-600 text-white" },
      { id: "minimal", label: "ミニマル", preview: "bg-stone-100 text-stone-900" },
      { id: "bold", label: "ボールド", preview: "bg-black text-yellow-400" },
    ],
  },
  {
    name: "自然",
    styles: [
      { id: "ocean", label: "オーシャン", preview: "bg-sky-800 text-sky-100" },
      { id: "sunset", label: "サンセット", preview: "bg-gradient-to-br from-orange-700 to-pink-700 text-white" },
      { id: "aurora", label: "オーロラ", preview: "bg-gradient-to-br from-teal-900 to-indigo-900 text-teal-200" },
      { id: "sakura", label: "桜", preview: "bg-pink-50 text-pink-800" },
      { id: "forest", label: "フォレスト", preview: "bg-gradient-to-br from-green-950 to-green-900 text-lime-200" },
      { id: "lavender", label: "ラベンダー", preview: "bg-purple-50 text-purple-800" },
      { id: "desert", label: "デザート", preview: "bg-amber-100 text-amber-900" },
      { id: "arctic", label: "アークティック", preview: "bg-cyan-50 text-cyan-800" },
    ],
  },
  {
    name: "アーバン",
    styles: [
      { id: "midnight", label: "ミッドナイト", preview: "bg-gradient-to-br from-[#0f0a1f] to-[#1a0a2e] text-violet-300" },
      { id: "concrete", label: "コンクリート", preview: "bg-stone-200 text-stone-900" },
      { id: "neon-city", label: "ネオンシティ", preview: "bg-black text-fuchsia-300" },
      { id: "chrome", label: "クローム", preview: "bg-gradient-to-br from-slate-300 to-slate-200 text-slate-800" },
      { id: "industrial", label: "インダストリアル", preview: "bg-stone-900 text-amber-400" },
    ],
  },
  {
    name: "レトロ・ゲーミング",
    styles: [
      { id: "pixel", label: "ピクセル", preview: "bg-black text-green-500" },
      { id: "retro-game", label: "レトロゲーム", preview: "bg-[#1a0000] text-red-400" },
      { id: "synthwave", label: "シンセウェーブ", preview: "bg-gradient-to-br from-[#0f051d] to-[#1a0730] text-fuchsia-300" },
      { id: "vaporwave", label: "ヴェイパーウェーブ", preview: "bg-gradient-to-br from-[#1a0a2e] to-slate-900 text-fuchsia-400" },
      { id: "arcade", label: "アーケード", preview: "bg-black text-yellow-400" },
      { id: "8bit", label: "8ビット", preview: "bg-indigo-950 text-green-400" },
      { id: "gameboy", label: "ゲームボーイ", preview: "bg-[#9bbc0f] text-[#0f380f]" },
      { id: "commodore", label: "コモドール", preview: "bg-[#40318d] text-[#7c85ca]" },
    ],
  },
  {
    name: "エレガント",
    styles: [
      { id: "marble", label: "マーブル", preview: "bg-stone-100 text-stone-900" },
      { id: "gold", label: "ゴールド", preview: "bg-stone-900 text-amber-100" },
      { id: "rose-gold", label: "ローズゴールド", preview: "bg-gradient-to-br from-[#4a0e2b] to-[#3b0d23] text-white" },
      { id: "platinum", label: "プラチナ", preview: "bg-slate-100 text-slate-900" },
      { id: "ivory", label: "アイボリー", preview: "bg-amber-50 text-amber-900" },
    ],
  },
  {
    name: "和風",
    styles: [
      { id: "washi", label: "和紙", preview: "bg-[#faf7f2] text-stone-900" },
      { id: "indigo", label: "藍", preview: "bg-indigo-950 text-indigo-100" },
      { id: "matcha", label: "抹茶", preview: "bg-green-50 text-green-900" },
      { id: "zen", label: "禅", preview: "bg-stone-50 text-stone-900" },
      { id: "ukiyo", label: "浮世", preview: "bg-gradient-to-br from-[#1a0000] to-stone-950 text-amber-100" },
    ],
  },
  {
    name: "テック",
    styles: [
      { id: "matrix", label: "マトリックス", preview: "bg-black text-green-500" },
      { id: "circuit", label: "サーキット", preview: "bg-green-950 text-emerald-400" },
      { id: "cyber", label: "サイバー", preview: "bg-gradient-to-br from-slate-950 to-stone-950 text-cyan-400" },
      { id: "hologram", label: "ホログラム", preview: "bg-gradient-to-br from-[#0f0a1f] to-slate-950 text-violet-300" },
      { id: "terminal", label: "ターミナル", preview: "bg-black text-green-400" },
    ],
  },
  {
    name: "グラデーション",
    styles: [
      { id: "fire", label: "ファイア", preview: "bg-gradient-to-br from-red-600 to-amber-500 text-white" },
      { id: "ice", label: "アイス", preview: "bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-800" },
      { id: "peach", label: "ピーチ", preview: "bg-gradient-to-br from-orange-50 to-pink-50 text-orange-900" },
      { id: "berry", label: "ベリー", preview: "bg-gradient-to-br from-purple-900 to-pink-900 text-white" },
      { id: "twilight", label: "トワイライト", preview: "bg-gradient-to-br from-indigo-950 to-purple-950 text-amber-200" },
    ],
  },
  {
    name: "ボールド・ポップ",
    styles: [
      { id: "monochrome", label: "モノクローム", preview: "bg-black text-white" },
      { id: "crimson", label: "クリムゾン", preview: "bg-red-950 text-white" },
      { id: "electric-blue", label: "エレクトリックブルー", preview: "bg-stone-950 text-sky-400" },
      { id: "neon-green", label: "ネオングリーン", preview: "bg-green-950 text-green-400" },
    ],
  },
];

// Flatten for easy lookup
const ALL_STYLES = WALLPAPER_STYLE_CATEGORIES.flatMap((cat) => cat.styles);

export default function WallpaperPage() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [style, setStyle] = useState<string>("dark");
  const [phoneModel, setPhoneModel] = useState("iphone-15");
  const [qrUrl, setQrUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  async function handleGenerate() {
    if (!name.trim()) return;
    setGenerating(true);

    try {
      const res = await fetch("/api/wallpaper/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          title: title.trim(),
          company: company.trim(),
          email: email.trim(),
          phone: phone.trim(),
          style,
          phone_model: phoneModel,
          qr_url: qrUrl.trim() || APP_URL,
        }),
      });

      if (!res.ok) throw new Error("生成に失敗しました");

      // API returns SVG — convert to PNG via Canvas for download compatibility
      const svgText = await res.text();
      const dimensions = PHONE_DIMENSIONS[phoneModel] || PHONE_DIMENSIONS["iphone-15"];
      const pngUrl = await svgToPng(svgText, dimensions.width, dimensions.height);
      setPreviewUrl(pngUrl);
    } catch (err) {
      alert("壁紙の生成に失敗しました。もう一度お試しください。");
    } finally {
      setGenerating(false);
    }
  }

  function svgToPng(svgText: string, width: number, height: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("SVG render failed")); };
      img.src = url;
    });
  }

  function handleDownload() {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `folio-card-${name.replace(/\s+/g, "-").toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {APP_NAME}に戻る
          </Link>
          <h1 className="mt-4 text-3xl font-bold">壁紙名刺ジェネレーター</h1>
          <p className="mt-2 text-muted-foreground">
            スマホのロック画面に設定できるデジタル名刺を無料で作成。
            QRコードをスキャンするだけで、あなたの情報にアクセスできます。
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">あなたの情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wp-name">名前 *</Label>
                  <Input
                    id="wp-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="山田 太郎"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wp-title">肩書き</Label>
                  <Input
                    id="wp-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="フリーランスデザイナー"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wp-company">会社名</Label>
                  <Input
                    id="wp-company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="株式会社〇〇"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wp-email">メール</Label>
                  <Input
                    id="wp-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wp-phone">電話番号</Label>
                  <Input
                    id="wp-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="090-1234-5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wp-qr">QRコードのリンク先</Label>
                  <Input
                    id="wp-qr"
                    type="url"
                    value={qrUrl}
                    onChange={(e) => setQrUrl(e.target.value)}
                    placeholder={`${APP_URL}/your-username（空欄の場合は${APP_NAME}のトップページ）`}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Style selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">スタイル</CardTitle>
                <CardDescription>{ALL_STYLES.length}種類のデザインから選択</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[480px] overflow-y-auto pr-1 space-y-4">
                  {WALLPAPER_STYLE_CATEGORIES.map((category) => (
                    <div key={category.name}>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {category.name}
                      </h3>
                      <div className="grid grid-cols-5 gap-1.5">
                        {category.styles.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setStyle(s.id)}
                            className={`flex flex-col items-center gap-0.5 rounded-lg p-1.5 transition-all hover:bg-muted/50 ${
                              style === s.id ? "ring-2 ring-primary bg-muted/30" : ""
                            }`}
                          >
                            <div className={`h-10 w-full rounded ${s.preview}`} />
                            <span className="text-[9px] leading-tight text-center truncate w-full">{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Phone model */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">端末サイズ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PHONE_DIMENSIONS).map(([key, dim]) => (
                    <button
                      key={key}
                      onClick={() => setPhoneModel(key)}
                      className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors ${
                        phoneModel === key
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <Smartphone className="h-4 w-4 shrink-0" />
                      <div>
                        <div className="font-medium">{dim.label}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {dim.width}x{dim.height}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerate}
              disabled={!name.trim() || generating}
              className="w-full"
              size="lg"
            >
              {generating ? "生成中..." : "壁紙を生成する"}
            </Button>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">プレビュー</CardTitle>
                <CardDescription>生成された壁紙がここに表示されます</CardDescription>
              </CardHeader>
              <CardContent>
                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl border shadow-lg">
                      <img
                        src={previewUrl}
                        alt="Wallpaper preview"
                        className="w-full"
                        style={{ maxHeight: "500px", objectFit: "contain" }}
                      />
                    </div>
                    <Button onClick={handleDownload} className="w-full" size="lg">
                      <Download className="mr-2 h-4 w-4" />
                      ダウンロード
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      ダウンロードした画像をスマホのロック画面に設定してください
                    </p>
                  </div>
                ) : (
                  <div className="flex aspect-[9/19] items-center justify-center rounded-2xl border-2 border-dashed bg-muted/30">
                    <div className="text-center text-sm text-muted-foreground">
                      <Smartphone className="mx-auto mb-2 h-8 w-8" />
                      情報を入力して
                      <br />
                      「壁紙を生成する」を
                      <br />
                      クリックしてください
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-primary/5">
              <CardContent className="pt-6 text-center">
                <p className="text-sm font-medium">
                  もっと機能が必要ですか？
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  無料でプロフィールページを作成して、壁紙のQRコードからリンクしましょう
                </p>
                <Link href="/signup">
                  <Button variant="outline" size="sm" className="mt-3">
                    無料で始める
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
