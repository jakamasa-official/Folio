"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

// ─── Inline i18n ─────────────────────────────────────────

const LABELS = {
  ja: {
    placeholder: "メールアドレスを入力",
    subscribe: "登録",
    subscribing: "登録中...",
    success: "登録しました！",
    error: "登録に失敗しました",
    poweredBy: "Powered by",
  },
  en: {
    placeholder: "Enter your email",
    subscribe: "Subscribe",
    subscribing: "Subscribing...",
    success: "Subscribed!",
    error: "Failed to subscribe",
    poweredBy: "Powered by",
  },
};

// ─── PostMessage helper ──────────────────────────────────

function notifyParent(type: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.parent !== window) {
    window.parent.postMessage({ type: `folio:${type}`, ...data }, "*");
  }
}

// ─── Main Component ─────────────────────────────────────

export default function SubscribeEmbed() {
  const { profileId } = useParams<{ profileId: string }>();
  const searchParams = useSearchParams();

  const lang = (searchParams.get("lang") === "en" ? "en" : "ja") as "ja" | "en";
  const theme = searchParams.get("theme") === "dark" ? "dark" : "light";
  const accent = searchParams.get("accent") || "6366f1";
  const accentColor = accent.startsWith("#") ? accent : `#${accent}`;

  const L = LABELS[lang];

  const [email, setEmail] = useState("");
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
    errorText: theme === "dark" ? "#fca5a5" : "#dc2626",
    successBg: theme === "dark" ? "#1c3b2a" : "#f0fdf4",
    successText: theme === "dark" ? "#86efac" : "#16a34a",
  };

  // ── Submit handler ─────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: profileId, email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || L.error);
      }

      setSuccess(true);
      setEmail("");
      notifyParent("success", { widget: "subscribe" });
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
            padding: 12,
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
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={L.placeholder}
            required
            style={{
              flex: 1,
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
              minWidth: 0,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.inputFocusBorder;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.inputBorder;
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              height: 40,
              padding: "0 20px",
              backgroundColor: loading ? `${accentColor}99` : accentColor,
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              transition: "background-color 0.15s",
              flexShrink: 0,
            }}
          >
            {loading ? L.subscribing : L.subscribe}
          </button>
        </form>
      )}

      {error && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: colors.errorText,
          }}
        >
          {error}
        </div>
      )}

      {/* Powered by */}
      <div style={{ marginTop: 10, textAlign: "center" }}>
        <a
          href="https://and-folio.com"
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
