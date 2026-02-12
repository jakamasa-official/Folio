"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ChevronUp, ChevronDown, ImagePlus, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";
import type { ProfileSlide } from "@/lib/types";

interface SlidesEditorProps {
  slides: ProfileSlide[] | null;
  onChange: (slides: ProfileSlide[]) => void;
  userId: string;
}

type SlideMode = "image" | "content";

export function SlidesEditor({ slides, onChange, userId }: SlidesEditorProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<SlideMode>(() => {
    if (!slides || slides.length === 0) return "image";
    return slides[0].type;
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSlides = (slides || [])
    .filter((s) => s.type === mode)
    .sort((a, b) => a.order - b.order);

  function switchMode(newMode: SlideMode) {
    setMode(newMode);
  }

  // --- Image mode handlers ---

  async function handleImageAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imageSlides = (slides || []).filter((s) => s.type === "image");
    if (imageSlides.length >= 10) return;

    setUploading(true);
    const supabase = createClient();
    const newSlides = [...(slides || [])];

    for (let i = 0; i < files.length; i++) {
      if (imageSlides.length + i >= 10) break;

      const file = files[i];
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${Date.now()}_${i}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("slides")
        .upload(path, file, { upsert: true });

      if (uploadError) continue;

      const {
        data: { publicUrl },
      } = supabase.storage.from("slides").getPublicUrl(path);

      const maxOrder = newSlides.reduce(
        (max, s) => (s.type === "image" && s.order > max ? s.order : max),
        -1
      );

      newSlides.push({
        id: crypto.randomUUID(),
        type: "image",
        image_url: publicUrl,
        order: maxOrder + 1,
      });
    }

    onChange(newSlides);
    setUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleImageDelete(id: string) {
    const updated = (slides || []).filter((s) => s.id !== id);
    // Reindex order for remaining image slides
    let order = 0;
    const reindexed = updated.map((s) => {
      if (s.type === "image") {
        return { ...s, order: order++ };
      }
      return s;
    });
    onChange(reindexed);
  }

  // --- Content mode handlers ---

  function handleAddSection() {
    const contentSlides = (slides || []).filter((s) => s.type === "content");
    if (contentSlides.length >= 10) return;

    const maxOrder = contentSlides.reduce(
      (max, s) => (s.order > max ? s.order : max),
      -1
    );

    const newSlide: ProfileSlide = {
      id: crypto.randomUUID(),
      type: "content",
      title: "",
      body: "",
      order: maxOrder + 1,
    };

    onChange([...(slides || []), newSlide]);
  }

  function handleContentUpdate(
    id: string,
    field: "title" | "body",
    value: string
  ) {
    const updated = (slides || []).map((s) =>
      s.id === id ? { ...s, [field]: value } : s
    );
    onChange(updated);
  }

  function handleContentDelete(id: string) {
    const updated = (slides || []).filter((s) => s.id !== id);
    let order = 0;
    const reindexed = updated.map((s) => {
      if (s.type === "content") {
        return { ...s, order: order++ };
      }
      return s;
    });
    onChange(reindexed);
  }

  // --- Shared reorder handlers ---

  function handleMoveUp(id: string) {
    const typeSlides = currentSlides;
    const idx = typeSlides.findIndex((s) => s.id === id);
    if (idx <= 0) return;

    const swapId = typeSlides[idx - 1].id;
    const updated = (slides || []).map((s) => {
      if (s.id === id) return { ...s, order: typeSlides[idx - 1].order };
      if (s.id === swapId) return { ...s, order: typeSlides[idx].order };
      return s;
    });
    onChange(updated);
  }

  function handleMoveDown(id: string) {
    const typeSlides = currentSlides;
    const idx = typeSlides.findIndex((s) => s.id === id);
    if (idx < 0 || idx >= typeSlides.length - 1) return;

    const swapId = typeSlides[idx + 1].id;
    const updated = (slides || []).map((s) => {
      if (s.id === id) return { ...s, order: typeSlides[idx + 1].order };
      if (s.id === swapId) return { ...s, order: typeSlides[idx].order };
      return s;
    });
    onChange(updated);
  }

  const imageCount = (slides || []).filter((s) => s.type === "image").length;
  const contentCount = (slides || []).filter(
    (s) => s.type === "content"
  ).length;

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex rounded-lg border bg-muted p-1">
        <button
          type="button"
          onClick={() => switchMode("image")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "image"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("slideModeImage")}
        </button>
        <button
          type="button"
          onClick={() => switchMode("content")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "content"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("slideModeContent")}
        </button>
      </div>

      {/* Image mode */}
      {mode === "image" && (
        <div className="space-y-3">
          {currentSlides.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {currentSlides.map((slide, idx) => (
                <div key={slide.id} className="group relative">
                  <img
                    src={slide.image_url}
                    alt={`Slide ${idx + 1}`}
                    className="aspect-square w-full rounded-lg border object-cover"
                  />
                  {/* Overlay controls */}
                  <div className="absolute inset-0 flex items-start justify-between rounded-lg bg-black/0 p-1 opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100">
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(slide.id)}
                        disabled={idx === 0}
                        className="rounded bg-white/80 p-0.5 text-gray-700 shadow-sm hover:bg-white disabled:opacity-30"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(slide.id)}
                        disabled={idx === currentSlides.length - 1}
                        className="rounded bg-white/80 p-0.5 text-gray-700 shadow-sm hover:bg-white disabled:opacity-30"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImageDelete(slide.id)}
                      className="rounded bg-red-500/90 p-0.5 text-white shadow-sm hover:bg-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageAdd}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || imageCount >= 10}
            >
              {uploading ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="mr-1 h-4 w-4" />
              )}
              {uploading ? t("slideUploading") : t("slideAddImage")}
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("slideImageCount", { count: String(imageCount) })}
            </p>
          </div>
        </div>
      )}

      {/* Content mode */}
      {mode === "content" && (
        <div className="space-y-3">
          {currentSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className="rounded-lg border bg-muted/30 p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("slideSection", { index: String(idx + 1) })}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(slide.id)}
                    disabled={idx === 0}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(slide.id)}
                    disabled={idx === currentSlides.length - 1}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleContentDelete(slide.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <Input
                value={slide.title || ""}
                onChange={(e) =>
                  handleContentUpdate(slide.id, "title", e.target.value)
                }
                placeholder={t("slideTitlePlaceholder")}
                className="text-sm"
              />
              <Textarea
                value={slide.body || ""}
                onChange={(e) =>
                  handleContentUpdate(slide.id, "body", e.target.value)
                }
                placeholder={t("slideBodyPlaceholder")}
                rows={3}
                className="text-sm"
              />
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSection}
            disabled={contentCount >= 10}
          >
            <Plus className="mr-1 h-4 w-4" />
            {t("slideAddSection")}
          </Button>
          <p className="text-xs text-muted-foreground">
            {t("slideSectionCount", { count: String(contentCount) })}
          </p>
        </div>
      )}
    </div>
  );
}
