import { NextResponse } from "next/server";
import QRCode from "qrcode";
import type { WallpaperConfig } from "@/lib/types";
import { PHONE_DIMENSIONS } from "@/lib/types";

// Rate limiting: simple in-memory store
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count++;
  return true;
}

export async function POST(request: Request) {
  // Rate limit
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  try {
    const config: WallpaperConfig = await request.json();

    // Validate
    if (!config.name || config.name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const dimensions = PHONE_DIMENSIONS[config.phone_model] || PHONE_DIMENSIONS["iphone-15"];
    const qrUrl = config.qr_url || "https://folio.jp";

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 200,
      margin: 1,
      color: getQrColors(config.style),
      errorCorrectionLevel: "M",
    });

    // Generate wallpaper as SVG (Satori-like approach using HTML-to-image)
    // For MVP, we'll generate an SVG and convert to PNG via canvas on the client
    // Or we can use a simpler approach: generate SVG directly
    const svg = generateWallpaperSvg(config, dimensions, qrDataUrl);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Wallpaper generation error:", error);
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}

function getQrColors(style: string) {
  switch (style) {
    case "dark":
      return { dark: "#ffffff", light: "#00000000" };
    case "light":
      return { dark: "#1a1a1a", light: "#00000000" };
    case "gradient":
      return { dark: "#ffffff", light: "#00000000" };
    case "minimal":
      return { dark: "#44403c", light: "#00000000" };
    case "bold":
      return { dark: "#facc15", light: "#00000000" };
    default:
      return { dark: "#ffffff", light: "#00000000" };
  }
}

function getStyleColors(style: string) {
  switch (style) {
    case "dark":
      return { bg: "#111827", text: "#ffffff", subtext: "#9ca3af", accent: "#6366f1" };
    case "light":
      return { bg: "#ffffff", text: "#111827", subtext: "#6b7280", accent: "#3b82f6" };
    case "gradient":
      return { bg: "#1e3a5f", text: "#ffffff", subtext: "#93c5fd", accent: "#60a5fa", bgGradient: true };
    case "minimal":
      return { bg: "#f5f5f4", text: "#1c1917", subtext: "#78716c", accent: "#a8a29e" };
    case "bold":
      return { bg: "#000000", text: "#facc15", subtext: "#fef08a", accent: "#facc15" };
    default:
      return { bg: "#111827", text: "#ffffff", subtext: "#9ca3af", accent: "#6366f1" };
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateWallpaperSvg(
  config: WallpaperConfig,
  dimensions: { width: number; height: number },
  qrDataUrl: string
): string {
  const colors = getStyleColors(config.style);
  // Scale down for SVG (actual wallpaper dimensions are large)
  const scale = 0.5;
  const w = dimensions.width * scale;
  const h = dimensions.height * scale;

  const centerX = w / 2;
  const contentY = h * 0.55; // Position content in lower-center (above home bar area)

  const qrSize = 120;
  const lineHeight = 28;

  let bgFill = `<rect width="${w}" height="${h}" fill="${colors.bg}" />`;
  if (colors.bgGradient) {
    bgFill = `
      <defs>
        <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#bg-grad)" />
    `;
  }

  const lines: string[] = [];
  let y = contentY;

  // Name
  lines.push(
    `<text x="${centerX}" y="${y}" text-anchor="middle" font-family="'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif" font-size="32" font-weight="bold" fill="${colors.text}">${escapeXml(config.name)}</text>`
  );
  y += lineHeight + 4;

  // Title
  if (config.title) {
    lines.push(
      `<text x="${centerX}" y="${y}" text-anchor="middle" font-family="'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif" font-size="16" fill="${colors.subtext}">${escapeXml(config.title)}</text>`
    );
    y += lineHeight;
  }

  // Company
  if (config.company) {
    lines.push(
      `<text x="${centerX}" y="${y}" text-anchor="middle" font-family="'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif" font-size="14" fill="${colors.subtext}">${escapeXml(config.company)}</text>`
    );
    y += lineHeight;
  }

  // Separator
  y += 10;
  lines.push(
    `<line x1="${centerX - 30}" y1="${y}" x2="${centerX + 30}" y2="${y}" stroke="${colors.accent}" stroke-width="1" opacity="0.5" />`
  );
  y += 20;

  // Contact info
  if (config.email) {
    lines.push(
      `<text x="${centerX}" y="${y}" text-anchor="middle" font-family="'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif" font-size="12" fill="${colors.subtext}">${escapeXml(config.email)}</text>`
    );
    y += 20;
  }

  if (config.phone) {
    lines.push(
      `<text x="${centerX}" y="${y}" text-anchor="middle" font-family="'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif" font-size="12" fill="${colors.subtext}">${escapeXml(config.phone)}</text>`
    );
    y += 20;
  }

  // QR code
  y += 15;
  lines.push(
    `<image x="${centerX - qrSize / 2}" y="${y}" width="${qrSize}" height="${qrSize}" href="${qrDataUrl}" />`
  );
  y += qrSize + 12;

  // "Scan me" text
  lines.push(
    `<text x="${centerX}" y="${y}" text-anchor="middle" font-family="'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif" font-size="10" fill="${colors.subtext}" opacity="0.6">QRコードをスキャン</text>`
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${bgFill}
  ${lines.join("\n  ")}
</svg>`;
}
