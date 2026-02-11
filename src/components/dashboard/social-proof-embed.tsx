"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APP_URL } from "@/lib/constants";
import { Copy, Check, Code2 } from "lucide-react";

// ─── Types ──────────────────────────────────────────────

type WidgetMode = "badge" | "reviews" | "stats" | "full";

interface ModeConfig {
  key: WidgetMode;
  label: string;
  description: string;
  width: number;
  height: number;
}

const MODES: ModeConfig[] = [
  {
    key: "badge",
    label: "バッジ",
    description: "コンパクトなフローティングバッジ。評価・予約数・閲覧数をローテーション表示",
    width: 300,
    height: 60,
  },
  {
    key: "reviews",
    label: "レビュー",
    description: "レビューカルーセル。承認済みレビューを自動スクロール",
    width: 350,
    height: 200,
  },
  {
    key: "stats",
    label: "統計バー",
    description: "横一列の統計バー。評価・レビュー数・予約数を表示",
    width: 500,
    height: 50,
  },
  {
    key: "full",
    label: "フル",
    description: "総合表示。評価・最新レビュー・閲覧数を縦に配置",
    width: 350,
    height: 280,
  },
];

// ─── Component ──────────────────────────────────────────

export function SocialProofEmbed({ profileId }: { profileId: string }) {
  const [selectedMode, setSelectedMode] = useState<WidgetMode>("badge");
  const [copied, setCopied] = useState(false);

  const modeConfig = MODES.find((m) => m.key === selectedMode)!;
  const embedUrl = `${APP_URL}/embed/social-proof/${profileId}?mode=${selectedMode}`;

  const embedCode = `<iframe src="${embedUrl}" width="${modeConfig.width}" height="${modeConfig.height}" frameborder="0" style="border:none;overflow:hidden;" loading="lazy"></iframe>`;

  function handleCopy() {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Code2 className="h-4 w-4" />
          埋め込みウィジェット
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode selector */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            表示モード
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {MODES.map((mode) => (
              <button
                key={mode.key}
                type="button"
                onClick={() => setSelectedMode(mode.key)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  selectedMode === mode.key
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-background hover:bg-muted/50"
                }`}
              >
                <p className="text-sm font-medium">{mode.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                  {mode.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            プレビュー
          </p>
          <div className="overflow-hidden rounded-lg border bg-gray-50 p-4">
            <div
              className="mx-auto"
              style={{
                maxWidth: modeConfig.width,
                height: modeConfig.height,
              }}
            >
              <iframe
                src={`/embed/social-proof/${profileId}?mode=${selectedMode}`}
                width={modeConfig.width}
                height={modeConfig.height}
                frameBorder="0"
                style={{ border: "none", overflow: "hidden" }}
                title="ウィジェットプレビュー"
              />
            </div>
          </div>
        </div>

        {/* Embed code */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            埋め込みコード
          </p>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
              <code>{embedCode}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="absolute right-2 top-2 gap-1.5"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "コピー済み" : "コピー"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            このコードをあなたのウェブサイトやブログのHTMLに貼り付けてください。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
