/**
 * HTML email templates for Folio.
 * All templates are responsive with inline CSS, Japanese UI copy,
 * a consistent header and an unsubscribe footer placeholder.
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function layout(businessName: string, content: string): string {
  const safeName = escapeHtml(businessName);
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Sans',sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="padding:28px 32px 20px;text-align:center;border-bottom:1px solid #eee;">
              <h1 style="margin:0;font-size:20px;font-weight:700;color:#111827;">${safeName}</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:28px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #eee;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;">&copy; ${safeName}</p>
              <p style="margin:0;font-size:11px;color:#9ca3af;">
                このメールは${safeName}から送信されました。<br/>
                配信停止をご希望の場合は<a href="{{unsubscribe_url}}" style="color:#6b7280;text-decoration:underline;">こちら</a>からお手続きください。
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Booking Confirmation (to booker) ────────────────────────────

interface BookingConfirmationParams {
  businessName: string;
  bookerName: string;
  date: string;
  time: string;
  service?: string;
  notes?: string;
}

export function bookingConfirmationEmail(params: BookingConfirmationParams): string {
  const { businessName, bookerName, date, time, service, notes } = params;

  const serviceRow = service
    ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">サービス</td><td style="padding:6px 0;font-size:14px;font-weight:500;">${escapeHtml(service)}</td></tr>`
    : "";
  const notesRow = notes
    ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">備考</td><td style="padding:6px 0;font-size:14px;">${escapeHtml(notes)}</td></tr>`
    : "";

  const content = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#374151;">
      ${escapeHtml(bookerName)}様
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#374151;">
      この度は${businessName}をご予約いただき、誠にありがとうございます。<br/>
      以下の内容でご予約を承りました。
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;padding:16px;margin-bottom:20px;">
      <tr>
        <td style="padding:6px 0;color:#6b7280;font-size:14px;width:100px;">日付</td>
        <td style="padding:6px 0;font-size:14px;font-weight:500;">${date}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#6b7280;font-size:14px;">時間</td>
        <td style="padding:6px 0;font-size:14px;font-weight:500;">${time}</td>
      </tr>
      ${serviceRow}
      ${notesRow}
    </table>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#6b7280;">
      ご来店を心よりお待ちしております。<br/>
      ご不明な点がございましたら、お気軽にお問い合わせください。
    </p>`;

  return layout(businessName, content);
}

// ─── Booking Notification (to business owner) ────────────────────

interface BookingNotificationParams {
  bookerName: string;
  bookerEmail: string;
  date: string;
  time: string;
  service?: string;
  notes?: string;
}

export function bookingNotificationEmail(params: BookingNotificationParams): string {
  const { bookerName, bookerEmail, date, time, service, notes } = params;

  const serviceRow = service
    ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">サービス</td><td style="padding:6px 0;font-size:14px;">${service}</td></tr>`
    : "";
  const notesRow = notes
    ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">備考</td><td style="padding:6px 0;font-size:14px;">${notes}</td></tr>`
    : "";

  const content = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#374151;font-weight:600;">
      新しい予約が入りました
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;padding:16px;margin-bottom:20px;">
      <tr>
        <td style="padding:6px 0;color:#6b7280;font-size:14px;width:100px;">お客様名</td>
        <td style="padding:6px 0;font-size:14px;font-weight:500;">${escapeHtml(bookerName)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#6b7280;font-size:14px;">メール</td>
        <td style="padding:6px 0;font-size:14px;">${escapeHtml(bookerEmail)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#6b7280;font-size:14px;">日付</td>
        <td style="padding:6px 0;font-size:14px;font-weight:500;">${date}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#6b7280;font-size:14px;">時間</td>
        <td style="padding:6px 0;font-size:14px;font-weight:500;">${time}</td>
      </tr>
      ${serviceRow}
      ${notesRow}
    </table>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#6b7280;">
      ダッシュボードで予約を確認してください。
    </p>`;

  return layout("Folio", content);
}

// ─── Review Request ──────────────────────────────────────────────

interface ReviewRequestParams {
  businessName: string;
  customerName: string;
  reviewUrl: string;
}

export function reviewRequestEmail(params: ReviewRequestParams): string {
  const { businessName, customerName, reviewUrl } = params;

  const content = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#374151;">
      ${escapeHtml(customerName)}様
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#374151;">
      先日は${escapeHtml(businessName)}をご利用いただき、誠にありがとうございました。
    </p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#374151;">
      お客様のご体験はいかがでしたでしょうか？もしよろしければ、レビューにてご感想をお聞かせいただけますと大変嬉しく思います。
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:0 0 24px;">
          <a href="${reviewUrl}" style="display:inline-block;padding:12px 32px;background-color:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">
            レビューを書く
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#6b7280;">
      お忙しいところ恐れ入りますが、何卒よろしくお願いいたします。
    </p>`;

  return layout(businessName, content);
}

// ─── Welcome Email ───────────────────────────────────────────────

interface WelcomeParams {
  businessName: string;
  customerName: string;
}

export function welcomeEmail(params: WelcomeParams): string {
  const { businessName, customerName } = params;

  const content = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#374151;">
      ${escapeHtml(customerName)}様
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#374151;">
      ${escapeHtml(businessName)}へのご登録、誠にありがとうございます。
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#374151;">
      今後、お得な情報やキャンペーンのお知らせをお届けいたします。<br/>
      どうぞよろしくお願いいたします。
    </p>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#6b7280;">
      ${escapeHtml(businessName)}スタッフ一同
    </p>`;

  return layout(businessName, content);
}

// ─── Follow-Up Email ─────────────────────────────────────────────

interface FollowUpParams {
  businessName: string;
  customerName: string;
  message: string;
}

export function followUpEmail(params: FollowUpParams): string {
  const { businessName, customerName, message } = params;

  const content = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#374151;">
      ${escapeHtml(customerName)}様
    </p>
    <div style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#374151;">
      ${escapeHtml(message).replace(/\n/g, "<br/>")}
    </div>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#6b7280;">
      ${escapeHtml(businessName)}
    </p>`;

  return layout(businessName, content);
}

// ─── Campaign Email ──────────────────────────────────────────────

interface CampaignParams {
  title: string;
  body: string;
  ctaText: string;
  ctaUrl: string;
  businessName: string;
}

export function campaignEmail(params: CampaignParams): string {
  const { title, body, ctaText, ctaUrl, businessName } = params;

  const content = `
    <h2 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#111827;">${escapeHtml(title)}</h2>
    <div style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#374151;">
      ${escapeHtml(body).replace(/\n/g, "<br/>")}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:0 0 24px;">
          <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:12px 32px;background-color:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">
            ${escapeHtml(ctaText)}
          </a>
        </td>
      </tr>
    </table>`;

  return layout(businessName, content);
}

// ─── Contact Form Notification (to business owner) ───────────────

interface ContactNotificationParams {
  senderName: string;
  senderEmail: string;
  message: string;
}

export function contactNotificationEmail(params: ContactNotificationParams): string {
  const { senderName, senderEmail, message } = params;

  const content = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#374151;font-weight:600;">
      新しいお問い合わせが届きました
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;padding:16px;margin-bottom:20px;">
      <tr>
        <td style="padding:6px 0;color:#6b7280;font-size:14px;width:100px;">お名前</td>
        <td style="padding:6px 0;font-size:14px;font-weight:500;">${escapeHtml(senderName)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#6b7280;font-size:14px;">メール</td>
        <td style="padding:6px 0;font-size:14px;">${escapeHtml(senderEmail)}</td>
      </tr>
    </table>
    <div style="background-color:#f9fafb;border-radius:8px;padding:16px;margin-bottom:20px;">
      <p style="margin:0 0 8px;font-size:12px;color:#6b7280;font-weight:600;">メッセージ</p>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#374151;">
        ${escapeHtml(message).replace(/\n/g, "<br/>")}
      </p>
    </div>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#6b7280;">
      ダッシュボードの受信箱で返信してください。
    </p>`;

  return layout("Folio", content);
}

// ─── Generic template-based HTML wrapper ─────────────────────────

/**
 * Wraps plain-text template body into a styled HTML email.
 * Used by the bulk-send flow to convert template text into HTML.
 */
export function templateToHtml(businessName: string, subject: string, body: string): string {
  const htmlBody = escapeHtml(body).replace(/\n/g, "<br/>");

  const content = `
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#374151;">
      ${htmlBody}
    </p>`;

  return layout(businessName, content);
}
