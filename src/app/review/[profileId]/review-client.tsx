"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/client";

interface ProfileInfo {
  display_name: string;
  avatar_url: string | null;
}

export default function ReviewClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const profileId = params.profileId as string;
  const token = searchParams.get("token");
  const { t } = useTranslation();

  const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [serviceTags, setServiceTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [autoApproved, setAutoApproved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", profileId)
          .eq("is_published", true)
          .maybeSingle();

        if (data) {
          setProfileInfo({
            display_name: data.display_name || "ビジネス",
            avatar_url: data.avatar_url || null,
          });
        }
      } catch {
        // Non-critical — page still works without profile info
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [profileId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("評価を選択してください");
      return;
    }
    if (!reviewerName.trim()) {
      setError("お名前を入力してください");
      return;
    }
    if (!body.trim()) {
      setError("レビュー本文を入力してください");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: profileId,
          reviewer_name: reviewerName.trim(),
          reviewer_email: reviewerEmail.trim() || undefined,
          rating,
          title: title.trim() || undefined,
          body: body.trim(),
          token: token || undefined,
          service_tags: serviceTags.length > 0 ? serviceTags : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "レビューの投稿に失敗しました");
        return;
      }

      setAutoApproved(data.auto_approved === true);
      setSubmitted(true);
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  function addTag() {
    const trimmed = tagInput.trim();
    if (trimmed && !serviceTags.includes(trimmed) && serviceTags.length < 10) {
      setServiceTags([...serviceTags, trimmed]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setServiceTags(serviceTags.filter((tg) => tg !== tag));
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Success screen
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold">
              レビューありがとうございます！
            </h2>
            <p className="text-sm text-muted-foreground">
              {autoApproved
                ? "レビューが公開されました。"
                : "レビューは確認後に公開されます。"}
            </p>
            <div className="mt-4 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-lg">
        {/* Profile header */}
        <div className="mb-6 flex flex-col items-center text-center">
          {profileInfo?.avatar_url ? (
            <img
              src={profileInfo.avatar_url}
              alt={profileInfo.display_name}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-200"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-600">
              {(profileInfo?.display_name || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="mt-3 text-lg font-bold">
            {profileInfo?.display_name || "レビューを書く"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ご体験はいかがでしたか？ぜひご感想をお聞かせください。
          </p>
          {token && (
            <Badge
              variant="secondary"
              className="mt-2 gap-1"
            >
              <ShieldCheck className="h-3 w-3" />
              確認済みのリクエスト
            </Badge>
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Star rating */}
              <div className="space-y-2">
                <Label>評価 *</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {
                      ["", "不満", "やや不満", "普通", "満足", "大変満足"][
                        rating
                      ]
                    }
                  </p>
                )}
              </div>

              {/* Reviewer name */}
              <div className="space-y-2">
                <Label htmlFor="reviewer-name">{t("name")} *</Label>
                <Input
                  id="reviewer-name"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="山田 太郎"
                  maxLength={100}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="reviewer-email">
                  {t("email")}{" "}
                  <span className="text-xs text-muted-foreground">
                    （{t("optional")}）
                  </span>
                </Label>
                <Input
                  id="reviewer-email"
                  type="email"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="review-title">
                  タイトル{" "}
                  <span className="text-xs text-muted-foreground">
                    （{t("optional")}）
                  </span>
                </Label>
                <Input
                  id="review-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="一言で感想を..."
                  maxLength={200}
                />
              </div>

              {/* Body */}
              <div className="space-y-2">
                <Label htmlFor="review-body">レビュー本文 *</Label>
                <Textarea
                  id="review-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="サービスのご感想をお聞かせください..."
                  rows={5}
                  maxLength={2000}
                  required
                />
                <p className="text-right text-xs text-muted-foreground">
                  {body.length}/2000
                </p>
              </div>

              {/* Service tags */}
              <div className="space-y-2">
                <Label>
                  サービスタグ{" "}
                  <span className="text-xs text-muted-foreground">
                    （{t("optional")}）
                  </span>
                </Label>
                {serviceTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {serviceTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} &times;
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="例: カット、カラー..."
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTag}
                  >
                    {t("add")}
                  </Button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("sending")}
                  </>
                ) : (
                  "レビューを送信"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
