"use client";

import { useEffect, useState, useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PublicReview {
  id: string;
  reviewer_name: string;
  rating: number;
  title: string | null;
  body: string;
  is_featured: boolean;
  service_tags: string[];
  response: string | null;
  response_at: string | null;
  verified: boolean;
  created_at: string;
}

interface ReviewsData {
  reviews: PublicReview[];
  stats: {
    approvedCount: number;
    averageRating: number;
  };
  settings: {
    display_style: string;
    show_aggregate_rating: boolean;
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ReviewCard({
  review,
  cardClassName,
}: {
  review: PublicReview;
  cardClassName?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const bodyTruncated = review.body.length > 120;

  return (
    <div className={`rounded-lg border bg-white/80 p-4 ${cardClassName || ""}`}>
      <div className="flex items-center gap-2">
        <StarRating rating={review.rating} />
        {review.verified && (
          <span className="text-xs text-green-600">認証済み</span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-sm font-medium">{review.reviewer_name}</span>
        <span className="text-xs text-gray-400">
          {formatDate(review.created_at)}
        </span>
      </div>
      {review.title && (
        <p className="mt-1 text-sm font-medium">{review.title}</p>
      )}
      <p className="mt-1 text-sm text-gray-600">
        {expanded || !bodyTruncated
          ? review.body
          : review.body.slice(0, 120) + "..."}
      </p>
      {bodyTruncated && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-1 text-xs font-medium text-blue-600 hover:underline"
        >
          もっと見る
        </button>
      )}
      {review.service_tags && review.service_tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {review.service_tags.map((tag) => (
            <span
              key={tag}
              className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {review.response && (
        <div className="mt-3 rounded-md bg-gray-50 p-2.5">
          <p className="text-xs font-medium text-gray-500">オーナーからの返信</p>
          <p className="mt-0.5 text-xs text-gray-600">{review.response}</p>
        </div>
      )}
    </div>
  );
}

// ─── Carousel display ──────────────────────────────────

function CarouselDisplay({ reviews }: { reviews: PublicReview[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollButtons() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }

  useEffect(() => {
    updateScrollButtons();
  }, [reviews]);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute -left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      <div
        ref={scrollRef}
        onScroll={updateScrollButtons}
        className="scrollbar-hide flex gap-3 overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {reviews.map((review) => (
          <div key={review.id} className="w-72 shrink-0 sm:w-80">
            <ReviewCard review={review} />
          </div>
        ))}
      </div>
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute -right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ─── Grid display ──────────────────────────────────────

function GridDisplay({ reviews }: { reviews: PublicReview[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}

// ─── List display ──────────────────────────────────────

function ListDisplay({ reviews }: { reviews: PublicReview[] }) {
  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}

// ─── Main Section ──────────────────────────────────────

export function ReviewsSection({ profileId }: { profileId: string }) {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(
          `/api/reviews/public?profile_id=${profileId}`
        );
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // Non-critical — silently fail
      }
    }
    fetchReviews();
  }, [profileId]);

  if (!data || data.reviews.length === 0) return null;

  const { reviews, stats, settings } = data;
  const displayReviews = showAll ? reviews : reviews.slice(0, 6);

  return (
    <div className="mt-8">
      {/* Aggregate rating */}
      {settings.show_aggregate_rating && stats.approvedCount > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(stats.averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium">
            {stats.averageRating.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500">
            ({stats.approvedCount}件のレビュー)
          </span>
        </div>
      )}

      {/* Reviews display */}
      {settings.display_style === "carousel" && (
        <CarouselDisplay reviews={displayReviews} />
      )}
      {settings.display_style === "grid" && (
        <GridDisplay reviews={displayReviews} />
      )}
      {settings.display_style === "list" && (
        <ListDisplay reviews={displayReviews} />
      )}

      {/* Show more */}
      {!showAll && reviews.length > 6 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-3 w-full rounded-lg border bg-white/80 py-2 text-center text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          もっと見る ({reviews.length - 6}件)
        </button>
      )}

      {/* Write review CTA */}
      <div className="mt-4">
        <Link
          href={`/review/${profileId}`}
          className="flex w-full items-center justify-center gap-2 rounded-lg border bg-white/80 px-5 py-3 text-sm font-medium transition-all hover:scale-[1.02] hover:bg-gray-50"
        >
          <Star className="h-4 w-4 text-yellow-500" />
          レビューを書く
        </Link>
      </div>
    </div>
  );
}
