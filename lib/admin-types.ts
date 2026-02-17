export interface DashboardOverview {
  total_urls: number;
  total_clicks: number;
  clicks_last_7_days: number;
  hot_urls: HotUrl[];
}

export interface HotUrl {
  id: string;
  short_code: string;
  long_url: string;
  click_count: number | null;
  clicks_last_7_days: number | null;
  last_clicked_at: string | null;
}

export interface UrlDetail {
  id: string;
  short_code: string;
  long_url: string;
  click_count: number | null;
  created_at: string;
  expires_at: string | null;
  last_clicked_at: string | null;
  daily_clicks: DailyClick[] | null;
}

export interface DailyClick {
  date: string;
  clicks: number;
}
