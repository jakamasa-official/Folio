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
import { useTranslation } from "@/lib/i18n/client";

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

// --- Progress Bar ---
function StepProgressBar({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const { t } = useTranslation();
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {t("stepOf", { current: String(currentStep + 1), total: String(totalSteps) })}
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
  const { t } = useTranslation();
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
        {open ? t("learnMoreClose") : t("learnMoreOpen")}
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
  const { t } = useTranslation();
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
          {t("copiedButton")}
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {t("copyButton")}
        </>
      )}
    </Button>
  );
}

// ============================================================
// STEPS
// ============================================================

function Step1() {
  const { t } = useTranslation();

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
            {t("step1Instruction1")}
          </span>,
          t("step1Instruction2"),
          t("step1Instruction3"),
        ]}
      />

      <TipBox variant="info">
        <p>
          {t("step1Tip")}
        </p>
      </TipBox>

      <LearnMore>
        <p>
          {t("step1LearnMore1")}
        </p>
        <p>
          {t("step1LearnMore2")}
        </p>
      </LearnMore>
    </div>
  );
}

function Step2() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <InstructionList
        items={[
          <span key="1">
            コンソール画面で「<strong>{t("step2Instruction1Provider")}</strong>」の横にある「
            <strong>{t("step2Instruction1Create")}</strong>」をクリック
          </span>,
          <span key="2">
            プロバイダー名に<strong>{t("step2Instruction2")}</strong>を入力
          </span>,
          <span key="3">
            「<strong>{t("step2Instruction3Create")}</strong>」をクリック
          </span>,
        ]}
      />

      <TipBox variant="tip">
        <p>
          {t("step2Tip")}
        </p>
      </TipBox>

      <LearnMore>
        <p>
          {t("step2LearnMore1")}
        </p>
        <p>
          {t("step2LearnMore2")}
        </p>
      </LearnMore>
    </div>
  );
}

function Step3() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <InstructionList
        items={[
          <span key="1">
            「<strong>{t("step3Instruction1Prefix")}</strong>」をクリックし、「
            <strong>{t("step3Instruction1")}</strong>」を選択
          </span>,
          <span key="2">
            チャネル名に<strong>{t("step3Instruction2")}</strong>を入力
          </span>,
          t("step3Instruction3"),
          t("step3Instruction4"),
          <span key="5">
            利用規約に同意して「<strong>{t("step3Instruction5Create")}</strong>」をクリック
          </span>,
        ]}
      />

      <TipBox variant="info">
        <p>
          {t("step3Tip")}
        </p>
      </TipBox>

      <LearnMore>
        <p>{t("step3LearnMoreCategoryTitle")}</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>{t("step3LearnMoreCat1")}</li>
          <li>{t("step3LearnMoreCat2")}</li>
          <li>{t("step3LearnMoreCat3")}</li>
          <li>{t("step3LearnMoreCat4")}</li>
        </ul>
        <p className="mt-2">
          {t("step3LearnMoreEmailNote")}
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
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <InstructionList
        items={[
          <span key="1">
            作成したチャネルの「<strong>{t("step4Instruction1")}</strong>
            」タブを開く
          </span>,
          <span key="2">
            「<strong>{t("step4Instruction2")}</strong>
            」をコピーして、下のフィールドに貼り付け
          </span>,
          <span key="3">
            「<strong>{t("step4Instruction3")}</strong>
            」をコピーして、下のフィールドに貼り付け
          </span>,
        ]}
      />

      {/* Inline input fields */}
      <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
        <div className="space-y-2">
          <Label htmlFor="guide-channelId" className="text-sm font-medium">
            {t("step4ChannelIdLabel")}
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
            {t("step4ChannelSecretLabel")}
          </Label>
          <Input
            id="guide-channelSecret"
            type="password"
            value={channelSecret}
            onChange={(e) => onChannelSecretChange(e.target.value)}
            placeholder={t("step4ChannelSecretPlaceholder")}
          />
        </div>
      </div>

      <TipBox variant="warning">
        <p>
          {t("step4Warning")}
        </p>
      </TipBox>

      <LearnMore>
        <p>
          {t("step4LearnMore1")}
        </p>
        <p>
          {t("step4LearnMore2")}
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
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <InstructionList
        items={[
          <span key="1">
            「<strong>{t("step5Instruction1")}</strong>」タブを開く
          </span>,
          <span key="2">
            ページ下部の「
            <strong>{t("step5Instruction2")}</strong>」を探す
          </span>,
          <span key="3">
            「<strong>{t("step5Instruction3Issue")}</strong>」をクリック
          </span>,
          t("step5Instruction4"),
        ]}
      />

      {/* Inline input field */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="space-y-2">
          <Label
            htmlFor="guide-channelAccessToken"
            className="text-sm font-medium"
          >
            {t("step5TokenLabel")}
          </Label>
          <Input
            id="guide-channelAccessToken"
            type="password"
            value={channelAccessToken}
            onChange={(e) => onChannelAccessTokenChange(e.target.value)}
            placeholder={t("step5TokenPlaceholder")}
          />
        </div>
      </div>

      <TipBox variant="info">
        <p>
          {t("step5Tip")}
        </p>
      </TipBox>

      <LearnMore>
        <p>
          {t("step5LearnMore1")}
        </p>
        <p>
          {t("step5LearnMore2")}
        </p>
      </LearnMore>
    </div>
  );
}

function Step6() {
  const { t } = useTranslation();
  const webhookUrl = `${APP_URL}/api/line/webhook`;

  return (
    <div className="space-y-4">
      <InstructionList
        items={[
          <span key="1">
            同じ「<strong>{t("step6Instruction1")}</strong>」タブで
          </span>,
          <span key="2">
            「<strong>{t("step6Instruction2")}</strong>」に以下のURLを入力：
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
            「<strong>{t("step6Instruction3")}</strong>」をオンにする
          </span>,
          <span key="4">
            「<strong>{t("step6Instruction4")}</strong>」ボタンで接続テスト
          </span>,
        ]}
      />

      <TipBox variant="warning">
        <p>
          <strong>{t("step6WarningImportant")}</strong>
          {t("step6Warning")}
        </p>
      </TipBox>

      <LearnMore>
        <p>
          {t("step6LearnMore1")}
        </p>
        <p>
          {t("step6LearnMore2")}
        </p>
        <p>
          {t("step6LearnMore3")}
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
  const { t } = useTranslation();
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
        <h4 className="text-sm font-semibold">{t("inputConfirmation")}</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("channelIdStatus")}</span>
            {channelId ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                {t("entered")}
              </Badge>
            ) : (
              <Badge variant="secondary">{t("notEntered")}</Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t("channelSecretStatus")}
            </span>
            {channelSecret ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                {t("entered")}
              </Badge>
            ) : (
              <Badge variant="secondary">{t("notEntered")}</Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t("accessTokenStatus")}
            </span>
            {channelAccessToken ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                {t("entered")}
              </Badge>
            ) : (
              <Badge variant="secondary">{t("notEntered")}</Badge>
            )}
          </div>
        </div>
      </div>

      {!allFilled && (
        <TipBox variant="warning">
          <p>
            {t("fillAllFields")}
          </p>
        </TipBox>
      )}

      {saved && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-950">
          <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-600 dark:text-green-400" />
          <p className="font-medium text-green-800 dark:text-green-200">
            {t("settingsSaved")}
          </p>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">
            {t("lineAccountConnected")}
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
          {saving ? t("saving") : t("saveAndConnect")}
        </Button>
      )}

      <TipBox variant="tip">
        <p>
          {t("step7Tip")}
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
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const STEP_TITLES = [
    t("stepTitle1"),
    t("stepTitle2"),
    t("stepTitle3"),
    t("stepTitle4"),
    t("stepTitle5"),
    t("stepTitle6"),
    t("stepTitle7"),
  ];

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
        <h2 className="text-lg font-bold">{t("lineSetupTitle")}</h2>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t("close")}
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
                {t("step", { num: String(currentStep + 1) })}
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
              {t("back")}
            </Button>

            {currentStep < TOTAL_STEPS - 1 && (
              <Button onClick={goNext} className="gap-1">
                {t("next")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {currentStep === TOTAL_STEPS - 1 && onClose && (
              <Button
                variant="outline"
                onClick={onClose}
                disabled={!(channelId && channelSecret && channelAccessToken)}
              >
                {t("doneAndClose")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
