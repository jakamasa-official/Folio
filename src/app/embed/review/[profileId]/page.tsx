"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

// ─── Inline i18n ─────────────────────────────────────────

const LABELS = {
  ja: {
    rating: "評価",
    name: "お名前",
    email: "メールアドレス（任意）",
    review: "レビュー",
    send: "送信",
    sending: "送信中...",
    success: "レビューを投稿しました",
    error: "送信に失敗しました",
    poweredBy: "Powered by",
  },
  en: {
    rating: "Rating",
    name: "Name",
    email: "Email (optional)",
    review: "Your review",
    send: "Submit",
    sending: "Submitting...",
    success: "Review submitted!",
    error: "Failed to submit",
    poweredBy: "Powered by",
  },
};

// ─── PostMessage helper ──────────────────────────────────

function notifyParent(type: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.parent !== window) {
    window.parent.postMessage({ type: `folio:${type}`, ...data }, "*");
  }
}

// ─── Star SVG Component ─────────────────────────────────

function StarIcon({
  filled,
  size = 28,
  onClick,
  onMouseEnter,
  onMouseLeave,
  hoverColor,
  emptyColor,
}: {
  filled: boolean;
  size?: number;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  hoverColor: string;
  emptyColor: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill={filled ? hoverColor : emptyColor}
      style={{
        cursor: onClick ? "pointer" : "default",
        display: "block",
        transition: "fill 0.15s, transform 0.1s",
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────

export default function ReviewEmbed() {
  const { profileId } = useParams<{ profileId: string }>();
  const searchParams = useSearchParams();

  const lang = (searchParams.get("lang") === "en" ? "en" : "ja") as "ja" | "en";
  const theme = searchParams.get("theme") === "dark" ? "dark" : "light";
  const accent = searchParams.get("accent") || "6366f1";
  const accentColor = accent.startsWith("#") ? accent : `#${accent}`;

  const L = LABELS[lang];

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // ── Resize observer ────────────────────────────────────

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      notifyParent("resize", { height: document.body.scrollHeight });
    });
    observer.observe(document.body);
    notifyParent("resize", { height: document.body.scrollHeight });
    return () => observer.disconnect();
  }, []);

  // ── Theme colors ───────────────────────────────────────

  const colors = {
    bg: theme === "dark" ? "#1a1a2e" : "#ffffff",
    text: theme === "dark" ? "#ffffff" : "#1f2937",
    textSecondary: theme === "dark" ? "#a1a1aa" : "#6b7280",
    inputBg: theme === "dark" ? "#16213e" : "#ffffff",
    inputBorder: theme === "dark" ? "#334155" : "#d1d5db",
    inputFocusBorder: accentColor,
    errorBg: theme === "dark" ? "#3b1c1c" : "#fef2f2",
    errorText: theme === "dark" ? "#fca5a5" : "#dc2626",
    successBg: theme === "dark" ? "#1c3b2a" : "#f0fdf4",
    successText: theme === "dark" ? "#86efac" : "#16a34a",
    starFilled: "#facc15",
    starEmpty: theme === "dark" ? "#4b5563" : "#e5e7eb",
  };

  // ── Shared styles ──────────────────────────────────────

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: colors.text,
    marginBottom: 4,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 40,
    padding: "0 12px",
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: 8,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    height: "auto",
    padding: "10px 12px",
    resize: "vertical",
    minHeight: 100,
    lineHeight: 1.5,
    fontFamily: "inherit",
  };

  // ── Submit handler ─────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError(lang === "ja" ? "評価を選択してください" : "Please select a rating");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: profileId,
          reviewer_name: reviewerName.trim(),
          reviewer_email: reviewerEmail.trim() || undefined,
          rating,
          body: reviewBody.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || L.error);
      }

      setSuccess(true);
      notifyParent("success", { widget: "review" });
    } catch (err) {
      setError(err instanceof Error ? err.message : L.error);
    } finally {
      setLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────

  return (
    <div
      style={{
        maxWidth: "100%",
        padding: 16,
        backgroundColor: colors.bg,
        boxSizing: "border-box",
      }}
    >
      {success ? (
        <div
          style={{
            padding: 16,
            backgroundColor: colors.successBg,
            color: colors.successText,
            borderRadius: 8,
            fontSize: 14,
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          {L.success}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                padding: 10,
                marginBottom: 12,
                backgroundColor: colors.errorBg,
                color: colors.errorText,
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          {/* Star Rating */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>{L.rating}</label>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  filled={star <= (hoverRating || rating)}
                  size={28}
                  hoverColor={colors.starFilled}
                  emptyColor={colors.starEmpty}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>{L.name}</label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.inputFocusBorder;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.inputBorder;
              }}
            />
          </div>

          {/* Email (optional) */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>{L.email}</label>
            <input
              type="email"
              value={reviewerEmail}
              onChange={(e) => setReviewerEmail(e.target.value)}
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.inputFocusBorder;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.inputBorder;
              }}
            />
          </div>

          {/* Review body */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{L.review}</label>
            <textarea
              value={reviewBody}
              onChange={(e) => setReviewBody(e.target.value)}
              required
              rows={4}
              style={textareaStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.inputFocusBorder;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.inputBorder;
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: 40,
              backgroundColor: loading ? `${accentColor}99` : accentColor,
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.15s",
            }}
          >
            {loading ? L.sending : L.send}
          </button>
        </form>
      )}

      {/* Powered by */}
      <div style={{ marginTop: 12, textAlign: "center" }}>
        <a
          href="https://folio-for-everyone.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 10,
            color: colors.textSecondary,
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          {L.poweredBy} Folio
        </a>
      </div>
    </div>
  );
}
