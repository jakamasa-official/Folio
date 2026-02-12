"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardNav } from "@/components/dashboard/nav";
import { OnboardingWizard, shouldShowOnboarding } from "@/components/dashboard/onboarding-wizard";
import { TutorialTour, isTourCompleted, resetTourCompletion } from "@/components/dashboard/tutorial-tour";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { I18nProvider, useTranslation } from "@/lib/i18n/client";
import { getLocaleFromCookie, type Locale } from "@/lib/i18n";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | undefined>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let initialLoadDone = false;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUser(user);

      // Fetch or create profile
      let { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profileData) {
        const metadata = user.user_metadata || {};
        const fallbackUsername = user.email?.split("@")[0]?.replace(/[^a-z0-9_-]/gi, "-")?.slice(0, 30) || `user-${user.id.slice(0, 8)}`;
        const uname = (metadata.username || fallbackUsername).toLowerCase();
        const displayName = metadata.display_name || uname;

        const { data: newProfile, error } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            username: uname,
            display_name: displayName,
          })
          .select()
          .single();

        if (error) {
          const uniqueUsername = `${uname.slice(0, 22)}-${Math.random().toString(36).slice(2, 8)}`;
          const { data: retryProfile } = await supabase
            .from("profiles")
            .insert({
              user_id: user.id,
              username: uniqueUsername,
              display_name: displayName,
            })
            .select()
            .single();
          profileData = retryProfile;
        } else {
          profileData = newProfile;
        }
      }

      const typedProfile = profileData as Profile | null;
      setProfile(typedProfile);
      setUsername(typedProfile?.username);

      // Check if onboarding should show
      if (typedProfile && shouldShowOnboarding(typedProfile)) {
        setShowOnboarding(true);
      }

      setLoading(false);
      initialLoadDone = true;
    }

    init();

    // Only redirect on sign-out AFTER the initial load is done.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || (initialLoadDone && !session?.user)) {
        window.location.href = "/login";
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  function handleOnboardingComplete() {
    setShowOnboarding(false);
  }

  function handleStartTour() {
    resetTourCompletion();
    setShowTour(true);
  }

  function handleTourComplete() {
    setShowTour(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const locale = (typeof document !== "undefined" ? getLocaleFromCookie(document.cookie) : "ja") as Locale;

  return (
    <I18nProvider initialLocale={locale} namespaces={["common", "dashboard", "editor", "settings", "analytics", "marketing", "bookings", "customers", "reviews", "profile", "pricing"]}>
      <DashboardLayoutInner
        username={username}
        profile={profile}
        showOnboarding={showOnboarding}
        showTour={showTour}
        onStartTour={handleStartTour}
        onOnboardingComplete={handleOnboardingComplete}
        onTourComplete={handleTourComplete}
      >
        {children}
      </DashboardLayoutInner>
    </I18nProvider>
  );
}

function DashboardLayoutInner({
  username,
  profile,
  showOnboarding,
  showTour,
  onStartTour,
  onOnboardingComplete,
  onTourComplete,
  children,
}: {
  username?: string;
  profile: Profile | null;
  showOnboarding: boolean;
  showTour: boolean;
  onStartTour: () => void;
  onOnboardingComplete: () => void;
  onTourComplete: () => void;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen">
      <DashboardNav username={username} isPro={profile?.is_pro} />

      {/* Help button in top-right (desktop) */}
      <div className="fixed top-4 right-4 z-40 hidden md:block">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={onStartTour}
          title={t("layout.tutorialTooltip")}
        >
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Help button in mobile header area */}
      <div className="fixed top-3 right-4 z-50 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={onStartTour}
          title={t("layout.tutorialTooltip")}
        >
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64">
        {children}
      </main>

      {/* Onboarding Wizard */}
      {showOnboarding && profile && (
        <OnboardingWizard
          profile={profile}
          onComplete={onOnboardingComplete}
          onStartTour={onStartTour}
        />
      )}

      {/* Tutorial Tour */}
      <TutorialTour active={showTour} onComplete={onTourComplete} />
    </div>
  );
}
