"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { APP_NAME, APP_URL } from "@/lib/constants";
import { PHONE_DIMENSIONS } from "@/lib/types";
import { useTranslation } from "@/lib/i18n/client";
import { Download, Smartphone, ArrowLeft } from "lucide-react";

interface StyleItem {
  id: string;
  labelKey: string;
  preview: string;
}

interface StyleCategory {
  nameKey: string;
  styles: StyleItem[];
}

const WALLPAPER_STYLE_CATEGORIES: StyleCategory[] = [
  {
    nameKey: "wpCatBasic",
    styles: [
      { id: "dark", labelKey: "wpStyleDark", preview: "bg-gray-900 text-white" },
      { id: "light", labelKey: "wpStyleLight", preview: "bg-white text-gray-900 border" },
      { id: "gradient", labelKey: "wpStyleGradient", preview: "bg-gradient-to-br from-blue-600 to-purple-600 text-white" },
      { id: "minimal", labelKey: "wpStyleMinimal", preview: "bg-stone-100 text-stone-900" },
      { id: "bold", labelKey: "wpStyleBold", preview: "bg-black text-yellow-400" },
    ],
  },
  {
    nameKey: "wpCatNature",
    styles: [
      { id: "ocean", labelKey: "wpStyleOcean", preview: "bg-sky-800 text-sky-100" },
      { id: "sunset", labelKey: "wpStyleSunset", preview: "bg-gradient-to-br from-orange-700 to-pink-700 text-white" },
      { id: "aurora", labelKey: "wpStyleAurora", preview: "bg-gradient-to-br from-teal-900 to-indigo-900 text-teal-200" },
      { id: "sakura", labelKey: "wpStyleSakura", preview: "bg-pink-50 text-pink-800" },
      { id: "forest", labelKey: "wpStyleForest", preview: "bg-gradient-to-br from-green-950 to-green-900 text-lime-200" },
      { id: "lavender", labelKey: "wpStyleLavender", preview: "bg-purple-50 text-purple-800" },
      { id: "desert", labelKey: "wpStyleDesert", preview: "bg-amber-100 text-amber-900" },
      { id: "arctic", labelKey: "wpStyleArctic", preview: "bg-cyan-50 text-cyan-800" },
    ],
  },
  {
    nameKey: "wpCatUrban",
    styles: [
      { id: "midnight", labelKey: "wpStyleMidnight", preview: "bg-gradient-to-br from-[#0f0a1f] to-[#1a0a2e] text-violet-300" },
      { id: "concrete", labelKey: "wpStyleConcrete", preview: "bg-stone-200 text-stone-900" },
      { id: "neon-city", labelKey: "wpStyleNeonCity", preview: "bg-black text-fuchsia-300" },
      { id: "chrome", labelKey: "wpStyleChrome", preview: "bg-gradient-to-br from-slate-300 to-slate-200 text-slate-800" },
      { id: "industrial", labelKey: "wpStyleIndustrial", preview: "bg-stone-900 text-amber-400" },
    ],
  },
  {
    nameKey: "wpCatRetro",
    styles: [
      { id: "pixel", labelKey: "wpStylePixel", preview: "bg-black text-green-500" },
      { id: "retro-game", labelKey: "wpStyleRetroGame", preview: "bg-[#1a0000] text-red-400" },
      { id: "synthwave", labelKey: "wpStyleSynthwave", preview: "bg-gradient-to-br from-[#0f051d] to-[#1a0730] text-fuchsia-300" },
      { id: "vaporwave", labelKey: "wpStyleVaporwave", preview: "bg-gradient-to-br from-[#1a0a2e] to-slate-900 text-fuchsia-400" },
      { id: "arcade", labelKey: "wpStyleArcade", preview: "bg-black text-yellow-400" },
      { id: "8bit", labelKey: "wpStyle8bit", preview: "bg-indigo-950 text-green-400" },
      { id: "gameboy", labelKey: "wpStyleGameboy", preview: "bg-[#9bbc0f] text-[#0f380f]" },
      { id: "commodore", labelKey: "wpStyleCommodore", preview: "bg-[#40318d] text-[#7c85ca]" },
    ],
  },
  {
    nameKey: "wpCatElegant",
    styles: [
      { id: "marble", labelKey: "wpStyleMarble", preview: "bg-stone-100 text-stone-900" },
      { id: "gold", labelKey: "wpStyleGold", preview: "bg-stone-900 text-amber-100" },
      { id: "rose-gold", labelKey: "wpStyleRoseGold", preview: "bg-gradient-to-br from-[#4a0e2b] to-[#3b0d23] text-white" },
      { id: "platinum", labelKey: "wpStylePlatinum", preview: "bg-slate-100 text-slate-900" },
      { id: "ivory", labelKey: "wpStyleIvory", preview: "bg-amber-50 text-amber-900" },
    ],
  },
  {
    nameKey: "wpCatJapanese",
    styles: [
      { id: "washi", labelKey: "wpStyleWashi", preview: "bg-[#faf7f2] text-stone-900" },
      { id: "indigo", labelKey: "wpStyleIndigo", preview: "bg-indigo-950 text-indigo-100" },
      { id: "matcha", labelKey: "wpStyleMatcha", preview: "bg-green-50 text-green-900" },
      { id: "zen", labelKey: "wpStyleZen", preview: "bg-stone-50 text-stone-900" },
      { id: "ukiyo", labelKey: "wpStyleUkiyo", preview: "bg-gradient-to-br from-[#1a0000] to-stone-950 text-amber-100" },
    ],
  },
  {
    nameKey: "wpCatTech",
    styles: [
      { id: "matrix", labelKey: "wpStyleMatrix", preview: "bg-black text-green-500" },
      { id: "circuit", labelKey: "wpStyleCircuit", preview: "bg-green-950 text-emerald-400" },
      { id: "cyber", labelKey: "wpStyleCyber", preview: "bg-gradient-to-br from-slate-950 to-stone-950 text-cyan-400" },
      { id: "hologram", labelKey: "wpStyleHologram", preview: "bg-gradient-to-br from-[#0f0a1f] to-slate-950 text-violet-300" },
      { id: "terminal", labelKey: "wpStyleTerminal", preview: "bg-black text-green-400" },
    ],
  },
  {
    nameKey: "wpCatGradient",
    styles: [
      { id: "fire", labelKey: "wpStyleFire", preview: "bg-gradient-to-br from-red-600 to-amber-500 text-white" },
      { id: "ice", labelKey: "wpStyleIce", preview: "bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-800" },
      { id: "peach", labelKey: "wpStylePeach", preview: "bg-gradient-to-br from-orange-50 to-pink-50 text-orange-900" },
      { id: "berry", labelKey: "wpStyleBerry", preview: "bg-gradient-to-br from-purple-900 to-pink-900 text-white" },
      { id: "twilight", labelKey: "wpStyleTwilight", preview: "bg-gradient-to-br from-indigo-950 to-purple-950 text-amber-200" },
    ],
  },
  {
    nameKey: "wpCatBoldPop",
    styles: [
      { id: "monochrome", labelKey: "wpStyleMonochrome", preview: "bg-black text-white" },
      { id: "crimson", labelKey: "wpStyleCrimson", preview: "bg-red-950 text-white" },
      { id: "electric-blue", labelKey: "wpStyleElectricBlue", preview: "bg-stone-950 text-sky-400" },
      { id: "neon-green", labelKey: "wpStyleNeonGreen", preview: "bg-green-950 text-green-400" },
    ],
  },
];

// Flatten for easy lookup
const ALL_STYLES = WALLPAPER_STYLE_CATEGORIES.flatMap((cat) => cat.styles);

export default function WallpaperClient() {
  const { t } = useTranslation();
  const router = useRouter();
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

      if (!res.ok) throw new Error("generation failed");

      // API returns SVG — convert to PNG via Canvas for download compatibility
      const svgText = await res.text();
      const dimensions = PHONE_DIMENSIONS[phoneModel] || PHONE_DIMENSIONS["iphone-15"];
      const pngUrl = await svgToPng(svgText, dimensions.width, dimensions.height);
      setPreviewUrl(pngUrl);
    } catch (err) {
      alert(t("wpErrorGenerate"));
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
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("wpBack")}
          </button>
          <h1 className="mt-4 text-3xl font-bold">{t("wpTitle")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("wpDescription")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("wpFormTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wp-name">{t("wpLabelName")}</Label>
                  <Input
                    id="wp-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("wpPlaceholderName")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wp-title">{t("wpLabelTitle")}</Label>
                  <Input
                    id="wp-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("wpPlaceholderTitle")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wp-company">{t("wpLabelCompany")}</Label>
                  <Input
                    id="wp-company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder={t("wpPlaceholderCompany")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wp-email">{t("wpLabelEmail")}</Label>
                  <Input
                    id="wp-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wp-phone">{t("wpLabelPhone")}</Label>
                  <Input
                    id="wp-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("wpPlaceholderPhone")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wp-qr">{t("wpLabelQrUrl")}</Label>
                  <Input
                    id="wp-qr"
                    type="url"
                    value={qrUrl}
                    onChange={(e) => setQrUrl(e.target.value)}
                    placeholder={t("wpPlaceholderQrUrl", { appUrl: APP_URL, appName: APP_NAME })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Style selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("wpStyleTitle")}</CardTitle>
                <CardDescription>{t("wpStyleCount", { count: String(ALL_STYLES.length) })}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[480px] overflow-y-auto pr-1 space-y-4">
                  {WALLPAPER_STYLE_CATEGORIES.map((category) => (
                    <div key={category.nameKey}>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t(category.nameKey)}
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
                            <span className="text-[9px] leading-tight text-center truncate w-full">{t(s.labelKey)}</span>
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
                <CardTitle className="text-lg">{t("wpPhoneModelTitle")}</CardTitle>
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
              {generating ? t("wpGenerating") : t("wpGenerate")}
            </Button>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("wpPreviewTitle")}</CardTitle>
                <CardDescription>{t("wpPreviewDescription")}</CardDescription>
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
                      {t("wpDownload")}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      {t("wpDownloadHint")}
                    </p>
                  </div>
                ) : (
                  <div className="flex aspect-[9/19] items-center justify-center rounded-2xl border-2 border-dashed bg-muted/30">
                    <div className="text-center text-sm text-muted-foreground">
                      <Smartphone className="mx-auto mb-2 h-8 w-8" />
                      {t("wpEmptyPreviewLine1")}
                      <br />
                      {t("wpEmptyPreviewLine2")}
                      <br />
                      {t("wpEmptyPreviewLine3")}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-primary/5">
              <CardContent className="pt-6 text-center">
                <p className="text-sm font-medium">
                  {t("wpCtaTitle")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("wpCtaDescription")}
                </p>
                <Link href="/signup">
                  <Button variant="outline" size="sm" className="mt-3">
                    {t("wpCtaButton")}
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
