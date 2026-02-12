import type { ReactNode } from "react";

export default function EmbedLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "transparent",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
