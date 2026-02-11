export interface AnalyticsData {
  totalViews: number;
  todayViews: number;
  weekViews: number;
  realtimeViewers: number;
  timeSeries: TimeSeriesPoint[];
  devices: BreakdownItem[];
  browsers: BreakdownItem[];
  operatingSystems: BreakdownItem[];
  countries: BreakdownItem[];
  referrers: BreakdownItem[];
  utmSources: BreakdownItem[];
  utmMediums: BreakdownItem[];
  utmCampaigns: BreakdownItem[];
  linkClicks: LinkClickData[];
  totalClicks: number;
  conversions: ConversionData;
  conversionRate: number;
}

export interface TimeSeriesPoint {
  date: string;
  label: string;
  views: number;
  clicks: number;
}

export interface BreakdownItem {
  label: string;
  count: number;
}

export interface LinkClickData {
  link_id: string;
  link_label: string;
  link_url: string;
  count: number;
}

export interface ConversionData {
  contact_submit: number;
  booking_submit: number;
  email_subscribe: number;
  total: number;
}
