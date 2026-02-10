export const APP_NAME = "Folio";
export const APP_DESCRIPTION = "あなたのビジネスをオンラインに。10分で、ひとつのツールで。";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

export const MAX_LINKS = 50;
export const MAX_BIO_LENGTH = 500;
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const MAX_PROFILES_FREE = 1;
export const MAX_PROFILES_PRO = 5;
export const PRO_PRICE_MONTHLY = 2000; // JPY
