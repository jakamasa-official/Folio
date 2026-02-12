"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";

const TOUR_COMPLETED_KEY = "folio-tour-completed";

export interface TourStep {
  targetSelector: string; // data-tour-id value
  titleKey: string;
  bodyKey: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetSelector: "nav-mypage",
    titleKey: "tour.mypageTitle",
    bodyKey: "tour.mypageBody",
  },
  {
    targetSelector: "nav-analytics",
    titleKey: "tour.analyticsTitle",
    bodyKey: "tour.analyticsBody",
  },
  {
    targetSelector: "nav-inbox",
    titleKey: "tour.inboxTitle",
    bodyKey: "tour.inboxBody",
  },
  {
    targetSelector: "nav-bookings",
    titleKey: "tour.bookingsTitle",
    bodyKey: "tour.bookingsBody",
  },
  {
    targetSelector: "nav-customers",
    titleKey: "tour.customersTitle",
    bodyKey: "tour.customersBody",
  },
  {
    targetSelector: "marketing-section",
    titleKey: "tour.marketingTitle",
    bodyKey: "tour.marketingBody",
  },
  {
    targetSelector: "nav-settings",
    titleKey: "tour.settingsTitle",
    bodyKey: "tour.settingsBody",
  },
  {
    targetSelector: "nav-view-page",
    titleKey: "tour.viewPageTitle",
    bodyKey: "tour.viewPageBody",
  },
];

interface TooltipPosition {
  top: number;
  left: number;
  arrowSide: "left" | "right" | "top" | "bottom";
}

function getTooltipPosition(
  targetRect: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number
): TooltipPosition {
  const viewportWidth = window.innerWidth;
  const padding = 12;

  // Default: place tooltip to the right of the target
  let top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
  let left = targetRect.right + padding;
  let arrowSide: TooltipPosition["arrowSide"] = "left";

  // If overflows right, place to the left
  if (left + tooltipWidth > viewportWidth - padding) {
    left = targetRect.left - tooltipWidth - padding;
    arrowSide = "right";
  }

  // If overflows left (mobile), place below
  if (left < padding) {
    left = Math.max(padding, targetRect.left);
    top = targetRect.bottom + padding;
    arrowSide = "top";
  }

  // Clamp top to viewport
  top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

  return { top, left, arrowSide };
}

function TourOverlay({
  step,
  currentIndex,
  totalSteps,
  onNext,
  onSkip,
}: {
  step: TourStep;
  currentIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({ top: 0, left: 0, arrowSide: "left" });

  const { t } = useTranslation();

  useEffect(() => {
    const el = document.querySelector(`[data-tour-id="${step.targetSelector}"]`);
    if (!el) return;

    function update() {
      const rect = el!.getBoundingClientRect();
      setTargetRect(rect);

      if (tooltipRef.current) {
        const tw = tooltipRef.current.offsetWidth;
        const th = tooltipRef.current.offsetHeight;
        setTooltipPos(getTooltipPosition(rect, tw, th));
      }
    }

    update();
    // Recalculate on scroll/resize
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [step.targetSelector]);

  const isLast = currentIndex === totalSteps - 1;

  return (
    <>
      {/* Overlay backdrop with cutout */}
      <div className="fixed inset-0 z-[9998]" onClick={onSkip}>
        <svg className="absolute inset-0 h-full w-full">
          <defs>
            <mask id="tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left - 4}
                  y={targetRect.top - 4}
                  width={targetRect.width + 8}
                  height={targetRect.height + 8}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.5)"
            mask="url(#tour-mask)"
          />
        </svg>
      </div>

      {/* Highlight ring around target */}
      {targetRect && (
        <div
          className="fixed z-[9999] rounded-lg ring-2 ring-primary ring-offset-2 pointer-events-none"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] w-72 rounded-lg border bg-background p-4 shadow-lg"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm">{t(step.titleKey)}</h3>
          <button
            onClick={onSkip}
            className="shrink-0 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{t(step.bodyKey)}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {currentIndex + 1} / {totalSteps}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onSkip}>
              {t("tour.skip")}
            </Button>
            <Button size="sm" onClick={onNext}>
              {isLast ? t("tour.done") : t("tour.next")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export function TutorialTour({
  active,
  onComplete,
}: {
  active: boolean;
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (active) {
      setCurrentStep(0);
      // Open marketing section so step 6 target is visible
      const stored = localStorage.getItem("folio-marketing-nav-open");
      if (stored !== "true") {
        localStorage.setItem("folio-marketing-nav-open", "true");
        // Trigger a re-render of the nav by dispatching storage event
        window.dispatchEvent(new Event("storage"));
      }
    }
  }, [active]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    onComplete();
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (currentStep >= TOUR_STEPS.length - 1) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, handleComplete]);

  if (!active || !mounted) return null;

  return createPortal(
    <TourOverlay
      step={TOUR_STEPS[currentStep]}
      currentIndex={currentStep}
      totalSteps={TOUR_STEPS.length}
      onNext={handleNext}
      onSkip={handleComplete}
    />,
    document.body
  );
}

export function isTourCompleted(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(TOUR_COMPLETED_KEY) === "true";
}

export function resetTourCompletion(): void {
  localStorage.removeItem(TOUR_COMPLETED_KEY);
}
