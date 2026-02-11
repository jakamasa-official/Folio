import type { Customer } from "@/lib/types";

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export interface ComputedFields {
  daysSinceFirstVisit: number;
  daysSinceLastVisit: number;
  isNew: boolean;
  isActive: boolean;
  isAtRisk: boolean;
  isChurned: boolean;
  isVIP: boolean;
  isSubscriber: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  hasLine: boolean;
  contactRichness: number;
  engagementScore: number;
}

export type SegmentOperator =
  | "eq"
  | "neq"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "between"
  | "contains"
  | "not_contains";

export interface SegmentRule {
  field: string;
  operator: SegmentOperator;
  value: unknown;
}

export interface SegmentCriteria {
  match: "all" | "any";
  rules: SegmentRule[];
}

export interface AutoAction {
  type: "send_email" | "send_coupon" | "add_tag";
  template_id?: string;
  coupon_id?: string;
  tag?: string;
  delay_hours?: number;
}

export interface SegmentDefinition {
  id?: string;
  profile_id: string;
  name: string;
  description: string;
  type: "system" | "custom";
  criteria: SegmentCriteria;
  color: string;
  icon: string;
  auto_actions: AutoAction[];
  customer_count: number;
  is_active: boolean;
}

export interface CustomerExtras {
  hasReferrals?: boolean;
  hasStamps?: boolean;
}

// ──────────────────────────────────────────────────────────────
// Compute derived fields for a customer
// ──────────────────────────────────────────────────────────────

export function computeCustomerFields(
  customer: Customer,
  extras?: CustomerExtras
): ComputedFields {
  const now = new Date();
  const firstSeen = new Date(customer.first_seen_at);
  const lastSeen = new Date(customer.last_seen_at);

  const daysSinceFirstVisit = Math.floor(
    (now.getTime() - firstSeen.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysSinceLastVisit = Math.floor(
    (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24)
  );

  const hasEmail = !!customer.email;
  const hasPhone = !!customer.phone;
  const hasLine = !!customer.line_user_id;
  const hasStamps = extras?.hasStamps ?? false;
  const hasReferrals = extras?.hasReferrals ?? false;

  const contactRichness =
    (hasEmail ? 1 : 0) + (hasPhone ? 1 : 0) + (hasLine ? 1 : 0);

  // Engagement score: recency (40) + frequency (30) + depth (30)
  // Recency: 40 if visited today, decreasing linearly over 90 days
  const recencyScore = Math.max(0, 40 - (daysSinceLastVisit / 90) * 40);
  // Frequency: based on total_bookings, capped at 10
  const frequencyScore = Math.min(customer.total_bookings, 10) * 3;
  // Depth: 10 for email, 10 for line, 5 for phone, 5 for stamps
  const depthScore =
    (hasEmail ? 10 : 0) +
    (hasLine ? 10 : 0) +
    (hasPhone ? 5 : 0) +
    (hasStamps ? 5 : 0);

  const engagementScore = Math.round(
    Math.min(100, recencyScore + frequencyScore + depthScore)
  );

  const isNew = daysSinceFirstVisit <= 30;
  const isActive = daysSinceLastVisit <= 60;
  const isAtRisk =
    customer.total_bookings >= 2 &&
    daysSinceLastVisit >= 45 &&
    daysSinceLastVisit <= 90;
  const isChurned =
    customer.total_bookings >= 1 && daysSinceLastVisit > 90;
  const isVIP =
    customer.total_bookings >= 10 ||
    (customer.total_bookings >= 5 && hasReferrals);
  const isSubscriber = customer.source.includes("subscriber");

  return {
    daysSinceFirstVisit,
    daysSinceLastVisit,
    isNew,
    isActive,
    isAtRisk,
    isChurned,
    isVIP,
    isSubscriber,
    hasEmail,
    hasPhone,
    hasLine,
    contactRichness,
    engagementScore,
  };
}

// ──────────────────────────────────────────────────────────────
// Evaluate a single rule against a value
// ──────────────────────────────────────────────────────────────

function evaluateRule(fieldValue: unknown, rule: SegmentRule): boolean {
  const { operator, value } = rule;

  switch (operator) {
    case "eq":
      return fieldValue === value;
    case "neq":
      return fieldValue !== value;
    case "gt":
      return typeof fieldValue === "number" && fieldValue > (value as number);
    case "lt":
      return typeof fieldValue === "number" && fieldValue < (value as number);
    case "gte":
      return typeof fieldValue === "number" && fieldValue >= (value as number);
    case "lte":
      return typeof fieldValue === "number" && fieldValue <= (value as number);
    case "between": {
      if (typeof fieldValue !== "number" || !Array.isArray(value)) return false;
      const [min, max] = value as [number, number];
      return fieldValue >= min && fieldValue <= max;
    }
    case "contains":
      if (typeof fieldValue === "string" && typeof value === "string") {
        return fieldValue.toLowerCase().includes(value.toLowerCase());
      }
      if (Array.isArray(fieldValue) && typeof value === "string") {
        return fieldValue.some(
          (v) =>
            typeof v === "string" && v.toLowerCase().includes(value.toLowerCase())
        );
      }
      return false;
    case "not_contains":
      if (typeof fieldValue === "string" && typeof value === "string") {
        return !fieldValue.toLowerCase().includes(value.toLowerCase());
      }
      if (Array.isArray(fieldValue) && typeof value === "string") {
        return !fieldValue.some(
          (v) =>
            typeof v === "string" && v.toLowerCase().includes(value.toLowerCase())
        );
      }
      return true;
    default:
      return false;
  }
}

// ──────────────────────────────────────────────────────────────
// Evaluate segment criteria against a customer
// ──────────────────────────────────────────────────────────────

export function evaluateSegmentCriteria(
  customer: Customer,
  computed: ComputedFields,
  criteria: SegmentCriteria,
  extras?: CustomerExtras
): boolean {
  if (!criteria.rules || criteria.rules.length === 0) return false;

  // Merge customer raw fields, computed fields, and extras into one lookup
  const fieldMap: Record<string, unknown> = {
    // Raw customer fields
    total_bookings: customer.total_bookings,
    total_messages: customer.total_messages,
    source: customer.source,
    email: customer.email,
    phone: customer.phone,
    name: customer.name,
    tags: customer.tags,
    line_user_id: customer.line_user_id,
    // Computed fields
    daysSinceFirstVisit: computed.daysSinceFirstVisit,
    daysSinceLastVisit: computed.daysSinceLastVisit,
    isNew: computed.isNew,
    isActive: computed.isActive,
    isAtRisk: computed.isAtRisk,
    isChurned: computed.isChurned,
    isVIP: computed.isVIP,
    isSubscriber: computed.isSubscriber,
    hasEmail: computed.hasEmail,
    hasPhone: computed.hasPhone,
    hasLine: computed.hasLine,
    contactRichness: computed.contactRichness,
    engagementScore: computed.engagementScore,
    // Extras (from related tables)
    hasReferrals: extras?.hasReferrals ?? false,
    hasStamps: extras?.hasStamps ?? false,
  };

  const results = criteria.rules.map((rule) => {
    const fieldValue = fieldMap[rule.field];
    return evaluateRule(fieldValue, rule);
  });

  if (criteria.match === "all") {
    return results.every(Boolean);
  }
  return results.some(Boolean);
}

// ──────────────────────────────────────────────────────────────
// System segments definitions
// ──────────────────────────────────────────────────────────────

export function getSystemSegments(profileId: string): SegmentDefinition[] {
  return [
    {
      profile_id: profileId,
      name: "新規顧客",
      description: "過去30日以内に初めて来た顧客",
      type: "system",
      criteria: {
        match: "all",
        rules: [{ field: "isNew", operator: "eq", value: true }],
      },
      color: "#3B82F6",
      icon: "user-plus",
      auto_actions: [],
      customer_count: 0,
      is_active: true,
    },
    {
      profile_id: profileId,
      name: "常連顧客",
      description: "3回以上予約し、60日以内にアクティブな顧客",
      type: "system",
      criteria: {
        match: "all",
        rules: [
          { field: "total_bookings", operator: "gte", value: 3 },
          { field: "isActive", operator: "eq", value: true },
        ],
      },
      color: "#22C55E",
      icon: "heart",
      auto_actions: [],
      customer_count: 0,
      is_active: true,
    },
    {
      profile_id: profileId,
      name: "VIP顧客",
      description: "10回以上予約、または5回以上予約で紹介実績のある顧客",
      type: "system",
      criteria: {
        match: "all",
        rules: [{ field: "isVIP", operator: "eq", value: true }],
      },
      color: "#F59E0B",
      icon: "crown",
      auto_actions: [],
      customer_count: 0,
      is_active: true,
    },
    {
      profile_id: profileId,
      name: "離脱リスク",
      description: "2回以上予約したが、45〜90日間来店がない顧客",
      type: "system",
      criteria: {
        match: "all",
        rules: [{ field: "isAtRisk", operator: "eq", value: true }],
      },
      color: "#F97316",
      icon: "alert-triangle",
      auto_actions: [],
      customer_count: 0,
      is_active: true,
    },
    {
      profile_id: profileId,
      name: "離脱顧客",
      description: "1回以上予約したが、90日以上来店がない顧客",
      type: "system",
      criteria: {
        match: "all",
        rules: [{ field: "isChurned", operator: "eq", value: true }],
      },
      color: "#EF4444",
      icon: "user-x",
      auto_actions: [],
      customer_count: 0,
      is_active: true,
    },
    {
      profile_id: profileId,
      name: "紹介者",
      description: "他の顧客を紹介してくれた顧客",
      type: "system",
      criteria: {
        // This uses a special computed field "hasReferrals"
        // that is checked via CustomerExtras
        match: "all",
        rules: [{ field: "hasReferrals", operator: "eq", value: true }],
      },
      color: "#8B5CF6",
      icon: "gift",
      auto_actions: [],
      customer_count: 0,
      is_active: true,
    },
    {
      profile_id: profileId,
      name: "メール購読のみ",
      description: "メール購読はあるが予約のない顧客",
      type: "system",
      criteria: {
        match: "all",
        rules: [
          { field: "isSubscriber", operator: "eq", value: true },
          { field: "total_bookings", operator: "eq", value: 0 },
        ],
      },
      color: "#6B7280",
      icon: "mail",
      auto_actions: [],
      customer_count: 0,
      is_active: true,
    },
    {
      profile_id: profileId,
      name: "LINE連携済み",
      description: "LINEアカウントが連携されている顧客",
      type: "system",
      criteria: {
        match: "all",
        rules: [{ field: "hasLine", operator: "eq", value: true }],
      },
      color: "#06C755",
      icon: "message-circle",
      auto_actions: [],
      customer_count: 0,
      is_active: true,
    },
  ];
}

// ──────────────────────────────────────────────────────────────
// Helpers for criteria display
// ──────────────────────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  total_bookings: "予約回数",
  total_messages: "メッセージ数",
  source: "ソース",
  email: "メールアドレス",
  phone: "電話番号",
  name: "名前",
  tags: "タグ",
  daysSinceFirstVisit: "初回来店からの日数",
  daysSinceLastVisit: "最終来店からの日数",
  isNew: "新規顧客",
  isActive: "アクティブ",
  isAtRisk: "離脱リスク",
  isChurned: "離脱済み",
  isVIP: "VIP",
  isSubscriber: "メール購読",
  hasEmail: "メールあり",
  hasPhone: "電話番号あり",
  hasLine: "LINE連携",
  hasReferrals: "紹介実績あり",
  contactRichness: "連絡先充実度",
  engagementScore: "エンゲージメントスコア",
};

const OPERATOR_LABELS: Record<SegmentOperator, string> = {
  eq: "＝",
  neq: "≠",
  gt: "＞",
  lt: "＜",
  gte: "≧",
  lte: "≦",
  between: "範囲内",
  contains: "含む",
  not_contains: "含まない",
};

export function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] || field;
}

export function getOperatorLabel(operator: SegmentOperator): string {
  return OPERATOR_LABELS[operator] || operator;
}

export function formatRuleDisplay(rule: SegmentRule): string {
  const fieldLabel = getFieldLabel(rule.field);
  const opLabel = getOperatorLabel(rule.operator);

  if (typeof rule.value === "boolean") {
    return rule.value
      ? `${fieldLabel}：はい`
      : `${fieldLabel}：いいえ`;
  }

  if (rule.operator === "between" && Array.isArray(rule.value)) {
    return `${fieldLabel} ${rule.value[0]}〜${rule.value[1]}`;
  }

  return `${fieldLabel} ${opLabel} ${rule.value}`;
}

// Available fields for custom segment builder
export const SEGMENT_FIELDS = [
  { value: "total_bookings", label: "予約回数", type: "number" },
  { value: "total_messages", label: "メッセージ数", type: "number" },
  { value: "daysSinceFirstVisit", label: "初回来店からの日数", type: "number" },
  { value: "daysSinceLastVisit", label: "最終来店からの日数", type: "number" },
  { value: "engagementScore", label: "エンゲージメントスコア", type: "number" },
  { value: "contactRichness", label: "連絡先充実度 (0-3)", type: "number" },
  { value: "source", label: "ソース", type: "string" },
  { value: "tags", label: "タグ", type: "string" },
  { value: "isNew", label: "新規顧客", type: "boolean" },
  { value: "isActive", label: "アクティブ", type: "boolean" },
  { value: "isAtRisk", label: "離脱リスク", type: "boolean" },
  { value: "isChurned", label: "離脱済み", type: "boolean" },
  { value: "isVIP", label: "VIP", type: "boolean" },
  { value: "isSubscriber", label: "メール購読", type: "boolean" },
  { value: "hasEmail", label: "メールあり", type: "boolean" },
  { value: "hasPhone", label: "電話番号あり", type: "boolean" },
  { value: "hasLine", label: "LINE連携", type: "boolean" },
] as const;

export const SEGMENT_COLORS = [
  "#3B82F6", // blue
  "#22C55E", // green
  "#F59E0B", // amber
  "#F97316", // orange
  "#EF4444", // red
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#6B7280", // gray
  "#06C755", // LINE green
] as const;
