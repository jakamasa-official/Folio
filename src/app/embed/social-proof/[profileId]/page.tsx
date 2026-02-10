"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Eye } from "lucide-react";

export default function SocialProofEmbed() {
  const { profileId } = useParams<{ profileId: string }>();
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch(`/api/widget/social-proof?profile_id=${profileId}`);
        const data = await res.json();
        setCount(data.count || 0);
      } catch {}
    }

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [profileId]);

  if (count === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-lg ring-1 ring-gray-100">
        <Eye className="h-4 w-4 text-green-500" />
        <span>{count}人が閲覧中</span>
      </div>
    </div>
  );
}
