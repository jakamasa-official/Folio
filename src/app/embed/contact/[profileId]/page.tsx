"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

// ─── Inline i18n ─────────────────────────────────────────

const LABELS = {
  ja: {
    name: "お名前",
    email: "メールアドレス",
    message: "メッセージ",
    send: "送信",
    sending: "送信中...",
    success: "送信しました",
    error: "送信に失敗しました",
    poweredBy: "Powered by",
  },
  en: {
    name: "Name",
    email: "Email",
    message: "Message",
    send: "Send",
    sending: "Sending...",
    success: "Message sent!",
    error: "Failed to send",
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

export default function ContactEmbed() {
  const { profileId } = useParams<{ profileId: string }>();
  const searchParams = useSearchParams();

  const lang = (searchParams.get("lang") === "en" ? "en" : "ja") as "ja" | "en";
  const theme = searchParams.get("theme") === "dark" ? "dark" : "light";
  const accent = searchParams.get("accent") || "6366f1";
  const accentColor = accent.startsWith("#") ? accent : `#${accent}`;

  const L = LABELS[lang];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
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
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: profileId,
          sender_name: name,
          sender_email: email,
          message,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || L.error);
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
      notifyParent("success", { widget: "contact" });
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

          {/* Name */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>{L.name}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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

          {/* Email */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>{L.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          {/* Message */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{L.message}</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
