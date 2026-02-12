"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  Download,
  Shield,
} from "lucide-react";
import { type Profile, isProUser } from "@/lib/types";
import { USERNAME_REGEX, APP_URL } from "@/lib/constants";

// --- Notification preferences stored in localStorage ---
interface NotificationPrefs {
  emailOnBooking: boolean;
  emailOnContact: boolean;
  emailOnSubscriber: boolean;
}

const NOTIF_STORAGE_KEY = "folio-notification-prefs";

function loadNotifPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return { emailOnBooking: true, emailOnContact: true, emailOnSubscriber: false };
  try {
    const stored = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { emailOnBooking: true, emailOnContact: true, emailOnSubscriber: false };
}

function saveNotifPrefs(prefs: NotificationPrefs) {
  localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(prefs));
}

// --- Toggle switch ---
function Toggle({
  checked,
  onToggle,
  label,
  description,
}: {
  checked: boolean;
  onToggle: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onToggle(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// --- Account Tab ---
function AccountTab({
  profile,
  email,
  onProfileUpdate,
}: {
  profile: Profile | null;
  email: string;
  onProfileUpdate: (p: Profile) => void;
}) {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [usernameError, setUsernameError] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const router = useRouter();

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(t("settings.passwordChanged"));
      setNewPassword("");
    }
    setLoading(false);
  }

  async function handleDisplayNameSave() {
    if (!profile || !displayName.trim()) return;
    setSavingName(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("id", profile.id)
      .select()
      .single();
    if (data) onProfileUpdate(data as Profile);
    setSavingName(false);
  }

  async function handleUsernameSave() {
    if (!profile) return;
    setUsernameError("");
    setUsernameSuccess("");

    if (!USERNAME_REGEX.test(username)) {
      setUsernameError(t("settings.usernameInvalid"));
      return;
    }

    setSavingUsername(true);
    const supabase = createClient();

    // Check availability
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", username)
      .neq("id", profile.id)
      .maybeSingle();

    if (existing) {
      setUsernameError(t("settings.usernameTaken"));
      setSavingUsername(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .update({ username: username.toLowerCase() })
      .eq("id", profile.id)
      .select()
      .single();

    if (data) {
      onProfileUpdate(data as Profile);
      setUsernameSuccess(t("settings.usernameChanged"));
    }
    setSavingUsername(false);
  }

  async function handleDeleteAccount() {
    if (!confirm(t("settings.deleteAccountConfirm"))) return;
    if (!confirm(t("settings.deleteAccountConfirmFinal"))) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").delete().eq("user_id", user.id);
    }
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Email (read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.emailTitle")}</CardTitle>
          <CardDescription>{t("settings.emailDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Input value={email} readOnly className="bg-muted" />
        </CardContent>
      </Card>

      {/* Display name */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.displayNameTitle")}</CardTitle>
          <CardDescription>{t("settings.displayNameDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t("settings.displayNamePlaceholder")}
            />
            <Button onClick={handleDisplayNameSave} disabled={savingName}>
              {savingName ? t("settings.saving") : t("settings.save")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Username */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.usernameTitle")}</CardTitle>
          <CardDescription>
            {t("settings.usernameProfileUrl", { appUrl: APP_URL, username })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""));
                setUsernameError("");
                setUsernameSuccess("");
              }}
              placeholder="your-username"
            />
            <Button onClick={handleUsernameSave} disabled={savingUsername}>
              {savingUsername ? t("settings.usernameChecking") : t("settings.usernameChange")}
            </Button>
          </div>
          {usernameError && (
            <p className="text-sm text-destructive">{usernameError}</p>
          )}
          {usernameSuccess && (
            <p className="text-sm text-green-600">{usernameSuccess}</p>
          )}
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.passwordTitle")}</CardTitle>
          <CardDescription>{t("settings.passwordDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            {message && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{message}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("settings.newPasswordLabel")}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? t("settings.passwordChanging") : t("settings.passwordChangeButton")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">{t("settings.deleteAccountTitle")}</CardTitle>
          <CardDescription>
            {t("settings.deleteAccountDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDeleteAccount}>
            {t("settings.deleteAccountButton")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Notifications Tab ---
function NotificationsTab() {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<NotificationPrefs>(loadNotifPrefs);

  function updatePref(key: keyof NotificationPrefs, value: boolean) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    saveNotifPrefs(updated);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.notificationsTitle")}</CardTitle>
          <CardDescription>{t("settings.notificationsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          <Toggle
            checked={prefs.emailOnBooking}
            onToggle={(v) => updatePref("emailOnBooking", v)}
            label={t("settings.notifBookingLabel")}
            description={t("settings.notifBookingDescription")}
          />
          <Toggle
            checked={prefs.emailOnContact}
            onToggle={(v) => updatePref("emailOnContact", v)}
            label={t("settings.notifContactLabel")}
            description={t("settings.notifContactDescription")}
          />
          <Toggle
            checked={prefs.emailOnSubscriber}
            onToggle={(v) => updatePref("emailOnSubscriber", v)}
            label={t("settings.notifSubscriberLabel")}
            description={t("settings.notifSubscriberDescription")}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// --- Custom Domain Tab ---
function DomainTab({ profile, onProfileUpdate }: { profile: Profile | null; onProfileUpdate: (p: Profile) => void }) {
  const { t } = useTranslation();
  const [domain, setDomain] = useState(profile?.custom_domain || "");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  if (!profile) return null;

  // Pro-only gate
  if (!isProUser(profile)) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-yellow-500" />
          <h2 className="mb-2 text-lg font-semibold">{t("settings.domainProRequired")}</h2>
          <p className="mb-4 text-muted-foreground">
            {t("settings.domainProRequiredDescription")}
          </p>
        </CardContent>
      </Card>
    );
  }

  async function saveDomain() {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .update({
        custom_domain: domain.trim() || null,
        custom_domain_verified: false,
      })
      .eq("id", profile.id)
      .select()
      .single();
    if (data) onProfileUpdate(data as Profile);
    setSaving(false);
  }

  async function removeDomain() {
    if (!profile) return;
    if (!confirm(t("settings.domainDeleteConfirm"))) return;
    setRemoving(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .update({
        custom_domain: null,
        custom_domain_verified: false,
      })
      .eq("id", profile.id)
      .select()
      .single();
    if (data) onProfileUpdate(data as Profile);
    setDomain("");
    setRemoving(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.domainSettingsTitle")}</CardTitle>
          <CardDescription>{t("settings.domainSettingsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">{t("settings.domainNameLabel")}</Label>
            <div className="flex gap-2">
              <Input
                id="domain"
                type="text"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
              <Button onClick={saveDomain} disabled={saving}>
                {saving ? t("settings.saving") : t("settings.save")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {profile.custom_domain && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle>{t("settings.dnsSettingsTitle")}</CardTitle>
                {profile.custom_domain_verified ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {t("settings.dnsVerified")}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                    <Clock className="mr-1 h-3 w-3" />
                    {t("settings.dnsPending")}
                  </Badge>
                )}
              </div>
              <CardDescription>{t("settings.dnsInstructions")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left font-medium">{t("settings.dnsTableType")}</th>
                      <th className="px-4 py-2 text-left font-medium">{t("settings.dnsTableName")}</th>
                      <th className="px-4 py-2 text-left font-medium">{t("settings.dnsTableValue")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-2">
                        <Badge variant="outline">CNAME</Badge>
                      </td>
                      <td className="px-4 py-2 font-mono text-xs">@</td>
                      <td className="px-4 py-2 font-mono text-xs">cname.vercel-dns.com</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">
                        <Badge variant="outline">CNAME</Badge>
                      </td>
                      <td className="px-4 py-2 font-mono text-xs">www</td>
                      <td className="px-4 py-2 font-mono text-xs">cname.vercel-dns.com</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                <p>{t("settings.dnsNote")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">{t("settings.domainDeleteTitle")}</CardTitle>
              <CardDescription>
                {t("settings.domainDeleteDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={removeDomain} disabled={removing}>
                <Trash2 className="mr-2 h-4 w-4" />
                {removing ? t("settings.domainDeleting") : t("settings.domainDeleteButton")}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// --- Data & Privacy Tab ---
function DataTab({ profile }: { profile: Profile | null }) {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  async function handleExport() {
    if (!profile) return;
    setExporting(true);

    try {
      const supabase = createClient();

      // Fetch customer data
      const { data: customers } = await supabase
        .from("customers")
        .select("*")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false });

      if (!customers || customers.length === 0) {
        alert(t("settings.dataExportNoData"));
        setExporting(false);
        return;
      }

      // Convert to CSV
      const headers = [
        t("settings.csvName"),
        t("settings.csvEmail"),
        t("settings.csvPhone"),
        t("settings.csvSource"),
        t("settings.csvTags"),
        t("settings.csvNotes"),
        t("settings.csvFirstSeen"),
        t("settings.csvLastSeen"),
        t("settings.csvBookings"),
        t("settings.csvMessages"),
      ];
      const rows = customers.map((c) => [
        c.name || "",
        c.email || "",
        c.phone || "",
        c.source || "",
        (c.tags || []).join("; "),
        c.notes || "",
        c.first_seen_at || "",
        c.last_seen_at || "",
        String(c.total_bookings || 0),
        String(c.total_messages || 0),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

      // BOM for Japanese Excel compatibility
      const bom = "\uFEFF";
      const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `folio-customers-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert(t("settings.dataExportError"));
    }

    setExporting(false);
  }

  async function handleDeleteAccount() {
    if (!confirm(t("settings.deleteAccountConfirm"))) return;
    if (!confirm(t("settings.deleteAccountConfirmFinal"))) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").delete().eq("user_id", user.id);
    }
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t("settings.dataExportTitle")}
          </CardTitle>
          <CardDescription>
            {t("settings.dataExportDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? t("settings.dataExporting") : t("settings.dataExportButton")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t("settings.privacyTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            {t("settings.privacyLink")}
          </a>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">{t("settings.deleteAccountTitle")}</CardTitle>
          <CardDescription>
            {t("settings.deleteAccountDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDeleteAccount}>
            {t("settings.deleteAccountButton")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main Settings Page ---
export default function SettingsPage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setEmail(user.email || "");

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) setProfile(data as Profile);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">{t("settings.pageTitle")}</h1>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{t("settings.pageTitle")}</h1>

      <Tabs defaultValue="account">
        <TabsList className="w-full">
          <TabsTrigger value="account">{t("settings.tabAccount")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("settings.tabNotifications")}</TabsTrigger>
          <TabsTrigger value="domain">
            <Globe className="mr-1.5 h-3.5 w-3.5" />
            {t("settings.tabDomain")}
          </TabsTrigger>
          <TabsTrigger value="data">{t("settings.tabData")}</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountTab
            profile={profile}
            email={email}
            onProfileUpdate={setProfile}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="domain">
          <DomainTab profile={profile} onProfileUpdate={setProfile} />
        </TabsContent>

        <TabsContent value="data">
          <DataTab profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
