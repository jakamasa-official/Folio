export const APP_NAME = "Folio";
export const APP_DESCRIPTION = "あなたのビジネスをオンラインに。10分で、ひとつのツールで。";
function resolveAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw}`;
}
export const APP_URL = resolveAppUrl();

export const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

export const MAX_LINKS = 50;
export const MAX_BIO_LENGTH = 500;
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const MAX_PROFILES_FREE = 1;
export const MAX_PROFILES_PRO = 5;
export const PRO_PRICE_MONTHLY = 480; // JPY
export const PRO_PRICE_YEARLY = 3980; // JPY
export const PRO_PLUS_PRICE_MONTHLY = 1480; // JPY
export const PRO_PLUS_PRICE_YEARLY = 11800; // JPY
