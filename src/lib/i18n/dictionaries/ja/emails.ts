export const emails = {
  // --- Layout / footer ---
  footerCopyright: "&copy; {{businessName}}",
  footerSentBy: "このメールは{{businessName}}から送信されました。",
  footerUnsubscribe: "配信停止をご希望の場合は<a href=\"{{unsubscribe_url}}\" style=\"color:#6b7280;text-decoration:underline;\">こちら</a>からお手続きください。",

  // --- Booking confirmation (to booker) ---
  bookingGreeting: "{{bookerName}}様",
  bookingThankYou: "この度は{{businessName}}をご予約いただき、誠にありがとうございます。",
  bookingConfirmed: "以下の内容でご予約を承りました。",
  bookingDateLabel: "日付",
  bookingTimeLabel: "時間",
  bookingServiceLabel: "サービス",
  bookingNotesLabel: "備考",
  bookingLookForward: "ご来店を心よりお待ちしております。",
  bookingContactNote: "ご不明な点がございましたら、お気軽にお問い合わせください。",

  // --- Booking notification (to owner) ---
  bookingNewTitle: "新しい予約が入りました",
  bookingCustomerNameLabel: "お客様名",
  bookingEmailLabel: "メール",
  bookingCheckDashboard: "ダッシュボードで予約を確認してください。",

  // --- Review request ---
  reviewGreeting: "{{customerName}}様",
  reviewThankYou: "先日は{{businessName}}をご利用いただき、誠にありがとうございました。",
  reviewAskBody: "お客様のご体験はいかがでしたでしょうか？もしよろしければ、レビューにてご感想をお聞かせいただけますと大変嬉しく思います。",
  reviewCtaButton: "レビューを書く",
  reviewClosing: "お忙しいところ恐れ入りますが、何卒よろしくお願いいたします。",

  // --- Welcome email ---
  welcomeGreeting: "{{customerName}}様",
  welcomeThankYou: "{{businessName}}へのご登録、誠にありがとうございます。",
  welcomeBody: "今後、お得な情報やキャンペーンのお知らせをお届けいたします。",
  welcomeRegards: "どうぞよろしくお願いいたします。",
  welcomeSignoff: "{{businessName}}スタッフ一同",

  // --- Follow-up email ---
  followUpGreeting: "{{customerName}}様",

  // --- Contact notification (to owner) ---
  contactNewTitle: "新しいお問い合わせが届きました",
  contactNameLabel: "お名前",
  contactEmailLabel: "メール",
  contactMessageLabel: "メッセージ",
  contactReplyNote: "ダッシュボードの受信箱で返信してください。",
} as const;
