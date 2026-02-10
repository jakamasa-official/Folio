import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <h2 className="mt-4 text-xl font-semibold">ページが見つかりません</h2>
      <p className="mt-2 text-muted-foreground">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/">
          <Button variant="outline">
            {APP_NAME}トップへ
          </Button>
        </Link>
        <Link href="/signup">
          <Button>
            無料で始める
          </Button>
        </Link>
      </div>
    </div>
  );
}
