"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { APP_NAME } from "@/lib/constants";
import {
  User,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  Image,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "マイページ", icon: User },
  { href: "/dashboard/analytics", label: "アナリティクス", icon: BarChart3 },
  { href: "/dashboard/settings", label: "設定", icon: Settings },
];

function NavContent({
  username,
  onLogout,
}: {
  username?: string;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <Link href="/" className="text-xl font-bold tracking-tight">
          {APP_NAME}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
        <Link
          href="/wallpaper"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Image className="h-4 w-4" />
          壁紙名刺
        </Link>
      </nav>

      <div className="border-t p-3 space-y-1">
        {username && (
          <Link
            href={`/${username}`}
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            ページを見る
          </Link>
        )}
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          ログアウト
        </button>
      </div>
    </div>
  );
}

export function DashboardNav({ username }: { username?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* Mobile hamburger */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center border-b bg-background px-4 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <NavContent username={username} onLogout={handleLogout} />
          </SheetContent>
        </Sheet>
        <span className="ml-3 font-semibold">{APP_NAME}</span>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-64 border-r bg-background md:block">
        <NavContent username={username} onLogout={handleLogout} />
      </aside>

      {/* Mobile spacer */}
      <div className="h-14 md:hidden" />
    </>
  );
}
