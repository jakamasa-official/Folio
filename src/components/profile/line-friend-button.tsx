"use client";

import { SiLine } from "react-icons/si";
import { useTranslation } from "@/lib/i18n/client";

interface LineFriendButtonProps {
  url: string;
}

export function LineFriendButton({ url }: LineFriendButtonProps) {
  const { t } = useTranslation();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#06C755] px-5 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
    >
      <SiLine className="h-5 w-5" />
      {t("lineAddFriend")}
    </a>
  );
}
