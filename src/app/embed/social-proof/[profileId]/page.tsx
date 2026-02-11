"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";

// ─── Types ──────────────────────────────────────────────

interface ReviewData {
  average: number;
  count: number;
}

interface RecentReview {
  reviewer_name: string;
  rating: number;
  body: string;
  created_at: string;
}

interface WidgetData {
  viewers: number;
  reviews: ReviewData | null;
  recentReviews: RecentReview[];
  recentBookings: number;
  totalCustomers: number;
}

// ─── Star Rendering ─────────────────────────────────────

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill={star <= Math.round(rating) ? "#facc15" : "#e5e7eb"}
          style={{ display: "block" }}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
    </span>
  );
}

// ─── Badge Mode ─────────────────────────────────────────

function BadgeMode({
  data,
  profileUrl,
}: {
  data: WidgetData;
  profileUrl: string;
}) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // Build the list of messages to rotate through
  const messages: { icon: string; text: string }[] = [];

  if (data.reviews && data.reviews.count > 0) {
    messages.push({
      icon: "star",
      text: `★ ${data.reviews.average} (${data.reviews.count}件)`,
    });
  }
  if (data.recentBookings > 0) {
    messages.push({
      icon: "booking",
      text: `今月${data.recentBookings}人が予約`,
    });
  }
  if (data.viewers > 0) {
    messages.push({
      icon: "eye",
      text: `${data.viewers}人が閲覧中`,
    });
  }

  useEffect(() => {
    if (messages.length <= 1) return;

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setSlideIndex((prev) => (prev + 1) % messages.length);
        setVisible(true);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [messages.length]);

  if (messages.length === 0) return null;

  const current = messages[slideIndex % messages.length];

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: 999,
        backgroundColor: "#fff",
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
        border: "1px solid #f0f0f0",
        textDecoration: "none",
        color: "#1f2937",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1,
        transition: "box-shadow 0.2s",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {current.icon === "star" && (
        <span style={{ color: "#facc15", fontSize: 15 }}>★</span>
      )}
      {current.icon === "booking" && (
        <span style={{ color: "#6366f1", fontSize: 14 }}>📅</span>
      )}
      {current.icon === "eye" && (
        <span style={{ color: "#22c55e", fontSize: 14 }}>👁</span>
      )}
      <span
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        {current.text}
      </span>
      <FolioMark />
    </a>
  );
}

// ─── Reviews Carousel Mode ──────────────────────────────

function ReviewsMode({ data }: { data: WidgetData }) {
  const [index, setIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const reviews = data.recentReviews || [];

  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % reviews.length);
        setFadeIn(true);
      }, 300);
    }, 6000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  if (reviews.length === 0 && (!data.reviews || data.reviews.count === 0)) {
    return (
      <div style={containerStyle}>
        <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center" }}>
          まだレビューはありません
        </p>
        <PoweredBy />
      </div>
    );
  }

  const current = reviews[index % reviews.length];
  const truncatedBody =
    current && current.body.length > 80
      ? current.body.slice(0, 80) + "..."
      : current?.body || "";

  return (
    <div style={containerStyle}>
      {/* Aggregate rating header */}
      {data.reviews && data.reviews.count > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
            paddingBottom: 10,
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <Stars rating={data.reviews.average} size={16} />
          <span
            style={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}
          >
            {data.reviews.average}
          </span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            ({data.reviews.count}件のレビュー)
          </span>
        </div>
      )}

      {/* Current review */}
      {current && (
        <div
          style={{
            opacity: fadeIn ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 6,
            }}
          >
            <Stars rating={current.rating} size={12} />
            <span
              style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}
            >
              {current.reviewer_name}
            </span>
          </div>
          <p
            style={{
              fontSize: 13,
              color: "#4b5563",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {truncatedBody}
          </p>
        </div>
      )}

      {/* Dots indicator */}
      {reviews.length > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 4,
            marginTop: 10,
          }}
        >
          {reviews.map((_, i) => (
            <span
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor:
                  i === index % reviews.length ? "#6366f1" : "#e5e7eb",
                transition: "background-color 0.3s",
              }}
            />
          ))}
        </div>
      )}

      <PoweredBy />
    </div>
  );
}

// ─── Stats Bar Mode ─────────────────────────────────────

function StatsMode({ data }: { data: WidgetData }) {
  const parts: string[] = [];

  if (data.reviews && data.reviews.count > 0) {
    parts.push(`★ ${data.reviews.average}`);
    parts.push(`${data.reviews.count}件のレビュー`);
  }
  if (data.recentBookings > 0) {
    parts.push(`今月${data.recentBookings}件の予約`);
  }
  if (data.totalCustomers > 0) {
    parts.push(`${data.totalCustomers}人の顧客`);
  }

  if (parts.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: "10px 16px",
        backgroundColor: "#fff",
        borderRadius: 8,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        border: "1px solid #f0f0f0",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 13,
        color: "#374151",
        fontWeight: 500,
        lineHeight: 1,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {parts.map((part, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
          {i > 0 && (
            <span
              style={{
                margin: "0 10px",
                color: "#d1d5db",
                fontWeight: 300,
              }}
            >
              |
            </span>
          )}
          {part}
        </span>
      ))}
      <span
        style={{
          margin: "0 10px",
          color: "#d1d5db",
          fontWeight: 300,
        }}
      >
        |
      </span>
      <FolioMark />
    </div>
  );
}

// ─── Full Mode ──────────────────────────────────────────

function FullMode({ data }: { data: WidgetData }) {
  const latestReview = data.recentReviews?.[0];

  return (
    <div style={containerStyle}>
      {/* Review rating section */}
      {data.reviews && data.reviews.count > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <span
            style={{ fontSize: 28, fontWeight: 700, color: "#1f2937" }}
          >
            {data.reviews.average}
          </span>
          <div>
            <Stars rating={data.reviews.average} size={14} />
            <p
              style={{
                fontSize: 12,
                color: "#9ca3af",
                margin: "2px 0 0",
              }}
            >
              {data.reviews.count}件のレビュー
            </p>
          </div>
        </div>
      )}

      {/* Latest review */}
      {latestReview && (
        <div
          style={{
            padding: 10,
            borderRadius: 8,
            backgroundColor: "#f9fafb",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <Stars rating={latestReview.rating} size={11} />
            <span
              style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}
            >
              {latestReview.reviewer_name}
            </span>
          </div>
          <p
            style={{
              fontSize: 12,
              color: "#6b7280",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {latestReview.body.length > 80
              ? latestReview.body.slice(0, 80) + "..."
              : latestReview.body}
          </p>
        </div>
      )}

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        {data.viewers > 0 && (
          <div style={statItemStyle}>
            <span style={{ color: "#22c55e", fontSize: 13 }}>●</span>
            <span>{data.viewers}人が閲覧中</span>
          </div>
        )}
        {data.recentBookings > 0 && (
          <div style={statItemStyle}>
            <span>今月{data.recentBookings}件予約</span>
          </div>
        )}
        {data.totalCustomers > 0 && (
          <div style={statItemStyle}>
            <span>{data.totalCustomers}人の顧客</span>
          </div>
        )}
      </div>

      <PoweredBy />
    </div>
  );
}

// ─── Shared Components & Styles ─────────────────────────

const containerStyle: React.CSSProperties = {
  padding: 16,
  backgroundColor: "#fff",
  borderRadius: 10,
  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
  border: "1px solid #f0f0f0",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const statItemStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: 12,
  color: "#6b7280",
};

function FolioMark() {
  return (
    <span
      style={{
        fontSize: 10,
        color: "#c4c4c4",
        fontWeight: 500,
        letterSpacing: "0.02em",
      }}
    >
      Folio
    </span>
  );
}

function PoweredBy() {
  return (
    <div style={{ marginTop: 10, textAlign: "right" }}>
      <a
        href="https://and-folio.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: 10,
          color: "#c4c4c4",
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        Powered by Folio
      </a>
    </div>
  );
}

// ─── Main Widget Page ───────────────────────────────────

export default function SocialProofEmbed() {
  const { profileId } = useParams<{ profileId: string }>();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "badge";

  const [data, setData] = useState<WidgetData | null>(null);
  const initialFetchDone = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/widget/social-proof?profile_id=${profileId}`
      );
      const json = await res.json();
      setData({
        viewers: json.viewers || 0,
        reviews: json.reviews || null,
        recentReviews: json.recentReviews || [],
        recentBookings: json.recentBookings || 0,
        totalCustomers: json.totalCustomers || 0,
      });
    } catch {
      // Silently fail — widget is non-critical
    }
  }, [profileId]);

  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchData();
      initialFetchDone.current = true;
    }

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (!data) {
    return null;
  }

  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${profileId}`;

  return (
    <div
      style={{
        background: "transparent",
        margin: 0,
        padding: mode === "badge" ? 4 : 0,
      }}
    >
      {mode === "badge" && (
        <BadgeMode data={data} profileUrl={profileUrl} />
      )}
      {mode === "reviews" && <ReviewsMode data={data} />}
      {mode === "stats" && <StatsMode data={data} />}
      {mode === "full" && <FullMode data={data} />}
    </div>
  );
}
