"use client";

import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProfileSlide } from "@/lib/types";

interface ProfileSlidesProps {
  slides: ProfileSlide[];
  templateStyles: {
    card: string;
    text: string;
    subtext: string;
    linkBtn: string;
  };
}

export function ProfileSlides({ slides, templateStyles }: ProfileSlidesProps) {
  if (!slides || slides.length === 0) return null;

  const sorted = [...slides].sort((a, b) => a.order - b.order);
  const type = sorted[0].type;

  if (type === "image") {
    return <ImageCarousel slides={sorted} />;
  }

  return <ContentSections slides={sorted} templateStyles={templateStyles} />;
}

// --- Image Carousel ---

function ImageCarousel({ slides }: { slides: ProfileSlide[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative group">
      {/* Viewport */}
      <div ref={emblaRef} className="overflow-hidden rounded-xl">
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide.id} className="min-w-0 flex-[0_0_100%]">
              <img
                src={slide.image_url}
                alt=""
                className="w-full rounded-xl object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows (desktop hover) */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/60 group-hover:opacity-100 disabled:hidden"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/60 group-hover:opacity-100 disabled:hidden"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => emblaApi?.scrollTo(idx)}
              className={`h-2 w-2 rounded-full transition-colors ${
                idx === selectedIndex
                  ? "bg-white shadow-sm"
                  : "bg-white/40"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Content Sections ---

function ContentSections({
  slides,
  templateStyles,
}: {
  slides: ProfileSlide[];
  templateStyles: {
    card: string;
    text: string;
    subtext: string;
    linkBtn: string;
  };
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
      {slides.map((slide) => (
        <div
          key={slide.id}
          className={`min-w-[260px] max-w-[300px] flex-shrink-0 snap-start rounded-lg p-4 ${templateStyles.card}`}
        >
          {slide.title && (
            <h3
              className={`text-sm font-bold leading-snug ${templateStyles.text}`}
            >
              {slide.title}
            </h3>
          )}
          {slide.body && (
            <p
              className={`mt-1.5 text-xs leading-relaxed whitespace-pre-wrap ${templateStyles.subtext}`}
            >
              {slide.body}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
