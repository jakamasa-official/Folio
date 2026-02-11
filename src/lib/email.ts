import { Resend } from "resend";

// Lazy initialization to avoid build-time errors when env vars are not set
let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    _resend = new Resend(apiKey);
  }
  return _resend;
}

const getDefaultFrom = () =>
  process.env.EMAIL_FROM || "Folio <noreply@resend.dev>";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send a single email via Resend.
 * Returns the Resend message ID on success, or null on failure.
 * Errors are logged but never thrown — email failures should not break main flows.
 */
export async function sendEmail({
  to,
  subject,
  html,
  from,
}: SendEmailParams): Promise<string | null> {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: from || getDefaultFrom(),
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return null;
    }

    return data?.id ?? null;
  } catch (err) {
    console.error("[email] Failed to send email:", err);
    return null;
  }
}

interface BulkEmail {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface BulkResult {
  successCount: number;
  failureCount: number;
  results: { to: string; id: string | null; error?: string }[];
}

/**
 * Send multiple emails individually (not CC/BCC) for privacy.
 * Returns counts and per-recipient results.
 */
export async function sendBulkEmails(emails: BulkEmail[]): Promise<BulkResult> {
  const results: BulkResult["results"] = [];
  let successCount = 0;
  let failureCount = 0;

  // Send in parallel batches of 10 to avoid overwhelming the API
  const batchSize = 10;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(async (email) => {
        const id = await sendEmail({
          to: email.to,
          subject: email.subject,
          html: email.html,
          from: email.from,
        });
        return { to: email.to, id };
      })
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        if (result.value.id) {
          successCount++;
          results.push({ to: result.value.to, id: result.value.id });
        } else {
          failureCount++;
          results.push({
            to: result.value.to,
            id: null,
            error: "Send failed",
          });
        }
      } else {
        failureCount++;
        results.push({
          to: "unknown",
          id: null,
          error: result.reason?.message || "Unknown error",
        });
      }
    }
  }

  return { successCount, failureCount, results };
}
