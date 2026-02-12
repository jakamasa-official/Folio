"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { APP_NAME } from "@/lib/constants";
import {
  Home,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  Inbox,
  Calendar,
  Users,
  Star,
  Stamp,
  MessageSquare,
  Megaphone,
  MessageCircle,
  ChevronDown,
  Crown,
  CreditCard,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/lib/i18n/client";
import { LanguageToggle } from "@/components/ui/language-toggle";

// --- Badge hook: fetches unread inbox + pending bookings counts ---
function useNavBadges() {
  const [inboxCount, setInboxCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchCounts() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!profile || cancelled) return;

        // Unread contact submissions
        const { count: unread } = await supabase
          .from("contact_submissions")
          .select("id", { count: "exact", head: true })
          .eq("profile_id", profile.id)
          .eq("is_read", false);

        // Pending bookings
        const { count: pending } = await supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("profile_id", profile.id)
          .eq("status", "pending");

        if (!cancelled) {
          setInboxCount(unread ?? 0);
          setBookingsCount(pending ?? 0);
        }
      } catch {
        // silently fail — badges are non-critical
      }
    }

    fetchCounts();
    // Refresh every 60 seconds
    const interval = setInterval(fetchCounts, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { inboxCount, bookingsCount };
}

// --- Small red badge ---
function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

// --- Core nav item ---
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tourId?: string;
  badge?: number;
  external?: boolean;
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = item.href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(item.href);

  const content = (
    <>
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.badge !== undefined && <NavBadge count={item.badge} />}
      {item.external && <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />}
    </>
  );

  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      data-tour-id={item.tourId}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {content}
    </Link>
  );
}

// --- Marketing collapsible section ---
const MARKETING_STORAGE_KEY = "folio-marketing-nav-open";

function MarketingSection({ pathname }: { pathname: string }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(MARKETING_STORAGE_KEY);
    if (stored !== null) {
      setIsOpen(stored === "true");
    }
    // default is closed (false) for new users
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      localStorage.setItem(MARKETING_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const items: NavItem[] = [
    { href: "/dashboard/stamps", label: t("nav.stamps"), icon: Stamp },
    { href: "/dashboard/messages", label: t("nav.messages"), icon: MessageSquare },
    { href: "/dashboard/automations", label: t("nav.automations"), icon: Zap, tourId: "automations" },
    { href: "/dashboard/referrals", label: t("nav.referrals"), icon: Megaphone },
    { href: "/dashboard/line", label: t("nav.line"), icon: MessageCircle },
  ];

  return (
    <div className="mt-4" data-tour-id="marketing-section">
      <button
        onClick={toggle}
        className="flex w-full items-center gap-1 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            !isOpen && "-rotate-90"
          )}
        />
        {t("nav.marketing")}
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="space-y-1 pt-1">
          {items.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Nav content ---
function NavContent({
  username,
  isPro,
  onLogout,
}: {
  username?: string;
  isPro?: boolean;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const { inboxCount, bookingsCount } = useNavBadges();
  const { t } = useTranslation();

  const coreItems: NavItem[] = [
    { href: "/dashboard", label: t("nav.mypage"), icon: Home, tourId: "nav-mypage" },
    { href: "/dashboard/analytics", label: t("nav.analytics"), icon: BarChart3, tourId: "nav-analytics" },
    { href: "/dashboard/inbox", label: t("nav.inbox"), icon: Inbox, tourId: "nav-inbox", badge: inboxCount },
    { href: "/dashboard/bookings", label: t("nav.bookings"), icon: Calendar, tourId: "nav-bookings", badge: bookingsCount },
    { href: "/dashboard/customers", label: t("nav.customers"), icon: Users, tourId: "nav-customers" },
    { href: "/dashboard/reviews", label: t("nav.reviews"), icon: Star, tourId: "reviews" },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <Link href="/" className="text-xl font-bold tracking-tight">
          {APP_NAME}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        {/* Core section */}
        <div className="space-y-1">
          {coreItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>

        {/* Marketing collapsible section */}
        <MarketingSection pathname={pathname} />

        {/* Settings + Billing */}
        <div className="mt-4 space-y-1">
          <NavLink
            item={{ href: "/dashboard/settings", label: t("nav.settings"), icon: Settings, tourId: "nav-settings" }}
            pathname={pathname}
          />
          {isPro ? (
            <NavLink
              item={{ href: "/dashboard/billing", label: t("nav.planAndBilling"), icon: CreditCard }}
              pathname={pathname}
            />
          ) : (
            <Link
              href="/dashboard/billing"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/dashboard/billing"
                  ? "bg-primary text-primary-foreground"
                  : "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-700 hover:from-yellow-500/20 hover:to-orange-500/20 dark:text-yellow-400"
              )}
            >
              <Crown className="h-4 w-4" />
              <span className="flex-1">{t("nav.upgrade")}</span>
              <Sparkles className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </nav>

      <div className="border-t p-3 space-y-1">
        <div className="px-3 py-1">
          <LanguageToggle variant="ghost" size="sm" />
        </div>
        {username && (
          <Link
            href={`/${username}`}
            target="_blank"
            data-tour-id="nav-view-page"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            {t("nav.viewPage")}
          </Link>
        )}
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          {t("nav.logout")}
        </button>
      </div>
    </div>
  );
}

export function DashboardNav({ username, isPro }: { username?: string; isPro?: boolean }) {
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
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
            <NavContent username={username} isPro={isPro} onLogout={handleLogout} />
          </SheetContent>
        </Sheet>
        <span className="ml-3 font-semibold">{APP_NAME}</span>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-64 border-r bg-background md:block">
        <NavContent username={username} isPro={isPro} onLogout={handleLogout} />
      </aside>

      {/* Mobile spacer */}
      <div className="h-14 md:hidden" />
    </>
  );
}
