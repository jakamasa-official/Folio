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

const WALLPAPER_STYLES = [
  { id: "dark", label: "ダーク", preview: "bg-gray-900 text-white" },
  { id: "light", label: "ライト", preview: "bg-white text-gray-900 border" },
  { id: "gradient", label: "グラデーション", preview: "bg-gradient-to-br from-blue-600 to-purple-600 text-white" },
  { id: "minimal", label: "ミニマル", preview: "bg-stone-100 text-stone-900" },
  { id: "bold", label: "ボールド", preview: "bg-black text-yellow-400" },
] as const;

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
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {WALLPAPER_STYLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-all ${
                        style === s.id ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className={`h-12 w-full rounded ${s.preview}`} />
                      <span className="text-[10px]">{s.label}</span>
                    </button>
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
