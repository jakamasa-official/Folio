"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  LogIn,
  Building2,
  MessageSquarePlus,
  Key,
  KeyRound,
  Webhook,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  Info,
  Lightbulb,
  CircleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_URL } from "@/lib/constants";

interface LineSetupGuideProps {
  channelId: string;
  channelSecret: string;
  channelAccessToken: string;
  onChannelIdChange: (value: string) => void;
  onChannelSecretChange: (value: string) => void;
  onChannelAccessTokenChange: (value: string) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  onClose?: () => void;
}

const TOTAL_STEPS = 7;

const STEP_ICONS = [
  LogIn,
  Building2,
  MessageSquarePlus,
  Key,
  KeyRound,
  Webhook,
  CheckCircle2,
];

const STEP_TITLES = [
  "LINE Developersにログイン",
  "プロバイダーを作成",
  "Messaging APIチャネルを作成",
  "チャネルIDとシークレットをコピー",
  "チャネルアクセストークンを発行",
  "Webhook URLを設定",
  "設定完了！",
];

// --- Progress Bar ---
function StepProgressBar({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          ステップ {currentStep + 1} / {totalSteps}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[#06C755] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* Step dots */}
      <div className="flex items-center justify-between px-1">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const Icon = STEP_ICONS[i];
          return (
            <div
              key={i}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300",
                i === currentStep
                  ? "bg-[#06C755] text-white scale-110"
                  : i < currentStep
                    ? "bg-[#06C755]/20 text-[#06C755]"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {i < currentStep ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Expandable Tip ---
function TipBox({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "info" | "warning" | "tip";
}) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
    warning:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
    tip: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
  };
  const icons = {
    info: Info,
    warning: CircleAlert,
    tip: Lightbulb,
  };
  const Icon = icons[variant];

  return (
    <div
      className={cn("flex gap-2.5 rounded-lg border p-3 text-sm", styles[variant])}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="space-y-1">{children}</div>
    </div>
  );
}

// --- Learn More Collapsible ---
function LearnMore({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
        {open ? "閉じる" : "詳しく見る"}
      </button>
      {open && (
        <div className="mt-2 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

// --- Numbered Instruction ---
function InstructionList({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#06C755]/10 text-xs font-bold text-[#06C755]">
            {i + 1}
          </span>
          <span className="text-sm leading-relaxed pt-0.5">{item}</span>
        </li>
      ))}
    </ol>
  );
}

// --- Copy Button ---
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          コピー済み
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          コピー
        </>
      )}
    </Button>
  );
}

// ============================================================
// STEPS
// ============================================================

function Step1() {
  return (
    <div className="space-y-4">
      <InstructionList
        items={[
          <span key="1">
            <a
              href="https://developers.line.biz/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-[#06C755] underline hover:no-underline"
            >
              LINE Developers
              <ExternalLink className="h-3.5 w-3.5" />
            </a>{" "}
            にアクセス
          </span>,
          "LINEアカウントでログイン（お持ちでない場合は新規作成）",
          "ログイン後、コンソールが表示されます",
        ]}
      />

      <TipBox variant="info">
        <p>
          普段お使いのLINEアカウントでログインできます。ビジネス用の別アカウントは不要です。
        </p>
      </TipBox>

      <LearnMore>
        <p>
          LINE
          Developersは、LINEの公式開発者ツールです。ここでMessaging
          APIのチャネル（公式アカウント）を作成・管理できます。
        </p>
        <p>
          ログインに使用するLINEアカウントは、個人のアカウントで構いません。お客様に公開されるのはプロバイダー名とチャネル名のみです。
        </p>
      </LearnMore>
    </div>
  );
}

function Step2() {
  return (
    <div className="space-y-4">
      <InstructionList
        items={[
          <span key="1">
            コンソール画面で「<strong>プロバイダー</strong>」の横にある「
            <strong>作成</strong>」をクリック
          </span>,
          <span key="2">
            プロバイダー名に<strong>お店やサービスの名前</strong>を入力
          </span>,
          <span key="3">
            「<strong>作成</strong>」をクリック
          </span>,
        ]}
      />

      <TipBox variant="tip">
        <p>
          プロバイダー名はお客様に表示されます。お店やサービスの正式名称をおすすめします。（例：「○○サロン」「△△スタジオ」）
        </p>
      </TipBox>

      <LearnMore>
        <p>
          プロバイダーは、LINEサービスを提供する組織や個人を表します。1つのプロバイダーの中に複数のチャネル（公式アカウント）を作成できます。
        </p>
        <p>
          既にプロバイダーをお持ちの場合は、新しく作成せずに既存のプロバイダーを使用しても構いません。
        </p>
      </LearnMore>
    </div>
  );
}

function Step3() {
  return (
    <div className="space-y-4">
      <InstructionList
        items={[
          <span key="1">
            「<strong>新規チャネル作成</strong>」をクリックし、「
            <strong>Messaging API</strong>」を選択
          </span>,
          <span key="2">
            チャネル名に<strong>お店の名前</strong>を入力
          </span>,
          <span key="3">
            チャネル説明を入力（例：「○○サロンの公式アカウント」）
          </span>,
          "カテゴリとサブカテゴリを選択",
          <span key="5">
            利用規約に同意して「<strong>作成</strong>」をクリック
          </span>,
        ]}
      />

      <TipBox variant="info">
        <p>
          チャネル名がLINE公式アカウントの名前になります。お客様がLINEで検索したときに表示されます。
        </p>
      </TipBox>

      <LearnMore>
        <p>カテゴリの選択例：</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>美容サロン → 「ビューティー」→「ヘアサロン」</li>
          <li>ネイルサロン → 「ビューティー」→「ネイル」</li>
          <li>整体・マッサージ → 「ヘルス」→「リラクゼーション」</li>
          <li>
            フリーランス → 該当するカテゴリを選択、なければ「その他」
          </li>
        </ul>
        <p className="mt-2">
          メールアドレスは受信可能なものを設定してください。LINE側からの重要な通知が届きます。
        </p>
      </LearnMore>
    </div>
  );
}

function Step4({
  channelId,
  channelSecret,
  onChannelIdChange,
  onChannelSecretChange,
}: {
  channelId: string;
  channelSecret: string;
  onChannelIdChange: (v: string) => void;
  onChannelSecretChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <InstructionList
        items={[
          <span key="1">
            作成したチャネルの「<strong>チャネル基本設定</strong>
            」タブを開く
          </span>,
          <span key="2">
            「<strong>チャネルID</strong>
            」をコピーして、下のフィールドに貼り付け
          </span>,
          <span key="3">
            「<strong>チャネルシークレット</strong>
            」をコピーして、下のフィールドに貼り付け
          </span>,
        ]}
      />

      {/* Inline input fields */}
      <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
        <div className="space-y-2">
          <Label htmlFor="guide-channelId" className="text-sm font-medium">
            チャネルID
          </Label>
          <Input
            id="guide-channelId"
            type="text"
            value={channelId}
            onChange={(e) => onChannelIdChange(e.target.value)}
            placeholder="1234567890"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guide-channelSecret" className="text-sm font-medium">
            チャネルシークレット
          </Label>
          <Input
            id="guide-channelSecret"
            type="password"
            value={channelSecret}
            onChange={(e) => onChannelSecretChange(e.target.value)}
            placeholder="チャネルシークレットを貼り付け"
          />
        </div>
      </div>

      <TipBox variant="warning">
        <p>
          チャネルシークレットが表示されていない場合は、「発行」ボタンを押してください。
        </p>
      </TipBox>

      <LearnMore>
        <p>
          チャネルIDは数字のみの文字列です。チャネル基本設定ページの上部に表示されています。
        </p>
        <p>
          チャネルシークレットは英数字の文字列です。これはパスワードのようなものなので、他の人と共有しないでください。
        </p>
      </LearnMore>
    </div>
  );
}

function Step5({
  channelAccessToken,
  onChannelAccessTokenChange,
}: {
  channelAccessToken: string;
  onChannelAccessTokenChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <InstructionList
        items={[
          <span key="1">
            「<strong>Messaging API設定</strong>」タブを開く
          </span>,
          <span key="2">
            ページ下部の「
            <strong>チャネルアクセストークン（長期）</strong>」を探す
          </span>,
          <span key="3">
            「<strong>発行</strong>」をクリック
          </span>,
          "表示されたトークンをコピーして、下のフィールドに貼り付け",
        ]}
      />

      {/* Inline input field */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="space-y-2">
          <Label
            htmlFor="guide-channelAccessToken"
            className="text-sm font-medium"
          >
            チャネルアクセストークン
          </Label>
          <Input
            id="guide-channelAccessToken"
            type="password"
            value={channelAccessToken}
            onChange={(e) => onChannelAccessTokenChange(e.target.value)}
            placeholder="チャネルアクセストークンを貼り付け"
          />
        </div>
      </div>

      <TipBox variant="info">
        <p>
          アクセストークンは非常に長い文字列です。必ず全体をコピーしてください。
        </p>
      </TipBox>

      <LearnMore>
        <p>
          チャネルアクセストークンは、LINEのAPIにアクセスするための認証情報です。「発行」ボタンを押すと新しいトークンが生成されます。
        </p>
        <p>
          以前発行したトークンがある場合、再発行すると古いトークンは無効になります。
        </p>
      </LearnMore>
    </div>
  );
}

function Step6() {
  const webhookUrl = `${APP_URL}/api/line/webhook`;

  return (
    <div className="space-y-4">
      <InstructionList
        items={[
          <span key="1">
            同じ「<strong>Messaging API設定</strong>」タブで
          </span>,
          <span key="2">
            「<strong>Webhook URL</strong>」に以下のURLを入力：
          </span>,
        ]}
      />

      {/* Webhook URL copyable */}
      <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
        <code className="flex-1 break-all text-xs font-mono">
          {webhookUrl}
        </code>
        <CopyButton text={webhookUrl} />
      </div>

      <InstructionList
        items={[
          <span key="3">
            「<strong>Webhookの利用</strong>」をオンにする
          </span>,
          <span key="4">
            「<strong>検証</strong>」ボタンで接続テスト
          </span>,
        ]}
      />

      <TipBox variant="warning">
        <p>
          <strong>重要：</strong>
          応答メッセージの設定で「応答メッセージ」を<strong>オフ</strong>に、「Webhook」を
          <strong>オン</strong>にしてください。
        </p>
      </TipBox>

      <LearnMore>
        <p>
          Webhook
          URLは、お客様がLINEでメッセージを送信した際に、そのメッセージの情報が送られる先のURLです。
        </p>
        <p>
          「応答メッセージ」をオフにすると、LINE側の自動応答が無効になり、こちらのシステムで応答を制御できるようになります。
        </p>
        <p>
          「検証」ボタンを押して「成功」と表示されれば、Webhook
          URLの設定は正常です。エラーが出る場合は、URLが正しいか確認してください。
        </p>
      </LearnMore>
    </div>
  );
}

function Step7({
  channelId,
  channelSecret,
  channelAccessToken,
  onSave,
  saving,
}: {
  channelId: string;
  channelSecret: string;
  channelAccessToken: string;
  onSave: () => Promise<void>;
  saving: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const allFilled = !!(channelId && channelSecret && channelAccessToken);

  async function handleSave() {
    await onSave();
    setSaved(true);
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
        <h4 className="text-sm font-semibold">入力内容の確認</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">チャネルID</span>
            {channelId ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                入力済み
              </Badge>
            ) : (
              <Badge variant="secondary">未入力</Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              チャネルシークレット
            </span>
            {channelSecret ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                入力済み
              </Badge>
            ) : (
              <Badge variant="secondary">未入力</Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              アクセストークン
            </span>
            {channelAccessToken ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                入力済み
              </Badge>
            ) : (
              <Badge variant="secondary">未入力</Badge>
            )}
          </div>
        </div>
      </div>

      {!allFilled && (
        <TipBox variant="warning">
          <p>
            すべての項目を入力してください。前のステップに戻って入力できます。
          </p>
        </TipBox>
      )}

      {saved && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-950">
          <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-600 dark:text-green-400" />
          <p className="font-medium text-green-800 dark:text-green-200">
            設定を保存しました！
          </p>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">
            LINE公式アカウントが接続されました。
          </p>
        </div>
      )}

      {!saved && (
        <Button
          className="w-full"
          size="lg"
          onClick={handleSave}
          disabled={saving || !allFilled}
        >
          {saving ? "保存中..." : "保存して接続"}
        </Button>
      )}

      <TipBox variant="tip">
        <p>
          LINE公式アカウントのQRコードを友だち追加ページに表示して、お客様に友だち登録してもらいましょう。
        </p>
      </TipBox>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function LineSetupGuide({
  channelId,
  channelSecret,
  channelAccessToken,
  onChannelIdChange,
  onChannelSecretChange,
  onChannelAccessTokenChange,
  onSave,
  saving,
  onClose,
}: LineSetupGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  function goNext() {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function goBack() {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  const CurrentIcon = STEP_ICONS[currentStep];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">LINE Messaging API セットアップ</h2>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            閉じる
          </Button>
        )}
      </div>

      {/* Progress */}
      <StepProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      {/* Step Content */}
      <Card>
        <CardContent className="space-y-5 pt-2">
          {/* Step Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#06C755]/10">
              <CurrentIcon className="h-5 w-5 text-[#06C755]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                ステップ {currentStep + 1}
              </p>
              <h3 className="font-semibold">{STEP_TITLES[currentStep]}</h3>
            </div>
          </div>

          {/* Step Body */}
          {currentStep === 0 && <Step1 />}
          {currentStep === 1 && <Step2 />}
          {currentStep === 2 && <Step3 />}
          {currentStep === 3 && (
            <Step4
              channelId={channelId}
              channelSecret={channelSecret}
              onChannelIdChange={onChannelIdChange}
              onChannelSecretChange={onChannelSecretChange}
            />
          )}
          {currentStep === 4 && (
            <Step5
              channelAccessToken={channelAccessToken}
              onChannelAccessTokenChange={onChannelAccessTokenChange}
            />
          )}
          {currentStep === 5 && <Step6 />}
          {currentStep === 6 && (
            <Step7
              channelId={channelId}
              channelSecret={channelSecret}
              channelAccessToken={channelAccessToken}
              onSave={onSave}
              saving={saving}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              onClick={goBack}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              戻る
            </Button>

            {currentStep < TOTAL_STEPS - 1 && (
              <Button onClick={goNext} className="gap-1">
                次へ
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {currentStep === TOTAL_STEPS - 1 && onClose && (
              <Button
                variant="outline"
                onClick={onClose}
                disabled={!(channelId && channelSecret && channelAccessToken)}
              >
                完了して閉じる
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
