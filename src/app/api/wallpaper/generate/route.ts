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
  // Map of styles to QR dark color. Light is always transparent.
  const darkColorMap: Record<string, string> = {
    // Original 5
    dark: "#ffffff",
    light: "#1a1a1a",
    gradient: "#ffffff",
    minimal: "#44403c",
    bold: "#facc15",
    // Nature
    ocean: "#e0f2fe",
    sunset: "#ffffff",
    aurora: "#e0fffe",
    sakura: "#831843",
    forest: "#d9f99d",
    lavender: "#581c87",
    desert: "#451a03",
    arctic: "#164e63",
    // Urban
    midnight: "#c4b5fd",
    concrete: "#1c1917",
    "neon-city": "#f0abfc",
    chrome: "#1e293b",
    industrial: "#fbbf24",
    // Retro/Gaming
    pixel: "#22c55e",
    "retro-game": "#f87171",
    synthwave: "#f0abfc",
    vaporwave: "#e879f9",
    arcade: "#facc15",
    "8bit": "#4ade80",
    gameboy: "#0f380f",
    commodore: "#7c85ca",
    // Elegant
    marble: "#1c1917",
    gold: "#fef3c7",
    "rose-gold": "#ffffff",
    platinum: "#0f172a",
    ivory: "#78350f",
    // Japanese
    washi: "#1c1917",
    indigo: "#e0e7ff",
    matcha: "#14532d",
    zen: "#1c1917",
    ukiyo: "#fef3c7",
    // Tech
    matrix: "#22c55e",
    circuit: "#34d399",
    cyber: "#22d3ee",
    hologram: "#c4b5fd",
    terminal: "#4ade80",
    // Gradients
    fire: "#ffffff",
    ice: "#164e63",
    peach: "#431407",
    berry: "#ffffff",
    twilight: "#fde68a",
    // Bold/Pop
    monochrome: "#ffffff",
    crimson: "#ffffff",
    "electric-blue": "#ffffff",
    "neon-green": "#022c22",
  };

  return {
    dark: darkColorMap[style] || "#ffffff",
    light: "#00000000",
  };
}

interface StyleColors {
  bg: string;
  text: string;
  subtext: string;
  accent: string;
  bgGradient?: boolean;
  gradientStops?: string[];
}

function getStyleColors(style: string): StyleColors {
  const styles: Record<string, StyleColors> = {
    // === Original 5 ===
    dark: { bg: "#111827", text: "#ffffff", subtext: "#9ca3af", accent: "#6366f1" },
    light: { bg: "#ffffff", text: "#111827", subtext: "#6b7280", accent: "#3b82f6" },
    gradient: { bg: "#1e3a5f", text: "#ffffff", subtext: "#93c5fd", accent: "#60a5fa", bgGradient: true, gradientStops: ["#1e3a8a", "#7c3aed"] },
    minimal: { bg: "#f5f5f4", text: "#1c1917", subtext: "#78716c", accent: "#a8a29e" },
    bold: { bg: "#000000", text: "#facc15", subtext: "#fef08a", accent: "#facc15" },

    // === Nature ===
    ocean: { bg: "#0c4a6e", text: "#e0f2fe", subtext: "#7dd3fc", accent: "#38bdf8", bgGradient: true, gradientStops: ["#0c4a6e", "#164e63"] },
    sunset: { bg: "#7c2d12", text: "#ffffff", subtext: "#fed7aa", accent: "#fb923c", bgGradient: true, gradientStops: ["#7c2d12", "#be185d"] },
    aurora: { bg: "#042f2e", text: "#ccfbf1", subtext: "#5eead4", accent: "#2dd4bf", bgGradient: true, gradientStops: ["#042f2e", "#1e1b4b"] },
    sakura: { bg: "#fdf2f8", text: "#831843", subtext: "#be185d", accent: "#ec4899" },
    forest: { bg: "#052e16", text: "#d9f99d", subtext: "#86efac", accent: "#4ade80", bgGradient: true, gradientStops: ["#052e16", "#1a2e05"] },
    lavender: { bg: "#faf5ff", text: "#581c87", subtext: "#7e22ce", accent: "#a855f7" },
    desert: { bg: "#fef3c7", text: "#451a03", subtext: "#92400e", accent: "#d97706" },
    arctic: { bg: "#ecfeff", text: "#164e63", subtext: "#0891b2", accent: "#06b6d4" },

    // === Urban ===
    midnight: { bg: "#0f0a1f", text: "#c4b5fd", subtext: "#8b5cf6", accent: "#a78bfa", bgGradient: true, gradientStops: ["#0f0a1f", "#1a0a2e"] },
    concrete: { bg: "#e7e5e4", text: "#1c1917", subtext: "#57534e", accent: "#78716c" },
    "neon-city": { bg: "#0a0a0a", text: "#f0abfc", subtext: "#e879f9", accent: "#d946ef" },
    chrome: { bg: "#e2e8f0", text: "#1e293b", subtext: "#475569", accent: "#64748b", bgGradient: true, gradientStops: ["#cbd5e1", "#e2e8f0"] },
    industrial: { bg: "#1c1917", text: "#fbbf24", subtext: "#d97706", accent: "#f59e0b" },

    // === Retro/Gaming ===
    pixel: { bg: "#0a0a0a", text: "#22c55e", subtext: "#16a34a", accent: "#4ade80" },
    "retro-game": { bg: "#1a0000", text: "#f87171", subtext: "#ef4444", accent: "#dc2626" },
    synthwave: { bg: "#0f051d", text: "#f0abfc", subtext: "#d946ef", accent: "#a855f7", bgGradient: true, gradientStops: ["#0f051d", "#1a0730"] },
    vaporwave: { bg: "#1a0a2e", text: "#e879f9", subtext: "#c084fc", accent: "#f0abfc", bgGradient: true, gradientStops: ["#1a0a2e", "#0f172a"] },
    arcade: { bg: "#000000", text: "#facc15", subtext: "#fbbf24", accent: "#eab308" },
    "8bit": { bg: "#1e1b4b", text: "#4ade80", subtext: "#22c55e", accent: "#86efac" },
    gameboy: { bg: "#9bbc0f", text: "#0f380f", subtext: "#306230", accent: "#8bac0f" },
    commodore: { bg: "#40318d", text: "#7c85ca", subtext: "#a0a7e0", accent: "#7c85ca" },

    // === Elegant ===
    marble: { bg: "#f5f5f4", text: "#1c1917", subtext: "#57534e", accent: "#a8a29e" },
    gold: { bg: "#1c1917", text: "#fef3c7", subtext: "#fde68a", accent: "#f59e0b" },
    "rose-gold": { bg: "#4a0e2b", text: "#ffffff", subtext: "#fda4af", accent: "#fb7185", bgGradient: true, gradientStops: ["#4a0e2b", "#3b0d23"] },
    platinum: { bg: "#f1f5f9", text: "#0f172a", subtext: "#475569", accent: "#94a3b8" },
    ivory: { bg: "#fffbeb", text: "#78350f", subtext: "#92400e", accent: "#b45309" },

    // === Japanese ===
    washi: { bg: "#faf7f2", text: "#1c1917", subtext: "#78716c", accent: "#c2410c" },
    indigo: { bg: "#1e1b4b", text: "#e0e7ff", subtext: "#a5b4fc", accent: "#818cf8" },
    matcha: { bg: "#f0fdf4", text: "#14532d", subtext: "#166534", accent: "#22c55e" },
    zen: { bg: "#fafaf9", text: "#1c1917", subtext: "#a8a29e", accent: "#78716c" },
    ukiyo: { bg: "#1a0000", text: "#fef3c7", subtext: "#fde68a", accent: "#ef4444", bgGradient: true, gradientStops: ["#1a0000", "#0c0a09"] },

    // === Tech ===
    matrix: { bg: "#000000", text: "#22c55e", subtext: "#16a34a", accent: "#4ade80" },
    circuit: { bg: "#022c22", text: "#34d399", subtext: "#10b981", accent: "#6ee7b7" },
    cyber: { bg: "#020617", text: "#22d3ee", subtext: "#06b6d4", accent: "#67e8f9", bgGradient: true, gradientStops: ["#020617", "#0c0a09"] },
    hologram: { bg: "#0f0a1f", text: "#c4b5fd", subtext: "#a78bfa", accent: "#e879f9", bgGradient: true, gradientStops: ["#0f0a1f", "#020617"] },
    terminal: { bg: "#000000", text: "#4ade80", subtext: "#22c55e", accent: "#86efac" },

    // === Gradients ===
    fire: { bg: "#7c2d12", text: "#ffffff", subtext: "#fed7aa", accent: "#fb923c", bgGradient: true, gradientStops: ["#dc2626", "#ea580c", "#f59e0b"] },
    ice: { bg: "#ecfeff", text: "#164e63", subtext: "#0e7490", accent: "#06b6d4", bgGradient: true, gradientStops: ["#cffafe", "#e0f2fe"] },
    peach: { bg: "#fff7ed", text: "#431407", subtext: "#9a3412", accent: "#f97316", bgGradient: true, gradientStops: ["#fff1e6", "#fce7f3"] },
    berry: { bg: "#3b0764", text: "#ffffff", subtext: "#e9d5ff", accent: "#c084fc", bgGradient: true, gradientStops: ["#3b0764", "#831843"] },
    twilight: { bg: "#1e1b4b", text: "#fde68a", subtext: "#c4b5fd", accent: "#a78bfa", bgGradient: true, gradientStops: ["#1e1b4b", "#312e81", "#4c1d95"] },

    // === Bold/Pop ===
    monochrome: { bg: "#000000", text: "#ffffff", subtext: "#a1a1aa", accent: "#ffffff" },
    crimson: { bg: "#450a0a", text: "#ffffff", subtext: "#fca5a5", accent: "#ef4444" },
    "electric-blue": { bg: "#0c0a09", text: "#38bdf8", subtext: "#7dd3fc", accent: "#0ea5e9" },
    "neon-green": { bg: "#022c22", text: "#4ade80", subtext: "#86efac", accent: "#22c55e" },
  };

  return styles[style] || styles.dark;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generate SVG decoration elements for special styles.
 * These appear BEHIND the text content as background patterns.
 */
function generateStyleDecorations(style: string, w: number, h: number): string {
  switch (style) {
    // --- Nature ---
    case "ocean": {
      // Wavy horizontal lines
      let waves = "";
      for (let i = 0; i < 8; i++) {
        const y = h * 0.05 + i * (h * 0.12);
        const opacity = 0.08 + (i % 3) * 0.03;
        waves += `<path d="M0,${y} Q${w * 0.25},${y - 15} ${w * 0.5},${y} Q${w * 0.75},${y + 15} ${w},${y}" fill="none" stroke="#38bdf8" stroke-width="1.5" opacity="${opacity}" />`;
      }
      return waves;
    }

    case "sunset": {
      // Large sun circle and horizon bands
      const sunY = h * 0.22;
      let bands = `<circle cx="${w / 2}" cy="${sunY}" r="${w * 0.25}" fill="#fb923c" opacity="0.15" />`;
      for (let i = 0; i < 5; i++) {
        const by = sunY + 30 + i * 12;
        bands += `<rect x="0" y="${by}" width="${w}" height="4" fill="#fb923c" opacity="${0.1 - i * 0.015}" />`;
      }
      return bands;
    }

    case "aurora": {
      // Wavy colorful bands across the top
      const colors = ["#2dd4bf", "#818cf8", "#a78bfa", "#34d399", "#6366f1"];
      let auroras = "";
      for (let i = 0; i < colors.length; i++) {
        const y = h * 0.08 + i * (h * 0.06);
        const dx1 = w * 0.2 + (i % 3) * w * 0.1;
        const dx2 = w * 0.6 + (i % 2) * w * 0.15;
        auroras += `<path d="M0,${y + 20} Q${dx1},${y - 20} ${w / 2},${y + 10} Q${dx2},${y + 40} ${w},${y}" fill="none" stroke="${colors[i]}" stroke-width="${3 + (i % 2)}" opacity="0.2" stroke-linecap="round" />`;
      }
      return auroras;
    }

    case "sakura": {
      // Small flower/petal shapes scattered
      let petals = "";
      const positions = [
        [0.1, 0.08], [0.85, 0.05], [0.2, 0.15], [0.75, 0.18], [0.5, 0.1],
        [0.05, 0.3], [0.92, 0.28], [0.35, 0.22], [0.65, 0.35],
        [0.15, 0.42], [0.8, 0.45], [0.5, 0.38], [0.3, 0.48],
        [0.9, 0.08], [0.08, 0.2], [0.6, 0.05], [0.4, 0.32],
      ];
      for (const [px, py] of positions) {
        const x = w * px;
        const y = h * py;
        const size = 4 + (px * 10) % 5;
        const opacity = 0.15 + (py * 10) % 0.15;
        // 5-petal flower shape
        for (let p = 0; p < 5; p++) {
          const angle = (p * 72) * Math.PI / 180;
          const dx = Math.cos(angle) * size;
          const dy = Math.sin(angle) * size;
          petals += `<ellipse cx="${x + dx}" cy="${y + dy}" rx="${size * 0.6}" ry="${size * 0.3}" fill="#ec4899" opacity="${opacity}" transform="rotate(${p * 72},${x + dx},${y + dy})" />`;
        }
        petals += `<circle cx="${x}" cy="${y}" r="${size * 0.25}" fill="#fbbf24" opacity="${opacity + 0.1}" />`;
      }
      return petals;
    }

    case "forest": {
      // Subtle tree silhouettes at bottom edges and leaf pattern
      let trees = "";
      const treePositions = [0.02, 0.08, 0.15, 0.82, 0.88, 0.95];
      for (const tx of treePositions) {
        const x = w * tx;
        const treeH = h * (0.15 + Math.abs(tx - 0.5) * 0.1);
        const baseY = h * 0.92;
        trees += `<polygon points="${x},${baseY - treeH} ${x - 12},${baseY} ${x + 12},${baseY}" fill="#4ade80" opacity="0.06" />`;
        trees += `<polygon points="${x},${baseY - treeH * 0.7} ${x - 8},${baseY - treeH * 0.2} ${x + 8},${baseY - treeH * 0.2}" fill="#4ade80" opacity="0.08" />`;
      }
      return trees;
    }

    case "lavender": {
      // Soft circular bokeh dots
      let dots = "";
      const positions = [
        [0.1, 0.1, 20], [0.8, 0.15, 15], [0.3, 0.05, 12], [0.6, 0.2, 18],
        [0.15, 0.25, 10], [0.9, 0.3, 14], [0.5, 0.12, 16], [0.05, 0.18, 8],
        [0.7, 0.08, 11], [0.4, 0.28, 13],
      ];
      for (const [px, py, r] of positions) {
        dots += `<circle cx="${w * px}" cy="${h * py}" r="${r}" fill="#a855f7" opacity="0.08" />`;
      }
      return dots;
    }

    case "desert": {
      // Sand dune curves
      let dunes = "";
      for (let i = 0; i < 4; i++) {
        const y = h * (0.7 + i * 0.06);
        const opacity = 0.04 + i * 0.02;
        dunes += `<path d="M0,${y + 10} Q${w * 0.3},${y - 15} ${w * 0.5},${y} Q${w * 0.7},${y + 15} ${w},${y - 5}" fill="none" stroke="#d97706" stroke-width="2" opacity="${opacity}" />`;
      }
      return dunes;
    }

    case "arctic": {
      // Snowflake-like dots and crystal shapes
      let snow = "";
      const flakes = [
        [0.15, 0.1], [0.8, 0.08], [0.4, 0.2], [0.65, 0.15], [0.1, 0.3],
        [0.9, 0.25], [0.3, 0.35], [0.7, 0.32], [0.5, 0.05], [0.2, 0.22],
        [0.85, 0.38], [0.55, 0.28],
      ];
      for (const [px, py] of flakes) {
        const x = w * px;
        const y = h * py;
        const size = 3 + (px * 10) % 4;
        // Simple star/snowflake
        for (let a = 0; a < 6; a++) {
          const angle = a * 60 * Math.PI / 180;
          const ex = x + Math.cos(angle) * size;
          const ey = y + Math.sin(angle) * size;
          snow += `<line x1="${x}" y1="${y}" x2="${ex}" y2="${ey}" stroke="#06b6d4" stroke-width="0.5" opacity="0.15" />`;
        }
      }
      return snow;
    }

    // --- Urban ---
    case "midnight": {
      // Scattered stars
      let stars = "";
      const starPos = [
        [0.1, 0.05], [0.3, 0.12], [0.5, 0.03], [0.7, 0.1], [0.9, 0.07],
        [0.15, 0.2], [0.45, 0.18], [0.65, 0.22], [0.85, 0.15], [0.25, 0.08],
        [0.55, 0.25], [0.75, 0.28], [0.05, 0.14], [0.35, 0.3], [0.95, 0.2],
      ];
      for (const [px, py] of starPos) {
        const size = 1 + (px * 10) % 2;
        stars += `<circle cx="${w * px}" cy="${h * py}" r="${size}" fill="#c4b5fd" opacity="${0.2 + (py * 10) % 0.3}" />`;
      }
      return stars;
    }

    case "concrete": {
      // Subtle speckle texture using tiny dots
      let speckles = "";
      for (let i = 0; i < 40; i++) {
        const x = (i * 37 + 13) % w;
        const y = (i * 53 + 7) % h;
        speckles += `<circle cx="${x}" cy="${y}" r="0.8" fill="#78716c" opacity="0.1" />`;
      }
      return speckles;
    }

    case "neon-city": {
      // Neon glow lines and building silhouettes
      let city = "";
      // Horizontal neon lines
      const neonColors = ["#d946ef", "#ec4899", "#8b5cf6"];
      for (let i = 0; i < 3; i++) {
        const y = h * 0.15 + i * (h * 0.12);
        city += `<line x1="${w * 0.1}" y1="${y}" x2="${w * 0.9}" y2="${y}" stroke="${neonColors[i]}" stroke-width="0.5" opacity="0.15" />`;
      }
      // Building silhouettes at bottom
      const buildings = [
        [0.05, 0.18], [0.12, 0.25], [0.2, 0.15], [0.28, 0.22], [0.36, 0.3],
        [0.48, 0.2], [0.56, 0.28], [0.64, 0.17], [0.72, 0.24], [0.82, 0.19], [0.9, 0.26],
      ];
      for (const [bx, bh] of buildings) {
        const x = w * bx;
        const bw = w * 0.06;
        const by = h * 0.88;
        const buildH = h * bh;
        city += `<rect x="${x}" y="${by - buildH}" width="${bw}" height="${buildH + h * 0.12}" fill="#d946ef" opacity="0.04" />`;
        // Window dots
        for (let wy = 0; wy < 3; wy++) {
          for (let wx = 0; wx < 2; wx++) {
            city += `<rect x="${x + 3 + wx * 8}" y="${by - buildH + 5 + wy * 12}" width="3" height="3" fill="#f0abfc" opacity="0.08" />`;
          }
        }
      }
      return city;
    }

    case "chrome": {
      // Subtle diagonal lines
      let lines = "";
      for (let i = 0; i < 20; i++) {
        const x = i * (w / 10) - w * 0.5;
        lines += `<line x1="${x}" y1="0" x2="${x + w}" y2="${h}" stroke="#94a3b8" stroke-width="0.3" opacity="0.08" />`;
      }
      return lines;
    }

    case "industrial": {
      // Gear/cog shapes and diagonal caution stripes
      let elements = "";
      // Warning stripes at top
      for (let i = 0; i < 15; i++) {
        const x = i * (w / 7) - 10;
        elements += `<polygon points="${x},0 ${x + 15},0 ${x + 30},30 ${x + 15},30" fill="#f59e0b" opacity="0.06" />`;
      }
      // Simple gear outline
      const gx = w * 0.85;
      const gy = h * 0.12;
      for (let t = 0; t < 8; t++) {
        const angle = t * 45 * Math.PI / 180;
        const ex = gx + Math.cos(angle) * 25;
        const ey = gy + Math.sin(angle) * 25;
        elements += `<rect x="${ex - 3}" y="${ey - 3}" width="6" height="6" fill="#f59e0b" opacity="0.08" transform="rotate(${t * 45},${ex},${ey})" />`;
      }
      elements += `<circle cx="${gx}" cy="${gy}" r="15" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.08" />`;
      return elements;
    }

    // --- Retro/Gaming ---
    case "pixel": {
      // Pixelated grid pattern with random filled cells
      let grid = "";
      const cellSize = 12;
      const cols = Math.ceil(w / cellSize);
      const rows = Math.ceil(h / cellSize);
      // Decorative border
      for (let c = 0; c < cols; c++) {
        if (c % 3 === 0) {
          grid += `<rect x="${c * cellSize}" y="0" width="${cellSize}" height="${cellSize}" fill="#22c55e" opacity="0.08" />`;
          grid += `<rect x="${c * cellSize}" y="${(rows - 1) * cellSize}" width="${cellSize}" height="${cellSize}" fill="#22c55e" opacity="0.08" />`;
        }
      }
      for (let r = 0; r < rows; r++) {
        if (r % 3 === 0) {
          grid += `<rect x="0" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#22c55e" opacity="0.06" />`;
          grid += `<rect x="${(cols - 1) * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#22c55e" opacity="0.06" />`;
        }
      }
      // Scattered random pixels
      const pixelSeeds = [3, 7, 11, 19, 23, 31, 37, 43, 47, 53, 59, 67, 71, 79, 83, 89, 97];
      for (const seed of pixelSeeds) {
        const px = (seed * 13) % cols;
        const py = (seed * 17) % rows;
        grid += `<rect x="${px * cellSize}" y="${py * cellSize}" width="${cellSize}" height="${cellSize}" fill="#22c55e" opacity="0.05" />`;
      }
      // Grid lines
      grid += `<defs><pattern id="pixel-grid" width="${cellSize}" height="${cellSize}" patternUnits="userSpaceOnUse">
        <rect width="${cellSize}" height="${cellSize}" fill="none" stroke="#22c55e" stroke-width="0.2" opacity="0.06" />
      </pattern></defs>
      <rect width="${w}" height="${h}" fill="url(#pixel-grid)" />`;
      return grid;
    }

    case "retro-game": {
      // Hearts, score display, retro border
      let game = "";
      // Top border with repeating pattern
      for (let i = 0; i < Math.ceil(w / 16); i++) {
        const x = i * 16;
        game += `<rect x="${x}" y="0" width="8" height="8" fill="#ef4444" opacity="0.12" />`;
        game += `<rect x="${x + 8}" y="8" width="8" height="8" fill="#ef4444" opacity="0.08" />`;
      }
      // Hearts (lives)
      for (let i = 0; i < 3; i++) {
        const hx = w * 0.15 + i * 22;
        const hy = h * 0.06;
        game += `<path d="M${hx},${hy + 4} C${hx - 5},${hy - 2} ${hx - 8},${hy + 4} ${hx},${hy + 10} C${hx + 8},${hy + 4} ${hx + 5},${hy - 2} ${hx},${hy + 4}Z" fill="#ef4444" opacity="0.2" />`;
      }
      // Score-like text decoration
      game += `<text x="${w * 0.85}" y="${h * 0.065}" text-anchor="end" font-family="monospace" font-size="8" fill="#f87171" opacity="0.15">HI-SCORE</text>`;
      // Bottom border
      for (let i = 0; i < Math.ceil(w / 16); i++) {
        const x = i * 16;
        game += `<rect x="${x + 8}" y="${h - 16}" width="8" height="8" fill="#ef4444" opacity="0.08" />`;
        game += `<rect x="${x}" y="${h - 8}" width="8" height="8" fill="#ef4444" opacity="0.12" />`;
      }
      return game;
    }

    case "synthwave": {
      // Perspective grid + retro sun
      let synth = "";
      // Sun
      const sunCx = w / 2;
      const sunCy = h * 0.25;
      const sunR = w * 0.18;
      synth += `<circle cx="${sunCx}" cy="${sunCy}" r="${sunR}" fill="#f97316" opacity="0.12" />`;
      // Sun horizontal slices
      for (let i = 1; i <= 6; i++) {
        const sliceY = sunCy + i * (sunR / 7);
        const sliceH = 2 + i;
        synth += `<rect x="${sunCx - sunR}" y="${sliceY}" width="${sunR * 2}" height="${sliceH}" fill="#0f051d" opacity="0.7" rx="1" />`;
      }
      // Horizon line
      const horizonY = h * 0.45;
      synth += `<line x1="0" y1="${horizonY}" x2="${w}" y2="${horizonY}" stroke="#a855f7" stroke-width="1" opacity="0.2" />`;
      // Perspective grid below horizon
      for (let i = 1; i <= 12; i++) {
        const gy = horizonY + i * i * 2.5;
        if (gy > h) break;
        const opacity = 0.04 + i * 0.01;
        synth += `<line x1="0" y1="${gy}" x2="${w}" y2="${gy}" stroke="#d946ef" stroke-width="0.5" opacity="${opacity}" />`;
      }
      // Vertical perspective lines from center
      for (let i = -6; i <= 6; i++) {
        const bx = sunCx + i * (w * 0.2);
        synth += `<line x1="${sunCx}" y1="${horizonY}" x2="${bx}" y2="${h}" stroke="#d946ef" stroke-width="0.5" opacity="0.06" />`;
      }
      return synth;
    }

    case "vaporwave": {
      // Greek column outlines, grid, sunset gradient tones
      let vapor = "";
      // Horizontal scan lines
      for (let i = 0; i < Math.ceil(h / 4); i++) {
        if (i % 2 === 0) {
          vapor += `<rect x="0" y="${i * 4}" width="${w}" height="1" fill="#e879f9" opacity="0.015" />`;
        }
      }
      // Column left
      const colW = 18;
      const colH = h * 0.3;
      const colY = h * 0.55;
      vapor += `<rect x="${w * 0.08}" y="${colY}" width="${colW}" height="${colH}" fill="#c084fc" opacity="0.05" rx="2" />`;
      vapor += `<rect x="${w * 0.08 - 4}" y="${colY}" width="${colW + 8}" height="8" fill="#c084fc" opacity="0.06" />`;
      vapor += `<rect x="${w * 0.08 - 4}" y="${colY + colH - 8}" width="${colW + 8}" height="8" fill="#c084fc" opacity="0.06" />`;
      // Column right
      vapor += `<rect x="${w * 0.88}" y="${colY}" width="${colW}" height="${colH}" fill="#c084fc" opacity="0.05" rx="2" />`;
      vapor += `<rect x="${w * 0.88 - 4}" y="${colY}" width="${colW + 8}" height="8" fill="#c084fc" opacity="0.06" />`;
      vapor += `<rect x="${w * 0.88 - 4}" y="${colY + colH - 8}" width="${colW + 8}" height="8" fill="#c084fc" opacity="0.06" />`;
      // Floating triangle
      const tx = w / 2;
      const ty = h * 0.15;
      vapor += `<polygon points="${tx},${ty} ${tx - 30},${ty + 50} ${tx + 30},${ty + 50}" fill="none" stroke="#e879f9" stroke-width="1" opacity="0.1" />`;
      return vapor;
    }

    case "arcade": {
      // Pac-man-like dots and border
      let arc = "";
      // Border of dots
      for (let i = 0; i < Math.ceil(w / 20); i++) {
        arc += `<circle cx="${i * 20 + 10}" cy="10" r="2" fill="#facc15" opacity="0.12" />`;
        arc += `<circle cx="${i * 20 + 10}" cy="${h - 10}" r="2" fill="#facc15" opacity="0.12" />`;
      }
      for (let i = 1; i < Math.ceil(h / 20) - 1; i++) {
        arc += `<circle cx="10" cy="${i * 20 + 10}" r="2" fill="#facc15" opacity="0.12" />`;
        arc += `<circle cx="${w - 10}" cy="${i * 20 + 10}" r="2" fill="#facc15" opacity="0.12" />`;
      }
      // Center horizontal dot line
      for (let i = 0; i < Math.ceil(w / 25); i++) {
        arc += `<circle cx="${i * 25 + 12}" cy="${h * 0.44}" r="1.5" fill="#facc15" opacity="0.08" />`;
      }
      // Simple ghost shape
      const gx = w * 0.82;
      const gy = h * 0.43;
      arc += `<path d="M${gx - 8},${gy + 10} L${gx - 8},${gy - 2} Q${gx - 8},${gy - 10} ${gx},${gy - 10} Q${gx + 8},${gy - 10} ${gx + 8},${gy - 2} L${gx + 8},${gy + 10} L${gx + 5},${gy + 6} L${gx + 2},${gy + 10} L${gx - 2},${gy + 6} L${gx - 5},${gy + 10}Z" fill="#ef4444" opacity="0.1" />`;
      return arc;
    }

    case "8bit": {
      // Blocky castle/landscape silhouette at bottom
      let bits = "";
      const blockSize = 8;
      // Castle towers at bottom
      const towers = [
        { x: 0.1, h: 0.08 }, { x: 0.15, h: 0.12 }, { x: 0.2, h: 0.06 },
        { x: 0.75, h: 0.1 }, { x: 0.8, h: 0.14 }, { x: 0.85, h: 0.07 },
      ];
      for (const t of towers) {
        const tx = w * t.x;
        const th = h * t.h;
        const by = h * 0.92;
        for (let row = 0; row < Math.ceil(th / blockSize); row++) {
          for (let col = 0; col < 3; col++) {
            bits += `<rect x="${tx + col * blockSize}" y="${by - row * blockSize}" width="${blockSize}" height="${blockSize}" fill="#4ade80" opacity="0.05" />`;
          }
        }
      }
      // Decorative stars
      const starPositions = [[0.2, 0.1], [0.5, 0.06], [0.8, 0.12], [0.35, 0.15], [0.65, 0.08]];
      for (const [sx, sy] of starPositions) {
        bits += `<rect x="${w * sx}" y="${h * sy}" width="4" height="4" fill="#86efac" opacity="0.15" />`;
      }
      return bits;
    }

    case "gameboy": {
      // Gameboy-style screen border and pixel frame
      let gb = "";
      // Screen inner border
      const margin = 8;
      gb += `<rect x="${margin}" y="${margin}" width="${w - margin * 2}" height="${h - margin * 2}" fill="none" stroke="#0f380f" stroke-width="2" opacity="0.1" rx="4" />`;
      // Corner decorations
      const cornerSize = 16;
      for (const [cx, cy] of [[margin, margin], [w - margin - cornerSize, margin], [margin, h - margin - cornerSize], [w - margin - cornerSize, h - margin - cornerSize]]) {
        gb += `<rect x="${cx}" y="${cy}" width="${cornerSize}" height="${cornerSize}" fill="#0f380f" opacity="0.06" />`;
      }
      // Dot matrix overlay (subtle)
      gb += `<defs><pattern id="gb-dots" width="4" height="4" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="0.4" fill="#0f380f" opacity="0.05" />
      </pattern></defs>
      <rect width="${w}" height="${h}" fill="url(#gb-dots)" />`;
      return gb;
    }

    case "commodore": {
      // C64 style: PETSCII-like border and screen frame
      let c64 = "";
      const borderChar = 8;
      // Top/bottom PETSCII border
      for (let i = 0; i < Math.ceil(w / borderChar); i++) {
        const x = i * borderChar;
        if (i % 2 === 0) {
          c64 += `<rect x="${x}" y="0" width="${borderChar}" height="${borderChar}" fill="#7c85ca" opacity="0.1" />`;
          c64 += `<rect x="${x}" y="${h - borderChar}" width="${borderChar}" height="${borderChar}" fill="#7c85ca" opacity="0.1" />`;
        }
      }
      // Side borders
      for (let i = 0; i < Math.ceil(h / borderChar); i++) {
        const y = i * borderChar;
        if (i % 2 === 0) {
          c64 += `<rect x="0" y="${y}" width="${borderChar}" height="${borderChar}" fill="#7c85ca" opacity="0.08" />`;
          c64 += `<rect x="${w - borderChar}" y="${y}" width="${borderChar}" height="${borderChar}" fill="#7c85ca" opacity="0.08" />`;
        }
      }
      // Blinking cursor
      c64 += `<rect x="${w * 0.15}" y="${h * 0.08}" width="8" height="12" fill="#7c85ca" opacity="0.2" />`;
      return c64;
    }

    // --- Elegant ---
    case "marble": {
      // Subtle veining lines
      let veins = "";
      const veinPaths = [
        `M0,${h * 0.2} Q${w * 0.3},${h * 0.15} ${w * 0.6},${h * 0.25} Q${w * 0.8},${h * 0.3} ${w},${h * 0.22}`,
        `M0,${h * 0.5} Q${w * 0.2},${h * 0.48} ${w * 0.5},${h * 0.55} Q${w * 0.7},${h * 0.52} ${w},${h * 0.48}`,
        `M0,${h * 0.75} Q${w * 0.4},${h * 0.7} ${w * 0.7},${h * 0.78} Q${w * 0.9},${h * 0.73} ${w},${h * 0.76}`,
      ];
      for (const d of veinPaths) {
        veins += `<path d="${d}" fill="none" stroke="#a8a29e" stroke-width="0.5" opacity="0.12" />`;
      }
      return veins;
    }

    case "gold": {
      // Art deco golden lines and corner decorations
      let deco = "";
      // Corner flourishes
      deco += `<path d="M20,20 L20,60 M20,20 L60,20" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.15" />`;
      deco += `<path d="M${w - 20},20 L${w - 20},60 M${w - 20},20 L${w - 60},20" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.15" />`;
      deco += `<path d="M20,${h - 20} L20,${h - 60} M20,${h - 20} L60,${h - 20}" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.15" />`;
      deco += `<path d="M${w - 20},${h - 20} L${w - 20},${h - 60} M${w - 20},${h - 20} L${w - 60},${h - 20}" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.15" />`;
      // Diamond shapes
      const dx = w / 2;
      const dy = h * 0.12;
      deco += `<polygon points="${dx},${dy - 12} ${dx + 8},${dy} ${dx},${dy + 12} ${dx - 8},${dy}" fill="none" stroke="#f59e0b" stroke-width="0.8" opacity="0.12" />`;
      return deco;
    }

    case "rose-gold": {
      // Soft circles and thin border
      let rg = "";
      rg += `<rect x="15" y="15" width="${w - 30}" height="${h - 30}" fill="none" stroke="#fb7185" stroke-width="0.5" opacity="0.1" rx="8" />`;
      const circlePos = [[0.2, 0.1, 30], [0.8, 0.15, 20], [0.5, 0.08, 25], [0.15, 0.35, 15], [0.85, 0.3, 18]];
      for (const [cx, cy, r] of circlePos) {
        rg += `<circle cx="${w * cx}" cy="${h * cy}" r="${r}" fill="#fb7185" opacity="0.05" />`;
      }
      return rg;
    }

    case "platinum": {
      // Thin horizontal lines
      let pl = "";
      for (let i = 0; i < 6; i++) {
        const y = h * 0.1 + i * (h * 0.15);
        pl += `<line x1="${w * 0.15}" y1="${y}" x2="${w * 0.85}" y2="${y}" stroke="#94a3b8" stroke-width="0.3" opacity="0.1" />`;
      }
      return pl;
    }

    case "ivory": {
      // Subtle textile weave pattern
      let weave = "";
      weave += `<defs><pattern id="ivory-weave" width="12" height="12" patternUnits="userSpaceOnUse">
        <line x1="0" y1="6" x2="12" y2="6" stroke="#b45309" stroke-width="0.3" opacity="0.05" />
        <line x1="6" y1="0" x2="6" y2="12" stroke="#b45309" stroke-width="0.3" opacity="0.05" />
      </pattern></defs>
      <rect width="${w}" height="${h}" fill="url(#ivory-weave)" />`;
      return weave;
    }

    // --- Japanese ---
    case "washi": {
      // Washi paper texture: soft fibers and subtle dots
      let fiber = "";
      for (let i = 0; i < 25; i++) {
        const x1 = (i * 43 + 7) % w;
        const y1 = (i * 67 + 13) % h;
        const x2 = x1 + ((i % 3) - 1) * 15;
        const y2 = y1 + ((i % 2) === 0 ? 8 : -8);
        fiber += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#c2410c" stroke-width="0.3" opacity="0.06" />`;
      }
      // Red seal stamp in corner
      fiber += `<circle cx="${w * 0.85}" cy="${h * 0.08}" r="14" fill="none" stroke="#c2410c" stroke-width="1.5" opacity="0.12" />`;
      return fiber;
    }

    case "indigo": {
      // Shibori-inspired pattern: repeating circles/diamonds
      let shibori = "";
      shibori += `<defs><pattern id="shibori" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="15" cy="15" r="8" fill="none" stroke="#818cf8" stroke-width="0.5" opacity="0.08" />
        <circle cx="0" cy="0" r="8" fill="none" stroke="#818cf8" stroke-width="0.5" opacity="0.08" />
        <circle cx="30" cy="0" r="8" fill="none" stroke="#818cf8" stroke-width="0.5" opacity="0.08" />
        <circle cx="0" cy="30" r="8" fill="none" stroke="#818cf8" stroke-width="0.5" opacity="0.08" />
        <circle cx="30" cy="30" r="8" fill="none" stroke="#818cf8" stroke-width="0.5" opacity="0.08" />
      </pattern></defs>
      <rect width="${w}" height="${h}" fill="url(#shibori)" />`;
      return shibori;
    }

    case "matcha": {
      // Tea whisk circular strokes
      let tea = "";
      const cx = w / 2;
      const cy = h * 0.2;
      for (let i = 0; i < 12; i++) {
        const angle = i * 30 * Math.PI / 180;
        const ex = cx + Math.cos(angle) * 50;
        const ey = cy + Math.sin(angle) * 50;
        tea += `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="#22c55e" stroke-width="0.5" opacity="0.06" />`;
      }
      tea += `<circle cx="${cx}" cy="${cy}" r="50" fill="none" stroke="#22c55e" stroke-width="0.3" opacity="0.06" />`;
      tea += `<circle cx="${cx}" cy="${cy}" r="25" fill="none" stroke="#22c55e" stroke-width="0.3" opacity="0.08" />`;
      return tea;
    }

    case "zen": {
      // Zen garden raked sand circles
      let garden = "";
      const zcx = w * 0.7;
      const zcy = h * 0.18;
      for (let i = 1; i <= 5; i++) {
        garden += `<circle cx="${zcx}" cy="${zcy}" r="${i * 12}" fill="none" stroke="#78716c" stroke-width="0.5" opacity="0.07" />`;
      }
      // Horizontal rake lines
      for (let i = 0; i < 6; i++) {
        const y = h * 0.28 + i * 8;
        garden += `<line x1="${w * 0.1}" y1="${y}" x2="${w * 0.9}" y2="${y}" stroke="#a8a29e" stroke-width="0.3" opacity="0.06" />`;
      }
      // Stone
      garden += `<ellipse cx="${w * 0.3}" cy="${h * 0.18}" rx="10" ry="6" fill="#78716c" opacity="0.06" />`;
      return garden;
    }

    case "ukiyo": {
      // Wave pattern (Hokusai-inspired)
      let waves = "";
      for (let row = 0; row < 4; row++) {
        const baseY = h * 0.08 + row * 35;
        for (let col = 0; col < Math.ceil(w / 40); col++) {
          const x = col * 40;
          waves += `<path d="M${x},${baseY + 15} Q${x + 10},${baseY} ${x + 20},${baseY + 15} Q${x + 30},${baseY + 30} ${x + 40},${baseY + 15}" fill="none" stroke="#ef4444" stroke-width="0.5" opacity="0.08" />`;
        }
      }
      return waves;
    }

    // --- Tech ---
    case "matrix": {
      // Falling character columns (static snapshot)
      let rain = "";
      const charSet = "01";
      const colSpacing = 14;
      const numCols = Math.ceil(w / colSpacing);
      for (let c = 0; c < numCols; c++) {
        const x = c * colSpacing + 4;
        // Each column has a random height
        const colLen = 3 + ((c * 7 + 3) % 12);
        const startRow = (c * 11 + 5) % 8;
        for (let r = 0; r < colLen; r++) {
          const y = (startRow + r) * 14 + 10;
          if (y > h * 0.5) break;
          const char = charSet[(c + r) % 2];
          const opacity = r === colLen - 1 ? 0.25 : 0.04 + r * 0.01;
          const fill = r === colLen - 1 ? "#4ade80" : "#22c55e";
          rain += `<text x="${x}" y="${y}" font-family="monospace" font-size="10" fill="${fill}" opacity="${opacity}">${char}</text>`;
        }
      }
      return rain;
    }

    case "circuit": {
      // PCB trace lines and solder dots
      let pcb = "";
      // Horizontal traces
      const traceYs = [0.08, 0.16, 0.24, 0.32, 0.82, 0.88];
      for (const ty of traceYs) {
        const y = h * ty;
        const startX = (ty * 100) % 0.3 * w;
        const endX = w - startX;
        pcb += `<line x1="${startX}" y1="${y}" x2="${endX}" y2="${y}" stroke="#34d399" stroke-width="0.8" opacity="0.08" />`;
        // Solder dots at ends
        pcb += `<circle cx="${startX}" cy="${y}" r="2" fill="#6ee7b7" opacity="0.12" />`;
        pcb += `<circle cx="${endX}" cy="${y}" r="2" fill="#6ee7b7" opacity="0.12" />`;
      }
      // Vertical traces
      const traceXs = [0.1, 0.25, 0.4, 0.6, 0.75, 0.9];
      for (const tx of traceXs) {
        const x = w * tx;
        const startY = h * ((tx * 10) % 0.15);
        const endY = h * (0.3 + (tx * 10) % 0.1);
        pcb += `<line x1="${x}" y1="${startY}" x2="${x}" y2="${endY}" stroke="#34d399" stroke-width="0.8" opacity="0.06" />`;
        pcb += `<circle cx="${x}" cy="${startY}" r="2" fill="#6ee7b7" opacity="0.1" />`;
      }
      // IC chip shapes
      const chips = [[0.3, 0.12], [0.7, 0.28]];
      for (const [cx, cy] of chips) {
        const chipX = w * cx;
        const chipY = h * cy;
        pcb += `<rect x="${chipX - 10}" y="${chipY - 6}" width="20" height="12" fill="none" stroke="#34d399" stroke-width="0.5" opacity="0.1" rx="1" />`;
        // Pins
        for (let p = 0; p < 4; p++) {
          pcb += `<line x1="${chipX - 8 + p * 5}" y1="${chipY - 6}" x2="${chipX - 8 + p * 5}" y2="${chipY - 10}" stroke="#34d399" stroke-width="0.5" opacity="0.08" />`;
          pcb += `<line x1="${chipX - 8 + p * 5}" y1="${chipY + 6}" x2="${chipX - 8 + p * 5}" y2="${chipY + 10}" stroke="#34d399" stroke-width="0.5" opacity="0.08" />`;
        }
      }
      return pcb;
    }

    case "cyber": {
      // Hexagonal grid and scan lines
      let hex = "";
      const hexSize = 20;
      const hexH = hexSize * Math.sqrt(3);
      for (let row = 0; row < Math.ceil(h / hexH) && row < 8; row++) {
        for (let col = 0; col < Math.ceil(w / (hexSize * 3)); col++) {
          const cx = col * hexSize * 3 + (row % 2) * hexSize * 1.5;
          const cy = row * hexH;
          const points = [];
          for (let i = 0; i < 6; i++) {
            const angle = (60 * i - 30) * Math.PI / 180;
            points.push(`${cx + hexSize * Math.cos(angle)},${cy + hexSize * Math.sin(angle)}`);
          }
          hex += `<polygon points="${points.join(" ")}" fill="none" stroke="#22d3ee" stroke-width="0.3" opacity="0.06" />`;
        }
      }
      // Horizontal scan line
      hex += `<rect x="0" y="${h * 0.35}" width="${w}" height="1" fill="#22d3ee" opacity="0.08" />`;
      return hex;
    }

    case "hologram": {
      // Rainbow refraction lines
      let holo = "";
      const holoColors = ["#c4b5fd", "#e879f9", "#22d3ee", "#a78bfa", "#f0abfc"];
      for (let i = 0; i < 15; i++) {
        const y = i * (h / 15);
        const color = holoColors[i % holoColors.length];
        holo += `<line x1="0" y1="${y}" x2="${w}" y2="${y + h * 0.05}" stroke="${color}" stroke-width="0.5" opacity="0.06" />`;
      }
      // Diagonal refraction
      for (let i = 0; i < 8; i++) {
        const x = i * (w / 5) - w * 0.2;
        holo += `<line x1="${x}" y1="0" x2="${x + w * 0.3}" y2="${h}" stroke="#e879f9" stroke-width="0.3" opacity="0.04" />`;
      }
      return holo;
    }

    case "terminal": {
      // Terminal prompt and scan lines
      let term = "";
      // CRT scan lines
      term += `<defs><pattern id="scanlines" width="${w}" height="4" patternUnits="userSpaceOnUse">
        <rect width="${w}" height="1" fill="#4ade80" opacity="0.02" />
      </pattern></defs>
      <rect width="${w}" height="${h}" fill="url(#scanlines)" />`;
      // Prompt decoration
      term += `<text x="15" y="25" font-family="monospace" font-size="9" fill="#4ade80" opacity="0.15">$ _</text>`;
      // Frame
      term += `<rect x="5" y="5" width="${w - 10}" height="${h - 10}" fill="none" stroke="#4ade80" stroke-width="0.5" opacity="0.06" rx="2" />`;
      return term;
    }

    // --- Gradients (decorations are minimal, the gradient bg does the work) ---
    case "fire": {
      // Ember particles
      let embers = "";
      const emberPos = [
        [0.1, 0.2], [0.3, 0.1], [0.5, 0.15], [0.7, 0.08], [0.9, 0.18],
        [0.2, 0.3], [0.6, 0.25], [0.8, 0.32], [0.4, 0.35], [0.15, 0.12],
      ];
      for (const [ex, ey] of emberPos) {
        const size = 1 + (ex * 10) % 2;
        embers += `<circle cx="${w * ex}" cy="${h * ey}" r="${size}" fill="#fbbf24" opacity="0.12" />`;
      }
      return embers;
    }

    case "ice": {
      // Crystal facets
      let crystals = "";
      const facets = [[0.15, 0.1], [0.8, 0.15], [0.45, 0.08], [0.65, 0.22]];
      for (const [fx, fy] of facets) {
        const x = w * fx;
        const y = h * fy;
        crystals += `<polygon points="${x},${y - 10} ${x + 8},${y} ${x},${y + 10} ${x - 8},${y}" fill="none" stroke="#06b6d4" stroke-width="0.5" opacity="0.1" />`;
      }
      return crystals;
    }

    case "peach": {
      // Soft round shapes
      let shapes = "";
      shapes += `<circle cx="${w * 0.15}" cy="${h * 0.1}" r="30" fill="#f97316" opacity="0.04" />`;
      shapes += `<circle cx="${w * 0.85}" cy="${h * 0.2}" r="20" fill="#ec4899" opacity="0.04" />`;
      shapes += `<circle cx="${w * 0.5}" cy="${h * 0.06}" r="25" fill="#f97316" opacity="0.03" />`;
      return shapes;
    }

    case "berry": {
      // Berry-like clusters
      let berries = "";
      const clusters = [[0.15, 0.1], [0.85, 0.18], [0.4, 0.06]];
      for (const [bx, by] of clusters) {
        const x = w * bx;
        const y = h * by;
        for (let i = 0; i < 5; i++) {
          const angle = i * 72 * Math.PI / 180;
          berries += `<circle cx="${x + Math.cos(angle) * 6}" cy="${y + Math.sin(angle) * 6}" r="4" fill="#c084fc" opacity="0.06" />`;
        }
      }
      return berries;
    }

    case "twilight": {
      // Stars fading in
      let stars = "";
      const twStars = [
        [0.1, 0.05], [0.25, 0.12], [0.4, 0.03], [0.55, 0.1], [0.7, 0.06],
        [0.85, 0.14], [0.15, 0.2], [0.5, 0.18], [0.75, 0.22], [0.9, 0.08],
        [0.3, 0.25], [0.6, 0.28], [0.05, 0.15], [0.95, 0.1],
      ];
      for (const [sx, sy] of twStars) {
        const size = 0.5 + (sx * 10) % 1.5;
        stars += `<circle cx="${w * sx}" cy="${h * sy}" r="${size}" fill="#fde68a" opacity="${0.1 + sy * 0.5}" />`;
      }
      return stars;
    }

    // --- Bold/Pop (keep decorations minimal to let the bold colors speak) ---
    case "monochrome": {
      // Halftone dot pattern
      let dots = "";
      dots += `<defs><pattern id="halftone" width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="5" cy="5" r="1" fill="#ffffff" opacity="0.04" />
      </pattern></defs>
      <rect width="${w}" height="${h}" fill="url(#halftone)" />`;
      return dots;
    }

    case "crimson": {
      // Vertical stripe accents
      let stripes = "";
      for (let i = 0; i < 5; i++) {
        const x = w * (0.05 + i * 0.23);
        stripes += `<rect x="${x}" y="0" width="1" height="${h}" fill="#ef4444" opacity="0.08" />`;
      }
      return stripes;
    }

    case "electric-blue": {
      // Electric spark lines
      let sparks = "";
      const sparkPaths = [
        `M${w * 0.1},${h * 0.1} L${w * 0.15},${h * 0.12} L${w * 0.12},${h * 0.15} L${w * 0.18},${h * 0.18}`,
        `M${w * 0.85},${h * 0.08} L${w * 0.8},${h * 0.1} L${w * 0.87},${h * 0.13} L${w * 0.82},${h * 0.16}`,
        `M${w * 0.5},${h * 0.05} L${w * 0.53},${h * 0.08} L${w * 0.48},${h * 0.1} L${w * 0.55},${h * 0.13}`,
      ];
      for (const d of sparkPaths) {
        sparks += `<path d="${d}" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.1" stroke-linejoin="round" />`;
      }
      return sparks;
    }

    case "neon-green": {
      // Glowing grid
      let glow = "";
      glow += `<defs><pattern id="neon-grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="none" stroke="#22c55e" stroke-width="0.3" opacity="0.06" />
      </pattern></defs>
      <rect width="${w}" height="${h}" fill="url(#neon-grid)" />`;
      // Bright corner accents
      glow += `<circle cx="0" cy="0" r="60" fill="#4ade80" opacity="0.03" />`;
      glow += `<circle cx="${w}" cy="${h}" r="60" fill="#4ade80" opacity="0.03" />`;
      return glow;
    }

    default:
      return "";
  }
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
    const stops = colors.gradientStops || [colors.bg, colors.bg];
    let stopElements = "";
    for (let i = 0; i < stops.length; i++) {
      const offset = Math.round((i / (stops.length - 1)) * 100);
      stopElements += `<stop offset="${offset}%" style="stop-color:${stops[i]};stop-opacity:1" />`;
    }
    bgFill = `
      <defs>
        <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          ${stopElements}
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#bg-grad)" />
    `;
  }

  // Generate style-specific decorations
  const decorations = generateStyleDecorations(config.style, w, h);

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
  ${decorations}
  ${lines.join("\n  ")}
</svg>`;
}
