"use client";

import { UserPlus } from "lucide-react";

interface VCardButtonProps {
  displayName: string;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  profileUrl: string;
}

export function VCardButton({
  displayName,
  title,
  email,
  phone,
  location,
  profileUrl,
}: VCardButtonProps) {
  function handleDownload() {
    const lines: string[] = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${displayName}`,
    ];

    if (title) {
      lines.push(`TITLE:${title}`);
    }
    if (email) {
      lines.push(`EMAIL:${email}`);
    }
    if (phone) {
      lines.push(`TEL:${phone}`);
    }
    if (location) {
      lines.push(`ADR:;;${location};;;`);
    }

    lines.push(`URL:${profileUrl}`);
    lines.push("END:VCARD");

    const vcardString = lines.join("\r\n");
    const blob = new Blob([vcardString], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${displayName}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleDownload}
      className="flex w-full items-center justify-center gap-2 rounded-lg border px-5 py-3.5 text-sm font-medium transition-all hover:scale-[1.02]"
    >
      <UserPlus className="h-4 w-4" />
      連絡先に追加
    </button>
  );
}
